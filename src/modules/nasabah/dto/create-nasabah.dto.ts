import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateNasabahDto {
  @ApiProperty({ example: 'nasabah_dewi', description: 'Username unik login nasabah baru' })
  @IsString()
  @IsNotEmpty({ message: 'Username wajib diisi.' })
  username!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  password!: string;

  @ApiProperty({ example: 'Dewi Lestari' })
  @IsString()
  @IsNotEmpty({ message: 'Nama nasabah wajib diisi.' })
  namaNasabah!: string;

  @ApiProperty({ example: 'Jl. Kenanga No. 5' })
  @IsString()
  @IsNotEmpty({ message: 'Alamat wajib diisi.' })
  alamat!: string;

  @ApiProperty({ example: '081987654321' })
  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi.' })
  telp!: string;
}