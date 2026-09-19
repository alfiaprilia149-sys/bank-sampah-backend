import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin - Profile')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/profile')
export class AdminProfileController {
  constructor(private readonly authService: AuthService) {}

  // PUT /api/v1/admin/profile - Khusus Admin
  @ApiOperation({ summary: 'Update Data Profil Unit Bank Sampah (endpoint tambahan, lihat catatan)' })
  @Put()
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateAdminProfileDto) {
    return this.authService.updateAdminProfile(user.id, dto);
  }
}