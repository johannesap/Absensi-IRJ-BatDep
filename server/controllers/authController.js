import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const sign = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

export const login = async (req, res) => {
  const { username, password } = req.body ?? {};
  const user = await User.findOne({ username: String(username ?? '').trim().toLowerCase() }).select('+password');
  if (!user || !(await user.checkPassword(String(password ?? '')))) {
    return res.status(401).json({ message: 'Username atau password salah' });
  }
  res.json({ token: sign(user), role: user.role, name: user.name });
};

// Password lama salah dibalas 400, bukan 401: client menganggap 401 sebagai sesi berakhir lalu logout
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body ?? {};
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.checkPassword(String(oldPassword ?? '')))) {
    return res.status(400).json({ message: 'Password lama salah' });
  }
  user.password = newPassword;
  await user.save();
  // Semua token lama kini ditolak (middleware/auth.js); token baru supaya perangkat ini tetap masuk
  res.json({ message: 'Password diganti', token: sign(user) });
};
