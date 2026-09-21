import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';
import { generateKodePenukaran } from '../../common/utils/generate-code.util';
import { parseBulanFilter } from '../../common/utils/date-filter.util';

@Injectable()
export class PenukaranPoinService {
  constructor(private prisma: PrismaService) {}

  async tukar(nasabahId: string, dto: CreatePenukaranPoinDto) {
    const [nasabah, hadiah] = await Promise.all([
      this.prisma.nasabah.findUnique({ where: { id: nasabahId } }),
      this.prisma.hadiah.findUnique({ where: { id: dto.hadiahId } }),
    ]);

    if (!hadiah) {
      throw new NotFoundException('Data hadiah tidak ditemukan.');
    }
    if (!nasabah) {
      throw new NotFoundException('Data nasabah tidak ditemukan.');
    }

    if (nasabah.saldoPoin < hadiah.poinDibutuhkan) {
      throw new BadRequestException(
        `Saldo poin Anda (${nasabah.saldoPoin} poin) tidak mencukupi untuk menukar hadiah ini (${hadiah.poinDibutuhkan} poin).`,
      );
    }

    if (hadiah.stok <= 0) {
      throw new BadRequestException('Stok hadiah ini sudah habis.');
    }

    const kodePenukaran = generateKodePenukaran();
    const sisaSaldoPoin = nasabah.saldoPoin - hadiah.poinDibutuhkan;
    const [penukaran] = await this.prisma.$transaction([
      this.prisma.penukaranPoin.create({
        data: {
          kodePenukaran,
          idNasabah: nasabahId,
          idHadiah: dto.hadiahId,
          poinTerpakai: hadiah.poinDibutuhkan,
          status: 'diproses',
        },
        include: { hadiah: { select: { namaHadiah: true } } },
      }),
      this.prisma.nasabah.update({
        where: { id: nasabahId },
        data: { saldoPoin: { decrement: hadiah.poinDibutuhkan } },
      }),
      this.prisma.hadiah.update({
        where: { id: dto.hadiahId },
        data: { stok: { decrement: 1 } },
      }),
    ]);

    return {
      message: 'Penukaran poin berhasil diajukan',
      data: {
        id: penukaran.id,
        kodePenukaran: penukaran.kodePenukaran,
        tanggal: penukaran.tanggal,
        hadiahId: penukaran.idHadiah,
        poinTerpakai: penukaran.poinTerpakai,
        sisaSaldoPoin,
        status: penukaran.status,
        hadiah: penukaran.hadiah,
      },
    };
  }

  async findMyPenukaran(nasabahId: string) {
    const list = await this.prisma.penukaranPoin.findMany({
      where: { idNasabah: nasabahId },
      include: {
        hadiah: { select: { namaHadiah: true, poinDibutuhkan: true, foto: true } },
      },
      orderBy: { tanggal: 'desc' },
    });

    return {
      message: 'Histori penukaran poin nasabah berhasil diambil',
      data: list,
    };
  }

  async findAllForAdmin(bulan?: string) {
    const range = parseBulanFilter(bulan);

    const list = await this.prisma.penukaranPoin.findMany({
      where: {
        ...(range ? { tanggal: { gte: range.gte, lt: range.lt } } : {}),
      },
      include: {
        nasabah: { select: { namaNasabah: true, telp: true } },
        hadiah: { select: { namaHadiah: true } },
      },
      orderBy: { tanggal: 'desc' },
    });

    return {
      message: 'Seluruh data transaksi penukaran poin berhasil diambil',
      data: list,
    };
  }

  async updateStatus(id: string, dto: UpdateStatusPenukaranDto) {
    const penukaran = await this.prisma.penukaranPoin.findUnique({ where: { id } });

    if (!penukaran) {
      throw new NotFoundException('Transaksi penukaran poin tidak ditemukan.');
    }

    const updated = await this.prisma.penukaranPoin.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      message: 'Status transaksi penukaran poin berhasil diperbarui',
      data: { id: updated.id, status: updated.status },
    };
  }

  async findNota(id: string, currentUser: any) {
    const penukaran = await this.prisma.penukaranPoin.findUnique({
      where: { id },
      include: {
        nasabah: { select: { id: true, namaNasabah: true, telp: true } },
        hadiah: { select: { namaHadiah: true, poinDibutuhkan: true } },
      },
    });

    if (!penukaran) {
      throw new NotFoundException('Struk nota penukaran poin tidak ditemukan.');
    }

    if (currentUser.role === 'NASABAH' && penukaran.idNasabah !== currentUser.nasabah?.id) {
      throw new ForbiddenException('Anda tidak memiliki akses ke transaksi ini.');
    }

    return {
      message: 'Struk nota penukaran poin berhasil diambil',
      data: {
        id: penukaran.id,
        kodePenukaran: penukaran.kodePenukaran,
        tanggal: penukaran.tanggal,
        nasabah: { namaNasabah: penukaran.nasabah.namaNasabah, telp: penukaran.nasabah.telp },
        hadiah: penukaran.hadiah,
        poinTerpakai: penukaran.poinTerpakai,
        status: penukaran.status,
      },
    };
  }
}