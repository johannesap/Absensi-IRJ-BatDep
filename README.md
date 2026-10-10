# Absensi Ibadah Raya Jumat — PD Universitas Gunadarma

```
client/                 React + Vite + Tailwind v4
  src/
    main.jsx            Router + guard role (Protected)
    api.js              fetch wrapper, sesi JWT, helper tanggal WIB
    index.css           Tailwind + animasi masuk (transform/opacity saja)
    components/ui.jsx   Field, Alert, Shell (header halaman petugas)
    pages/
      Home.jsx          Form absensi publik (tanggal otomatis, read-only)
      Login.jsx         Login petugas → diarahkan sesuai role
      Dashboard.jsx     Tabel kehadiran, cari nama/NPM, filter tanggal
      Admin.jsx         CRUD akun User Pendataan
server/                 Express 5 + Mongoose
  app.js                App Express, error handler, koneksi DB + seed admin pertama
  index.js              Jalankan server lokal / Render
  functions/api.js      Pembungkus app untuk Netlify Function
  routes.js             Semua endpoint API
  middleware/auth.js    Verifikasi JWT + cek role
  models/               User (role admin|pendataan), Attendance
  controllers/          auth, attendance, user
```

## API

| Method | Endpoint              | Akses              |
|--------|-----------------------|--------------------|
| POST   | /api/auth/login       | publik             |
| POST   | /api/attendance       | publik             |
| GET    | /api/attendance?q=&date=YYYY-MM-DD | pendataan, admin |
| DELETE | /api/attendance/:id   | pendataan, admin   |
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

Satu NPM hanya bisa absen sekali per hari (zona waktu WIB).

## Deploy ke Netlify (tanpa kartu kredit)

Frontend dan API berjalan di satu situs Netlify: API dijalankan sebagai Netlify Function ([server/functions/api.js](./server/functions/api.js)), database di MongoDB Atlas. Tidak perlu CORS maupun `VITE_API_URL`.

1. MongoDB Atlas: Network Access harus berisi `0.0.0.0/0` (IP Netlify berubah-ubah).
2. Netlify: **Add new site → Import an existing project → GitHub**, pilih repo ini. Pengaturan build dibaca otomatis dari [netlify.toml](./netlify.toml).
3. Di **Site configuration → Environment variables**, isi `MONGO_URI`, `JWT_SECRET` (string acak panjang), `ADMIN_USERNAME`, `ADMIN_PASSWORD`, lalu **Deploys → Trigger deploy**.
4. Uji form absensi dan login petugas lewat URL Netlify.

Alternatif: [render.yaml](./render.yaml) masih bisa dipakai untuk menjalankan API di Render (`node index.js`), tapi Render kini meminta kartu kredit. Jika memakai Render, set `CORS_ORIGINS` ke URL frontend dan `VITE_API_URL` ke URL Render.

Jangan simpan nilai rahasia MongoDB atau kredensial admin ke repository. Akun admin pertama dibuat otomatis saat API terhubung ke database yang belum memiliki admin.
