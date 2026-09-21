import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  async seed() {
    const existing = await this.prisma.user.findUnique({
      where: { username: 'admin_banksampah' },
    });
    if (existing) {
      throw new BadRequestException(
        'Data seed sudah pernah dibuat sebelumnya. Reset database terlebih dahulu jika ingin generate ulang.',
      );
    }

    const [adminPassword, nasabahPassword] = await Promise.all([
      bcrypt.hash('admin123', 10),
      bcrypt.hash('password123', 10),
    ]);

    // ---- 1. Admin ----
    const admin = await this.prisma.user.create({
      data: {
        username: 'admin_banksampah',
        password: adminPassword,
        role: 'ADMIN',
        adminBank: {
          create: {
            namaUnit: 'Bank Sampah Asri Jaya',
            namaPengelola: 'Bapak H. Sukirman',
            telp: '081234567890',
          },
        },
      },
      include: { adminBank: true },
    });

    // ---- 2. Dua Nasabah aktif ----
    const nasabah1 = await this.prisma.user.create({
      data: {
        username: 'nasabah_budi',
        password: nasabahPassword,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: 'Budi Santoso',
            alamat: 'Jl. Merdeka No. 12, RT 03/05',
            telp: '085678901234',
            saldoPoin: 150,
            foto: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=16a34a&color=fff',
          },
        },
      },
      include: { nasabah: true },
    });

    const nasabah2 = await this.prisma.user.create({
      data: {
        username: 'nasabah_siti',
        password: nasabahPassword,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: 'Siti Aminah',
            alamat: 'Jl. Mawar Indah No. 45',
            telp: '081987654321',
            saldoPoin: 80,
            foto: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=16a34a&color=fff',
          },
        },
      },
      include: { nasabah: true },
    });

    // ---- 3. Empat Kategori Sampah ----
    const [kategoriPlastik, kategoriKertas] = await Promise.all([
      this.prisma.kategoriSampah.create({
        data: {
          namaKategori: 'Botol Plastik PET (Bersih)',
          hargaPerKg: 3500,
          poinPerKg: 10,
          jenis: 'plastik',
        },
      }),
      this.prisma.kategoriSampah.create({
        data: {
          namaKategori: 'Kardus & Karton Bekas',
          hargaPerKg: 2000,
          poinPerKg: 5,
          jenis: 'kertas',
        },
      }),
      this.prisma.kategoriSampah.create({
        data: {
          namaKategori: 'Kaleng Aluminium / Minuman',
          hargaPerKg: 12000,
          poinPerKg: 30,
          jenis: 'logam',
        },
      }),
      this.prisma.kategoriSampah.create({
        data: {
          namaKategori: 'Botol Kaca Bening',
          hargaPerKg: 1500,
          poinPerKg: 4,
          jenis: 'kaca',
        },
      }),
    ]);

    // ---- 4. Tiga Katalog Hadiah ----
    const [hadiahPulsa] = await Promise.all([
      this.prisma.hadiah.create({
        data: { namaHadiah: 'Voucher Pulsa / E-Wallet Rp 25.000', poinDibutuhkan: 75, stok: 50 },
      }),
      this.prisma.hadiah.create({
        data: { namaHadiah: 'Minyak Goreng Bimoli 1 Liter', poinDibutuhkan: 100, stok: 25 },
      }),
      this.prisma.hadiah.create({
        data: { namaHadiah: 'Beras Super Pulen 2.5 Kg', poinDibutuhkan: 180, stok: 15 },
      }),
    ]);

    // ---- 5. Riwayat transaksi setor (sudah selesai) untuk nasabah1 ----
    await this.prisma.setorSampah.create({
      data: {
        kodeSetor: 'STR-202608-1001',
        tanggal: new Date('2026-08-26T09:35:51.874Z'),
        idNasabah: nasabah1.nasabah!.id,
        idAdmin: admin.adminBank!.id,
        status: 'selesai',
        totalBeratKg: 15,
        totalPoin: 150,
        catatan: 'Sampah sudah dipilah rapi dalam karung',
        catatanAdmin: 'Penimbangan selesai dan akurat.',
        detailSetor: {
          create: [
            { idKategoriSampah: kategoriPlastik.id, beratKg: 10, beratKgReal: 10, subtotalPoin: 100 },
            { idKategoriSampah: kategoriKertas.id, beratKg: 5, beratKgReal: 5, subtotalPoin: 25 },
          ],
        },
      },
    });

    // ---- 6. Riwayat transaksi penukaran poin untuk nasabah1 ----
    await this.prisma.penukaranPoin.create({
      data: {
        kodePenukaran: 'TKR-202608-5001',
        tanggal: new Date('2026-08-26T09:35:52.333Z'),
        idNasabah: nasabah1.nasabah!.id,
        idHadiah: hadiahPulsa.id,
        poinTerpakai: 75,
        status: 'selesai',
      },
    });

    return {
      message: 'Dummy sample data Bank Sampah berhasil dibuat!',
      data: {
        admin: {
          username: 'admin_banksampah',
          password: 'admin123',
          namaUnit: admin.adminBank!.namaUnit,
        },
        nasabah1: {
          username: 'nasabah_budi',
          password: 'password123',
          namaNasabah: nasabah1.nasabah!.namaNasabah,
          saldoPoin: nasabah1.nasabah!.saldoPoin,
        },
        nasabah2: {
          username: 'nasabah_siti',
          password: 'password123',
          namaNasabah: nasabah2.nasabah!.namaNasabah,
          saldoPoin: nasabah2.nasabah!.saldoPoin,
        },
        kategoriSampahCount: 4,
        hadiahKatalogCount: 3,
      },
    };
  }
}