import mongoose from 'mongoose';

// Tanggal hari ini di WIB, "YYYY-MM-DD"
export const todayWIB = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

const attendanceSchema = new mongoose.Schema({
  nama: { type: String, required: [true, 'Nama wajib diisi'], trim: true, maxlength: [100, 'Nama maksimal 100 karakter'] },
  npm: { type: String, required: [true, 'NPM wajib diisi'], trim: true, match: [/^\d{8}$/, 'NPM harus 8 digit angka'] },
  kelas: { type: String, required: [true, 'Kelas wajib diisi'], trim: true, uppercase: true, maxlength: [5, 'Kelas maksimal 5 karakter'] },
  kakakKomsel: { type: String, required: [true, 'Kakak Komsel wajib diisi'], trim: true, maxlength: [100, 'Kakak Komsel maksimal 100 karakter'] },
  // Masuk sebagai angka saja, maks. 13 digit (dicek di controller); disimpan seragam sebagai 628… ("0812…" → "62812…")
  whatsapp: {
    type: String,
    required: [true, 'Nomor WhatsApp wajib diisi'],
    set: (v) => String(v).replace(/^0/, '62'),
    match: [/^628\d{7,11}$/, 'Nomor WhatsApp tidak valid (cth. 081234567890)'],
  },
  // Opsional; disimpan tanpa "@" dan huruf kecil, sesuai aturan username Instagram (huruf, angka, titik, garis bawah)
  instagram: {
    type: String,
    set: (v) => v && String(v).trim().replace(/^@/, '').toLowerCase(),
    match: [/^[a-z0-9._]{1,30}$/, 'ID Instagram tidak valid'],
  },
  asalGereja: { type: String, required: [true, 'Asal Gereja wajib diisi'], trim: true, maxlength: [100, 'Asal Gereja maksimal 100 karakter'] },
  sumberInfo: { type: String, required: [true, 'Asal info Ibadah Raya Jumat wajib diisi'], trim: true, maxlength: [100, 'Asal info maksimal 100 karakter'] },
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
  // Opsional, diisi peserta setelah presensi (lihat addDoa)
  dukunganDoa: { type: String, trim: true, maxlength: [1000, 'Dukungan doa maksimal 1000 karakter'] },
  tanggal: { type: Date, default: Date.now },
  // Hari presensi (WIB); index unik (npm, hari) menjamin satu NPM sekali per hari, walau dua kiriman datang bersamaan
  hari: { type: String, default: todayWIB },
});

attendanceSchema.index({ tanggal: -1 });
// partial: data lama (sebelum ada kolom hari) tidak ikut dicek
attendanceSchema.index({ npm: 1, hari: 1 }, { unique: true, partialFilterExpression: { hari: { $exists: true } } });

export default mongoose.model('Attendance', attendanceSchema);
