import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

/**
 * Perhatian: nama field di sini SENGAJA beda dari CreateNasabahDto
 * (namaLengkap vs namaNasabah, noTelepon vs telp) karena memang
 * begitu adanya di Kontrak API PDF. Endpoint tetap 100% mengikuti
 * kontrak; pemetaan ke field schema Prisma yang konsisten
 * (namaNasabah, telp) dilakukan di NasabahService.
 */
export class UpdateNasabahDto {
  @ApiProperty({ example: 'Ahmad Dahlan Putra', description: 'Nama lengkap nasabah hasil perbaikan' })
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi.' })
  namaLengkap!: string;

  @ApiProperty({ example: '081299998888', description: 'Nomor telepon terbaru' })
  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi.' })
  noTelepon!: string;

  @ApiProperty({ example: 'Jl. Sudirman No. 120', description: 'Alamat nasabah terbaru' })
  @IsString()
  @IsNotEmpty({ message: 'Alamat wajib diisi.' })
  alamat!: string;

  @ApiProperty({ example: '2000-01-15', description: 'Tanggal lahir nasabah (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Format tanggal lahir harus YYYY-MM-DD.' })
  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi.' })
  tanggalLahir!: string;
}