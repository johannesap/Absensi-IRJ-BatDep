# PRD — Presensi Ibadah Raya Jumat

| | |
|---|---|
| **Produk** | Presensi Ibadah Raya Jumat, PD Universitas Gunadarma (Area Depok) |
| **Status** | Berjalan di produksi: https://absensi-irj-batdep.vercel.app |
| **Pembaruan terakhir** | 21 Oktober 2026 |
| **Dokumen teknis** | [README.md](./README.md): struktur kode, API, cara menjalankan, dan deploy |

## 1. Latar belakang

Kehadiran Ibadah Raya Jumat perlu dicatat supaya pengurus tahu siapa yang hadir, bisa menghubungi dan menggembalakan peserta, dan bisa mendoakan pokok doa mereka. Aplikasi ini menggantikan pencatatan manual dengan form yang diisi peserta di HP masing-masing, plus dashboard untuk pengurus.

## 2. Tujuan

1. Peserta bisa presensi sendiri dari HP dalam waktu kurang dari satu menit, tanpa membuat akun.
2. Pengurus melihat siapa saja yang hadir hari ini dan jumlahnya, yang diperbarui otomatis selama ibadah.
3. Pengurus punya kontak (WhatsApp, Instagram), ulang tahun, dan dukungan doa setiap peserta untuk tindak lanjut.
4. Data pribadi peserta hanya bisa dilihat pengurus yang login.

**Bukan tujuan saat ini:** statistik atau grafik kehadiran, ekspor ke spreadsheet, notifikasi WhatsApp, akun untuk peserta, dan presensi lewat QR code.

## 3. Pengguna

| Pengguna | Kebutuhan | Akses |
|---|---|---|
| **Peserta** (mahasiswa) | Mengisi kehadiran dengan cepat, lalu boleh menitipkan pokok doa | Halaman publik `/`, tanpa login |
| **User Penggembalaan** (pengurus) | Melihat, mencari, dan menghapus data kehadiran; mengganti password sendiri | Login, lalu masuk ke `/penggembalaan` |
| **Admin** | Semua yang bisa dilakukan User Penggembalaan, ditambah mengelola akun User Penggembalaan | Login, lalu masuk ke `/admin` |

Akun admin pertama dibuat otomatis dari environment variable saat aplikasi pertama kali terhubung ke database. Peserta tidak punya akun.

## 4. Alur utama

**Peserta**
1. Membuka halaman presensi dan melihat layar sambutan "Selamat Datang di Ibadah Raya Jumat", lalu mengetuk "Ketuk untuk masuk". Ketukan ini juga memulai lagu latar.
2. Mengisi form, lalu menekan **Kirim Kehadiran**.
3. Kalau berhasil, muncul ucapan terima kasih dan kolom **Dukungan Doa** yang boleh diisi atau dilewati.
4. Layar terima kasih tampil sekitar 5 detik, lalu halaman kembali ke awal untuk peserta berikutnya.

**Pengurus**
1. Login di `/login`. Admin diarahkan ke halaman Akun, User Penggembalaan ke halaman Kehadiran.
2. Halaman Kehadiran langsung menampilkan data hari ini dan totalnya, yang diperbarui setiap 15 detik.
3. Pengurus bisa mencari nama atau NPM, memilih tanggal lain atau semua tanggal, dan menghapus data yang salah.

## 5. Kebutuhan fungsional

### 5.1 Form presensi (publik)

| Kolom | Wajib | Aturan |
|---|---|---|
| Nama Lengkap | Ya | Maksimal 100 karakter |
| NPM | Ya | Tepat 8 digit angka |
| Kelas | Ya | Maksimal 5 karakter, disimpan dalam huruf besar (cth. `3IA01`) |
| Kakak Komsel | Ya | Maksimal 100 karakter |
| Nomor WhatsApp | Ya | Hanya angka, maksimal 13 digit. Awalan `0` disimpan sebagai `62` (cth. `0812…` menjadi `62812…`) |
| ID Instagram | Tidak | Boleh diawali `@`; hanya huruf, angka, titik, dan garis bawah, maksimal 30 karakter. Disimpan tanpa `@` dan dalam huruf kecil |
| Asal Gereja | Ya | Maksimal 100 karakter |
| Kamu tahu Ibadah Raya Jumat dari mana? | Ya | Maksimal 100 karakter |
| Tanggal Ulang Tahun | Tidak | Tanggal dan bulan, tanpa tahun. Isi keduanya atau kosongkan keduanya. Tanggalnya harus ada (29 Februari boleh, 31 April tidak) |
| Tanggal Kehadiran | Otomatis | Hanya ditampilkan (hari, tanggal, dan jam WIB). Nilai yang disimpan selalu diisi oleh server |

