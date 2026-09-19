import { ApiProperty } from '@nestjs/swagger';
import { JenisSampah } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKategoriSampahDto {
  @ApiProperty({ example: 'Botol Plastik PET' })
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi.' })
  namaKategori!: string;

  @ApiProperty({ example: 3500, description: 'Estimasi harga beli per kg (Rupiah)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Harga per kg harus berupa angka.' })
  @IsPositive({ message: 'Harga per kg harus lebih dari 0.' })
  hargaPerKg!: number;

  @ApiProperty({ example: 10, description: 'Konversi reward poin per kg sampah' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Poin per kg harus berupa angka.' })
  @IsPositive({ message: 'Poin per kg harus lebih dari 0.' })
  poinPerKg!: number;

  @ApiProperty({ enum: JenisSampah, example: JenisSampah.plastik })
  @IsEnum(JenisSampah, { message: 'Jenis harus salah satu: plastik, kertas, logam, kaca.' })
  jenis!: JenisSampah;
}