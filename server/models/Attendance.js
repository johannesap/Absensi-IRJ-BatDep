import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  nama: { type: String, required: [true, 'Nama wajib diisi'], trim: true },
  npm: { type: String, required: [true, 'NPM wajib diisi'], trim: true, match: [/^\d{8}$/, 'NPM harus 8 digit angka'] },
  kelas: { type: String, required: [true, 'Kelas wajib diisi'], trim: true, uppercase: true },
  kakakKomsel: { type: String, required: [true, 'Kakak Komsel wajib diisi'], trim: true },
  // Disimpan seragam sebagai 628…: dari "0812…", "+62 812-…", dst.
  whatsapp: {
    type: String,
    required: [true, 'Nomor WhatsApp wajib diisi'],
    set: (v) => String(v).replace(/\D/g, '').replace(/^0/, '62'),
    match: [/^628\d{7,11}$/, 'Nomor WhatsApp tidak valid (cth. 081234567890)'],
  },
  tanggal: { type: Date, default: Date.now },
});

attendanceSchema.index({ tanggal: -1 });
attendanceSchema.index({ npm: 1, tanggal: -1 });

export default mongoose.model('Attendance', attendanceSchema);
