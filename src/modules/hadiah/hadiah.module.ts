import { Module } from '@nestjs/common';
import { HadiahController } from './hadiah.controller';
import { HadiahService } from './hadiah.service';

@Module({
  controllers: [HadiahController],
  providers: [HadiahService],
  exports: [HadiahService], // dipakai nanti oleh PenukaranPoinModule utk cek stok & poin
})
export class HadiahModule {}