# 🛒 E-Commerce & PC Builder API

Backend REST API untuk aplikasi E-Commerce dengan fitur perakitan PC (PC Builder) terintegrasi. Dibangun menggunakan Node.js, Express.js, Prisma ORM, dan PostgreSQL.

## 🚀 Fitur Utama
- **Autentikasi & Otorisasi:** JWT untuk akses API (Role: Admin & Customer).
- **Manajemen Produk:** Admin dapat menambahkan produk PC (CPU, Motherboard, RAM, Storage, GPU, PSU, Casing).
- **Keranjang Belanja (Cart):** Customer dapat menambahkan produk ke keranjang, mengupdate kuantitas, dan melihat subtotal.
- **Transaksi (Checkout):** Pembelian dari keranjang otomatis memotong stok dan mencatat riwayat pesanan (menggunakan Database Transactions).
- **PC Builder:**
  - Pemilihan komponen yang dinamis dan terstruktur.
  - Validasi kompatibilitas antar komponen PC secara otomatis (contoh: kecocokan *Socket* Motherboard dengan CPU, dukungan *Tipe RAM*).
  - Estimasi dan kalkulasi harga secara *real-time*.
  - Checkout build PC langsung menjadi pesanan.

## 💻 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Keamanan:** Bcrypt.js (Password Hashing) & JSON Web Token (JWT)
- **Validasi:** Joi

## 📂 Struktur Proyek
```text
e-commerce_backend/
├── prisma/
│   ├── schema.prisma          # Skema database & relasi (Prisma)
│   └── seed.js                # Data awal untuk admin & komponen produk PC
├── src/
│   ├── controllers/           # Logika bisnis API
│   ├── middleware/            # Auth, Global Error Handler, & Validasi Joi
│   ├── routes/                # Endpoint API
│   ├── utils/                 # Validasi JSON schema Joi & Logika PC Builder
│   ├── prisma/client.js       # Instance koneksi Prisma
│   ├── app.js                 # Konfigurasi Express
│   └── index.js               # Entry point aplikasi
├── .env                       # Variabel environment
├── .env.example               # Template environment
└── package.json               # Dependensi proyek
```

## ⚙️ Prasyarat
- **Node.js**: Versi 18 atau ke atas
- **PostgreSQL**: Terpasang dan berjalan (Lokal atau Server)

## 🛠️ Instalasi & Menjalankan Aplikasi

1. **Clone repository ini** (jika ada):
   ```bash
   git clone <url-repository>
   cd e-commerce_backend
   ```

2. **Instal dependensi NPM:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Salin file `.env.example` menjadi `.env` lalu sesuaikan dengan database PostgreSQL milikmu.
   ```bash
   cp .env.example .env
   ```
   Edit `.env` (contoh):
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:password_kamu@localhost:5432/ecommerce_db?schema=public"
   JWT_SECRET=super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   ```

4. **Inisialisasi Database (Migrasi & Seed):**
   Ini akan membuat tabel pada database-mu dan mengisinya dengan data *dummy* pengguna & produk PC.
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

5. **Jalankan Aplikasi:**
   - **Mode Development:**
     ```bash
     npm run dev
     ```
   - **Mode Production:**
     ```bash
     npm start
     ```

## 🛂 Kredensial Uji Coba (Bawaan Seeder)
Gunakan kredensial berikut untuk menguji API setelah seeding (Endpoint `/api/auth/login`):

- **Admin Account**: 
  - Email: `admin@pcstore.com`
  - Password: `admin123`
- **Customer Account**:
  - Email: `budi@mail.com`
  - Password: `user123`

*(Jangan lupa meletakkan JWT *token* di dalam *header* "Authorization" sebagai Bearer Token ketika mengakses *endpoint* selain auth & products).*

## 📖 Dokumentasi Endpoint API
Terdapat lebih dari 20 endpoint API yang dikelompokkan ke dalam 6 kategori (`Auth`, `Users`, `Products`, `Cart`, `Orders`, dan `PC Builder`). 

Untuk rincian *Request* dan *Response* tiap endpoint, beserta logika kompatibilitas PC Builder secara mendetail, **lihat file** `api_documentation.md` (jika ada) atau rujuk pada dokumentasi yang disertakan. 

## 🛡️ Lisensi
Proyek ini dibuat untuk keperluan pembelajaran & *workshop cloud*. Bebas digunakan dan dimodifikasi.
