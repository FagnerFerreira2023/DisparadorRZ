-- =========================================================
-- SaaS Multi-tenant + Auth + WhatsApp Instances (PostgreSQL)
-- =========================================================
-- PostgreSQL 13+

BEGIN;

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- =========================================================
-- ENUMS
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
    CREATE TYPE tenant_status AS ENUM ('active', 'blocked', 'pending_verification', 'trial_expired');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin_tenant', 'user_tenant');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'blocked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instance_status') THEN
    CREATE TYPE instance_status AS ENUM ('disconnected', 'connecting', 'connected', 'qr', 'error');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('queued', 'running', 'paused', 'finished', 'failed', 'canceled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'send_result') THEN
    CREATE TYPE send_result AS ENUM ('sent', 'failed', 'skipped');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
    CREATE TYPE message_type AS ENUM ('menu', 'quick_reply_buttons', 'cta_buttons', 'list', 'poll', 'carousel');
  END IF;
END$$;

-- =========================================================
-- TENANTS (empresas)
-- =========================================================
CREATE TABLE IF NOT EXISTS tenants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text UNIQUE, -- Adicionado para URLs amigáveis
  status           tenant_status NOT NULL DEFAULT 'active',
  last_otp         text NULL,

  -- limites (SaaS)
  instance_limit   integer NOT NULL DEFAULT 1 CHECK (instance_limit >= 0),
  daily_send_limit integer NOT NULL DEFAULT 0 CHECK (daily_send_limit >= 0),

  -- metadados
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- =========================================================
-- USERS (usuários por tenant)
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name           text NOT NULL,
  email          text NOT NULL,
  whatsapp       text,
  password_hash  text NOT NULL,
  role           user_role NOT NULL DEFAULT 'user_tenant',
  status         user_status NOT NULL DEFAULT 'active',

  last_login_at  timestamptz NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_superadmin_tenant
    CHECK (
      (role = 'superadmin' AND tenant_id IS NULL)
      OR
      (role <> 'superadmin' AND tenant_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_whatsapp ON users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =========================================================
-- AUTH: OTP codes
-- =========================================================
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

-- =========================================================
-- GLOBAL SETTINGS (OTP config etc.)
-- =========================================================
CREATE TABLE IF NOT EXISTS global_settings (
  key          text PRIMARY KEY,
  value        jsonb NOT NULL,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

INSERT INTO global_settings (key, value)
VALUES ('otp_config', '{"url": "", "token": "", "template": "Seu código é {{code}}"}')
ON CONFLICT (key) DO NOTHING;

-- =========================================================
-- AUTH: refresh tokens
-- =========================================================
CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    text NOT NULL,
  expires_at    timestamptz NOT NULL,
  revoked_at    timestamptz NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_user ON auth_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_expires ON auth_refresh_tokens(expires_at);

-- =========================================================
-- AUTH: reset password tokens
-- =========================================================
CREATE TABLE IF NOT EXISTS auth_password_reset (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   text NOT NULL,
  expires_at   timestamptz NOT NULL,
  used_at      timestamptz NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reset_user ON auth_password_reset(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_expires ON auth_password_reset(expires_at);

-- =========================================================
-- INSTANCES (metadata no banco)
-- =========================================================
CREATE TABLE IF NOT EXISTS instances (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name         text NOT NULL,
  status       instance_status NOT NULL DEFAULT 'disconnected',
  last_error   text NULL,

  phone        text NULL,
  push_name    text NULL,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ux_instance_per_tenant UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_instances_tenant ON instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_instances_status ON instances(status);

-- =========================================================
-- JOBS de disparo
-- =========================================================
CREATE TABLE IF NOT EXISTS bulk_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  instance_id   uuid NOT NULL REFERENCES instances(id) ON DELETE RESTRICT,

  message_type  message_type NOT NULL,
  payload_json  jsonb NOT NULL,
  numbers_count integer NOT NULL DEFAULT 0 CHECK (numbers_count >= 0),

  min_delay_ms  integer NOT NULL DEFAULT 1000 CHECK (min_delay_ms >= 0),
  max_delay_ms  integer NOT NULL DEFAULT 3000 CHECK (max_delay_ms >= min_delay_ms),

  status        job_status NOT NULL DEFAULT 'queued',
  created_by    uuid NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at    timestamptz NOT NULL DEFAULT now(),
  started_at    timestamptz NULL,
  finished_at   timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON bulk_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_instance ON bulk_jobs(instance_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON bulk_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON bulk_jobs(created_at DESC);

-- =========================================================
-- LOGS por número
-- =========================================================
CREATE TABLE IF NOT EXISTS bulk_logs (
  id          bigserial PRIMARY KEY,
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  job_id      uuid NOT NULL REFERENCES bulk_jobs(id) ON DELETE CASCADE,

  phone       text NOT NULL,
  result      send_result NOT NULL,
  error       text NULL,

  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_job ON bulk_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_logs_tenant_created ON bulk_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_phone ON bulk_logs(phone);

-- =========================================================
-- USO DIÁRIO por tenant
-- =========================================================
CREATE TABLE IF NOT EXISTS tenant_daily_usage (
  id          bigserial PRIMARY KEY,
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usage_date  date NOT NULL,
  sends_count integer NOT NULL DEFAULT 0 CHECK (sends_count >= 0),

  CONSTRAINT ux_usage_tenant_date UNIQUE (tenant_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_usage_tenant_date ON tenant_daily_usage(tenant_id, usage_date DESC);

-- =========================================================
-- AUDIT
-- =========================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          bigserial PRIMARY KEY,
  tenant_id   uuid NULL REFERENCES tenants(id) ON DELETE SET NULL,
  user_id     uuid NULL REFERENCES users(id) ON DELETE SET NULL,

  action      text NOT NULL,
  target_type text NULL,
  target_id   text NULL,
  meta        jsonb NULL,

  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_created ON audit_log(user_id, created_at DESC);

-- =========================================================
-- UPDATED_AT trigger
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tenants_updated_at') THEN
    CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_instances_updated_at') THEN
    CREATE TRIGGER trg_instances_updated_at
    BEFORE UPDATE ON instances
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

COMMIT;
