import { Router, type Request, type Response } from 'express';
import db from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireSuperadmin } from '../middleware/rbac.js';
import { hashPassword } from '../utils/auth.js';

const router = Router();

// Apply superadmin restriction to all routes
router.use(authMiddleware);
router.use(requireSuperadmin());

// --- TENANT CRUD ---

/**
 * GET /admin/tenants
 * List all tenants
 */
router.get('/tenants', async (req: Request, res: Response) => {
    try {
        const tenants = await db.query(`SELECT * FROM tenants ORDER BY created_at DESC`);
        return res.json({ ok: true, tenants });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /admin/tenants
 * Create new tenant
 */
router.post('/tenants', async (req: Request, res: Response) => {
    try {
        const { name, instance_limit = 1, daily_send_limit = 0 } = req.body;
        if (!name) return res.status(400).json({ ok: false, error: 'missing_name' });

        const result = await db.query(
            `INSERT INTO tenants (name, instance_limit, daily_send_limit) 
             VALUES ($1, $2, $3) RETURNING *`,
            [name, instance_limit, daily_send_limit]
        );

        return res.json({ ok: true, tenant: result[0] });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * PATCH /admin/tenants/:id
 * Update tenant (limits, status)
 */
router.patch('/tenants/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, status, instance_limit, daily_send_limit, due_date } = req.body;

        const result = await db.query(
            `UPDATE tenants SET 
                name = COALESCE($1, name),
                status = COALESCE($2, status),
                instance_limit = COALESCE($3, instance_limit),
                daily_send_limit = COALESCE($4, daily_send_limit),
                due_date = COALESCE($5, due_date),
                updated_at = now()
             WHERE id = $6 RETURNING *`,
            [name, status, instance_limit, daily_send_limit, due_date, id]
        );

        if (result.length === 0) return res.status(404).json({ ok: false, error: 'tenant_not_found' });
        return res.json({ ok: true, tenant: result[0] });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * DELETE /admin/tenants/:id
 * Delete tenant and all related data
 */
router.delete('/tenants/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete related data first
        await db.query(`DELETE FROM users WHERE tenant_id = $1`, [id]);
        await db.query(`DELETE FROM instances WHERE tenant_id = $1`, [id]);
        await db.query(`DELETE FROM subscriptions WHERE tenant_id = $1`, [id]);
        await db.query(`DELETE FROM tenant_daily_usage WHERE tenant_id = $1`, [id]);
        await db.query(`DELETE FROM tenant_hourly_usage WHERE tenant_id = $1`, [id]);

        const result = await db.query(`DELETE FROM tenants WHERE id = $1 RETURNING *`, [id]);
        if (result.length === 0) return res.status(404).json({ ok: false, error: 'tenant_not_found' });

        return res.json({ ok: true, message: 'tenant_deleted' });
    } catch (err) {
        console.error('[ADMIN] Delete tenant error:', err);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

// --- USER CRUD ---

/**
 * GET /admin/users
 * List all users
 */
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await db.query(
            `SELECT u.*, t.name as tenant_name 
             FROM users u 
             LEFT JOIN tenants t ON u.tenant_id = t.id 
             ORDER BY u.created_at DESC`
        );
        return res.json({ ok: true, users });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /admin/users
 * Create user for any tenant
 */
router.post('/users', async (req: Request, res: Response) => {
    try {
        const { tenant_id, name, email, password, role = 'user_tenant' } = req.body;
        if (!email || !password || !name) return res.status(400).json({ ok: false, error: 'missing_fields' });

        const password_hash = await hashPassword(password);
        const result = await db.query(
            `INSERT INTO users (tenant_id, name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, tenant_id`,
            [tenant_id, name, email.toLowerCase(), password_hash, role]
        );

        return res.json({ ok: true, user: result[0] });
    } catch (err: any) {
        if (err.message?.includes('ux_users_email')) {
            return res.status(400).json({ ok: false, error: 'email_already_exists' });
        }
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

// --- OTP CONFIGURATION ---

/**
 * GET /admin/otp-config
 * Fetch global OTP settings
 */
router.get('/otp-config', async (req: Request, res: Response) => {
    try {
        const result = await db.query(
            "SELECT value FROM global_settings WHERE key = 'otp_config'"
        );
        return res.json({ ok: true, config: result[0]?.value || {} });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /admin/otp-config
 * Update global OTP settings
 */
router.post('/otp-config', async (req: Request, res: Response) => {
    try {
        const {
            url,
            token,
            template,
            confirmOtpUrl,
            instance,
            channels,
            smtpHost,
            smtpPort,
            smtpSecure,
            smtpUser,
            smtpPass,
            smtpFrom,
            smsUrl,
            smsAuthKey,
            smsSender,
        } = req.body;

        const defaultTemplate = {
            instance: instance || 'main',
            to: '{{number}}',
            text: 'Visite nosso site:',
            buttons: [
                {
                    type: 'url',
                    text: 'Acessar Site',
                    url: '{{url_confimar_otp}}'
                },
                {
                    type: 'copy',
                    text: 'Copiar',
                    copyCode: '{{code_otp}}'
                }
            ],
            footer: 'RZ Sender'
        };

        const newValue = {
            url: url || '',
            token: token || '',
            confirmOtpUrl: confirmOtpUrl || '',
            instance: instance || 'main',
            template: template || defaultTemplate,
            channels: {
                whatsapp: channels?.whatsapp !== false,
                email: channels?.email === true,
                sms: channels?.sms === true,
            },
            smtp: {
                host: smtpHost || '',
                port: Number(smtpPort || 587),
                secure: smtpSecure === true,
                user: smtpUser || '',
                pass: smtpPass || '',
                from: smtpFrom || smtpUser || '',
            },
            sms: {
                url: smsUrl || 'https://sms.comtele.com.br/api/v2/send',
                authKey: smsAuthKey || '',
                sender: smsSender || 'RZSender',
            },
        };

        await db.query(
            `INSERT INTO global_settings (key, value, updated_at)
             VALUES ('otp_config', $1, now())
             ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
            [JSON.stringify(newValue)]
        );

        return res.json({ ok: true, message: 'otp_config_updated' });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

// --- SYSTEM METRICS ---

/**
 * GET /admin/metrics
 * Overview of the system
 */
router.get('/metrics', async (req: Request, res: Response) => {
    try {
        const tenantCount = await db.query(`SELECT COUNT(*) FROM tenants`);
        const userCount = await db.query(`SELECT COUNT(*) FROM users`);
        const instanceCount = await db.query(`SELECT COUNT(*) FROM instances`);
        const totalSends = await db.query(`SELECT SUM(sends_count) FROM tenant_daily_usage`);

        return res.json({
            ok: true,
            metrics: {
                tenants: parseInt(tenantCount[0].count),
                users: parseInt(userCount[0].count),
                instances: parseInt(instanceCount[0].count),
                total_sends: parseInt(totalSends[0].sum || '0'),
            }
        });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

export default router;
