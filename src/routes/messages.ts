import { Router, type Request, type Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as Dispatcher from '../services/dispatcher.js';

const router = Router();

// Apply auth middleware to all message routes
router.use(authMiddleware);

// Helper to handle result
function handleResult(res: Response, result: Dispatcher.DispatchResult) {
  if (result.ok) {
    return res.json(result);
  }
  return res.status(result.status || 500).json(result);
}

function getTenantScope(req: Request): string {
  return req.tenantId ?? 'system';
}

// --- 0. TEXTO SIMPLES ---
router.post('/send_text', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, text, footer } = req.body;
    const result = await Dispatcher.sendText(getTenantScope(req), instance, to, text, footer);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- 0.1 IMAGEM ---
router.post('/send_image', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, imageUrl, caption } = req.body;
    const result = await Dispatcher.sendImage(getTenantScope(req), instance, to, imageUrl, caption);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- 0.2 VIDEO ---
router.post('/send_video', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, videoUrl, caption } = req.body;
    const result = await Dispatcher.sendVideo(getTenantScope(req), instance, to, videoUrl, caption);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- 1. MENU TEXTO ---
router.post('/send_menu', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, title, text, options, footer } = req.body;
    const result = await Dispatcher.sendMenu(getTenantScope(req), instance, to, title, text, options, footer);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- 2. BOTÕES QUICK REPLY ---
router.post('/send_buttons_helpers', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, text, buttons, footer } = req.body;
    const result = await Dispatcher.sendButtons(getTenantScope(req), instance, to, text, buttons, footer);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- 3. BOTÕES INTERACTIVE ---
router.post('/send_interactive_helpers', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, text, buttons, footer } = req.body;
    const result = await Dispatcher.sendInteractive(getTenantScope(req), instance, to, text, buttons, footer);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- 4. LISTA DROPDOWN ---
router.post('/send_list_helpers', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, text, footer, buttonText, sections } = req.body;
    const result = await Dispatcher.sendList(getTenantScope(req), instance, to, text, buttonText, sections, footer);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- 5. ENQUETE / POLL ---
router.post('/send_poll', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, name, options, selectableCount } = req.body;
    const result = await Dispatcher.sendPoll(getTenantScope(req), instance, to, name, options, selectableCount);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- 6. CARROSSEL ---
router.post('/send_carousel_helpers', async (req: Request, res: Response) => {
  try {
    const { instance = 'main', to, text, footer, cards } = req.body;
    const result = await Dispatcher.sendCarousel(getTenantScope(req), instance, to, text, cards, footer);
    return handleResult(res, result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
