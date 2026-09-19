import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class CreateHadiahDto {
  @ApiProperty({ example: 'Minyak Goreng 1 Liter' })
  @IsString()
  @IsNotEmpty({ message: 'Nama hadiah wajib diisi.' })
  namaHadiah!: string;

  @ApiProperty({ example: 100, description: 'Poin yang harus ditukarkan nasabah' })
  @Type(() => Number)
  @IsInt({ message: 'poinDibutuhkan harus berupa bilangan bulat.' })
  @IsPositive({ message: 'poinDibutuhkan harus lebih dari 0.' })
  poinDibutuhkan!: number;

  @ApiProperty({ example: 50, description: 'Jumlah ketersediaan stok hadiah' })
  @Type(() => Number)
  @IsInt({ message: 'stok harus berupa bilangan bulat.' })
  @Min(0, { message: 'stok tidak boleh negatif.' })
  stok!: number;
}