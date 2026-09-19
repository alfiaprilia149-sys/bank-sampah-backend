import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // userId
  username: string;
  role: 'ADMIN' | 'NASABAH';
}

/**
 * Strategy ini memvalidasi Bearer token milik Nasabah & Admin Bank.
 * Didaftarkan sebagai provider di AuthModule, tapi dipakai lintas
 * modul lain lewat JwtAuthGuard (src/common/guards/jwt-auth.guard.ts)
 * yang mereferensikan nama strategy 'jwt-user' -- modul manapun
 * tinggal @UseGuards(JwtAuthGuard) tanpa perlu import class ini
 * secara langsung.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { nasabah: true, adminBank: true },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan.');
    }

    // Ini yang akan tersedia di request.user (dipakai @CurrentUser())
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      nasabah: user.nasabah,
      adminBank: user.adminBank,
    };
  }
}