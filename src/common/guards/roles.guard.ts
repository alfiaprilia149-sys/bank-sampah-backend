import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from '../decorators/roles.decorator';

/**
 * Guard KETIGA (setelah AppKeyGuard & JwtAuthGuard). Mengecek
 * apakah `req.user.role` termasuk dalam daftar @Roles(...) yang
 * dipasang di controller/handler. Jika endpoint tidak memasang
 * @Roles() sama sekali, guard ini otomatis lolos (artinya semua
 * role yang sudah login boleh akses).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Akses ditolak. Endpoint ini khusus untuk role: ${requiredRoles.join(', ')}.`,
      );
    }

    return true;
  }
}
