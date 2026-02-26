BEGIN;

CREATE TABLE IF NOT EXISTS tenant_hourly_usage (
    id          bigserial PRIMARY KEY,
    tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usage_hour  timestamptz NOT NULL, -- Truncated to the hour
    sends_count integer NOT NULL DEFAULT 0 CHECK (sends_count >= 0),

    CONSTRAINT ux_usage_tenant_hour UNIQUE (tenant_id, usage_hour)
);

CREATE INDEX IF NOT EXISTS idx_usage_tenant_hour ON tenant_hourly_usage(tenant_id, usage_hour DESC);

COMMIT;
