import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiProperty({ example: 'Bank Sampah Asri Jaya' })
  @IsString()
  @IsNotEmpty({ message: 'Nama unit wajib diisi.' })
  namaUnit!: string;

  @ApiProperty({ example: 'Bapak H. Sukirman' })
  @IsString()
  @IsNotEmpty({ message: 'Nama pengelola wajib diisi.' })
  namaPengelola!: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi.' })
  telp!: string;
}