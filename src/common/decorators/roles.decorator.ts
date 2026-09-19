import { SetMetadata } from '@nestjs/common';

export type AppRole = 'ADMIN' | 'NASABAH';

export const ROLES_KEY = 'roles';

/**
 * Pakai di controller: @Roles('ADMIN')
 * Harus dipasang BERSAMA @UseGuards(..., RolesGuard)
 */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
