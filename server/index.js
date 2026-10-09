import express from 'express';
import mongoose from 'mongoose';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import routes from './routes.js';
import User from './models/User.js';

for (const key of ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD']) {
  if (!process.env[key]) throw new Error(`Env ${key} belum diisi (lihat .env.example)`);
}

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: 'ok' });
});

app.use('/api', routes);

const dist = fileURLToPath(new URL('../client/dist', import.meta.url));
if (existsSync(fileURLToPath(new URL('../client/dist/index.html', import.meta.url)))) {
  app.use(express.static(dist));
  app.get('/{*splat}', (_req, res) => res.sendFile('index.html', { root: dist }));
}

app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'ID tidak valid' });
  if (err.code === 11000) return res.status(409).json({ message: 'Username sudah dipakai' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Body JSON tidak valid' });
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

await mongoose.connect(process.env.MONGO_URI);

if (!(await User.exists({ role: 'admin' }))) {
  await User.create({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, name: 'Administrator', role: 'admin' });
  console.log(`Admin awal dibuat: ${process.env.ADMIN_USERNAME}`);
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`));

export default app;
