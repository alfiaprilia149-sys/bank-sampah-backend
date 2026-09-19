import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'nasabah_budi', description: 'Username akun Nasabah / Admin' })
  @IsString()
  @IsNotEmpty({ message: 'Username wajib diisi.' })
  username!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'Password wajib diisi.' })
  password!: string;
}