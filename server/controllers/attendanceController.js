import Attendance, { todayWIB } from '../models/Attendance.js';

const DAY = 24 * 60 * 60 * 1000;

// Awal hari (00:00 WIB) untuk tanggal "YYYY-MM-DD"
export const startOfDayWIB = (ymd) => new Date(`${ymd}T00:00:00+07:00`);

export const create = async (req, res) => {
  const { nama, npm, kelas, kakakKomsel, whatsapp, instagram, asalGereja, sumberInfo, ulangTahun } = req.body ?? {};
  // Batas 13 digit berlaku untuk nomor seperti yang diketik, sebelum dinormalisasi ke 62… oleh model
  if (whatsapp && !/^\d{1,13}$/.test(String(whatsapp))) {
    return res.status(400).json({ message: 'Nomor WhatsApp hanya boleh angka, maksimal 13 digit' });
  }
  // Tanggal selalu diisi server, bukan dari client. NPM yang sudah hadir hari ini ditolak index unik (npm, hari) → 409 di app.js
  const doc = await Attendance.create({
    nama, npm, kelas, kakakKomsel, whatsapp, asalGereja, sumberInfo,
    instagram: instagram || undefined, ulangTahun: ulangTahun || undefined,
  });
  res.status(201).json(doc);
};

// Publik: peserta menambahkan dukungan doa ke presensinya sendiri, sekali, di hari yang sama.
// _id (dari respons presensi) dan NPM harus cocok supaya orang lain tidak bisa mengisi doa atas nama peserta lain.
export const addDoa = async (req, res) => {
  const { npm, doa } = req.body ?? {};
  const text = String(doa ?? '').trim();
  if (!text) return res.status(400).json({ message: 'Dukungan doa wajib diisi' });
  const doc = await Attendance.findOneAndUpdate(
    { _id: req.params.id, npm: String(npm ?? ''), dukunganDoa: { $exists: false }, tanggal: { $gte: startOfDayWIB(todayWIB()) } },
    { dukunganDoa: text },
    { runValidators: true },
  );
  if (!doc) return res.status(404).json({ message: 'Data kehadiran tidak ditemukan atau dukungan doa sudah dikirim' });
  res.json({ message: 'Dukungan doa diterima' });
};

// Filter rentang satu hari WIB dari ?date=YYYY-MM-DD; false = format salah
const dateFilter = (date) => {
  if (!date) return {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const start = startOfDayWIB(date);
  return { tanggal: { $gte: start, $lt: new Date(start.getTime() + DAY) } };
};

export const list = async (req, res) => {
  const { q, date } = req.query;
  const filter = dateFilter(date);
  if (!filter) return res.status(400).json({ message: 'Format tanggal tidak valid' });
  const rx = q && new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const [rows, count] = await Promise.all([
    // ponytail: dibatasi 1000 baris tanpa paginasi (dashboard memberi tahu saat batas tercapai); tambahkan paginasi jika data lama perlu dijelajahi
    Attendance.find(rx ? { ...filter, $or: [{ nama: rx }, { npm: rx }] } : filter).sort({ tanggal: -1 }).limit(1000),
    // Total hadir per tanggal, tidak terpengaruh pencarian maupun batas 1000 baris
    Attendance.countDocuments(filter),
  ]);
  res.json({ rows, count });
};

export const remove = async (req, res) => {
  const doc = await Attendance.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Data tidak ditemukan' });
  res.json({ message: 'Data dihapus' });
};
