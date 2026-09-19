import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ItemSetorDto } from './item-setor.dto';

export class CreateSetorSampahDto {
  @ApiProperty({ example: '2026-08-26T10:00:00.000Z', description: 'Tanggal & waktu pengajuan setor (ISO 8601)' })
  @IsDateString({}, { message: 'Format tanggal harus ISO 8601.' })
  tanggal!: string;

  @ApiProperty({ example: 'Sampah sudah dipilah rapi dalam karung', required: false })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiProperty({ type: [ItemSetorDto], description: 'Daftar item sampah yang disetorkan' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Minimal 1 item sampah harus diajukan.' })
  @ValidateNested({ each: true })
  @Type(() => ItemSetorDto)
  items!: ItemSetorDto[];
}