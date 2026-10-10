import app, { connectDB } from '../server/app.js';

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
