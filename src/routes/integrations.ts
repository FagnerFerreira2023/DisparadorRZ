
import { Router, type Request, type Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as Dispatcher from '../services/dispatcher.js';

const router = Router();

// API Externa requer autenticação Bearer
router.use(authMiddleware);

// Endpoint unificado
router.post('/send', async (req: Request, res: Response) => {
    try {
        const { instance = 'main', to, type, payload } = req.body;

        if (!to || !type || !payload) {
            return res.status(400).json({
                ok: false,
                error: 'missing_fields',
                hint: 'required: instance (optional), to, type, payload'
            });
        }

        console.log(`[INTEGRATION] External send type=${type} to=${to} tenant=${req.tenantId}`);

        const result = await Dispatcher.sendUnified(req.tenantId!, instance, to, type, payload);

        if (result.ok) {
            return res.json(result);
        } else {
            return res.status(result.status || 500).json(result);
        }

    } catch (err) {
        return res.status(500).json({ ok: false, error: String(err) });
    }
});

// Helper para listar instâncias (útil para n8n)
router.get('/instances', async (req: Request, res: Response) => {
    // Importar getInstance logic or re-use existing route logic?
    // User requested "GET /api/integrations/instances (listar instâncias disponíveis)"
    // Let's reuse logic from src/routes/instances.ts but simplified for external use.
    // Actually, we should check instances.ts to see if we can reuse it, 
    // but for now, let's just return what's available in memory via whatsapp service.
    // Importing whatsapp service directly.
    const { getAllInstances } = await import('../services/whatsapp.js');
    const instances = getAllInstances()
        .filter(i => i.tenantId === req.tenantId)
        .map(i => ({
            name: i.name,
            status: i.status
        }));

    return res.json({ ok: true, instances });
});

export default router;
