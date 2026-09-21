import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // GET /api/v1/dashboard/summary - Khusus Nasabah
  @ApiOperation({ summary: 'Summary Saldo, Pemasukan, Pengeluaran & Transaksi Terakhir' })
  @Roles('NASABAH')
  @Get('summary')
  summary(@CurrentUser() user: any) {
    return this.dashboardService.summary(user.nasabah.id);
  }

  // GET /api/v1/dashboard/stats - Khusus Admin
  @ApiOperation({ summary: 'Statistik Umum (Total Nasabah, Saldo, Sampah, Transaksi)' })
  @Roles('ADMIN')
  @Get('stats')
  stats() {
    return this.dashboardService.stats();
  }
}