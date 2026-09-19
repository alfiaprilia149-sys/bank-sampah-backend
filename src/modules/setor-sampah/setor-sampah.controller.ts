import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SetorSampahService } from './setor-sampah.service';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Setor Sampah')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('setor-sampah')
export class SetorSampahController {
  constructor(private readonly setorSampahService: SetorSampahService) {}

  // POST /api/v1/setor-sampah/pengajuan - Khusus Nasabah
  @ApiOperation({ summary: 'Mengajukan Penyetoran Sampah (Multi-Item & Estimasi)' })
  @Roles('NASABAH')
  @Post('pengajuan')
  createPengajuan(@CurrentUser() user: any, @Body() dto: CreateSetorSampahDto) {
    return this.setorSampahService.createPengajuan(user.nasabah.id, dto);
  }

  // GET /api/v1/setor-sampah/my-setor - Khusus Nasabah
  @ApiOperation({ summary: 'Histori & Status Penyetoran Sendiri (Filter ?bulan)' })
  @ApiQuery({ name: 'bulan', required: false, example: '2026-08' })
  @Roles('NASABAH')
  @Get('my-setor')
  findMySetor(@CurrentUser() user: any, @Query('bulan') bulan?: string) {
    return this.setorSampahService.findMySetor(user.nasabah.id, bulan);
  }

  // GET /api/v1/setor-sampah/admin/list - Khusus Admin
  @ApiOperation({ summary: 'Seluruh Pengajuan Penyetoran Sampah (Filter ?status & ?bulan)' })
  @ApiQuery({ name: 'status', required: false, enum: ['menunggu_konfirmasi', 'diverifikasi', 'selesai', 'ditolak'] })
  @ApiQuery({ name: 'bulan', required: false, example: '2026-08' })
  @Roles('ADMIN')
  @Get('admin/list')
  findAllForAdmin(@Query('status') status?: string, @Query('bulan') bulan?: string) {
    return this.setorSampahService.findAllForAdmin(status, bulan);
  }

  // GET /api/v1/setor-sampah/:id - Nasabah & Admin
  @ApiOperation({ summary: 'Detail Transaksi / Struk Nota Penyetoran Sampah' })
  @Roles('NASABAH', 'ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.setorSampahService.findOne(id, user);
  }

  // PUT /api/v1/setor-sampah/admin/verify/:id - Khusus Admin
  @ApiOperation({ summary: 'Verifikasi Penimbangan Real Sampah & Perubahan Status' })
  @Roles('ADMIN')
  @Put('admin/verify/:id')
  verify(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: VerifySetorSampahDto) {
    return this.setorSampahService.verify(id, user.adminBank.id, dto);
  }
}