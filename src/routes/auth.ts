import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import db from '../db/connection.js';
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashToken,
    generateResetToken,
    hashResetToken,
    normalizeWhatsApp,
    type TokenPayload,
} from '../utils/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import * as otpService from '../services/otpService.js';

const router = Router();

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { ok: false, error: 'too_many_attempts' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /auth/login
 * Login with Email + password (fallback for legacy WhatsApp input)
 */
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
    try {
        const { email, whatsapp, password } = req.body as { email?: string; whatsapp?: string; password?: string };

        if ((!email && !whatsapp) || !password) {
            return res.status(400).json({ ok: false, error: 'missing_credentials' });
        }

        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanWhatsApp = whatsapp ? normalizeWhatsApp(whatsapp) : '';

        // Find user by Email (preferred) with legacy fallback to WhatsApp
        const users = await db.query<{
            id: string;
            tenant_id: string | null;
            name: string;
            email: string;
            whatsapp: string;
            password_hash: string;
            role: 'superadmin' | 'admin_tenant' | 'user_tenant';
            status: 'active' | 'blocked';
        }>(
            `SELECT id, tenant_id, name, email, whatsapp, password_hash, role, status
             FROM users
             WHERE lower(email) = lower($1)
                OR whatsapp = $2`,
            [cleanEmail, cleanWhatsApp]
        );

        if (users.length === 0) {
            return res.status(401).json({ ok: false, error: 'invalid_credentials' });
        }

        const user = users[0];

        // Check if user is blocked
        if (user.status === 'blocked') {
            return res.status(403).json({ ok: false, error: 'user_blocked' });
        }

        // Check if tenant is blocked or pending
        if (user.tenant_id) {
            const tenants = await db.query<{ status: string }>(
                `SELECT status FROM tenants WHERE id = $1`,
                [user.tenant_id]
            );

            if (tenants.length === 0 || tenants[0].status === 'blocked') {
                return res.status(403).json({ ok: false, error: 'tenant_blocked' });
            }
            if (tenants[0].status === 'pending_verification') {
                return res.status(403).json({ ok: false, error: 'verification_pending' });
            }
        }

        // Verify password
        if (user.password_hash === 'OTP_ONLY') {
            return res.status(401).json({ ok: false, error: 'password_not_set' });
        }

        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ ok: false, error: 'invalid_credentials' });
        }

        // Generate tokens
        const payload: TokenPayload = {
            userId: user.id,
            tenantId: user.tenant_id,
            role: user.role,
            email: user.email,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token in database
        const tokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.query(
            `INSERT INTO auth_refresh_tokens (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [user.id, tokenHash, expiresAt]
        );

        // Update last login
        await db.query(
            `UPDATE users SET last_login_at = now() WHERE id = $1`,
            [user.id]
        );

        return res.json({
            ok: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                whatsapp: user.whatsapp,
                role: user.role,
                tenantId: user.tenant_id,
            },
        });
    } catch (err) {
        const { email, whatsapp } = req.body || {};
        console.error('[AUTH] Login error:', {
            error: err,
            email,
            whatsapp,
            time: new Date().toISOString()
        });
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/forgot
 * Request password reset via WhatsApp OTP
 */
router.post('/forgot', async (req: Request, res: Response) => {
    try {
        const { whatsapp } = req.body as { whatsapp?: string };

        if (!whatsapp) {
            return res.status(400).json({ ok: false, error: 'missing_whatsapp' });
        }

        const cleanWhatsApp = normalizeWhatsApp(whatsapp);

        // Find user
        const users = await db.query<{ id: string }>(
            `SELECT id FROM users WHERE whatsapp = $1`,
            [cleanWhatsApp]
        );

        if (users.length === 0) {
            // Silence failure to prevent enumeration
            return res.json({ ok: true, message: 'otp_sent_if_exists' });
        }

        // Issue and send OTP via WhatsApp
        const { code, delivery } = await otpService.issueOTP(cleanWhatsApp);

        // Save to tenant record for admin visibility
        await db.query(`UPDATE tenants SET last_otp = $1 WHERE id = (SELECT tenant_id FROM users WHERE whatsapp = $2)`, [code, cleanWhatsApp]);

        return res.json({ ok: true, message: 'otp_sent', delivery });
    } catch (err) {
        console.error('[AUTH] Forgot error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/reset
 * Reset password with WhatsApp OTP
 */
router.post('/reset', async (req: Request, res: Response) => {
    try {
        const { whatsapp, code, newPassword } = req.body as { whatsapp?: string; code?: string; newPassword?: string };

        if (!whatsapp || !code || !newPassword) {
            return res.status(400).json({ ok: false, error: 'missing_fields' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ ok: false, error: 'password_too_short' });
        }

        const cleanWhatsApp = normalizeWhatsApp(whatsapp);

        // Verify OTP
        const isValid = await otpService.verifyOTP(cleanWhatsApp, code);
        if (!isValid) {
            return res.status(401).json({ ok: false, error: 'invalid_otp' });
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await db.query(
            `UPDATE users SET password_hash = $1, updated_at = now() WHERE whatsapp = $2`,
            [passwordHash, cleanWhatsApp]
        );

        // Revoke all refresh tokens for this user
        const users = await db.query<{ id: string }>("SELECT id FROM users WHERE whatsapp = $1", [cleanWhatsApp]);
        if (users.length > 0) {
            await db.query(
                `UPDATE auth_refresh_tokens SET revoked_at = now() WHERE user_id = $1`,
                [users[0].id]
            );
        }

        return res.json({ ok: true, message: 'password_reset_success' });
    } catch (err) {
        console.error('[AUTH] Reset error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/register
 * Public registration for new Tenant + Admin User (WhatsApp-first)
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { companyName, name, whatsapp, email, password } = req.body as {
            companyName?: string;
            name?: string;
            whatsapp?: string;
            email?: string;
            password?: string;
        };

        if (!companyName || !name || !whatsapp || !email) {
            return res.status(400).json({ ok: false, error: 'missing_fields' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ ok: false, error: 'invalid_email' });
        }

        // Normalize WhatsApp number
        const cleanWhatsApp = normalizeWhatsApp(whatsapp);
        if (cleanWhatsApp.length < 10) {
            return res.status(400).json({ ok: false, error: 'invalid_whatsapp' });
        }

        // Check if user exists
        const existing = await db.query('SELECT id FROM users WHERE whatsapp = $1', [cleanWhatsApp]);
        if (existing.length > 0) {
            return res.status(400).json({ ok: false, error: 'whatsapp_already_exists' });
        }

        // Create Tenant in 'pending_verification' status
        const slug = companyName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const tenantResult = await db.query<{ id: string }>(
            `INSERT INTO tenants (name, slug, status, instance_limit, daily_send_limit)
             VALUES ($1, $2, 'pending_verification', 1, 50)
             RETURNING id`,
            [companyName, slug]
        );
        const tenantId = tenantResult[0].id;

        // Create Admin User in 'active' status but linked to 'pending_verification' tenant
        // The user status 'active' means they can attempt OTP verification
        const passwordHash = password ? await hashPassword(password) : 'OTP_ONLY';
        await db.query(
            `INSERT INTO users (tenant_id, name, email, whatsapp, password_hash, role, status)
             VALUES ($1, $2, $3, $4, $5, 'admin_tenant', 'active')`,
            [tenantId, name, cleanEmail, cleanWhatsApp, passwordHash]
        );

        // Issue and send OTP
        const { code, delivery } = await otpService.issueOTP(cleanWhatsApp);

        // Save to tenant record for admin visibility
        await db.query(`UPDATE tenants SET last_otp = $1 WHERE id = $2`, [code, tenantId]);

        return res.status(201).json({
            ok: true,
            message: 'registration_pending_verification',
            whatsapp: cleanWhatsApp,
            email: cleanEmail,
            delivery
        });
    } catch (err: any) {
        console.error('[AUTH] Register error:', err);

        // Handle unique constraint violations
        if (err.code === '23505') {
            if (err.constraint === 'ux_users_email') {
                return res.status(400).json({ ok: false, error: 'email_already_exists' });
            }
            if (err.constraint === 'tenants_slug_key') {
                return res.status(400).json({ ok: false, error: 'company_name_already_exists' });
            }
            if (err.constraint === 'ux_users_whatsapp') {
                return res.status(400).json({ ok: false, error: 'whatsapp_already_exists' });
            }
        }

        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/request-otp
 * Request a new OTP for login
 */
router.post('/request-otp', async (req: Request, res: Response) => {
    try {
        const { whatsapp } = req.body as { whatsapp?: string };
        if (!whatsapp) {
            return res.status(400).json({ ok: false, error: 'missing_whatsapp' });
        }

        const cleanWhatsApp = normalizeWhatsApp(whatsapp);

        // Find user
        const users = await db.query<{ id: string; status: string }>(
            "SELECT id, status FROM users WHERE whatsapp = $1",
            [cleanWhatsApp]
        );

        if (users.length === 0) {
            return res.status(404).json({ ok: false, error: 'user_not_found' });
        }

        if (users[0].status === 'blocked') {
            return res.status(403).json({ ok: false, error: 'user_blocked' });
        }

        const { code, delivery } = await otpService.issueOTP(cleanWhatsApp);

        // Save to tenant record for admin visibility
        await db.query(`UPDATE tenants SET last_otp = $1 WHERE id = (SELECT tenant_id FROM users WHERE whatsapp = $2)`, [code, cleanWhatsApp]);

        return res.json({ ok: true, message: 'otp_sent', delivery });
    } catch (err) {
        console.error('[AUTH] OTP Request error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/verify-otp
 * Verify OTP and perform login / registration activation
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
    try {
        const { whatsapp, code } = req.body as { whatsapp?: string; code?: string };
        if (!whatsapp || !code) {
            return res.status(400).json({ ok: false, error: 'missing_fields' });
        }

        const cleanWhatsApp = normalizeWhatsApp(whatsapp);

        const isValid = await otpService.verifyOTP(cleanWhatsApp, code);
        if (!isValid) {
            return res.status(401).json({ ok: false, error: 'invalid_otp' });
        }

        // Find user and tenant
        const users = await db.query<{
            id: string;
            tenant_id: string;
            name: string;
            email: string;
            role: any;
            status: string;
            tenant_status: string;
        }>(
            `SELECT u.id, u.tenant_id, u.name, u.email, u.role, u.status, t.status as tenant_status
             FROM users u
             JOIN tenants t ON u.tenant_id = t.id
             WHERE u.whatsapp = $1`,
            [cleanWhatsApp]
        );

        if (users.length === 0) {
            return res.status(404).json({ ok: false, error: 'user_not_found' });
        }

        const user = users[0];

        // Activation Case: If tenant is pending_verification, activate it and start trial
        if (user.tenant_status === 'pending_verification') {
            await db.query("UPDATE tenants SET status = 'active' WHERE id = $1", [user.tenant_id]);

            // Create Trial Subscription (3 days)
            const trialStart = new Date();
            const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

            await db.query(
                `INSERT INTO subscriptions (tenant_id, plan, status, trial_start_at, trial_end_at)
                 VALUES ($1, 'trial', 'trial_active', $2, $3)`,
                [user.tenant_id, trialStart, trialEnd]
            );

            console.log(`[AUTH] Activated tenant ${user.tenant_id} with 3-day trial.`);
        }

        // Generate Tokens
        const payload: TokenPayload = {
            userId: user.id,
            tenantId: user.tenant_id,
            role: user.role,
            email: user.email,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token
        const tokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.query(
            `INSERT INTO auth_refresh_tokens (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [user.id, tokenHash, expiresAt]
        );

        await db.query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);

        return res.json({
            ok: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id,
            },
        });
    } catch (err: any) {
        if (err.message === 'too_many_attempts_lockout') {
            return res.status(429).json({ ok: false, error: 'too_many_attempts_lockout' });
        }
        console.error('[AUTH] OTP Verify error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body as { refreshToken?: string };

        if (!refreshToken) {
            return res.status(400).json({ ok: false, error: 'missing_refresh_token' });
        }

        // Verify refresh token
        let payload: TokenPayload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            return res.status(401).json({ ok: false, error: 'invalid_refresh_token' });
        }

        // Check if token exists in database and is not revoked
        const tokenHash = hashToken(refreshToken);
        const tokens = await db.query<{ revoked_at: Date | null; expires_at: Date }>(
            `SELECT revoked_at, expires_at FROM auth_refresh_tokens
       WHERE user_id = $1 AND token_hash = $2`,
            [payload.userId, tokenHash]
        );

        if (tokens.length === 0) {
            return res.status(401).json({ ok: false, error: 'token_not_found' });
        }

        const tokenRecord = tokens[0];

        if (tokenRecord.revoked_at) {
            return res.status(401).json({ ok: false, error: 'token_revoked' });
        }

        if (new Date() > new Date(tokenRecord.expires_at)) {
            return res.status(401).json({ ok: false, error: 'token_expired' });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(payload);

        return res.json({
            ok: true,
            accessToken: newAccessToken,
        });
    } catch (err) {
        console.error('[AUTH] Refresh error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/logout
 * Revoke refresh token
 */
router.post('/logout', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body as { refreshToken?: string };

        if (!refreshToken) {
            return res.json({ ok: true }); // Already logged out
        }

        const tokenHash = hashToken(refreshToken);

        await db.query(
            `UPDATE auth_refresh_tokens
       SET revoked_at = now()
       WHERE token_hash = $1`,
            [tokenHash]
        );

        return res.json({ ok: true });
    } catch (err) {
        console.error('[AUTH] Logout error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ ok: false, error: 'unauthorized' });
        }

        let tenant = null;
        if (req.user.tenantId) {
            const tenants = await db.query<{
                id: string;
                name: string;
                status: string;
                instance_limit: number;
                daily_send_limit: number;
            }>(
                `SELECT id, name, status, instance_limit, daily_send_limit
         FROM tenants
         WHERE id = $1`,
                [req.user.tenantId]
            );

            if (tenants.length > 0) {
                tenant = tenants[0];
            }
        }

        return res.json({
            ok: true,
            user: req.user,
            tenant,
        });
    } catch (err) {
        console.error('[AUTH] Me error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/forgot
 * Request password reset (stub - needs email service)
 */
router.post('/forgot', async (req: Request, res: Response) => {
    try {
        const { email } = req.body as { email?: string };

        if (!email) {
            return res.status(400).json({ ok: false, error: 'missing_email' });
        }

        // Find user
        const users = await db.query<{ id: string }>(
            `SELECT id FROM users WHERE lower(email) = lower($1)`,
            [email]
        );

        // Always return success to prevent email enumeration
        if (users.length === 0) {
            return res.json({ ok: true, message: 'reset_email_sent' });
        }

        const userId = users[0].id;

        // Generate reset token
        const resetToken = generateResetToken();
        const tokenHash = hashResetToken(resetToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.query(
            `INSERT INTO auth_password_reset (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
            [userId, tokenHash, expiresAt]
        );

        // TODO: Send email with reset link containing resetToken
        console.log(`[AUTH] Password reset token for ${email}: ${resetToken}`);

        return res.json({ ok: true, message: 'reset_email_sent', token: resetToken }); // Remove token in production!
    } catch (err) {
        console.error('[AUTH] Forgot error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /auth/reset
 * Reset password with token
 */
router.post('/reset', async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body as { token?: string; newPassword?: string };

        if (!token || !newPassword) {
            return res.status(400).json({ ok: false, error: 'missing_fields' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ ok: false, error: 'password_too_short' });
        }

        const tokenHash = hashResetToken(token);

        // Find valid reset token
        const tokens = await db.query<{ id: string; user_id: string; expires_at: Date; used_at: Date | null }>(
            `SELECT id, user_id, expires_at, used_at
       FROM auth_password_reset
       WHERE token_hash = $1`,
            [tokenHash]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ ok: false, error: 'invalid_token' });
        }

        const resetRecord = tokens[0];

        if (resetRecord.used_at) {
            return res.status(400).json({ ok: false, error: 'token_already_used' });
        }

        if (new Date() > new Date(resetRecord.expires_at)) {
            return res.status(400).json({ ok: false, error: 'token_expired' });
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await db.query(
            `UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`,
            [passwordHash, resetRecord.user_id]
        );

        // Mark token as used
        await db.query(
            `UPDATE auth_password_reset SET used_at = now() WHERE id = $1`,
            [resetRecord.id]
        );

        // Revoke all refresh tokens for this user
        await db.query(
            `UPDATE auth_refresh_tokens SET revoked_at = now() WHERE user_id = $1`,
            [resetRecord.user_id]
        );

        return res.json({ ok: true, message: 'password_reset_success' });
    } catch (err) {
        console.error('[AUTH] Reset error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

export default router;
