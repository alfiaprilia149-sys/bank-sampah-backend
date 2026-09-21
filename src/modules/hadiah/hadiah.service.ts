import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';

@Injectable()
export class HadiahService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  private async findHadiahOrThrow(id: string) {
    const hadiah = await this.prisma.hadiah.findUnique({ where: { id } });

    if (!hadiah) {
      throw new NotFoundException('Data hadiah tidak ditemukan.');
    }

    return hadiah;
  }

  async findAll() {
    const list = await this.prisma.hadiah.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return {
      message: 'Daftar barang/voucher hadiah berhasil diambil',
      data: list,
    };
  }

  async create(dto: CreateHadiahDto, req: any, file?: Express.Multer.File) {
    const foto = this.uploadService.buildFileUrl(req, file);

    const hadiah = await this.prisma.hadiah.create({
      data: {
        namaHadiah: dto.namaHadiah,
        poinDibutuhkan: dto.poinDibutuhkan,
        stok: dto.stok,
        foto,
      },
    });

    return {
      message: 'Hadiah baru berhasil ditambahkan',
      data: hadiah,
    };
  }

  async findOne(id: string) {
    const hadiah = await this.findHadiahOrThrow(id);

    return {
      message: 'Detail hadiah berhasil diambil',
      data: hadiah,
    };
  }

  async update(id: string, dto: UpdateHadiahDto, req: any, file?: Express.Multer.File) {
    const hadiah = await this.findHadiahOrThrow(id);
    const foto = this.uploadService.buildFileUrl(req, file);

    const updated = await this.prisma.hadiah.update({
      where: { id: hadiah.id },
      data: {
        namaHadiah: dto.namaHadiah,
        poinDibutuhkan: dto.poinDibutuhkan,
        stok: dto.stok,
        ...(foto ? { foto } : {}),
      },
    });

    return {
      message: 'Data hadiah berhasil diperbarui',
      data: updated,
    };
  }

  async remove(id: string) {
    const hadiah = await this.findHadiahOrThrow(id);

    try {
      await this.prisma.hadiah.delete({ where: { id: hadiah.id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          'Hadiah tidak dapat dihapus karena sudah pernah ditukar oleh nasabah.',
        );
      }
      throw error;
    }

    return {
      message: 'Hadiah berhasil dihapus',
      data: { id: hadiah.id },
    };
  }
}