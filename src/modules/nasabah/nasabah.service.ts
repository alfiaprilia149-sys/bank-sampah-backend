import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';

@Injectable()
export class NasabahService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  private async findNasabahOrThrow(id: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
      include: { user: { select: { username: true, role: true } } },
    });

    if (!nasabah) {
      throw new NotFoundException('Data nasabah tidak ditemukan.');
    }

    return nasabah;
  }

  async findAll() {
    const nasabahList = await this.prisma.nasabah.findMany({
      include: { user: { select: { username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Daftar nasabah berhasil diambil',
      data: nasabahList,
    };
  }

  async create(dto: CreateNasabahDto, req: any, file?: Express.Multer.File) {
    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const foto =
      this.uploadService.buildFileUrl(req, file) ??
      this.uploadService.buildDefaultAvatar(dto.namaNasabah);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: dto.namaNasabah,
            alamat: dto.alamat,
            telp: dto.telp,
            foto,
          },
        },
      },
      include: { nasabah: true },
    });

    return {
      message: 'Nasabah baru berhasil ditambahkan',
      data: {
        ...user.nasabah,
        user: { username: user.username, role: user.role },
      },
    };
  }

  async findOne(id: string) {
    const nasabah = await this.findNasabahOrThrow(id);

    return {
      message: 'Detail nasabah berhasil diambil',
      data: nasabah,
    };
  }

  async update(id: string, dto: UpdateNasabahDto, req: any, file?: Express.Multer.File) {
    const nasabah = await this.findNasabahOrThrow(id);
    const foto = this.uploadService.buildFileUrl(req, file);

    const updated = await this.prisma.nasabah.update({
      where: { id: nasabah.id },
      data: {
        // Mapping nama field DTO (kontrak PDF) -> field schema (konsisten)
        namaNasabah: dto.namaLengkap,
        telp: dto.noTelepon,
        alamat: dto.alamat,
        tanggalLahir: new Date(dto.tanggalLahir),
        ...(foto ? { foto } : {}),
      },
    });

    return {
      message: 'Data nasabah berhasil diperbarui',
      data: {
        id: updated.id,
        namaNasabah: updated.namaNasabah,
        alamat: updated.alamat,
        telp: updated.telp,
        saldoPoin: updated.saldoPoin,
      },
    };
  }

  async remove(id: string) {
    const nasabah = await this.findNasabahOrThrow(id);

    // Hapus lewat User (parent), bukan langsung Nasabah, supaya
    // konsisten dengan relasi 1:1 (onDelete: Cascade di schema).
    await this.prisma.user.delete({ where: { id: nasabah.userId } });

    return {
      message: 'Data nasabah berhasil dihapus',
      data: { id: nasabah.id },
    };
  }
}