
import { getInstance } from './whatsapp.js';
import { toJid, isConnected } from '../utils/helpers.js';
import { config } from '../config.js';
import { checkDailySendLimit, incrementDailyUsage } from './limits.js';

export type DispatchResult = { ok: boolean; error?: string; status?: number; messageId?: string; hint?: string; format?: string };

export type MessageType = 'text' | 'image' | 'video' | 'menu' | 'buttons' | 'interactive' | 'list' | 'poll' | 'carousel';

export interface TextPayload { text: string; footer?: string; }
export interface ImagePayload { imageUrl: string; caption?: string; }
export interface VideoPayload { videoUrl: string; caption?: string; }
export interface MenuPayload { title?: string; text?: string; options: (string | { text: string })[]; footer?: string; }
export interface ButtonsPayload { text: string; buttons: { id: string; text: string }[]; footer?: string; }
export interface InteractivePayload { text: string; buttons: any[]; footer?: string; }
export interface ListPayload { text: string; buttonText: string; sections: any[]; footer?: string; }
export interface PollPayload { name: string; options: string[]; selectableCount?: number; }
export interface CarouselPayload { text?: string; cards: any[]; footer?: string; }

export type UnifiedPayload =
    | { type: 'text'; payload: TextPayload }
    | { type: 'image'; payload: ImagePayload }
    | { type: 'video'; payload: VideoPayload }
    | { type: 'menu'; payload: MenuPayload }
    | { type: 'buttons'; payload: ButtonsPayload }
    | { type: 'interactive'; payload: InteractivePayload }
    | { type: 'list'; payload: ListPayload }
    | { type: 'poll'; payload: PollPayload }
    | { type: 'carousel'; payload: CarouselPayload };

async function validateContext(tenantId: string, instanceName: string): Promise<{ ctx?: ReturnType<typeof getInstance>; error?: string; status?: number }> {
    const ctx = getInstance(instanceName);

    if (!ctx) {
        return { error: 'instance_not_found', status: 404 };
    }

    // Verify tenant ownership - Superadmin bypasses ownership check (handled by caller passing 'system' or correct tenantId)
    // Here we strictly check if the context belongs to the tenant requesting it
    if (tenantId !== 'system' && ctx.tenantId !== tenantId) {
        return { error: 'forbidden_instance_access', status: 403 };
    }

    if (!isConnected(ctx)) {
        return { error: 'instance_not_connected', status: 400 };
    }
    return { ctx };
}

async function checkLimits(tenantId: string): Promise<boolean> {
    if (tenantId === 'system') return true;
    return await checkDailySendLimit(tenantId);
}

