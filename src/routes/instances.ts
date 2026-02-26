import { Router, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import {
  createInstance,
  getInstance,
  getAllInstances,
  removeInstance,
  disconnectInstance,
  logoutInstance,
} from '../services/whatsapp.js';
import { config } from '../config.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkInstanceLimit } from '../services/limits.js';
import db from '../db/connection.js';

const router = Router();

function getEffectiveTenantId(req: Request): string | undefined {
  if (req.tenantId) return req.tenantId;
  if (req.user?.role !== 'superadmin') return undefined;

  const fromQuery = req.query?.tenantId;
  if (typeof fromQuery === 'string' && fromQuery.trim()) return fromQuery.trim();

  const fromBody = (req.body as { tenantId?: unknown } | undefined)?.tenantId;
  if (typeof fromBody === 'string' && fromBody.trim()) return fromBody.trim();

  return undefined;
}

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /v1/instances
 * Cria uma nova instância e retorna o QR code em base64 (ou status se já conectada).
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'superadmin' && !req.tenantId)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const { instance = 'main' } = req.body as { instance?: string };
    const name = String(instance).trim() || 'main';

    const currentTenantId = getEffectiveTenantId(req);
    if (!currentTenantId) return res.status(400).json({ ok: false, error: 'missing_tenant_id' });

    // Check instance limit
    const canCreate = await checkInstanceLimit(currentTenantId);
    if (!canCreate) {
      return res.status(403).json({ ok: false, error: 'instance_limit_reached' });
    }

    // Check if instance already exists for this tenant
    const existing = await db.query<{ id: string }>(
      `SELECT id FROM instances WHERE tenant_id = $1 AND name = $2`,
      [currentTenantId, name]
    );

    if (existing.length > 0) {
      // Instance exists in DB, try to reconnect
      const ctx = getInstance(name);
      if (ctx && ctx.tenantId === currentTenantId) {
        if (ctx.status === 'connected') {
          return res.json({ ok: true, instance: name, status: 'connected' });
        }
        if (ctx.status === 'qr' && ctx.qr) {
          const qrBase64 = await QRCode.toDataURL(ctx.qr, { width: 400, margin: 2 });
          return res.json({ ok: true, instance: name, status: 'qr', qr: qrBase64 });
        }
      }
    }

    // Create new instance
    const result = await createInstance(currentTenantId, name, config.authFolder);

    if (!result.ok) {
      return res.status(500).json({ ok: false, error: result.error });
    }

    // Save instance metadata to database
    await db.query(
      `INSERT INTO instances (tenant_id, name, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (tenant_id, name) DO UPDATE
       SET status = $3, updated_at = now()`,
      [currentTenantId, name, 'connecting']
    );

    let qrBase64: string | undefined;
    if (result.qr) {
      qrBase64 = await QRCode.toDataURL(result.qr, { width: 400, margin: 2 });
    }

    const ctx = getInstance(name);
    return res.json({
      ok: true,
      instance: name,
      status: ctx?.status ?? 'connecting',
      qr: qrBase64 ?? null,
    });
  } catch (err) {
    console.error('[INSTANCES] Create error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * GET /v1/instances
 * Lista instâncias ativas do tenant.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    if (!_req.user) return res.status(401).json({ ok: false, error: 'unauthorized' });
    const tid = getEffectiveTenantId(_req);
    if (!tid) return res.status(400).json({ ok: false, error: 'missing_tenant_id' });

    // Get instances from database for this tenant
    const dbInstances = await db.query<{
      id: string;
      name: string;
      status: string;
      created_at: Date;
    }>(
      `SELECT id, name, status, created_at
       FROM instances
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tid]
    );

    // Merge with in-memory instances
    const list = dbInstances.map((dbInst: { id: string; name: string; status: string; created_at: Date }) => {
      const ctx = getInstance(dbInst.name);
      if (ctx && (ctx.tenantId === tid || _req.user?.role === 'superadmin')) {
        return {
          instance: ctx.name,
          status: ctx.status,
          hasQr: Boolean(ctx.qr),
          createdAt: ctx.createdAt.toISOString(),
        };
      }
      return {
        instance: dbInst.name,
        status: dbInst.status,
        hasQr: false,
        createdAt: dbInst.created_at.toISOString(),
      };
    });

    // Get saved instances from disk
    let saved: string[] = [];
    if (tid) {
      const authDir = path.resolve(process.cwd(), config.authFolder, tid);
      try {
        if (fs.existsSync(authDir)) {
          saved = fs.readdirSync(authDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        }
      } catch {
        saved = [];
      }
    }

    return res.json({ ok: true, instances: list, saved });
  } catch (err) {
    console.error('[INSTANCES] List error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * GET /v1/instances/saved
 * Lista apenas nomes das conexões salvas (pastas em auth/{tenantId}/).
 */
router.get('/saved', (_req: Request, res: Response) => {
  try {
    if (!_req.user || (_req.user.role !== 'superadmin' && !_req.tenantId)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const tenantId = getEffectiveTenantId(_req);
    if (!tenantId) return res.status(400).json({ ok: false, error: 'missing_tenant_id' });

    const authDir = path.resolve(process.cwd(), config.authFolder, tenantId);
    let saved: string[] = [];
    try {
      if (fs.existsSync(authDir)) {
        saved = fs.readdirSync(authDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name);
      }
    } catch {
      saved = [];
    }
    return res.json({ ok: true, saved });
  } catch (err) {
    console.error('[INSTANCES] Saved error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * GET /v1/instances/:name/qr
 * Retorna o QR code da instância em base64 (se estiver em estado qr).
 */
router.get('/:name/qr', async (req: Request, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'superadmin' && !req.tenantId)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const { name } = req.params;
    const ctx = getInstance(name);

    if (!ctx) {
      return res.status(404).json({ ok: false, error: 'instance_not_found' });
    }

    // Verify tenant ownership (superadmin can access any tenant)
    if (req.user.role !== 'superadmin' && ctx.tenantId !== req.tenantId) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    if (ctx.status !== 'qr' || !ctx.qr) {
      return res.status(400).json({ ok: false, error: 'no_qr_available', status: ctx.status });
    }

    const qrBase64 = await QRCode.toDataURL(ctx.qr, { width: 400, margin: 2 });
    return res.json({ ok: true, instance: name, qr: qrBase64 });
  } catch (err) {
    console.error('[INSTANCES] QR error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * GET /v1/instances/:name
 * Status de uma instância.
 */
router.get('/:name', (req: Request, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'superadmin' && !req.tenantId)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const { name } = req.params;
    const ctx = getInstance(name);

    if (!ctx) {
      return res.status(404).json({ ok: false, error: 'instance_not_found' });
    }

    // Verify tenant ownership (superadmin can access any tenant)
    if (req.user.role !== 'superadmin' && ctx.tenantId !== req.tenantId) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    return res.json({
      ok: true,
      instance: ctx.name,
      status: ctx.status,
      hasQr: Boolean(ctx.qr),
      createdAt: ctx.createdAt.toISOString(),
    });
  } catch (err) {
    console.error('[INSTANCES] Status error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * POST /v1/instances/:name/disconnect
 * Desconecta e remove a instância da memória (credenciais ficam em disco).
 */
router.post('/:name/disconnect', async (req: Request, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'superadmin' && !req.tenantId)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const { name } = req.params;
    const ctx = getInstance(name);

    if (ctx && req.user.role !== 'superadmin' && ctx.tenantId !== req.tenantId) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const tenantId = getEffectiveTenantId(req) ?? ctx?.tenantId;
    if (!tenantId) return res.status(400).json({ ok: false, error: 'missing_tenant_id' });

    const removed = disconnectInstance(name);

    // Update status in database
    await db.query(
      `UPDATE instances SET status = $1, updated_at = now()
       WHERE tenant_id = $2 AND name = $3`,
      ['disconnected', tenantId, name]
    );

    return res.json({ ok: removed, instance: name });
  } catch (err) {
    console.error('[INSTANCES] Disconnect error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * POST /v1/instances/:name/logout
 * Logout + apaga pasta de auth. Próxima conexão gera novo QR.
 */
router.post('/:name/logout', async (req: Request, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'superadmin' && !req.tenantId)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const { name } = req.params;
    const ctx = getInstance(name);

    if (ctx && req.user.role !== 'superadmin' && ctx.tenantId !== req.tenantId) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const tenantId = getEffectiveTenantId(req) ?? ctx?.tenantId;
    if (!tenantId) return res.status(400).json({ ok: false, error: 'missing_tenant_id' });

    const result = await logoutInstance(tenantId, name, config.authFolder);

    if (!result.ok) {
      return res.status(500).json({ ok: false, instance: name, error: result.error });
    }

    // Delete from database
    await db.query(
      `DELETE FROM instances WHERE tenant_id = $1 AND name = $2`,
      [tenantId, name]
    );

    return res.json({ ok: true, instance: name });
  } catch (err) {
    console.error('[INSTANCES] Logout error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: message });
  }
});

/**
 * DELETE /v1/instances/:name
 * Remove a instância (fecha socket, não apaga credenciais em disco).
 */
router.delete('/:name', async (req: Request, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'superadmin' && !req.tenantId)) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const { name } = req.params;
    const ctx = getInstance(name);

    if (ctx && req.user.role !== 'superadmin' && ctx.tenantId !== req.tenantId) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const tenantId = getEffectiveTenantId(req) ?? ctx?.tenantId;
    if (!tenantId) return res.status(400).json({ ok: false, error: 'missing_tenant_id' });

    const removed = removeInstance(tenantId, name);

    // Update status in database
    await db.query(
      `UPDATE instances SET status = $1, updated_at = now()
       WHERE tenant_id = $2 AND name = $3`,
      ['disconnected', tenantId, name]
    );

    return res.json({ ok: removed, instance: name });
  } catch (err) {
    console.error('[INSTANCES] Delete error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

export default router;
