import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({ example: 'admin_banksampah', description: 'Username unik akun admin pengelola' })
  @IsString()
  @IsNotEmpty({ message: 'Username wajib diisi.' })
  username!: string;

  @ApiProperty({ example: 'admin123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  password!: string;

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