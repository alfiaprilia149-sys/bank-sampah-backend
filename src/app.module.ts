import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuthModule } from './modules/auth/auth.module';
import { NasabahModule } from './modules/nasabah/nasabah.module';
import { KategoriSampahModule } from './modules/kategori-sampah/kategori-sampah.module';
import { SetorSampahModule } from './modules/setor-sampah/setor-sampah.module';
import { HadiahModule } from './modules/hadiah/hadiah.module';
import { PenukaranPoinModule } from './modules/penukaran-poin/penukaran-poin.module';
import { RekapitulasiModule } from './modules/rekapitulasi/rekapitulasi.module';
import { SeedModule } from './modules/seed/seed.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

// NOTE: Module fitur lain (hadiah, penukaran-poin, rekapitulasi,
// dashboard, seed) akan di-import di sini satu per satu pada
// tahap berikutnya.

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UploadModule,
    AuthModule,
    NasabahModule,
    KategoriSampahModule,
    SetorSampahModule,
    HadiahModule,
    PenukaranPoinModule,
    RekapitulasiModule,
    SeedModule,
    DashboardModule,
  ],
})
export class AppModule {}