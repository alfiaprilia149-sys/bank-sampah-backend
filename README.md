# Bank Sampah Digital & Daur Ulang — Backend API

RESTful API untuk sistem Bank Sampah Digital, dibangun dengan **NestJS (TypeScript)**, **Prisma ORM**, dan **MySQL**.

## Framework & Teknologi

| Komponen | Teknologi |
|---|---|
| Framework | NestJS 11 (TypeScript) |
| ORM | Prisma 5 |
| Database | MySQL |
| Autentikasi | JWT (Passport.js) + bcrypt |
| Dokumentasi API | Swagger (OpenAPI) |
| Upload File | Multer |

## Live Demo

- **Base URL**: `https://bank-sampah-backend-production-3ac1.up.railway.app`
- **Swagger Docs**: `https://bank-sampah-backend-production-3ac1.up.railway.app/api/docs`

## Menjalankan di Lokal

### 1. Prasyarat
- Node.js versi 18 ke atas
- MySQL Server (bisa pakai XAMPP)
- npm

### 2. Instalasi

```bash
# Clone / extract project, lalu masuk ke foldernya
cd bank-sampah-backend

# Install dependencies
npm install
```

### 3. Konfigurasi Environment

Copy `.env.example` jadi `.env`, lalu sesuaikan:

```env
DATABASE_URL="mysql://root:@localhost:3306/bankSampah_db"
JWT_SECRET="ganti-dengan-secret-key-yang-kuat"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 4. Setup Database

```bash
# Buat database kosong dulu (lewat phpMyAdmin atau terminal MySQL)
# Lalu jalankan migrasi:
npx prisma migrate dev
```

### 5. Jalankan Aplikasi

```bash
npm run start:dev
```

Server berjalan di `http://localhost:3000`, dengan:
- API base URL: `http://localhost:3000/api/v1`
- Swagger docs: `http://localhost:3000/api/docs`

### 6. (Opsional) Generate Data Dummy untuk Testing

```bash
curl -X POST http://localhost:3000/api/v1/seed
```
Atau panggil langsung lewat Swagger UI di endpoint `POST /seed`.

Ini akan membuat:
- 1 akun Admin (`admin_banksampah` / `admin123`)
- 2 akun Nasabah (`nasabah_budi` & `nasabah_siti` / `password123`)
- 4 Kategori Sampah
- 3 Katalog Hadiah
- Riwayat transaksi contoh

## Struktur Folder

```
src/
├── main.ts                 # Entry point, setup Swagger & global pipes
├── app.module.ts            # Root module
├── prisma/                  # PrismaService (koneksi database)
├── config/                  # Konfigurasi JWT & Multer
├── common/                  # Guard, decorator, filter, interceptor bersama
└── modules/
    ├── auth/                 # Register, login, profil
    ├── nasabah/               # CRUD nasabah oleh Admin
    ├── kategori-sampah/       # CRUD kategori sampah
    ├── setor-sampah/          # Pengajuan & verifikasi setor
    ├── hadiah/                # CRUD katalog hadiah
    ├── penukaran-poin/        # Tukar poin dengan hadiah
    ├── rekapitulasi/          # Laporan bulanan
    ├── dashboard/             # Ringkasan statistik
    ├── seed/                  # Generate data dummy
    └── upload/                # Helper upload foto
```

## Autentikasi

Semua endpoint yang butuh login memakai **Bearer Token (JWT)**:

```
Authorization: Bearer <token>
```

Token didapat dari endpoint `POST /api/v1/auth/login`.

## Role & Akses

| Role | Deskripsi |
|---|---|
| `NASABAH` | Bisa ajukan setor sampah, lihat histori, tukar poin |
| `ADMIN` | Bisa kelola data master (kategori, hadiah, nasabah), verifikasi setoran, lihat laporan |

## Catatan Teknis

- Password di-hash menggunakan **bcrypt** sebelum disimpan.
- Perhitungan poin & update saldo memakai **Prisma database transaction** untuk menjaga konsistensi data.
- File foto disimpan di folder `/uploads` dan di-serve sebagai file statis.