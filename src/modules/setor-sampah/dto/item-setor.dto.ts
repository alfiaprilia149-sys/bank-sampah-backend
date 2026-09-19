import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemSetorDto {
  @ApiProperty({ example: 'eacfc2cf-2dc6-40c3-96fe-d55806f96b50' })
  @IsUUID('4', { message: 'kategoriSampahId harus berupa UUID yang valid.' })
  @IsNotEmpty({ message: 'kategoriSampahId wajib diisi.' })
  kategoriSampahId!: string;

  @ApiProperty({ example: 2.5, description: 'Estimasi berat sampah yang disetor (Kg)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'beratKg harus berupa angka.' })
  @IsPositive({ message: 'beratKg harus lebih dari 0.' })
  beratKg!: number;
}