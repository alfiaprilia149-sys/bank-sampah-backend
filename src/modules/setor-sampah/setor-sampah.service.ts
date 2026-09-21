import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';
import { generateKodeSetor } from '../../common/utils/generate-code.util';
import { parseBulanFilter } from '../../common/utils/date-filter.util';

@Injectable()
export class SetorSampahService {
  constructor(private prisma: PrismaService) {}
  async createPengajuan(nasabahId: string, dto: CreateSetorSampahDto) {
    const kategoriIds = dto.items.map((item) => item.kategoriSampahId);

    const kategoriList = await this.prisma.kategoriSampah.findMany({
      where: { id: { in: kategoriIds } },
    });

    if (kategoriList.length !== new Set(kategoriIds).size) {
      throw new BadRequestException(
        'Salah satu atau lebih kategoriSampahId tidak valid / tidak ditemukan.',
      );
    }

    const kategoriMap = new Map(kategoriList.map((k) => [k.id, k]));

    let totalBeratKg = 0;
    let estimasiTotalPoin = 0;

    const detailData = dto.items.map((item) => {
      const kategori = kategoriMap.get(item.kategoriSampahId)!;
      const subtotalPoin = Math.round(item.beratKg * kategori.poinPerKg);
      totalBeratKg += item.beratKg;
      estimasiTotalPoin += subtotalPoin;

      return {
        idKategoriSampah: item.kategoriSampahId,
        beratKg: item.beratKg,
        subtotalPoin,
      };
    });

    const setor = await this.prisma.setorSampah.create({
      data: {
        kodeSetor: generateKodeSetor(new Date(dto.tanggal)),
        tanggal: new Date(dto.tanggal),
        idNasabah: nasabahId,
        status: 'menunggu_konfirmasi',
        totalBeratKg,
        totalPoin: estimasiTotalPoin,
        catatan: dto.catatan,
        detailSetor: { create: detailData },
      },
      include: { detailSetor: true },
    });

    return {
      message: 'Pengajuan penyetoran sampah berhasil dibuat',
      data: {
        id: setor.id,
        kodeSetor: setor.kodeSetor,
        tanggal: setor.tanggal,
        status: setor.status,
        totalBeratKg: setor.totalBeratKg,
        estimasiTotalPoin: setor.totalPoin,
        catatan: setor.catatan,
        detailSetors: setor.detailSetor,
      },
    };
  }

  async findMySetor(nasabahId: string, bulan?: string) {
    const range = parseBulanFilter(bulan);

    const list = await this.prisma.setorSampah.findMany({
      where: {
        idNasabah: nasabahId,
        ...(range ? { tanggal: { gte: range.gte, lt: range.lt } } : {}),
      },
      include: {
        detailSetor: {
          include: { kategoriSampah: { select: { namaKategori: true, jenis: true } } },
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    return {
      message: 'Histori pengajuan penyetoran sampah berhasil diambil',
      data: list,
    };
  }

  async findAllForAdmin(status?: string, bulan?: string) {
    const range = parseBulanFilter(bulan);

    const list = await this.prisma.setorSampah.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(range ? { tanggal: { gte: range.gte, lt: range.lt } } : {}),
      },
      include: {
        nasabah: { select: { namaNasabah: true, telp: true } },
      },
      orderBy: { tanggal: 'desc' },
    });

    return {
      message: 'Seluruh data pengajuan penyetoran sampah berhasil diambil',
      data: list,
    };
  }

  async findOne(id: string, currentUser: any) {
    const setor = await this.prisma.setorSampah.findUnique({
      where: { id },
      include: {
        nasabah: { select: { namaNasabah: true, alamat: true, telp: true } },
        detailSetor: {
          include: { kategoriSampah: { select: { namaKategori: true, jenis: true, poinPerKg: true } } },
        },
      },
    });

    if (!setor) {
      throw new NotFoundException('Detail transaksi penyetoran sampah tidak ditemukan.');
    }

    // Nasabah cuma boleh lihat struk miliknya sendiri; Admin boleh lihat semua.
    if (currentUser.role === 'NASABAH' && setor.idNasabah !== currentUser.nasabah?.id) {
      throw new ForbiddenException('Anda tidak memiliki akses ke transaksi ini.');
    }

    return {
      message: 'Detail transaksi penyetoran sampah berhasil diambil',
      data: {
        id: setor.id,
        kodeSetor: setor.kodeSetor,
        tanggal: setor.tanggal,
        status: setor.status,
        nasabah: setor.nasabah,
        totalBeratKg: setor.totalBeratKg,
        totalPoin: setor.totalPoin,
        catatanAdmin: setor.catatanAdmin,
        detailSetors: setor.detailSetor.map((d) => ({
          kategori: d.kategoriSampah.namaKategori,
          jenis: d.kategoriSampah.jenis,
          beratKg: d.beratKgReal ?? d.beratKg,
          poinPerKg: d.kategoriSampah.poinPerKg,
          subtotalPoin: d.subtotalPoin,
        })),
      },
    };
  }

  async verify(id: string, adminId: string, dto: VerifySetorSampahDto) {
    const setor = await this.prisma.setorSampah.findUnique({
      where: { id },
      include: { detailSetor: { include: { kategoriSampah: true } } },
    });

    if (!setor) {
      throw new NotFoundException('Data pengajuan penyetoran sampah tidak ditemukan.');
    }

    const wasAlreadySelesai = setor.status === 'selesai';
    const isNowSelesai = dto.status === 'selesai';

    let totalBeratKg = setor.totalBeratKg;
    let totalPoin = setor.totalPoin;
    const detailUpdates: { id: string; beratKgReal: number; subtotalPoin: number }[] = [];

    if (dto.itemsReal && dto.itemsReal.length > 0) {
      const realMap = new Map(dto.itemsReal.map((i) => [i.kategoriSampahId, i.beratKgReal]));

      totalBeratKg = 0;
      totalPoin = 0;

      for (const detail of setor.detailSetor) {
        const beratKgReal = realMap.get(detail.idKategoriSampah) ?? detail.beratKg;
        const subtotalPoin = Math.round(beratKgReal * detail.kategoriSampah.poinPerKg);

        totalBeratKg += beratKgReal;
        totalPoin += subtotalPoin;

        detailUpdates.push({ id: detail.id, beratKgReal, subtotalPoin });
      }
    }

    const [updatedSetor] = await this.prisma.$transaction([
      this.prisma.setorSampah.update({
        where: { id: setor.id },
        data: {
          status: dto.status,
          catatanAdmin: dto.catatanAdmin,
          idAdmin: adminId,
          totalBeratKg,
          totalPoin,
        },
      }),
      ...detailUpdates.map((d) =>
        this.prisma.detailSetor.update({
          where: { id: d.id },
          data: { beratKgReal: d.beratKgReal, subtotalPoin: d.subtotalPoin },
        }),
      ),
      ...(isNowSelesai && !wasAlreadySelesai
        ? [
            this.prisma.nasabah.update({
              where: { id: setor.idNasabah },
              data: { saldoPoin: { increment: totalPoin } },
            }),
          ]
        : []),
    ]);

    return {
      message: 'Verifikasi penyetoran sampah berhasil disimpan dan poin nasabah telah diperbarui',
      data: {
        id: updatedSetor.id,
        status: updatedSetor.status,
        totalPoin: updatedSetor.totalPoin,
        catatanAdmin: updatedSetor.catatanAdmin,
      },
    };
  }
}