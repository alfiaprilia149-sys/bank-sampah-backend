import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary(nasabahId: string) {
    const nasabah = await this.prisma.nasabah.findUnique({ where: { id: nasabahId } });
    if (!nasabah) {
      throw new NotFoundException('Data nasabah tidak ditemukan.');
    }

    const [totalSampahAgg, transaksiTerakhirSetor, transaksiTerakhirTukar] = await Promise.all([
      // Total sampah & poin yang PERNAH didapat (dari transaksi yang sudah selesai)
      this.prisma.setorSampah.aggregate({
        where: { idNasabah: nasabahId, status: 'selesai' },
        _sum: { totalBeratKg: true, totalPoin: true },
      }),
      this.prisma.setorSampah.findFirst({
        where: { idNasabah: nasabahId },
        orderBy: { tanggal: 'desc' },
        select: { kodeSetor: true, tanggal: true, totalBeratKg: true, totalPoin: true, status: true },
      }),
      this.prisma.penukaranPoin.findFirst({
        where: { idNasabah: nasabahId },
        orderBy: { tanggal: 'desc' },
        include: { hadiah: { select: { namaHadiah: true } } },
      }),
    ]);

    const totalPoinDitukar = await this.prisma.penukaranPoin.aggregate({
      where: { idNasabah: nasabahId },
      _sum: { poinTerpakai: true },
    });

    return {
      message: 'Summary dashboard nasabah berhasil diambil',
      data: {
        saldoPoinSaatIni: nasabah.saldoPoin,
        totalSampahDisetorKg: totalSampahAgg._sum.totalBeratKg ?? 0,
        totalPoinDidapat: totalSampahAgg._sum.totalPoin ?? 0,
        totalPoinDitukar: totalPoinDitukar._sum.poinTerpakai ?? 0,
        transaksiTerakhirSetor: transaksiTerakhirSetor
          ? {
              kodeSetor: transaksiTerakhirSetor.kodeSetor,
              tanggal: transaksiTerakhirSetor.tanggal,
              beratKg: transaksiTerakhirSetor.totalBeratKg,
              poin: transaksiTerakhirSetor.totalPoin,
              status: transaksiTerakhirSetor.status,
            }
          : null,
        transaksiTerakhirTukar: transaksiTerakhirTukar
          ? {
              kodePenukaran: transaksiTerakhirTukar.kodePenukaran,
              tanggal: transaksiTerakhirTukar.tanggal,
              hadiah: transaksiTerakhirTukar.hadiah.namaHadiah,
              poin: transaksiTerakhirTukar.poinTerpakai,
              status: transaksiTerakhirTukar.status,
            }
          : null,
      },
    };
  }

  async stats() {
    const [totalNasabah, totalKategoriSampah, totalTransaksiSetor, totalHadiah, selesaiAgg] =
      await Promise.all([
        this.prisma.nasabah.count(),
        this.prisma.kategoriSampah.count(),
        this.prisma.setorSampah.count(),
        this.prisma.hadiah.count(),
        this.prisma.setorSampah.aggregate({
          where: { status: 'selesai' },
          _sum: { totalBeratKg: true, totalPoin: true },
        }),
      ]);

    return {
      message: 'Statistik dashboard berhasil diambil',
      data: {
        totalNasabah,
        totalKategoriSampah,
        totalTransaksiSetor,
        totalHadiah,
        totalBeratSampahKg: selesaiAgg._sum.totalBeratKg ?? 0,
        totalPoinTersalurkan: selesaiAgg._sum.totalPoin ?? 0,
      },
    };
  }
}