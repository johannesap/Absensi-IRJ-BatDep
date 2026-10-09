import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  nama: { type: String, required: [true, 'Nama wajib diisi'], trim: true },
  npm: { type: String, required: [true, 'NPM wajib diisi'], trim: true, match: [/^\d{8}$/, 'NPM harus 8 digit angka'] },
  kelas: { type: String, required: [true, 'Kelas wajib diisi'], trim: true, uppercase: true },
  kakakKomsel: { type: String, required: [true, 'Kakak Komsel wajib diisi'], trim: true },
  tanggal: { type: Date, default: Date.now },
});

attendanceSchema.index({ tanggal: -1 });
attendanceSchema.index({ npm: 1, tanggal: -1 });

export default mongoose.model('Attendance', attendanceSchema);
