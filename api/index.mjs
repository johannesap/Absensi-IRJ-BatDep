// .mjs: package.json root bukan "type": "module", jadi file .js di sini diubah Vercel ke CommonJS dan gagal me-require server/app.js (ESM)
import app, { connectDB } from '../server/app.js';

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
