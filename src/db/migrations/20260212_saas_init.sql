BEGIN;

-- 1. Updates to ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('trial_active', 'trial_expired', 'active', 'past_due', 'canceled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM ('trial', 'basic', 'pro', 'enterprise');
    END IF;
END$$;

-- Alter existing enums (using separate transactions for safety if needed, but DO block or single ALTER is fine in PG 12+)
-- Note: ALTER TYPE ADD VALUE cannot run in a transaction block in some PG versions unless it's handled carefully.
-- However, we are in a BEGIN; COMMIT; block. Let's try.
ALTER TYPE tenant_status ADD VALUE IF NOT EXISTS 'pending_verification';
ALTER TYPE tenant_status ADD VALUE IF NOT EXISTS 'trial_expired';

-- 2. Update USERS table
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp text;
-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'ux_users_whatsapp') THEN
        CREATE UNIQUE INDEX ux_users_whatsapp ON users(whatsapp);
    END IF;
END$$;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Add AUTH_OTPS table
CREATE TABLE IF NOT EXISTS auth_otps (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp      text NOT NULL,
    otp_hash      text NOT NULL,
    expires_at    timestamptz NOT NULL,
    attempts      integer NOT NULL DEFAULT 0,
    locked_until  timestamptz NULL,
    used_at       timestamptz NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_otp_whatsapp ON auth_otps(whatsapp);

-- 4. Add SUBSCRIPTIONS table
CREATE TABLE IF NOT EXISTS subscriptions (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan              plan_type NOT NULL DEFAULT 'trial',
    status            subscription_status NOT NULL DEFAULT 'trial_active',
    trial_start_at    timestamptz NULL,
    trial_end_at      timestamptz NULL,
    current_period_end timestamptz NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sub_tenant ON subscriptions(tenant_id);

-- 5. Global Settings for Super Admin
CREATE TABLE IF NOT EXISTS global_settings (
    key               text PRIMARY KEY,
    value             jsonb NOT NULL,
    updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Initialize OTP settings slot
INSERT INTO global_settings (key, value) 
VALUES ('otp_config', '{"url": "", "token": "", "template": "Seu código é {{code}}"}')
ON CONFLICT (key) DO NOTHING;

-- 6. Updated_at Trigger for subscriptions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_subscriptions_updated_at') THEN
        CREATE TRIGGER trg_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END$$;

COMMIT;
