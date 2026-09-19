import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

// Sama seperti UpdateKategoriSampahDto, semua field di sini tetap
// "Wajib" sesuai PDF, jadi dibuat terpisah (bukan PartialType).
export class UpdateHadiahDto {
  @ApiProperty({ example: 'Minyak Goreng Premium 1L' })
  @IsString()
  @IsNotEmpty({ message: 'Nama hadiah wajib diisi.' })
  namaHadiah!: string;

  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsInt({ message: 'poinDibutuhkan harus berupa bilangan bulat.' })
  @IsPositive({ message: 'poinDibutuhkan harus lebih dari 0.' })
  poinDibutuhkan!: number;

  @ApiProperty({ example: 45 })
  @Type(() => Number)
  @IsInt({ message: 'stok harus berupa bilangan bulat.' })
  @Min(0, { message: 'stok tidak boleh negatif.' })
  stok!: number;
}