// --- 0. TEXTO SIMPLES ---
export async function sendText(tenantId: string, instanceName: string, to: string, text: string, footer: string | undefined): Promise<DispatchResult> {
    if (!to || !text) {
        return { ok: false, error: 'missing to/text', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    const content = footer ? `${text}\n\n_${footer}_` : text;
    const result = await ctx!.sock.sendMessage(jid, { text: content });
    await incrementDailyUsage(tenantId);

    return { ok: true, messageId: result?.key?.id };
}

// --- 0.1 IMAGEM ---
export async function sendImage(tenantId: string, instanceName: string, to: string, imageUrl: string, caption?: string): Promise<DispatchResult> {
    if (!to || !imageUrl) {
        return { ok: false, error: 'missing to/imageUrl', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    const result = await ctx!.sock.sendMessage(jid, {
        image: { url: String(imageUrl) },
        caption: caption ? String(caption) : undefined,
    });

    await incrementDailyUsage(tenantId);
    return { ok: true, messageId: result?.key?.id, format: 'image' };
}

// --- 0.2 VIDEO ---
export async function sendVideo(tenantId: string, instanceName: string, to: string, videoUrl: string, caption?: string): Promise<DispatchResult> {
    if (!to || !videoUrl) {
        return { ok: false, error: 'missing to/videoUrl', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    const result = await ctx!.sock.sendMessage(jid, {
        video: { url: String(videoUrl) },
        caption: caption ? String(caption) : undefined,
    });

    await incrementDailyUsage(tenantId);
    return { ok: true, messageId: result?.key?.id, format: 'video' };
}

// --- 1. MENU TEXTO ---
export async function sendMenu(tenantId: string, instanceName: string, to: string, title: string | undefined, text: string | undefined, options: any[], footer: string | undefined): Promise<DispatchResult> {
    if (!to || !Array.isArray(options) || options.length === 0) {
        return { ok: false, error: 'missing to/options', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    let menuText = '';
    if (title) menuText += `*${title}*\n\n`;
    if (text) menuText += `${text}\n\n`;
    options.forEach((opt, idx) => {
        const label = typeof opt === 'string' ? opt : (opt as { text?: string }).text ?? `Opção ${idx + 1}`;
        menuText += `*${idx + 1}.* ${label}\n`;
    });
    if (footer) menuText += `\n_${footer}_`;

    const result = await ctx!.sock.sendMessage(jid, { text: menuText.trim() });
    await incrementDailyUsage(tenantId);

    return { ok: true, messageId: result?.key?.id, hint: 'User should reply with the option number' };
}

// --- 2. BOTÕES QUICK REPLY ---
export async function sendButtons(tenantId: string, instanceName: string, to: string, text: string, buttons: Array<{ id: string; text: string }>, footer: string | undefined): Promise<DispatchResult> {
    if (!to || !text || !Array.isArray(buttons) || buttons.length === 0) {
        return { ok: false, error: 'missing to/text/buttons', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    const limited = buttons.slice(0, config.limits.maxButtons);
    const nativeButtons = limited.map((btn, idx) => ({
        type: 'reply' as const,
        id: btn.id ?? `btn_${idx}`,
        text: btn.text ?? `Botão ${idx + 1}`,
    }));

    const result = await ctx!.sock.sendMessage(jid, {
        nativeButtons,
        text: String(text),
        footer: footer ? String(footer) : undefined,
    });

    await incrementDailyUsage(tenantId);
    return { ok: true, format: 'nativeButtons', messageId: result?.key?.id };
}

// --- 3. BOTÕES INTERACTIVE (Url/Copy/Call) ---
export async function sendInteractive(tenantId: string, instanceName: string, to: string, text: string, buttons: any[], footer: string | undefined): Promise<DispatchResult> {
    if (!to || !text || !Array.isArray(buttons) || buttons.length === 0) {
        return { ok: false, error: 'missing to/text/buttons', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    const nativeButtons = buttons.slice(0, config.limits.maxButtons).map((btn, idx) => {
        const type = (btn.type ?? 'reply').toLowerCase();
        if (type === 'url' || btn.url) {
            return { type: 'url' as const, text: btn.text ?? 'Abrir', url: btn.url! };
        }
        if (type === 'copy' || btn.copyCode || btn.copyText) {
            return { type: 'copy' as const, text: btn.text ?? 'Copiar', copyText: btn.copyCode ?? btn.copyText ?? '' };
        }
        if (type === 'call' || btn.phoneNumber) {
            return { type: 'call' as const, text: btn.text ?? 'Ligar', phoneNumber: btn.phoneNumber! };
        }
        return { type: 'reply' as const, id: `btn_${idx}`, text: btn.text ?? 'Botão' };
    });

    const result = await ctx!.sock.sendMessage(jid, {
        nativeButtons,
        text: String(text),
        footer: footer ? String(footer) : undefined,
    });

    await incrementDailyUsage(tenantId);
    return { ok: true, format: 'nativeButtons', messageId: result?.key?.id };
}

// --- 4. LISTA ---
export async function sendList(tenantId: string, instanceName: string, to: string, text: string, buttonText: string, sections: any[], footer: string | undefined): Promise<DispatchResult> {
    if (!to || !text || !buttonText || !Array.isArray(sections) || sections.length === 0) {
        return { ok: false, error: 'missing to/text/buttonText/sections', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    const result = await ctx!.sock.sendMessage(jid, {
        nativeList: {
            buttonText: String(buttonText),
            sections: sections.map((s) => ({
                title: s.title ?? 'Opções',
                rows: (s.rows ?? []).map((row: any, idx: number) => ({
                    id: row.id ?? `row_${idx}`,
                    title: row.title ?? 'Item',
                    description: row.description ?? '',
                })),
            })),
        },
        text: String(text),
        footer: footer ? String(footer) : undefined,
    });

    await incrementDailyUsage(tenantId);
    return { ok: true, format: 'nativeList', messageId: result?.key?.id };
}

// --- 5. POLL ---
export async function sendPoll(tenantId: string, instanceName: string, to: string, name: string, options: any[], selectableCount: number | undefined): Promise<DispatchResult> {
    if (!to || !name || !Array.isArray(options) || options.length < 2) {
        return { ok: false, error: 'missing to/name/options (min 2)', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    const opts = options.slice(0, config.limits.maxPollOptions).map((o) => (typeof o === 'string' ? o : String(o)));

    const result = await ctx!.sock.sendMessage(jid, {
        poll: {
            name: String(name),
            values: opts,
            selectableCount: Math.min(Math.max(1, selectableCount ?? 1), opts.length),
        },
    });

    await incrementDailyUsage(tenantId);
    return { ok: true, messageId: result?.key?.id };
}

// --- 6. CAROUSEL ---
export async function sendCarousel(tenantId: string, instanceName: string, to: string, text: string | undefined, cards: any[], footer: string | undefined): Promise<DispatchResult> {
    if (!to || !Array.isArray(cards) || cards.length === 0) {
        return { ok: false, error: 'missing to/cards', status: 400 };
    }

    if (!(await checkLimits(tenantId))) return { ok: false, error: 'daily_limit_reached', status: 403 };

    const { ctx, error, status } = await validateContext(tenantId, instanceName);
    if (error) return { ok: false, error, status };

    const jid = toJid(to);
    if (!jid) return { ok: false, error: 'invalid_phone', status: 400 };

    const limited = cards.slice(0, config.limits.maxCarouselCards);
    const formattedCards = limited.map((card, idx) => ({
        title: card.title ?? `Card ${idx + 1}`,
        body: card.body ?? '',
        footer: card.footer,
        image: card.imageUrl ? { url: card.imageUrl } : undefined,
        buttons: (card.buttons ?? []).map((btn: any, bIdx: number) => ({
            type: 'reply' as const,
            id: btn.id ?? `card${idx}_btn${bIdx}`,
            text: btn.text ?? 'Botão',
        })),
    }));

    const result = await ctx!.sock.sendMessage(jid, {
        nativeCarousel: { cards: formattedCards },
        text: text ? String(text) : undefined,
        footer: footer ? String(footer) : undefined,
    });

    await incrementDailyUsage(tenantId);
    return { ok: true, format: 'nativeCarousel', messageId: result?.key?.id };
}

// --- UNIFIED SEND (API Integrations) ---
export async function sendUnified(tenantId: string, instanceName: string, to: string, type: MessageType, payload: any): Promise<DispatchResult> {
    switch (type) {
        case 'text':
            const textP = payload as TextPayload;
            return sendText(tenantId, instanceName, to, textP.text, textP.footer);

        case 'image':
            const imageP = payload as ImagePayload;
            return sendImage(tenantId, instanceName, to, imageP.imageUrl, imageP.caption);

        case 'video':
            const videoP = payload as VideoPayload;
            return sendVideo(tenantId, instanceName, to, videoP.videoUrl, videoP.caption);

        case 'menu':
            const menuP = payload as MenuPayload;
            return sendMenu(tenantId, instanceName, to, menuP.title, menuP.text, menuP.options, menuP.footer);

        case 'buttons':
            const buttonsP = payload as ButtonsPayload;
            return sendButtons(tenantId, instanceName, to, buttonsP.text, buttonsP.buttons, buttonsP.footer);

        case 'interactive':
            const interP = payload as InteractivePayload;
            return sendInteractive(tenantId, instanceName, to, interP.text, interP.buttons, interP.footer);

        case 'list':
            const listP = payload as ListPayload;
            return sendList(tenantId, instanceName, to, listP.text, listP.buttonText, listP.sections, listP.footer);

        case 'poll':
            const pollP = payload as PollPayload;
            return sendPoll(tenantId, instanceName, to, pollP.name, pollP.options, pollP.selectableCount);

        case 'carousel':
            const carP = payload as CarouselPayload;
            return sendCarousel(tenantId, instanceName, to, carP.text, carP.cards, carP.footer);

        default:
            return { ok: false, error: 'invalid_type', status: 400 };
    }
}
