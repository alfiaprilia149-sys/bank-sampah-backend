import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AdminProfileController } from './admin-profile.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConfigFactory } from '../../config/jwt.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfigFactory,
    }),
  ],
  controllers: [AuthController, AdminProfileController],
  // JwtStrategy didaftarkan di sini (bukan di maker) karena inilah
  // modul yang benar-benar memakainya untuk validasi Bearer token
  // Nasabah & Admin. JwtAuthGuard di endpoint modul LAIN (nasabah,
  // setor-sampah, dst nanti) tetap bisa pakai strategy 'jwt-user' ini
  // selama AuthModule sudah di-import di AppModule.
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}