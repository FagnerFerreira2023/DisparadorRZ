import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import instancesRouter from './routes/instances.js';
import messagesRouter from './routes/messages.js';
import adminRouter from './routes/admin.js';
import usersRouter from './routes/users.js';
import integrationsRouter from './routes/integrations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'rz-sender' });
});

// Auth routes (no auth required for login, etc.)
app.use('/auth', authRouter);

// Admin routes (require superadmin JWT)
app.use('/admin', adminRouter);

// API routes (require JWT auth via middleware in each router)
app.use('/v1/instances', instancesRouter);
app.use('/v1/messages', messagesRouter);
app.use('/v1/users', usersRouter);
app.use('/api/integrations', integrationsRouter);

// Serve static files (login page, etc.)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Redirect root to login page
app.get('/', (_req, res) => res.redirect('/login.html'));

app.listen(config.port, () => {
  console.log(`[BAILEYS-SAAS] API rodando em http://localhost:${config.port}`);
  console.log(`[BAILEYS-SAAS] Login: http://localhost:${config.port}/login.html`);
  console.log(`[BAILEYS-SAAS] Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
});
