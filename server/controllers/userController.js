import User from '../models/User.js';

// Admin hanya mengelola akun ber-role "pendataan"
const notFound = (res) => res.status(404).json({ message: 'Akun tidak ditemukan' });

export const list = async (_req, res) => {
  res.json(await User.find({ role: 'pendataan' }).sort({ createdAt: -1 }));
};

export const create = async (req, res) => {
  const { username, password, name } = req.body ?? {};
  const user = await User.create({ username, password, name, role: 'pendataan' });
  res.status(201).json(user);
};

export const update = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'pendataan' });
  if (!user) return notFound(res);
  const { username, password, name } = req.body ?? {};
  if (username) user.username = username;
  if (name) user.name = name;
  if (password) user.password = password; // kosong = password tidak diubah
  await user.save();
  res.json(user);
};

export const remove = async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, role: 'pendataan' });
  if (!user) return notFound(res);
  res.json({ message: 'Akun dihapus' });
};
