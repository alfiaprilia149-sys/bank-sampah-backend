import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterNasabahDto {
  @ApiProperty({ example: 'nasabah_budi', description: 'Username unik untuk login nasabah' })
  @IsString()
  @IsNotEmpty({ message: 'Username wajib diisi.' })
  username!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  password!: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty({ message: 'Nama nasabah wajib diisi.' })
  namaNasabah!: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 10' })
  @IsString()
  @IsNotEmpty({ message: 'Alamat wajib diisi.' })
  alamat!: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi.' })
  telp!: string;
}