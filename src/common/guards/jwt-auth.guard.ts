import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard KEDUA (setelah AppKeyGuard). Memvalidasi
 * `Authorization: Bearer <token>` untuk endpoint yang butuh
 * login Nasabah maupun Admin Bank.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-user') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa.');
    }
    return user;
  }
}
