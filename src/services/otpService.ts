import db from '../db/connection.js';
import crypto from 'node:crypto';
import axios from 'axios';
import nodemailer from 'nodemailer';
import * as Dispatcher from './dispatcher.js';

// =========================================================
// OTP Management Service
// =========================================================

export const OTP_EXPIRY_MINUTES = 10;
export const MAX_ATTEMPTS = 3;
export const LOCKOUT_MINUTES = 15;

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

type OtpSettings = {
    url?: string;
    token?: string;
    template?: JSONValue | string;
    confirmOtpUrl?: string;
    instance?: string;
    channels?: {
        whatsapp?: boolean;
        email?: boolean;
        sms?: boolean;
    };
    smtp?: {
        host?: string;
        port?: number;
        secure?: boolean;
        user?: string;
        pass?: string;
        from?: string;
    };
    sms?: {
        url?: string;
        authKey?: string;
        sender?: string;
    };
};

export type OtpChannelResult = {
    enabled: boolean;
    sent: boolean;
    target?: string | null;
    detail?: string;
};

export type OtpDeliveryReport = {
    anyDelivered: boolean;
    whatsapp: OtpChannelResult;
    email: OtpChannelResult;
    sms: OtpChannelResult;
};

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildConfirmOtpUrl(baseUrl: string | undefined, whatsapp: string, code: string): string {
    if (!baseUrl) {
        return `https://disparador.reidozap.com.br/login.html?whatsapp=${encodeURIComponent(whatsapp)}&code=${encodeURIComponent(code)}`;
    }

    try {
        const url = new URL(baseUrl);
        url.searchParams.set('whatsapp', whatsapp);
        url.searchParams.set('code', code);
        return url.toString();
    } catch {
        return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}whatsapp=${encodeURIComponent(whatsapp)}&code=${encodeURIComponent(code)}`;
    }
}

function applyTemplateVars(value: JSONValue, vars: Record<string, string>): JSONValue {
    if (typeof value === 'string') {
        return value.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_full, key) => {
            return vars[key] ?? `{{${key}}}`;
        });
    }

    if (Array.isArray(value)) {
        return value.map((item) => applyTemplateVars(item, vars));
    }

    if (value && typeof value === 'object') {
        const replaced: { [key: string]: JSONValue } = {};
        for (const [key, nestedValue] of Object.entries(value)) {
            replaced[key] = applyTemplateVars(nestedValue, vars);
        }
        return replaced;
    }

    return value;
}

async function tryInternalOtpDispatch(payload: JSONValue, whatsapp: string): Promise<boolean> {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return false;
    }

    const body = payload as Record<string, any>;
    const to = String(body.to || body.number || whatsapp);
    const instance = String(body.instance || 'main');

    const user = await db.query<{ tenant_id: string | null }>(
        'SELECT tenant_id FROM users WHERE whatsapp = $1 LIMIT 1',
        [whatsapp]
    );

    const tenantId = user[0]?.tenant_id || 'system';

    async function dispatchWithTenantFallback(
        sender: (effectiveTenantId: string) => Promise<{ ok: boolean; error?: string }>
    ): Promise<{ ok: boolean; error?: string }> {
        let result = await sender(tenantId);

        if (!result.ok && result.error === 'forbidden_instance_access' && tenantId !== 'system') {
            console.warn(`[OTP] Tenant ${tenantId} cannot access instance ${instance}. Retrying with system scope.`);
            result = await sender('system');
        }

        return result;
    }

    const maxAttempts = 4;
    let lastError = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            if (Array.isArray(body.buttons) && body.buttons.length > 0) {
                const interactiveResult = await dispatchWithTenantFallback((effectiveTenantId) =>
                    Dispatcher.sendInteractive(
                        effectiveTenantId,
                        instance,
                        to,
                        String(body.text || 'Seu código de confirmação'),
                        body.buttons,
                        body.footer ? String(body.footer) : undefined
                    )
                );

                if (interactiveResult.ok) {
                    return true;
                }

                lastError = String(interactiveResult.error || 'interactive_dispatch_failed');

                if (interactiveResult.error === 'instance_needs_qr') {
                    console.warn(`[OTP] Internal dispatch requires QR for instance ${instance}`);
                    return false;
                }

                if (typeof body.text === 'string' && body.text.trim().length > 0) {
                    const textResult = await dispatchWithTenantFallback((effectiveTenantId) =>
                        Dispatcher.sendText(
                            effectiveTenantId,
                            instance,
                            to,
                            String(body.text),
                            body.footer ? String(body.footer) : undefined
                        )
                    );

                    if (textResult.ok) {
                        return true;
                    }

                    lastError = String(textResult.error || lastError);
                }
            } else if (typeof body.text === 'string' && body.text.trim().length > 0) {
                const textResult = await dispatchWithTenantFallback((effectiveTenantId) =>
                    Dispatcher.sendText(
                        effectiveTenantId,
                        instance,
                        to,
                        String(body.text),
                        body.footer ? String(body.footer) : undefined
                    )
                );

                if (textResult.ok) {
                    return true;
                }

                lastError = String(textResult.error || 'text_dispatch_failed');

                if (textResult.error === 'instance_needs_qr') {
                    console.warn(`[OTP] Internal dispatch requires QR for instance ${instance}`);
                    return false;
                }
            }
        } catch (err: any) {
            lastError = err?.message || 'internal_dispatch_exception';
        }

        if (attempt < maxAttempts) {
            const delayMs = Math.min(3000 * Math.pow(2, attempt - 1), 20000);
            console.warn(`[OTP] Internal dispatch attempt ${attempt}/${maxAttempts} failed (${lastError}). Retrying in ${Math.round(delayMs / 1000)}s...`);
            await sleep(delayMs);
            continue;
        }
    }

    if (lastError) {
        console.warn(`[OTP] Internal dispatch failed after retries: ${lastError}`);
    }

    return false;
}

async function tryEmailOtpDelivery(
    settings: OtpSettings,
    whatsapp: string,
    code: string
): Promise<{ ok: boolean; target: string | null; detail?: string }> {
    const smtp = settings.smtp || {};
    if (!smtp.host || !smtp.user || !smtp.pass) {
        return { ok: false, target: null, detail: 'smtp_not_configured' };
    }

    const users = await db.query<{ email: string | null }>(
        'SELECT email FROM users WHERE whatsapp = $1 LIMIT 1',
        [whatsapp]
    );

    const recipient = users[0]?.email?.trim();
    if (!recipient) {
        console.warn(`[OTP] Email channel enabled, but no recipient email found for ${whatsapp}`);
        return { ok: false, target: null, detail: 'email_not_found' };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: String(smtp.host),
            port: Number(smtp.port || 587),
            secure: smtp.secure === true,
            auth: {
                user: String(smtp.user),
                pass: String(smtp.pass),
            },
        });

        await transporter.sendMail({
            from: smtp.from || smtp.user,
            to: recipient,
            subject: 'Seu código de verificação',
            text: `Seu código de verificação é: ${code}`,
            html: `<p>Seu código de verificação é: <strong>${code}</strong></p>`,
        });

        console.log(`[OTP] Sent successfully via email to ${recipient}`);
        return { ok: true, target: recipient };
    } catch (err: any) {
        console.warn('[OTP] Email delivery failed:', err?.message || err);
        return { ok: false, target: recipient, detail: err?.message || 'email_send_failed' };
    }
}

async function trySmsOtpDelivery(
    settings: OtpSettings,
    whatsapp: string,
    code: string
): Promise<{ ok: boolean; target: string; detail?: string }> {
    const sms = settings.sms || {};
    const smsUrl = sms.url || 'https://sms.comtele.com.br/api/v2/send';
    const authKey = sms.authKey;
    const sender = sms.sender || 'RZSender';

    if (!authKey) {
        return { ok: false, target: whatsapp, detail: 'sms_auth_key_missing' };
    }

    try {
        await axios.post(
            smsUrl,
            {
                Sender: sender,
                Receivers: whatsapp,
                Content: `Seu codigo de Verificação é:${code}`,
            },
            {
                headers: {
                    'content-type': 'application/json',
                    'auth-key': authKey,
                },
            }
        );

        console.log(`[OTP] Sent successfully via SMS to ${whatsapp}`);
        return { ok: true, target: whatsapp };
    } catch (err: any) {
        const status = err?.response?.status;
        console.warn(`[OTP] SMS delivery failed (${status || 'no_status'}):`, err?.message || err);
        return { ok: false, target: whatsapp, detail: err?.message || 'sms_send_failed' };
    }
}

/**
 * Generate a 6-digit numeric OTP
 */
export function generateNumericOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash the OTP for secure storage
 */
export function hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Send OTP via pre-configured global cURL settings
 */
export async function sendOTP(whatsapp: string, code: string): Promise<OtpDeliveryReport> {
    const report: OtpDeliveryReport = {
        anyDelivered: false,
        whatsapp: { enabled: true, sent: false, target: whatsapp },
        email: { enabled: false, sent: false, target: null },
        sms: { enabled: false, sent: false, target: whatsapp },
    };

    try {
        const settingsResult = await db.query<{ value: any }>(
            "SELECT value FROM global_settings WHERE key = 'otp_config'"
        );

        const settings: OtpSettings = settingsResult[0]?.value || {};

        // Always log for easier testing as requested
        console.log(`[OTP-TEST] CODE FOR ${whatsapp}: ${code}`);

        const channels = {
            whatsapp: settings.channels?.whatsapp !== false,
            email: settings.channels?.email === true,
            sms: settings.channels?.sms === true,
        };

        report.whatsapp.enabled = channels.whatsapp;
        report.email.enabled = channels.email;
        report.sms.enabled = channels.sms;

        const { url, token, template, confirmOtpUrl, instance } = settings;
        const otpUrl = buildConfirmOtpUrl(confirmOtpUrl, whatsapp, code);

        const vars: Record<string, string> = {
            number: whatsapp,
            whatsapp,
            message: `Seu código de confirmação é ${code}`,
            code,
            code_otp: code,
            url_confimar_otp: otpUrl,
            url_confirmar_otp: otpUrl,
            otp_url: otpUrl,
        };

        let payload: JSONValue;
        if (template && typeof template === 'object') {
            payload = applyTemplateVars(template as JSONValue, vars);
        } else if (typeof template === 'string' && template.trim().startsWith('{')) {
            const parsedTemplate = JSON.parse(template) as JSONValue;
            payload = applyTemplateVars(parsedTemplate, vars);
        } else {
            const bodyText = String(template || 'Seu código de confirmação é {{code}}').replace('{{code}}', code);
            payload = {
                body: bodyText,
                number: whatsapp,
                externalKey: code,
                isClosed: false
            };
        }

        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
            const payloadObj = payload as { [key: string]: JSONValue };
            if (instance && !payloadObj.instance) {
                payloadObj.instance = String(instance);
            }

            if (!payloadObj.to && !payloadObj.number) {
                payloadObj.to = whatsapp;
            }

            payload = payloadObj;
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        if (channels.whatsapp) {
            if (url) {
                try {
                    await axios.post(url, payload, { headers });
                    console.log(`[OTP] Sent successfully to ${whatsapp}`);
                    report.whatsapp.sent = true;
                    report.whatsapp.detail = 'sent_external';
                } catch (httpErr: any) {
                    const status = httpErr?.response?.status;
                    console.warn(`[OTP] External delivery failed (${status || 'no_status'}), trying internal fallback...`);

                    const fallbackOk = await tryInternalOtpDispatch(payload, whatsapp);
                    if (fallbackOk) {
                        console.log(`[OTP] Sent successfully via internal fallback to ${whatsapp}`);
                        report.whatsapp.sent = true;
                        report.whatsapp.detail = 'sent_internal_fallback';
                    } else {
                        report.whatsapp.detail = `external_${status || 'no_status'}_and_internal_failed`;
                    }
                }
            } else {
                console.warn('[OTP] WhatsApp channel enabled but endpoint URL is empty.');
                report.whatsapp.detail = 'whatsapp_url_missing';
            }
        } else {
            report.whatsapp.detail = 'disabled';
        }

        if (channels.email) {
            const emailResult = await tryEmailOtpDelivery(settings, whatsapp, code);
            report.email.target = emailResult.target;
            report.email.sent = emailResult.ok;
            report.email.detail = emailResult.ok ? 'sent' : (emailResult.detail || 'failed');
        } else {
            report.email.detail = 'disabled';
        }

        if (channels.sms) {
            const smsResult = await trySmsOtpDelivery(settings, whatsapp, code);
            report.sms.target = smsResult.target;
            report.sms.sent = smsResult.ok;
            report.sms.detail = smsResult.ok ? 'sent' : (smsResult.detail || 'failed');
        } else {
            report.sms.detail = 'disabled';
        }

        report.anyDelivered = report.whatsapp.sent || report.email.sent || report.sms.sent;

        if (!report.anyDelivered) {
            console.warn('[OTP] No channel delivered successfully. Keeping flow active with fallback code log.');
            console.log(`[OTP-FALLBACK-CODE] ${whatsapp}: ${code}`);
        }

        return report;
    } catch (err: any) {
        console.error('[OTP] Failed to deliver OTP. Keeping flow active:', err.message);
        console.log(`[OTP-FALLBACK-CODE] ${whatsapp}: ${code}`);
        report.whatsapp.detail = report.whatsapp.detail || 'unexpected_error';
        report.email.detail = report.email.detail || 'unexpected_error';
        report.sms.detail = report.sms.detail || 'unexpected_error';
        report.anyDelivered = report.whatsapp.sent || report.email.sent || report.sms.sent;
        return report;
    }
}

/**
 * Verify OTP and handle attempts/lockouts
 */
export async function verifyOTP(whatsapp: string, code: string): Promise<boolean> {
    const otpHash = hashOTP(code);

    const result = await db.query<{
        id: string;
        otp_hash: string;
        expires_at: Date;
        attempts: number;
        locked_until: Date | null;
        used_at: Date | null;
    }>(
        `SELECT id, otp_hash, expires_at, attempts, locked_until, used_at
         FROM auth_otps
         WHERE whatsapp = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [whatsapp]
    );

    if (result.length === 0) return false;

    const record = result[0];

    // Check lockout
    if (record.locked_until && new Date() < new Date(record.locked_until)) {
        throw new Error('too_many_attempts_lockout');
    }

    // Check expiry or usage
    if (new Date() > new Date(record.expires_at) || record.used_at) {
        return false;
    }

    // Verify hash
    if (record.otp_hash === otpHash) {
        // Success
        await db.query(
            "UPDATE auth_otps SET used_at = now() WHERE id = $1",
            [record.id]
        );
        return true;
    } else {
        // Failure: increment attempts
        const newAttempts = record.attempts + 1;
        let lockUntil = null;

        if (newAttempts >= MAX_ATTEMPTS) {
            lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        }

        await db.query(
            "UPDATE auth_otps SET attempts = $1, locked_until = $2 WHERE id = $3",
            [newAttempts, lockUntil, record.id]
        );

        return false;
    }
}

/**
 * Issue a new OTP for a user
 */
export async function issueOTP(whatsapp: string): Promise<{ code: string; delivery: OtpDeliveryReport }> {
    const code = generateNumericOTP();
    const otpHash = hashOTP(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await db.query(
        `INSERT INTO auth_otps (whatsapp, otp_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [whatsapp, otpHash, expiresAt]
    );

    const delivery = await sendOTP(whatsapp, code);
    return { code, delivery };
}
