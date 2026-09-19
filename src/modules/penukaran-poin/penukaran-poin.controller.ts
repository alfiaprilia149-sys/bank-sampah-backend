import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PenukaranPoinService } from './penukaran-poin.service';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Penukaran Poin')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('penukaran-poin')
export class PenukaranPoinController {
  constructor(private readonly penukaranPoinService: PenukaranPoinService) {}

  // POST /api/v1/penukaran-poin/tukar - Khusus Nasabah
  @ApiOperation({ summary: 'Melakukan Penukaran Poin dengan Hadiah/Voucher' })
  @Roles('NASABAH')
  @Post('tukar')
  tukar(@CurrentUser() user: any, @Body() dto: CreatePenukaranPoinDto) {
    return this.penukaranPoinService.tukar(user.nasabah.id, dto);
  }

  // GET /api/v1/penukaran-poin/my-penukaran - Khusus Nasabah
  @ApiOperation({ summary: 'Histori Penukaran Poin Milik Sendiri' })
  @Roles('NASABAH')
  @Get('my-penukaran')
  findMyPenukaran(@CurrentUser() user: any) {
    return this.penukaranPoinService.findMyPenukaran(user.nasabah.id);
  }

  // GET /api/v1/penukaran-poin/admin/list - Khusus Admin
  @ApiOperation({ summary: 'Semua Transaksi Penukaran Poin Nasabah (Filter ?bulan)' })
  @ApiQuery({ name: 'bulan', required: false, example: '2026-08' })
  @Roles('ADMIN')
  @Get('admin/list')
  findAllForAdmin(@Query('bulan') bulan?: string) {
    return this.penukaranPoinService.findAllForAdmin(bulan);
  }

  // PUT /api/v1/penukaran-poin/admin/status/:id - Khusus Admin
  @ApiOperation({ summary: 'Update Status Penukaran Poin (diproses / selesai)' })
  @Roles('ADMIN')
  @Put('admin/status/:id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusPenukaranDto) {
    return this.penukaranPoinService.updateStatus(id, dto);
  }

  // GET /api/v1/penukaran-poin/nota/:id - Nasabah & Admin
  @ApiOperation({ summary: 'Detail Nota / Struk Bukti Transaksi Penukaran' })
  @Roles('NASABAH', 'ADMIN')
  @Get('nota/:id')
  findNota(@Param('id') id: string, @CurrentUser() user: any) {
    return this.penukaranPoinService.findNota(id, user);
  }
}