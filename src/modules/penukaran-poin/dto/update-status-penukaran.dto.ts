import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateStatusPenukaranDto {
  @ApiProperty({ enum: ['diproses', 'selesai'], example: 'selesai' })
  @IsIn(['diproses', 'selesai'], { message: "Status harus salah satu: 'diproses', 'selesai'." })
  status!: 'diproses' | 'selesai';
}