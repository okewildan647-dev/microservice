# Sistem Inventaris Microservices

Fondasi pembelajaran Node.js/Express dengan empat proses API: autentikasi admin dan tiga service domain (barang, kategori, stok). Semua memakai MySQL yang sama pada tahap awal. Transaksi stok dan pembaruan saldo dilakukan atomik di satu transaksi database.

## Menjalankan

1. Siapkan MySQL dan jalankan `database/schema.sql`.
2. Salin `.env.example` menjadi `.env`, lalu isi kredensial database, `JWT_SECRET` acak minimal 32 karakter, dan kata sandi admin.
3. Instal dependensi dengan `npm.cmd install` (PowerShell dapat memblokir `npm.ps1`).
4. Buat admin awal dengan hash bcrypt: `node scripts/create-admin.js`.
5. Jalankan `npm.cmd start` untuk development atau `npm.cmd run start:auth` / `start:items` / `start:categories` / `start:stock` terpisah.

Port default: auth 3001, barang 3002, kategori 3003, stok 3004. Semua endpoint kecuali login meminta header `Authorization: Bearer <token>`. Stok menerima `Idempotency-Key` opsional; klien sebaiknya selalu mengirimkannya agar retry tidak menggandakan transaksi.

## Contoh login

`POST /auth/login` dengan `{ "username": "admin", "password": "..." }`.

Token JWT berumur terbatas; password hanya disimpan sebagai bcrypt hash. Endpoint internal lintas-service belum diekspos—stock service mengunci dan memperbarui tabel items langsung karena semua service masih dalam satu database. Saat database dipisah, pindahkan integrasi ke autentikasi antarlayanan dan pola konsistensi seperti outbox/saga.
