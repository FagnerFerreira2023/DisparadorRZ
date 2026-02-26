import db from '../db/connection.js';

function isValidTenantUuid(tenantId: string): boolean {
    if (!tenantId || tenantId === 'system') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantId);
}

/**
 * Check if tenant can create more instances
 */
export async function checkInstanceLimit(tenantId: string): Promise<boolean> {
    try {
        // Get tenant limits
        const tenants = await db.query<{ instance_limit: number }>(
            `SELECT instance_limit FROM tenants WHERE id = $1`,
            [tenantId]
        );

        if (tenants.length === 0) {
            return false;
        }

        const limit = tenants[0].instance_limit;

        // Count current instances
        const counts = await db.query<{ count: string }>(
            `SELECT COUNT(*) as count FROM instances WHERE tenant_id = $1`,
            [tenantId]
        );

        const currentCount = parseInt(counts[0].count, 10);

        return currentCount < limit;
    } catch (err) {
        console.error('[LIMITS] Error checking instance limit:', err);
        return false;
    }
}

/**
 * Check if tenant can send more messages today and this hour
 */
export async function checkDailySendLimit(tenantId: string, count: number = 1): Promise<boolean> {
    try {
        if (!isValidTenantUuid(tenantId)) return true;

        // Get subscription and limits
        const tenants = await db.query<{
            daily_send_limit: number;
            plan: string;
            status: string;
        }>(
            `SELECT t.daily_send_limit, s.plan, s.status
             FROM tenants t
             LEFT JOIN subscriptions s ON t.id = s.tenant_id
             WHERE t.id = $1
             ORDER BY s.created_at DESC LIMIT 1`,
            [tenantId]
        );

        if (tenants.length === 0) return false;

        const { daily_send_limit, plan, status } = tenants[0];

        // Trial Specific Limits
        let dailyLimit = daily_send_limit;
        let hourlyLimit = 999999; // Default high

        if (plan === 'trial' && status === 'trial_active') {
            dailyLimit = 50;
            hourlyLimit = 10;
        }

        // 1. Check Daily
        const today = new Date().toISOString().split('T')[0];
        const dailyUsage = await db.query<{ sends_count: number }>(
            `SELECT sends_count FROM tenant_daily_usage
             WHERE tenant_id = $1 AND usage_date = $2`,
            [tenantId, today]
        );
        const currentDaily = dailyUsage.length > 0 ? dailyUsage[0].sends_count : 0;
        if ((currentDaily + count) > dailyLimit) return false;

        // 2. Check Hourly
        const now = new Date();
        const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
        const hourlyUsage = await db.query<{ sends_count: number }>(
            `SELECT sends_count FROM tenant_hourly_usage
             WHERE tenant_id = $1 AND usage_hour = $2`,
            [tenantId, hourStart]
        );
        const currentHourly = hourlyUsage.length > 0 ? hourlyUsage[0].sends_count : 0;
        if ((currentHourly + count) > hourlyLimit) return false;

        return true;
    } catch (err) {
        console.error('[LIMITS] Error checking limit:', err);
        return false;
    }
}

/**
 * Increment usage counters (Daily and Hourly)
 */
export async function incrementDailyUsage(tenantId: string, count: number = 1): Promise<void> {
    try {
        if (!isValidTenantUuid(tenantId)) return;

        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

        // Daily
        await db.query(
            `INSERT INTO tenant_daily_usage (tenant_id, usage_date, sends_count)
             VALUES ($1, $2, $3)
             ON CONFLICT (tenant_id, usage_date)
             DO UPDATE SET sends_count = tenant_daily_usage.sends_count + $3`,
            [tenantId, today, count]
        );

        // Hourly
        await db.query(
            `INSERT INTO tenant_hourly_usage (tenant_id, usage_hour, sends_count)
             VALUES ($1, $2, $3)
             ON CONFLICT (tenant_id, usage_hour)
             DO UPDATE SET sends_count = tenant_hourly_usage.sends_count + $3`,
            [tenantId, hourStart, count]
        );
    } catch (err) {
        console.error('[LIMITS] Error incrementing usage:', err);
        return;
    }
}

/**
 * Get current usage stats for a tenant
 */
export async function getTenantUsage(tenantId: string): Promise<{
    instanceCount: number;
    instanceLimit: number;
    dailySendCount: number;
    dailySendLimit: number;
}> {
    try {
        // Get limits
        const tenants = await db.query<{ instance_limit: number; daily_send_limit: number }>(
            `SELECT instance_limit, daily_send_limit FROM tenants WHERE id = $1`,
            [tenantId]
        );

        if (tenants.length === 0) {
            return {
                instanceCount: 0,
                instanceLimit: 0,
                dailySendCount: 0,
                dailySendLimit: 0,
            };
        }

        const { instance_limit, daily_send_limit } = tenants[0];

        // Get instance count
        const instanceCounts = await db.query<{ count: string }>(
            `SELECT COUNT(*) as count FROM instances WHERE tenant_id = $1`,
            [tenantId]
        );
        const instanceCount = parseInt(instanceCounts[0].count, 10);

        // Get today's usage
        const today = new Date().toISOString().split('T')[0];
        const usage = await db.query<{ sends_count: number }>(
            `SELECT sends_count FROM tenant_daily_usage
       WHERE tenant_id = $1 AND usage_date = $2`,
            [tenantId, today]
        );
        const dailySendCount = usage.length > 0 ? usage[0].sends_count : 0;

        return {
            instanceCount,
            instanceLimit: instance_limit,
            dailySendCount,
            dailySendLimit: daily_send_limit,
        };
    } catch (err) {
        console.error('[LIMITS] Error getting tenant usage:', err);
        throw err;
    }
}
