Você é um desenvolvedor senior fullstack (TypeScript/Node.js) e vai implementar AUTENTICAÇÃO + MULTI-TENANT (SaaS) na aplicação já existente.

## CONTEXTO ATUAL (NÃO QUEBRAR)
- Interface Web em http://localhost:8787
- API REST TypeScript com endpoints /v1/*
- InfiniteAPI (fork Baileys) gerenciando instâncias WhatsApp
- Hoje existe:
  1) Gerenciamento de Instâncias:
     - conectar múltiplas contas (instâncias)
     - QR code atualizado (a cada ~2s)
     - credenciais salvas em disco (auth/{instance}/) para reconexão
     - status em tempo real
     - ações: Conectar, Desconectar, Logout, Deletar
  2) Painel web:
     - lista conexões salvas
     - ver QR
     - disparo em massa com intervalos aleatórios
     - tipos de mensagem: Menu, Botões, Listas, Enquetes, Carrossel
  3) Segurança atual:
     - x-api-key opcional
     - endpoints /v1/* exigem API key se configurada
     - / (interface web) não exige key

## OBJETIVO
Criar um sistema SaaS multi-tenant com:
- Página de login (email/usuário + senha)
- Cada empresa (tenant) terá usuários próprios
- Um tenant NÃO vê instâncias, QR, envios, dados ou logs de outro tenant
- Painel “Admin do Sistema” (superadmin) para gerenciar empresas e usuários
- Painel “Empresa” para gerenciar apenas suas instâncias e disparos

## REQUISITOS FUNCIONAIS (OBRIGATÓRIOS)
1) AUTENTICAÇÃO
- Tela /login com:
  - campo email (ou usuário)
  - campo senha
  - botão entrar
  - “esqueci minha senha” (fluxo básico: gerar token e permitir trocar senha)
- Armazenar senhas com hash forte (bcrypt/argon2)
- Sessão via JWT (access + refresh) OU cookie de sessão (explicar a escolha e implementar uma)
- Logout e expiração
- Middleware/guard protegendo rotas da interface e da API

2) MULTI-TENANT (ISOLAMENTO TOTAL)
- Toda instância WhatsApp pertence a um tenant
- Toda consulta/listagem de instâncias deve filtrar por tenant_id
- Disparos (jobs/histórico) pertencem a tenant_id
- Logs de envio pertencem a tenant_id
- QR code de uma instância só pode ser visto pelo tenant dono
- Rotas /v1/* devem exigir autenticação e tenant context (não só x-api-key)

3) ROLES (RBAC)
- Roles mínimas:
  - superadmin (dono do SaaS, vê tudo)
  - admin_tenant (admin da empresa)
  - user_tenant (operador)
- Permissões:
  - superadmin: CRUD tenants, ver métricas gerais, reset senha de usuários, bloquear tenant
  - admin_tenant: CRUD usuários do próprio tenant, gerenciar instâncias, disparos
  - user_tenant: usar instâncias e disparos, sem gerenciar usuários

4) PAINÉIS E TELAS
A) /login
B) /app (após login) com layout básico:
   - Menu lateral: Instâncias, Disparos, Histórico, Usuários (se admin_tenant), Configurações
C) Tela “Instâncias”:
   - listar instâncias DO TENANT logado
   - botão “Conectar nova instância”
   - status em tempo real
   - QR code com atualização automática
   - ações: conectar, desconectar, logout, deletar (somente do tenant)
D) Tela “Disparos”:
   - colar lista de números
   - intervalo aleatório min/max
   - selecionar instância (apenas do tenant)
   - selecionar tipo de mensagem: Menu, Botões, Listas, Enquetes, Carrossel
   - formulários dinâmicos por tipo
E) Tela “Superadmin” (/admin):
   - CRUD Tenants (empresa)
   - campos do tenant: nome, status (ativo/bloqueado), limite_instancias, limite_envios_dia, data_criacao
   - CRUD Usuários por tenant (criar, reset senha, bloquear)
   - visão geral: total tenants, total instâncias, total envios (pode ser simples)

5) LIMITES E BILLING (BASE)
- Implementar estrutura de limites por tenant:
  - limite_instancias
  - limite_envios_dia
- Bloquear ações quando exceder:
  - não permitir criar nova instância se atingiu limite
  - não permitir iniciar disparo se excedeu limite diário
- Registrar contadores por dia (ex: tabela tenant_daily_usage)

## REQUISITOS TÉCNICOS (OBRIGATÓRIOS)
- Usar TypeScript end-to-end
- Persistência: criar uma camada de banco (recomendado PostgreSQL ou SQLite se simples local)
  - Se a app já usa algo, integrar no padrão atual
- Criar migrations (ou schema inicial) e models
- Criar middleware de auth e tenant resolver:
  - extrair user do token
  - anexar req.user e req.tenantId
  - filtrar tudo por tenantId automaticamente
- Estruturar pastas limpas:
  - /server (API)
  - /web (UI)
  - /db (schema/migrations)
  - /services (whatsapp/instances)
- Segurança:
  - rate limit no /login
  - validação de input
  - CORS apropriado
  - cookie httpOnly se usar cookie
- Não expor informações sensíveis em logs

## MUDANÇA CRÍTICA: auth/ NO DISCO PRECISA SER MULTI-TENANT
Hoje: auth/{instance}/
Novo: auth/{tenantId}/{instance}/
- Ao criar instância, salvar credenciais no path do tenant correto
- Ao listar instâncias, só ler do tenant correto
- Impedir que um tenant acesse pasta de outro tenant

## ENDPOINTS NOVOS/ATUALIZADOS
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/forgot
- POST /auth/reset
- GET /me (retorna user + tenant info + role)

Atualizar endpoints existentes para exigir auth e tenant:
- GET /v1/instances (somente do tenant)
- POST /v1/instances
- GET /v1/instances/:name/qr
- POST /v1/instances/:name/disconnect
- endpoints /v1/messages/* (validar tenant da instância)

## BANCO DE DADOS (PROPOR E CRIAR)
Tabelas mínimas:
- tenants(id, name, status, instance_limit, daily_send_limit, created_at)
- users(id, tenant_id, name, email, password_hash, role, status, created_at, last_login)
- instances(id, tenant_id, name, status, created_at, updated_at)  // metadata, não credenciais
- bulk_jobs(id, tenant_id, instance_id, type, payload_json, status, created_at, started_at, finished_at)
- bulk_logs(id, tenant_id, job_id, phone, result, error, created_at)
- tenant_daily_usage(id, tenant_id, date, sends_count)

## UI/UX
- Design simples, moderno, responsivo
- Feedback de erro no login (mensagens claras)
- Loading states nos botões
- Páginas protegidas (se não logado, redireciona /login)
- Se tenant bloqueado: impedir login e mostrar mensagem “Conta bloqueada, contate o suporte.”

## CONDIÇÕES IMPORTANTES
- Não remover funcionalidades existentes, apenas adaptar para multi-tenant
- Não deixar rotas abertas: a interface web agora deve exigir login
- Se precisar, criar seed inicial:
  - criar 1 superadmin default
  - criar 1 tenant demo
  - criar 1 admin_tenant demo

## ENTREGA
1) Liste os arquivos que serão criados/alterados
2) Implemente o código completo necessário (backend + frontend)
3) Inclua instruções de execução local (env vars, migrate, start)
4) Inclua exemplos de requests (curl) para login e uso de endpoints
5) Garanta que a proteção multi-tenant esteja em todas as rotas relevantes

-- =========================================================
-- SaaS Multi-tenant + Auth + WhatsApp Instances (PostgreSQL)
-- =========================================================
-- Recomendado: PostgreSQL 13+
-- Se quiser usar um schema separado, descomente:
-- CREATE SCHEMA IF NOT EXISTS saas;
-- SET search_path TO saas, public;

BEGIN;

-- Extensões úteis (opcional)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- =========================================================
-- ENUMS
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
    CREATE TYPE tenant_status AS ENUM ('active', 'blocked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin_tenant', 'user_tenant');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'blocked');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instance_status') THEN
    CREATE TYPE instance_status AS ENUM ('disconnected', 'connecting', 'connected', 'error');
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
  status           tenant_status NOT NULL DEFAULT 'active',

  -- limites (SaaS)
  instance_limit   integer NOT NULL DEFAULT 1 CHECK (instance_limit >= 0),
  daily_send_limit integer NOT NULL DEFAULT 0 CHECK (daily_send_limit >= 0), -- 0 = sem envios (bloqueado por limite)

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
  tenant_id      uuid NULL REFERENCES tenants(id) ON DELETE CASCADE,  -- superadmin pode ser NULL
  name           text NOT NULL,
  email          text NOT NULL,
  password_hash  text NOT NULL, -- bcrypt/argon2 (gerado no backend)
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

-- email único global (mais simples). Se quiser por-tenant, me fala que eu ajusto.
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(lower(email));
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =========================================================
-- AUTH: refresh tokens (se usar JWT refresh)
-- =========================================================
CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    text NOT NULL,                -- hash do refresh token (não salvar puro)
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
  token_hash   text NOT NULL,                 -- hash do token
  expires_at   timestamptz NOT NULL,
  used_at      timestamptz NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reset_user ON auth_password_reset(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_expires ON auth_password_reset(expires_at);

-- =========================================================
-- INSTANCES (metadata no banco)
-- credenciais continuam no disco: auth/{tenantId}/{instanceName}/
-- =========================================================
CREATE TABLE IF NOT EXISTS instances (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- nome da instância (único por tenant)
  name         text NOT NULL,

  status       instance_status NOT NULL DEFAULT 'disconnected',
  last_error   text NULL,

  -- opcional: info do whatsapp conectado
  phone        text NULL,
  push_name    text NULL,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ux_instance_per_tenant UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_instances_tenant ON instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_instances_status ON instances(status);

-- =========================================================
-- JOBS de disparo (mass send)
-- =========================================================
CREATE TABLE IF NOT EXISTS bulk_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  instance_id   uuid NOT NULL REFERENCES instances(id) ON DELETE RESTRICT,

  message_type  message_type NOT NULL,
  payload_json  jsonb NOT NULL, -- guarda o formulário preenchido (campos dinâmicos)
  numbers_count integer NOT NULL DEFAULT 0 CHECK (numbers_count >= 0),

  min_delay_ms  integer NOT NULL DEFAULT 1000 CHECK (min_delay_ms >= 0),
  max_delay_ms  integer NOT NULL DEFAULT 3000 CHECK (max_delay_ms >= min_delay_ms),

  status        job_status NOT NULL DEFAULT 'queued',
  created_by    uuid NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at    timestamptz NOT NULL DEFAULT now(),
  started_at    timestamptz NULL,
  finished_at   timestamptz NULL,

  CONSTRAINT chk_job_tenant_instance
    CHECK (tenant_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON bulk_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_instance ON bulk_jobs(instance_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON bulk_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON bulk_jobs(created_at DESC);

-- =========================================================
-- LOGS por número (resultado do envio)
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
-- USO DIÁRIO por tenant (controle de limites)
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
-- AUDIT (simples) - útil pra SaaS
-- =========================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          bigserial PRIMARY KEY,
  tenant_id   uuid NULL REFERENCES tenants(id) ON DELETE SET NULL,
  user_id     uuid NULL REFERENCES users(id) ON DELETE SET NULL,

  action      text NOT NULL,      -- ex: "TENANT_CREATE", "LOGIN", "INSTANCE_DELETE"
  target_type text NULL,          -- ex: "tenant", "user", "instance", "job"
  target_id   text NULL,          -- uuid em texto ou outro identificador
  meta        jsonb NULL,

  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_created ON audit_log(user_id, created_at DESC);

-- =========================================================
-- UPDATED_AT trigger helper
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

-- =========================================================
-- SEED (opcional) - superadmin + tenant demo
-- Observação: password_hash precisa ser gerado no backend (bcrypt/argon2).
-- Aqui deixo placeholders.
-- =========================================================
-- 1) Tenant demo
INSERT INTO tenants (name, status, instance_limit, daily_send_limit)
VALUES ('Tenant Demo', 'active', 5, 2000)
ON CONFLICT DO NOTHING;

-- 2) Superadmin (tenant_id NULL)
-- Troque o password_hash por um hash real gerado no backend
INSERT INTO users (tenant_id, name, email, password_hash, role, status)
VALUES (NULL, 'Super Admin', 'admin@saas.local', '$2b$10$REPLACE_WITH_REAL_HASH', 'superadmin', 'active')
ON CONFLICT (lower(email)) DO NOTHING;

-- 3) Admin do tenant demo
-- Troque o password_hash por um hash real gerado no backend
INSERT INTO users (tenant_id, name, email, password_hash, role, status)
SELECT t.id, 'Admin Tenant Demo', 'admin@tenant.local', '$2b$10$REPLACE_WITH_REAL_HASH', 'admin_tenant', 'active'
FROM tenants t
WHERE t.name = 'Tenant Demo'
ON CONFLICT (lower(email)) DO NOTHING;

COMMIT;