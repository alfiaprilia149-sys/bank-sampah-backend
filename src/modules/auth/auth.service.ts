import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { RegisterNasabahDto } from './dto/register-nasabah.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private uploadService: UploadService,
  ) {}

  /** Cek username sudah dipakai atau belum (unik secara global). */
  private async ensureUsernameAvailable(username: string) {
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan.');
    }
  }

  async registerNasabah(dto: RegisterNasabahDto, req: any, file?: Express.Multer.File) {
    await this.ensureUsernameAvailable(dto.username);

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
      message: 'Registrasi nasabah berhasil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        nasabah: user.nasabah,
      },
    };
  }

  async registerAdmin(dto: RegisterAdminDto) {
    await this.ensureUsernameAvailable(dto.username);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'ADMIN',
        adminBank: {
          create: {
            namaUnit: dto.namaUnit,
            namaPengelola: dto.namaPengelola,
            telp: dto.telp,
          },
        },
      },
      include: { adminBank: true },
    });

    return {
      message: 'Pendaftaran unit Bank Sampah berhasil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        adminBank: user.adminBank,
      },
    };
  }

  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: { nasabah: true, adminBank: true },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau password salah.');
    }

    const token = this.jwt.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      message: `Login ${user.role} berhasil`,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        nasabah: user.nasabah ?? null,
        adminBank: user.adminBank ?? null,
        token,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { nasabah: true, adminBank: true },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan.');
    }

    return {
      message: 'Data profile user berhasil diambil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        nasabah: user.nasabah ?? null,
        adminBank: user.adminBank ?? null,
      },
    };
  }

  /**
   * Endpoint tambahan (tidak tercantum di tabel 37 endpoint Kontrak
   * API, tapi wajib ada untuk memenuhi fitur Admin poin #3:
   * "Admin dapat update data profil unit bank sampah").
   */
  async updateAdminProfile(userId: string, dto: UpdateAdminProfileDto) {
    const adminBank = await this.prisma.adminBank.findUnique({ where: { userId } });

    if (!adminBank) {
      throw new NotFoundException('Profil unit bank sampah tidak ditemukan.');
    }

    const updated = await this.prisma.adminBank.update({
      where: { id: adminBank.id },
      data: {
        namaUnit: dto.namaUnit,
        namaPengelola: dto.namaPengelola,
        telp: dto.telp,
      },
    });

    return {
      message: 'Profil unit bank sampah berhasil diperbarui',
      data: updated,
    };
  }
}