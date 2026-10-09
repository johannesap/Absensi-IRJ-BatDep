import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Usage: auth('admin') or auth('pendataan', 'admin')
export const auth = (...roles) => async (req, res, next) => {
  let payload;
  try {
    payload = jwt.verify((req.headers.authorization ?? '').replace(/^Bearer /, ''), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Sesi berakhir, silakan login ulang' });
  }
  // Akun yang sudah dihapus admin langsung kehilangan akses walau token belum kedaluwarsa
  if (!(await User.exists({ _id: payload.id }))) return res.status(401).json({ message: 'Akun tidak ditemukan' });
  if (!roles.includes(payload.role)) return res.status(403).json({ message: 'Akses ditolak' });
  req.user = payload;
  next();
};
