import express from 'express';
import mongoose from 'mongoose';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import routes from './routes.js';
import User from './models/User.js';
import Attendance from './models/Attendance.js';

for (const key of ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD']) {
  if (!process.env[key]) throw new Error(`Env ${key} belum diisi (lihat .env.example)`);
}

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({ status: up ? 'ok' : 'database tidak terhubung' });
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
  if (err.code === 11000) return res.status(409).json({ message: err.keyPattern?.npm ? 'NPM ini sudah tercatat hadir hari ini' : 'Username sudah dipakai' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Body JSON tidak valid' });
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

// Koneksi di-cache: dipakai ulang antar-request di Vercel Function yang masih hangat
let connecting;
export function connectDB() {
  connecting ??= (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    // Tunggu index selesai dibuat: index unik (npm, hari) yang menjaga aturan presensi sekali per hari
    await Attendance.init();
    if (!(await User.exists({ role: 'admin' }))) {
      await User.create({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, name: 'Administrator', role: 'admin' });
      console.log(`Admin awal dibuat: ${process.env.ADMIN_USERNAME}`);
    }
  })().catch((err) => { connecting = null; throw err; });
  return connecting;
}

export default app;
