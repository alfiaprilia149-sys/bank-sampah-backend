import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RekapitulasiService } from './rekapitulasi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Rekapitulasi')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('rekapitulasi')
export class RekapitulasiController {
  constructor(private readonly rekapitulasiService: RekapitulasiService) {}

  // GET /api/v1/rekapitulasi/bulanan?bulan=YYYY-MM - Khusus Admin
  @ApiOperation({ summary: 'Rekap Total Tonase Sampah & Estimasi Pembayaran (?bulan wajib)' })
  @ApiQuery({ name: 'bulan', required: true, example: '2026-08' })
  @Get('bulanan')
  getBulanan(@Query('bulan') bulan?: string) {
    return this.rekapitulasiService.getBulanan(bulan);
  }
}