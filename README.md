# Presensi Ibadah Raya Jumat — PD Universitas Gunadarma

```
client/                 React + Vite + Tailwind v4
  public/praise.mp3     Lagu latar (diputar pada klik pertama di halaman presensi, lanjut ke halaman login/pengurus)
  src/
    main.jsx            Router + guard role (Protected)
    api.js              fetch wrapper, sesi JWT, helper tanggal WIB
    index.css           Tailwind + animasi masuk (transform/opacity saja)
    components/ui.jsx   Field, Alert, Shell (header halaman petugas)
    components/Backsound.jsx  Pemutar lagu latar + tombol Jeda/Putar, di luar <Routes> agar tidak berhenti saat pindah halaman
    pages/
      Home.jsx          Form presensi publik (tanggal otomatis, read-only)
      Login.jsx         Login petugas → diarahkan sesuai role
      Dashboard.jsx     Tabel kehadiran, cari nama/NPM, filter tanggal
      Admin.jsx         CRUD akun User Penggembalaan
      Password.jsx      Ganti password sendiri (Admin dan User Penggembalaan)
server/                 Express 5 + Mongoose
  app.js                App Express, error handler, koneksi DB + seed admin pertama
  index.js              Jalankan server lokal
  test/                 Tes model presensi dan batas hari WIB (`npm test`, tanpa database)
  routes.js             Semua endpoint API
  middleware/auth.js    Verifikasi JWT + cek role
  models/               User (role admin|penggembalaan), Attendance
  controllers/          auth, attendance, user
```

## API

| Method | Endpoint              | Akses              |
|--------|-----------------------|--------------------|
| POST   | /api/auth/login       | publik             |
| PUT    | /api/auth/password    | penggembalaan, admin (wajib password lama; token lama tidak berlaku lagi) |
| POST   | /api/attendance       | publik             |
| POST   | /api/attendance/:id/doa | publik (NPM harus cocok, sekali, hari yang sama) |
| GET    | /api/attendance?q=&date=YYYY-MM-DD → `{ rows, count }` | penggembalaan, admin |
| DELETE | /api/attendance/:id   | penggembalaan, admin   |
| GET/POST | /api/users          | admin              |
| PUT/DELETE | /api/users/:id    | admin              |

## Menjalankan

Butuh Node.js 20.6+ dan MongoDB (lokal atau Atlas).

```bash
# Backend
cd server
cp .env.example .env      # isi MONGO_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
npm install
npm run dev               # http://localhost:5000, admin pertama dibuat otomatis

# Frontend (terminal lain)
cd client
npm install
npm run dev               # http://localhost:5173, /api diproxy ke :5000
```

Production: `cd client && npm run build`, lalu `cd server && npm start`. Express melayani hasil build sekaligus API di satu port.

Satu NPM hanya bisa presensi sekali per hari (zona waktu WIB), dijaga index unik `(npm, hari)` di MongoDB.

Jangan simpan nilai rahasia MongoDB atau kredensial admin ke repository. Akun admin pertama dibuat otomatis saat API terhubung ke database yang belum memiliki admin.

## Deploy frontend dan API ke Vercel

Vercel juga dapat menjalankan frontend dan API dalam satu project. Function [api/index.mjs](./api/index.mjs) menggunakan Express yang sama (semua `/api/*` di-rewrite ke sana; `.mjs` agar tidak diubah Vercel ke CommonJS); browser memanggil `/api` pada domain yang sama.

1. Import repository ke Vercel dengan project root di direktori repository. Build dan instalasi sudah dikonfigurasi di [vercel.json](./vercel.json).
2. Tambahkan environment variables untuk Production: `MONGO_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, dan `ADMIN_PASSWORD`. Gunakan rahasia kuat dan jangan simpan nilainya di repository.
3. Pastikan IP access list MongoDB Atlas mengizinkan koneksi dari Vercel. Setelah deploy, uji `https://<domain-vercel>/api/health`; status `200` menandakan API berhasil terhubung ke MongoDB.
4. Akun admin dibuat otomatis saat API pertama kali terhubung ke database yang belum memiliki admin. Login menggunakan nilai `ADMIN_USERNAME` dan `ADMIN_PASSWORD` yang ditetapkan di Vercel, lalu segera ganti password lewat menu **Ganti Password**. Mengubah `ADMIN_PASSWORD` di Vercel setelah itu tidak berpengaruh.
5. Vercel Cron di [vercel.json](./vercel.json) memanggil `/api/health` setiap Senin 08.00 WIB. Panggilan ini membuka koneksi ke MongoDB, sehingga cluster Atlas gratis tidak di-pause otomatis karena 30 hari tanpa koneksi (misalnya saat libur semester).
6. **Wajib:** batasi request supaya login tidak bisa ditebak beruntun dan form tidak bisa dibanjiri data palsu. Di dashboard Vercel: project → **Firewall** → **Add Rule** → kondisi *Request Path* *starts with* `/api/` dan *Method* *equals* `POST` → aksi **Rate Limit**, 10 request per 60 detik per IP, aksi bawaan. Paket Hobby mendapat 1 aturan rate limit per project.
