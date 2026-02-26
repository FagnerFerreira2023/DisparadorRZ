import bcrypt from 'bcryptjs';
import db from './connection.js';

async function seed() {
    console.log('[SEED] Starting database seed...');

    try {
        // 1. Create demo tenant
        console.log('[SEED] Creating demo tenant...');
        const tenantResult = await db.query<{ id: string }>(
            `INSERT INTO tenants (name, status, instance_limit, daily_send_limit)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING
       RETURNING id`,
            ['Tenant Demo', 'active', 5, 2000]
        );

        let tenantId: string;
        if (tenantResult.length > 0) {
            tenantId = tenantResult[0].id;
            console.log(`[SEED] ✓ Demo tenant created: ${tenantId}`);
        } else {
            // Tenant already exists, get it
            const existing = await db.query<{ id: string }>(
                `SELECT id FROM tenants WHERE name = $1`,
                ['Tenant Demo']
            );
            tenantId = existing[0].id;
            console.log(`[SEED] ✓ Demo tenant already exists: ${tenantId}`);
        }

        // 2. Create superadmin (tenant_id = NULL)
        console.log('[SEED] Creating superadmin user...');
        const superadminHash = await bcrypt.hash('Admin@123', 12);

        const superadminResult = await db.query(
            `INSERT INTO users (tenant_id, name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (lower(email)) DO NOTHING
       RETURNING id`,
            [null, 'Super Admin', 'admin@saas.local', superadminHash, 'superadmin', 'active']
        );

        if (superadminResult.length > 0) {
            console.log(`[SEED] ✓ Superadmin created: admin@saas.local / Admin@123`);
        } else {
            console.log(`[SEED] ✓ Superadmin already exists: admin@saas.local`);
        }

        // 3. Create admin_tenant for demo tenant
        console.log('[SEED] Creating admin_tenant user...');
        const adminTenantHash = await bcrypt.hash('Demo@123', 12);

        const adminResult = await db.query(
            `INSERT INTO users (tenant_id, name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (lower(email)) DO NOTHING
       RETURNING id`,
            [tenantId, 'Admin Tenant Demo', 'admin@tenant.local', adminTenantHash, 'admin_tenant', 'active']
        );

        if (adminResult.length > 0) {
            console.log(`[SEED] ✓ Admin tenant created: admin@tenant.local / Demo@123`);
        } else {
            console.log(`[SEED] ✓ Admin tenant already exists: admin@tenant.local`);
        }

        // 4. Create regular user for demo tenant
        console.log('[SEED] Creating user_tenant user...');
        const userHash = await bcrypt.hash('User@123', 12);

        const userResult = await db.query(
            `INSERT INTO users (tenant_id, name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (lower(email)) DO NOTHING
       RETURNING id`,
            [tenantId, 'User Demo', 'user@tenant.local', userHash, 'user_tenant', 'active']
        );

        if (userResult.length > 0) {
            console.log(`[SEED] ✓ User tenant created: user@tenant.local / User@123`);
        } else {
            console.log(`[SEED] ✓ User tenant already exists: user@tenant.local`);
        }

        console.log('\n[SEED] ✅ Seed completed successfully!');
        console.log('\n[SEED] Default credentials:');
        console.log('  Superadmin:   admin@saas.local / Admin@123');
        console.log('  Admin Tenant: admin@tenant.local / Demo@123');
        console.log('  User Tenant:  user@tenant.local / User@123');
        console.log('');

    } catch (err) {
        console.error('[SEED] ❌ Error:', err);
        throw err;
    } finally {
        await db.closePool();
    }
}

seed().catch((err) => {
    console.error('[SEED] Fatal error:', err);
    process.exit(1);
});
