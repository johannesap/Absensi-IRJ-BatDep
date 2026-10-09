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
  index.js              App, error handler, seed admin pertama
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

## Deploy ke Netlify + Render

Frontend di-host di Netlify, API di Render, dan database di MongoDB Atlas.

1. Buat database di MongoDB Atlas. Izinkan koneksi dari Render (misalnya dengan network access `0.0.0.0/0`) dan salin connection string sebagai `MONGO_URI`.
2. Hubungkan repository ke Render menggunakan [render.yaml](./render.yaml). Isi `MONGO_URI`, `ADMIN_USERNAME`, dan `ADMIN_PASSWORD` saat diminta. `JWT_SECRET` dibuat otomatis. Setelah situs Netlify dibuat, set `CORS_ORIGINS` ke URL situsnya, misalnya `https://nama-situs.netlify.app`.
3. Deploy frontend di Netlify menggunakan [netlify.toml](./netlify.toml). Set environment variable `VITE_API_URL` ke URL service Render tanpa garis miring di akhir, misalnya `https://absensi-pd-api.onrender.com`, lalu deploy ulang.
4. Pastikan `https://<url-render>/health` memberi status `200`, lalu uji form absensi dan login petugas melalui URL Netlify.

Jangan simpan nilai rahasia MongoDB atau kredensial admin ke repository. Akun admin pertama dibuat otomatis saat API terhubung ke database yang belum memiliki admin.
