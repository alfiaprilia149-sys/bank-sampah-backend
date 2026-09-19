import { BadRequestException, Injectable } from '@nestjs/common';
import { JenisSampah } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { parseBulanFilter } from '../../common/utils/date-filter.util';

type JenisBreakdown = { tonaseKg: number; rupiah: number; poin: number };

@Injectable()
export class RekapitulasiService {
  constructor(private prisma: PrismaService) {}

  async getBulanan(bulan?: string) {
    // ?bulan wajib diisi sesuai Kontrak API (beda dari filter opsional
    // di endpoint lain seperti setor-sampah/my-setor).
    const range = parseBulanFilter(bulan);
    if (!range) {
      throw new BadRequestException('Query parameter bulan wajib diisi dengan format YYYY-MM.');
    }

    //Ambil semua item setor yang SUDAH selesai di bulan ini 
    const details = await this.prisma.detailSetor.findMany({
      where: {
        setorSampah: {
          status: 'selesai',
          tanggal: { gte: range.gte, lt: range.lt },
        },
      },
      include: { kategoriSampah: true },
    });

    //Inisialisasi breakdown 4 jenis sampah, semua mulai dari 0
    const breakdown: Record<JenisSampah, JenisBreakdown> = {
      plastik: { tonaseKg: 0, rupiah: 0, poin: 0 },
      kertas: { tonaseKg: 0, rupiah: 0, poin: 0 },
      logam: { tonaseKg: 0, rupiah: 0, poin: 0 },
      kaca: { tonaseKg: 0, rupiah: 0, poin: 0 },
    };

    for (const detail of details) {
      const jenis = detail.kategoriSampah.jenis;
      const beratAktual = detail.beratKgReal ?? detail.beratKg;
      const rupiah = beratAktual * detail.kategoriSampah.hargaPerKg;

      breakdown[jenis].tonaseKg += beratAktual;
      breakdown[jenis].rupiah += rupiah;
      breakdown[jenis].poin += detail.subtotalPoin;
    }

    //Total keseluruhan (jumlah dari semua jenis) 
    const totalKg = Object.values(breakdown).reduce((sum, b) => sum + b.tonaseKg, 0);
    const totalEstimasiPembayaranRupiah = Object.values(breakdown).reduce((sum, b) => sum + b.rupiah, 0);
    const totalPoinDiterbitkan = Object.values(breakdown).reduce((sum, b) => sum + b.poin, 0);

    //Rekap penukaran poin di bulan yang sama 
    const penukaranList = await this.prisma.penukaranPoin.findMany({
      where: { tanggal: { gte: range.gte, lt: range.lt } },
      select: { poinTerpakai: true },
    });

    const totalPoinTerpakai = penukaranList.reduce((sum, p) => sum + p.poinTerpakai, 0);
    const roundBreakdown = (b: JenisBreakdown) => ({
      tonaseKg: Math.round(b.tonaseKg * 100) / 100,
      rupiah: Math.round(b.rupiah),
      poin: b.poin,
    });

    return {
      message: `Rekapitulasi Bank Sampah Bulan ${Number(bulan!.split('-')[1])}/${bulan!.split('-')[0]} berhasil diambil`,
      data: {
        periode: bulan,
        rekapitulasiTonase: {
          totalKg: Math.round(totalKg * 100) / 100,
          totalTon: Math.round((totalKg / 1000) * 1000) / 1000,
          totalEstimasiPembayaranRupiah: Math.round(totalEstimasiPembayaranRupiah),
          totalPoinDiterbitkan,
        },
        breakdownJenisSampah: {
          plastik: roundBreakdown(breakdown.plastik),
          kertas: roundBreakdown(breakdown.kertas),
          logam: roundBreakdown(breakdown.logam),
          kaca: roundBreakdown(breakdown.kaca),
        },
        rekapitulasiPenukaranPoin: {
          totalTransaksiPenukaran: penukaranList.length,
          totalPoinTerpakai,
        },
      },
    };
  }
}