- Semua pesan kesalahan berbahasa Indonesia dan muncul di bawah kolom yang salah.
- Server mengecek aturan yang sama dengan form. Data yang tidak lolos ditolak walau dikirim tanpa lewat form.
- Di bawah form ada pemberitahuan bahwa data hanya dipakai untuk pelayanan PD, hanya dilihat pengurus, dan isiannya disimpan di perangkat peserta.
- Setelah presensi berhasil, isian form (tanpa dukungan doa) disimpan di perangkat itu (localStorage). Presensi berikutnya dari perangkat yang sama langsung terisi, jadi peserta tinggal mengecek lalu mengirim. Tombol "Bukan kamu? Kosongkan" menghapus isian tersimpan, untuk HP yang dipakai bergantian.

### 5.2 Aturan presensi

- **Satu NPM hanya bisa presensi sekali per hari** menurut zona waktu WIB. Aturan ini dijaga oleh index unik di database, jadi tetap berlaku walau dua kiriman datang bersamaan. Kiriman kedua mendapat pesan "NPM ini sudah tercatat hadir hari ini".
- Waktu kehadiran diambil dari jam server, bukan dari HP peserta.
- Tidak ada batas per perangkat. Satu HP boleh mengisi untuk beberapa NPM.

### 5.3 Dukungan doa

- Muncul setelah presensi berhasil. Sifatnya opsional, maksimal 1.000 karakter, dan bisa dilewati.
- Hanya bisa dikirim **sekali**, pada **hari yang sama**, untuk presensi milik peserta itu sendiri. Server mencocokkan ID presensi dengan NPM-nya.
- Hanya dibaca oleh pengurus.

### 5.4 Suasana halaman presensi

- Layar sambutan dan layar terima kasih memakai animasi. Keduanya dilewati atau dimatikan kalau perangkat memakai setelan "kurangi gerakan".
- Lagu latar "Praise" (Elevation Worship) diputar setelah ketukan pertama, karena browser memblokir suara sebelum ada interaksi. Ada tombol Jeda/Putar, dan lagu tetap berlanjut saat pindah ke halaman login.

### 5.5 Login dan sesi

- Login memakai username dan password. Password minimal 10 karakter.
- Sesi berakhir saat tab atau browser ditutup, atau setelah 8 jam.
- Sesi lama langsung berakhir kalau akunnya dihapus, password-nya diganti, atau datanya diubah admin.
- Login dibatasi 10 percobaan per menit per IP melalui Vercel Firewall.

### 5.6 Halaman Kehadiran (User Penggembalaan dan Admin)

- Ringkasan berisi tanggal yang dipilih dan total hadir. Total tidak terpengaruh pencarian.
- Pencarian berdasarkan nama atau NPM.
- Filter tanggal, dengan hari ini sebagai bawaan. Tombol "Semua tanggal" menampilkan seluruh data.
- Diperbarui otomatis setiap 15 detik, hanya saat yang dipilih adalah tanggal hari ini.
- Data ditampilkan 5 per halaman, dengan tombol Sebelumnya dan Berikutnya.
- Kolom yang tampil: No, Nama, NPM, Kelas, WhatsApp (tautan ke chat), Instagram (tautan ke profil), Ulang Tahun, Kakak Komsel, Asal Gereja, Tahu Dari, Tanggal dan jam, serta Dukungan Doa.
- Di HP, data tampil sebagai kartu per peserta. Di layar lebar, data tampil sebagai tabel.
- Data bisa dihapus setelah konfirmasi. Setelah dihapus, NPM tersebut bisa presensi lagi di hari yang sama.

### 5.7 Manajemen akun (khusus Admin)

