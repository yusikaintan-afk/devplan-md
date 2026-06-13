# Sistem Penerimaan Mahasiswa Baru (PMB) - Vibe Coding

Sistem ini merupakan hasil pengembangan lanjutan (Penambahan Modul Penjadwalan Tes Seleksi & Wawancara) di atas purwarupa Sistem PMB yang telah dibuat sebelumnya.

## Cara Menjalankan Aplikasi

Aplikasi ini menggunakan React 18 + Vite untuk frontend dan Laravel 12 + SQLite untuk backend. 

### 1. Menjalankan Backend (Laravel)
1. Buka terminal baru dan arahkan ke folder `pmb-backend`
2. Jalankan perintah instalasi dependensi (jika belum):
   ```bash
   composer install
   ```
3. Copy file `.env.example` menjadi `.env` (jika belum ada) dan sesuaikan konfigurasi database ke SQLite.
4. Jalankan migrasi dan seeder untuk menyiapkan database (termasuk tabel baru `jadwal_tes` dan `reschedule_requests`):
   ```bash
   php artisan migrate:fresh --seed
   ```
5. Jalankan server backend:
   ```bash
   php artisan serve
   ```
   Backend akan berjalan di `http://localhost:8000`.

### 2. Menjalankan Frontend (React)
1. Buka terminal baru dan arahkan ke folder `pmb-frontend`
2. Jalankan perintah instalasi dependensi npm:
   ```bash
   npm install
   ```
3. Jalankan server frontend:
   ```bash
   npm run dev
   ```
   Frontend akan berjalan di `http://localhost:5173`.

---

## Status Fitur Baru (Modul Penjadwalan Tes)

Seluruh fitur baru yang direncanakan di dalam Development Plan telah berhasil diimplementasikan:

- ✅ **Admin: Membuat Sesi Jadwal Tes** — Berjalan lancar (termasuk validasi pencegahan jadwal bentrok).
- ✅ **Admin: Assign Pendaftar ke Sesi** — Berjalan lancar (hanya menampilkan pendaftar dengan status "Lolos Seleksi").
- ✅ **Admin: Kelola Reschedule** — Berjalan lancar (Admin dapat menerima/menolak pengajuan reschedule dari peserta, otomatis membatalkan jadwal lama jika disetujui).
- ✅ **Peserta: Cek Jadwal Tes** — Berjalan lancar (Peserta dapat mengecek jadwal dengan menggunakan nomor pendaftarannya di halaman utama).
- ✅ **Peserta: Ajukan Reschedule** — Berjalan lancar (Peserta dapat mengajukan reschedule beserta alasannya via Modal Form yang telah disediakan).

*Tidak ada fitur baru yang berstatus gagal / belum berjalan.*

---

## Konfirmasi Fungsionalitas Fitur Lama

Seluruh fitur lama dipastikan **tetap berjalan normal** tanpa regresi atau gangguan:
- Formulir pendaftaran mahasiswa baru tetap berfungsi dengan baik.
- Cek status pendaftaran masih berjalan sebagaimana mestinya.
- Admin tetap dapat melakukan login menggunakan kredensial Sanctum yang lama (`admin@pmb.local` / `pmb2025`).
- Statistik di Dashboard Admin untuk data pendaftar tetap akurat.
- Fitur Heregistrasi tetap berjalan bagi pendaftar yang lolos seleksi tanpa ada konflik dengan modul Penjadwalan Tes.

---

## Deskripsi Tampilan Modul Penjadwalan

1. **Halaman Publik: Cek Jadwal**
   Halaman utama publik kini memiliki tab baru "Cek Jadwal". Apabila peserta memasukkan nomor pendaftaran (`PMB-2025-XXXX`) dan telah berstatus "Lolos Seleksi", sistem akan menampilkan *card* berisi rincian jadwal (tanggal, jam, jenis tes, lokasi, status jadwal). Pada *card* ini juga terdapat tombol "Ajukan Reschedule" beraksen *amber* (kuning) yang memicu munculnya modal konfirmasi dan isian alasan apabila peserta tidak dapat hadir.

2. **Halaman Admin: Manajemen Jadwal**
   Halaman Admin telah diperbarui dengan tab navigasi baru di *header*. Terdapat antarmuka yang clean dengan *Statistik Cards* khusus jadwal tes di bagian atas. Tabel daftar jadwal menampilkan info rinci beserta *badge* status yang dapat diperbarui secara *inline*. 
   
3. **Form Buat Jadwal Baru (Admin)**
   Tampil sebagai modal melayang (overlay) yang rapi. Pilihan peserta tes menggunakan *dropdown* otomatis yang hanya berisi data calon mahasiswa dengan status "Lolos Seleksi" sehingga mencegah admin keliru dalam menjadwalkan.

4. **Halaman Admin: Tabel Reschedule**
   Berbentuk tabel terpisah untuk memudahkan admin meninjau pengajuan reschedule, memuat alasan peserta, status (Menunggu/Disetujui/Ditolak), dan langsung memfasilitasi pengambilan keputusan (tombol Setujui/Tolak) yang responsif.
