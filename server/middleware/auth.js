import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Usage: auth('admin') or auth('penggembalaan', 'admin')
export const auth = (...roles) => async (req, res, next) => {
  let payload;
  try {
    payload = jwt.verify((req.headers.authorization ?? '').replace(/^Bearer /, ''), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Sesi berakhir, silakan login ulang' });
  }
  // Akun yang dihapus, atau disimpan ulang setelah token dibuat (mis. ganti password), langsung kehilangan akses
  // walau token belum kedaluwarsa. iat dalam detik, jadi +1: token yang dibuat tepat sesudah penyimpanan tetap sah
  if (!(await User.exists({ _id: payload.id, updatedAt: { $lt: new Date((payload.iat + 1) * 1000) } }))) {
    return res.status(401).json({ message: 'Sesi berakhir, silakan login ulang' });
  }
  if (!roles.includes(payload.role)) return res.status(403).json({ message: 'Akses ditolak' });
  req.user = payload;
  next();
};
