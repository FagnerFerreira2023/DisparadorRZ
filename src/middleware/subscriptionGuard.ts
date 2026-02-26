import type { Request, Response, NextFunction } from 'express';
import db from '../db/connection.js';

/**
 * Subscription Guard Middleware
 * Verifies if the tenant has an active subscription or a valid trial.
 */
export async function subscriptionGuard(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const tenantId = req.tenantId;

        // Superadmin bypass
        if (req.user?.role === 'superadmin') {
            next();
            return;
        }

        if (!tenantId) {
            res.status(401).json({ ok: false, error: 'tenant_not_found' });
            return;
        }

        // Fetch current subscription
        const subs = await db.query<{
            status: string;
            trial_end_at: Date | null;
            plan: string;
        }>(
            `SELECT status, trial_end_at, plan
             FROM subscriptions
             WHERE tenant_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [tenantId]
        );

        if (subs.length === 0) {
            // No subscription record found, but tenant might be new
            // Check if tenant is pending verification
            const tenants = await db.query<{ status: string }>(
                "SELECT status FROM tenants WHERE id = $1",
                [tenantId]
            );

            if (tenants.length > 0 && tenants[0].status === 'pending_verification') {
                res.status(403).json({ ok: false, error: 'verification_pending', hint: 'verify_otp' });
                return;
            }

            res.status(403).json({ ok: false, error: 'no_subscription' });
            return;
        }

        const sub = subs[0];

        // Check for trial expiry
        if (sub.status === 'trial_active' && sub.trial_end_at && new Date() > new Date(sub.trial_end_at)) {
            // Auto-update status to trial_expired
            await db.query(
                "UPDATE subscriptions SET status = 'trial_expired' WHERE tenant_id = $1 AND status = 'trial_active'",
                [tenantId]
            );
            res.status(403).json({ ok: false, error: 'trial_expired' });
            return;
        }

        if (sub.status === 'trial_expired') {
            res.status(403).json({ ok: false, error: 'trial_expired' });
            return;
        }

        if (sub.status === 'canceled' || sub.status === 'past_due') {
            res.status(403).json({ ok: false, error: 'subscription_inactive', status: sub.status });
            return;
        }

        next();
    } catch (err) {
        console.error('[SUBSCRIPTION] Guard error:', err);
        res.status(500).json({ ok: false, error: 'internal_error' });
    }
}
