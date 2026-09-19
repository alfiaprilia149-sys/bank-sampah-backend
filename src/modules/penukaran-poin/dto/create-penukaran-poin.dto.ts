import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePenukaranPoinDto {
  @ApiProperty({ example: '8bd74595-8016-42b9-a585-a0e40d0fe42f', description: 'ID Hadiah yang ingin ditukarkan nasabah' })
  @IsUUID('4', { message: 'hadiahId harus berupa UUID yang valid.' })
  @IsNotEmpty({ message: 'hadiahId wajib diisi.' })
  hadiahId!: string;
}