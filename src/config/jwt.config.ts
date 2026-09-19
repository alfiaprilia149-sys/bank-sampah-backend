import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

type JwtExpiresIn = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

/**
 * Factory konfigurasi JWT terpusat. Dipakai oleh SEMUA module yang
 * butuh JwtModule.registerAsync (saat ini: MakerModule & AuthModule)
 * supaya secret & expiresIn tidak ditulis ulang di banyak tempat.
 *
 * getOrThrow memastikan tipe hasilnya `string` murni (bukan
 * `string | undefined`), sekaligus langsung gagal saat startup
 * jika JWT_SECRET lupa diisi di .env.
 */
export const jwtConfigFactory = (config: ConfigService): JwtModuleOptions => ({
  secret: config.getOrThrow<string>('JWT_SECRET'),
  signOptions: {
    expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as JwtExpiresIn,
  },
});