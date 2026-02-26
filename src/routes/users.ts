import { Router, type Request, type Response } from 'express';
import db from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireTenantAdmin } from '../middleware/rbac.js';
import { hashPassword } from '../utils/auth.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /v1/users
 * List users in the current tenant
 */
router.get('/', requireTenantAdmin(), async (req: Request, res: Response) => {
    try {
        const users = await db.query(
            `SELECT id, name, email, role, status, created_at, last_login_at 
             FROM users 
             WHERE tenant_id = $1 
             ORDER BY created_at DESC`,
            [req.tenantId]
        );
        return res.json({ ok: true, users });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * POST /v1/users
 * Create user in the current tenant
 */
router.post('/', requireTenantAdmin(), async (req: Request, res: Response) => {
    try {
        const { name, email, password, role = 'user_tenant' } = req.body;
        if (!email || !password || !name) return res.status(400).json({ ok: false, error: 'missing_fields' });

        // Force role to user_tenant unless specified otherwise (but restrict to tenant roles)
        const userRole = role === 'admin_tenant' ? 'admin_tenant' : 'user_tenant';

        const password_hash = await hashPassword(password);
        const result = await db.query(
            `INSERT INTO users (tenant_id, name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
            [req.tenantId, name, email.toLowerCase(), password_hash, userRole]
        );

        return res.json({ ok: true, user: result[0] });
    } catch (err: any) {
        if (err.message?.includes('ux_users_email')) {
            return res.status(400).json({ ok: false, error: 'email_already_exists' });
        }
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * PATCH /v1/users/:id
 * Toggle status or change role
 */
router.patch('/:id', requireTenantAdmin(), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, role } = req.body;

        const result = await db.query(
            `UPDATE users SET 
                status = COALESCE($1, status),
                role = COALESCE($2, role),
                updated_at = now()
             WHERE id = $3 AND tenant_id = $4 RETURNING id`,
            [status, role, id, req.tenantId]
        );

        if (result.length === 0) return res.status(404).json({ ok: false, error: 'user_not_found' });
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

/**
 * DELETE /v1/users/:id
 */
router.get('/:id', requireTenantAdmin(), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id`,
            [id, req.tenantId]
        );

        if (result.length === 0) return res.status(404).json({ ok: false, error: 'user_not_found' });
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});

export default router;
