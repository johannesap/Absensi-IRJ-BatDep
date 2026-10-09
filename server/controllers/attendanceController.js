import Attendance from '../models/Attendance.js';

const DAY = 24 * 60 * 60 * 1000;

// Awal hari (00:00 WIB) untuk tanggal "YYYY-MM-DD"
export const startOfDayWIB = (ymd) => new Date(`${ymd}T00:00:00+07:00`);
export const todayWIB = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export const create = async (req, res) => {
  const { nama, npm, kelas, kakakKomsel } = req.body ?? {};
  // Tanggal selalu diisi server, bukan dari client
  if (await Attendance.exists({ npm: String(npm ?? '').trim(), tanggal: { $gte: startOfDayWIB(todayWIB()) } })) {
    return res.status(409).json({ message: 'NPM ini sudah tercatat hadir hari ini' });
  }
  const doc = await Attendance.create({ nama, npm, kelas, kakakKomsel });
  res.status(201).json(doc);
};

export const list = async (req, res) => {
  const { q, date } = req.query;
  const filter = {};
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ nama: rx }, { npm: rx }];
  }
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: 'Format tanggal tidak valid' });
    const start = startOfDayWIB(date);
    filter.tanggal = { $gte: start, $lt: new Date(start.getTime() + DAY) };
  }
  // ponytail: dibatasi 1000 baris tanpa paginasi; tambahkan paginasi jika data per filter melebihi itu
  res.json(await Attendance.find(filter).sort({ tanggal: -1 }).limit(1000));
};

export const remove = async (req, res) => {
  const doc = await Attendance.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Data tidak ditemukan' });
  res.json({ message: 'Data dihapus' });
};
