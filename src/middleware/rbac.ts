import type { Request, Response, NextFunction } from 'express';

type UserRole = 'superadmin' | 'admin_tenant' | 'user_tenant';

/**
 * Require specific roles
 */
export function requireRole(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ ok: false, error: 'unauthorized' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ ok: false, error: 'forbidden', required_roles: roles });
            return;
        }

        next();
    };
}

/**
 * Require same tenant (or superadmin)
 */
export function requireSameTenant() {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ ok: false, error: 'unauthorized' });
            return;
        }

        // Superadmin can access everything
        if (req.user.role === 'superadmin') {
            next();
            return;
        }

        // Get tenant ID from request params or body
        const targetTenantId = req.params.tenantId || req.body.tenantId;

        if (!targetTenantId) {
            next();
            return;
        }

        if (req.user.tenantId !== targetTenantId) {
            res.status(403).json({ ok: false, error: 'forbidden_tenant_access' });
            return;
        }

        next();
    };
}

/**
 * Require tenant admin or superadmin
 */
export function requireTenantAdmin() {
    return requireRole('superadmin', 'admin_tenant');
}

/**
 * Require superadmin only
 */
export function requireSuperadmin() {
    return requireRole('superadmin');
}
