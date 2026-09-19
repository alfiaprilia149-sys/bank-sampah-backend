import { ApiProperty } from '@nestjs/swagger';
import { JenisSampah } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// Catatan: di Kontrak API, semua field UpdateKategoriSampahDto tetap
// berstatus "Wajib" (bukan partial update), jadi DTO ini dibuat
// terpisah dari CreateKategoriSampahDto (bukan PartialType) supaya
// validasi wajib-nya konsisten dengan PDF.
export class UpdateKategoriSampahDto {
  @ApiProperty({ example: 'Botol Plastik PET Bersih & Kering' })
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi.' })
  namaKategori!: string;

  @ApiProperty({ example: 4000 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Harga per kg harus berupa angka.' })
  @IsPositive({ message: 'Harga per kg harus lebih dari 0.' })
  hargaPerKg!: number;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Poin per kg harus berupa angka.' })
  @IsPositive({ message: 'Poin per kg harus lebih dari 0.' })
  poinPerKg!: number;

  @ApiProperty({ enum: JenisSampah, example: JenisSampah.plastik })
  @IsEnum(JenisSampah, { message: 'Jenis harus salah satu: plastik, kertas, logam, kaca.' })
  jenis!: JenisSampah;
}