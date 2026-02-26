import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../utils/auth.js';
import db from '../db/connection.js';

// Extend Express Request to include user and tenantId
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                tenantId: string | null;
                role: 'superadmin' | 'admin_tenant' | 'user_tenant';
                email: string;
                name: string;
            };
            tenantId?: string;
        }
    }
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ ok: false, error: 'missing_token' });
            return;
        }

        const token = authHeader.substring(7);

        let payload: TokenPayload;
        try {
            payload = verifyAccessToken(token);
        } catch (err) {
            res.status(401).json({ ok: false, error: 'invalid_token' });
            return;
        }

        // Fetch full user from database
        const users = await db.query<{
            id: string;
            tenant_id: string | null;
            name: string;
            email: string;
            role: 'superadmin' | 'admin_tenant' | 'user_tenant';
            status: 'active' | 'blocked';
        }>(
            `SELECT id, tenant_id, name, email, role, status 
       FROM users 
       WHERE id = $1`,
            [payload.userId]
        );

        if (users.length === 0) {
            res.status(401).json({ ok: false, error: 'user_not_found' });
            return;
        }

        const user = users[0];

        if (user.status === 'blocked') {
            res.status(403).json({ ok: false, error: 'user_blocked' });
            return;
        }

        // Check if tenant is blocked
        if (user.tenant_id) {
            const tenants = await db.query<{ status: 'active' | 'blocked' }>(
                `SELECT status FROM tenants WHERE id = $1`,
                [user.tenant_id]
            );

            if (tenants.length === 0 || tenants[0].status === 'blocked') {
                res.status(403).json({ ok: false, error: 'tenant_blocked' });
                return;
            }
        }

        // Attach user to request
        req.user = {
            id: user.id,
            tenantId: user.tenant_id,
            role: user.role,
            email: user.email,
            name: user.name,
        };

        req.tenantId = user.tenant_id ?? undefined;

        next();
    } catch (err) {
        console.error('[AUTH] Middleware error:', err);
        res.status(500).json({ ok: false, error: 'internal_error' });
    }
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export async function optionalAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
    }

    try {
        await authMiddleware(req, res, next);
    } catch {
        next();
    }
}
