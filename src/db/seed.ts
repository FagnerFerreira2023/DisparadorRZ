import bcrypt from 'bcryptjs';
import db from './connection.js';

async function seed() {
    console.log('[SEED] Starting database seed...');

    try {
        const superadminDefaultPassword = process.env.DEFAULT_SUPERADMIN_PASSWORD ?? 'Mudar@123';
        const superadminDefaultEmail = (process.env.DEFAULT_SUPERADMIN_EMAIL ?? 'superadmin@pizzbot.cloud').toLowerCase();
        const superadminDefaultWhatsApp = process.env.DEFAULT_SUPERADMIN_WHATSAPP ?? '5513981577934';
        const legacySuperadminEmail = (process.env.LEGACY_SUPERADMIN_EMAIL ?? 'admin@saas.local').toLowerCase();
        const adminDefaultPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? superadminDefaultPassword;
        const adminDefaultEmail = (process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@pizzbot.cloud').toLowerCase();

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
        const superadminHash = await bcrypt.hash(superadminDefaultPassword, 12);

        const targetSuperadmin = await db.query<{ id: string }>(
            `SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1`,
            [superadminDefaultEmail]
        );

        const legacySuperadmin = await db.query<{ id: string }>(
            `SELECT id
             FROM users
             WHERE lower(email) = lower($1)
                OR whatsapp = $2
             ORDER BY created_at ASC
             LIMIT 1`,
            [legacySuperadminEmail, superadminDefaultWhatsApp]
        );

        if (targetSuperadmin.length > 0) {
            await db.query(
                `UPDATE users
                 SET name = 'Super Admin',
                     whatsapp = $1,
                     password_hash = $2,
                     role = 'superadmin',
                     status = 'active',
                     tenant_id = NULL,
                     updated_at = now()
                 WHERE id = $3`,
                [superadminDefaultWhatsApp, superadminHash, targetSuperadmin[0].id]
            );

            if (legacySuperadmin.length > 0 && legacySuperadmin[0].id !== targetSuperadmin[0].id) {
                await db.query(`DELETE FROM users WHERE id = $1`, [legacySuperadmin[0].id]);
            }

            console.log(`[SEED] ✓ Superadmin synchronized: ${superadminDefaultEmail}`);
        } else if (legacySuperadmin.length > 0) {
            await db.query(
                `UPDATE users
                 SET name = 'Super Admin',
                     email = $1,
                     whatsapp = $2,
                     password_hash = $3,
                     role = 'superadmin',
                     status = 'active',
                     tenant_id = NULL,
                     updated_at = now()
                 WHERE id = $4`,
                [superadminDefaultEmail, superadminDefaultWhatsApp, superadminHash, legacySuperadmin[0].id]
            );

            console.log(`[SEED] ✓ Legacy superadmin migrated to: ${superadminDefaultEmail}`);
        } else {
            await db.query(
                `INSERT INTO users (tenant_id, name, email, whatsapp, password_hash, role, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [null, 'Super Admin', superadminDefaultEmail, superadminDefaultWhatsApp, superadminHash, 'superadmin', 'active']
            );

            console.log(`[SEED] ✓ Superadmin created: ${superadminDefaultEmail}`);
        }

        // Optional secondary admin account requested
        const adminHash = await bcrypt.hash(adminDefaultPassword, 12);

        await db.query(
            `INSERT INTO users (tenant_id, name, email, whatsapp, password_hash, role, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (lower(email)) DO NOTHING`,
            [null, 'Admin', adminDefaultEmail, null, adminHash, 'superadmin', 'active']
        );

        await db.query(
            `UPDATE users
             SET password_hash = $1, role = 'superadmin', status = 'active', tenant_id = NULL, updated_at = now()
             WHERE lower(email) = lower($2)`,
            [adminHash, adminDefaultEmail]
        );

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

        // 5. Configure OTP delivery settings from environment (SMTP via stack)
        const smtpHost = process.env.SMTP_HOST ?? '';
        const smtpPort = Number(process.env.SMTP_PORT ?? '587');
        const smtpSecure = String(process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true';
        const smtpUser = process.env.SMTP_USER ?? '';
        const smtpPass = process.env.SMTP_PASS ?? '';
        const smtpFrom = process.env.SMTP_FROM ?? smtpUser;
        const otpConfirmUrl = process.env.OTP_CONFIRM_URL ?? '';
        const otpWhatsappEnabled = String(process.env.OTP_WHATSAPP_ENABLED ?? 'true').toLowerCase() === 'true';
        const otpEmailEnabled = String(process.env.OTP_EMAIL_ENABLED ?? 'true').toLowerCase() === 'true';
        const otpSmsEnabled = String(process.env.OTP_SMS_ENABLED ?? 'false').toLowerCase() === 'true';

        const otpConfig = {
            url: '',
            token: '',
            template: 'Seu código de confirmação é {{code}}',
            confirmOtpUrl: otpConfirmUrl,
            channels: {
                whatsapp: otpWhatsappEnabled,
                email: otpEmailEnabled,
                sms: otpSmsEnabled,
            },
            smtp: {
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                user: smtpUser,
                pass: smtpPass,
                from: smtpFrom,
            },
            sms: {
                url: '',
                authKey: '',
                sender: 'RZSender',
            },
        };

        await db.query(
            `INSERT INTO global_settings (key, value, updated_at)
             VALUES ('otp_config', $1::jsonb, now())
             ON CONFLICT (key)
             DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
            [JSON.stringify(otpConfig)]
        );

        console.log('[SEED] ✓ OTP/SMTP configuration loaded from environment variables');

        console.log('\n[SEED] ✅ Seed completed successfully!');
        console.log('\n[SEED] Default credentials:');
        console.log(`  Superadmin: ${superadminDefaultEmail} / ${superadminDefaultPassword}`);
        console.log(`  Admin:      ${adminDefaultEmail} / ${adminDefaultPassword}`);
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
