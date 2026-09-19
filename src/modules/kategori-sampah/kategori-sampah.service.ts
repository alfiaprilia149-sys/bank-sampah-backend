import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';

@Injectable()
export class KategoriSampahService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  private async findKategoriOrThrow(id: string) {
    const kategori = await this.prisma.kategoriSampah.findUnique({ where: { id } });

    if (!kategori) {
      throw new NotFoundException('Kategori sampah tidak ditemukan.');
    }

    return kategori;
  }

  async findAll() {
    const list = await this.prisma.kategoriSampah.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return {
      message: 'Daftar kategori sampah daur ulang berhasil diambil',
      data: list,
    };
  }

  async create(dto: CreateKategoriSampahDto, req: any, file?: Express.Multer.File) {
    const foto = this.uploadService.buildFileUrl(req, file);

    const kategori = await this.prisma.kategoriSampah.create({
      data: {
        namaKategori: dto.namaKategori,
        hargaPerKg: dto.hargaPerKg,
        poinPerKg: dto.poinPerKg,
        jenis: dto.jenis,
        foto,
      },
    });

    return {
      message: 'Kategori sampah baru berhasil disimpan',
      data: kategori,
    };
  }

  async findOne(id: string) {
    const kategori = await this.findKategoriOrThrow(id);

    return {
      message: 'Detail kategori sampah berhasil diambil',
      data: kategori,
    };
  }

  async update(id: string, dto: UpdateKategoriSampahDto, req: any, file?: Express.Multer.File) {
    const kategori = await this.findKategoriOrThrow(id);
    const foto = this.uploadService.buildFileUrl(req, file);

    const updated = await this.prisma.kategoriSampah.update({
      where: { id: kategori.id },
      data: {
        namaKategori: dto.namaKategori,
        hargaPerKg: dto.hargaPerKg,
        poinPerKg: dto.poinPerKg,
        jenis: dto.jenis,
        ...(foto ? { foto } : {}),
      },
    });

    return {
      message: 'Kategori sampah berhasil diperbarui',
      data: updated,
    };
  }

  async remove(id: string) {
    const kategori = await this.findKategoriOrThrow(id);

    try {
      await this.prisma.kategoriSampah.delete({ where: { id: kategori.id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          'Kategori sampah tidak dapat dihapus karena sudah pernah dipakai dalam transaksi penyetoran.',
        );
      }
      throw error;
    }

    return {
      message: 'Kategori sampah berhasil dihapus',
      data: { id: kategori.id },
    };
  }
}