- Membuat, mengubah, dan menghapus akun User Penggembalaan (nama, username, password).
- Saat mengubah akun, kolom password yang dikosongkan berarti password tidak diubah.
- Username harus unik dan tidak membedakan huruf besar atau kecil.
- Admin tidak bisa mengubah atau menghapus akun admin lewat halaman ini, dan tidak bisa membuat akun admin baru.

### 5.8 Ganti password (Admin dan User Penggembalaan)

- Wajib memasukkan password lama dan mengulang password baru.
- Setelah berhasil, sesi di perangkat lain berakhir, sedangkan perangkat yang dipakai tetap masuk.

## 6. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
|---|---|
| **Perangkat** | Dirancang untuk HP terlebih dahulu dan tetap ringan di HP dengan RAM 4 GB. Animasi hanya memakai transform dan opacity |
| **Bahasa** | Seluruh tampilan dan pesan dalam bahasa Indonesia. Waktu memakai WIB |
| **Aksesibilitas** | Setiap kolom punya label, kesalahan dibacakan pembaca layar, dan tersedia tombol untuk melihat password |
| **Keamanan** | Password di-hash dengan bcrypt. Hak akses dicek di server, bukan hanya di tampilan. Login dibatasi Firewall. Header keamanan dipasang (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) |
| **Privasi** | Data pribadi hanya bisa diakses pengurus yang login, kecuali isian terakhir yang tersimpan di perangkat peserta sendiri. Ulang tahun disimpan tanpa tahun supaya tidak terlalu sensitif kalau bocor |
| **Kapasitas** | Mampu melayani ratusan peserta yang mengisi di menit yang sama. Batas teoretisnya sekitar 100 presensi per detik (batas Atlas gratis); di atas itu request antre, bukan gagal |
| **Ketersediaan** | Vercel (paket Hobby, region Singapura) dan MongoDB Atlas (gratis). Cron mingguan memanggil `/api/health` supaya Atlas tidak di-pause saat libur |
| **Kualitas** | Tes otomatis (`npm test` di folder `server`) mengecek validasi data dan batas hari WIB |

## 7. Data yang disimpan

**Presensi:** nama, NPM, kelas, kakak komsel, WhatsApp, Instagram, asal gereja, sumber info, ulang tahun (MM-DD), dukungan doa, waktu kehadiran, dan hari kehadiran (WIB).

**Akun:** username, nama, role (`admin` atau `penggembalaan`), hash password, dan waktu dibuat atau diubah.

## 8. Batasan yang diketahui

| Batasan | Dampak | Langkah kalau perlu |
|---|---|---|
| Daftar kehadiran menampilkan maksimal 1.000 data terbaru per filter | Data lama di tampilan "Semua tanggal" tidak terlihat. Dashboard memberi tahu saat batas ini tercapai | Pilih tanggal tertentu, atau tambahkan paginasi di server |
| Tidak ada batas per perangkat | "Titip absen" (mengisi presensi untuk orang lain) bisa terjadi | Lihat pertanyaan terbuka no. 2 |
| Isian terakhir tersimpan di perangkat | Di HP yang dipakai bergantian, orang berikutnya melihat data orang sebelumnya (termasuk nomor WhatsApp) sampai menekan "Bukan kamu? Kosongkan" | Ingatkan peserta saat meminjamkan HP |
| Form presensi tidak dibatasi per IP, karena peserta di Wi-Fi kampus memakai IP yang sama | Skrip bisa membanjiri form dengan data palsu | Aktifkan Vercel BotID untuk `POST /api/attendance` |
| Tidak ada ekspor data atau riwayat penghapusan | Data yang dihapus pengurus tidak bisa dikembalikan | Tambahkan kalau dibutuhkan |

## 9. Pertanyaan terbuka

1. **Berapa lama data pribadi disimpan?** Nomor WhatsApp, ulang tahun, dan dukungan doa saat ini disimpan tanpa batas waktu.
2. **Apakah "titip absen" boleh?** Kalau tidak boleh, perlu ada cara verifikasi, misalnya kode harian yang diumumkan saat ibadah.
3. **Apakah pengurus butuh ekspor ke spreadsheet atau rekap kehadiran per semester?**
