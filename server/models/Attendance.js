import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  nama: { type: String, required: [true, 'Nama wajib diisi'], trim: true },
  npm: { type: String, required: [true, 'NPM wajib diisi'], trim: true, match: [/^\d{8}$/, 'NPM harus 8 digit angka'] },
  kelas: { type: String, required: [true, 'Kelas wajib diisi'], trim: true, uppercase: true, maxlength: [5, 'Kelas maksimal 5 karakter'] },
  kakakKomsel: { type: String, required: [true, 'Kakak Komsel wajib diisi'], trim: true },
  // Masuk sebagai angka saja, maks. 13 digit (dicek di controller); disimpan seragam sebagai 628… ("0812…" → "62812…")
  whatsapp: {
    type: String,
    required: [true, 'Nomor WhatsApp wajib diisi'],
    set: (v) => String(v).replace(/^0/, '62'),
    match: [/^628\d{7,11}$/, 'Nomor WhatsApp tidak valid (cth. 081234567890)'],
  },
  // Opsional, "MM-DD" tanpa tahun: cukup untuk ucapan ulang tahun dan kurang sensitif jika bocor
  ulangTahun: {
    type: String,
    validate: {
      validator: (v) => {
        if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v)) return false;
        const [m, d] = v.split('-').map(Number);
        return new Date(Date.UTC(2000, m - 1, d)).getUTCMonth() === m - 1; // 2000 kabisat: 29 Feb sah, 31 Apr tidak
      },
      message: 'Tanggal ulang tahun tidak valid',
    },
  },
  // Opsional, diisi peserta setelah absen (lihat addDoa)
  dukunganDoa: { type: String, trim: true, maxlength: [1000, 'Dukungan doa maksimal 1000 karakter'] },
  tanggal: { type: Date, default: Date.now },
});

attendanceSchema.index({ tanggal: -1 });
attendanceSchema.index({ npm: 1, tanggal: -1 });

export default mongoose.model('Attendance', attendanceSchema);
