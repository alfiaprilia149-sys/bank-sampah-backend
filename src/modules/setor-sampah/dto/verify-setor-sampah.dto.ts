import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VerifyItemSetorDto } from './verify-item-setor.dto';

// Catatan: status di verifikasi SENGAJA tidak termasuk
// 'menunggu_konfirmasi' -- admin cuma boleh MAJU-kan status,
// bukan mundurkan ke status awal, sesuai deskripsi field di PDF.
export class VerifySetorSampahDto {
  @ApiProperty({ enum: ['diverifikasi', 'ditolak', 'selesai'], example: 'selesai' })
  @IsIn(['diverifikasi', 'ditolak', 'selesai'], {
    message: "Status harus salah satu: 'diverifikasi', 'ditolak', 'selesai'.",
  })
  status!: 'diverifikasi' | 'ditolak' | 'selesai';

  @ApiProperty({ example: 'Berat sesuai timbangan', required: false })
  @IsOptional()
  @IsString()
  catatanAdmin?: string;

  @ApiProperty({ type: [VerifyItemSetorDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VerifyItemSetorDto)
  itemsReal?: VerifyItemSetorDto[];
}