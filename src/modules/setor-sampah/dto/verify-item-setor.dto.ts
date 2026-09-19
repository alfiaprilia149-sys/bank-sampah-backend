import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyItemSetorDto {
  @ApiProperty({ example: 'eacfc2cf-2dc6-40c3-96fe-d55806f96b50' })
  @IsUUID('4', { message: 'kategoriSampahId harus berupa UUID yang valid.' })
  @IsNotEmpty({ message: 'kategoriSampahId wajib diisi.' })
  kategoriSampahId!: string;

  @ApiProperty({ example: 3.0, description: 'Berat timbangan aktual petugas di lapangan (Kg)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'beratKgReal harus berupa angka.' })
  @IsPositive({ message: 'beratKgReal harus lebih dari 0.' })
  beratKgReal!: number;
}