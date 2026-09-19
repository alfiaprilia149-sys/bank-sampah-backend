import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HadiahService } from './hadiah.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { multerConfig } from '../../config/multer.config';

@ApiTags('Hadiah')
@Controller('hadiah')
export class HadiahController {
  constructor(private readonly hadiahService: HadiahService) {}

  // GET /api/v1/hadiah - Publik (Nasabah & Admin)
  @ApiOperation({ summary: 'Get Katalog Barang / Voucher Hadiah' })
  @Get()
  findAll() {
    return this.hadiahService.findAll();
  }

  // POST /api/v1/hadiah - Khusus Admin
  @ApiOperation({ summary: 'Menambah Data Hadiah Baru (Upload Foto)' })
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaHadiah: { type: 'string', example: 'Gula Pasir 1 Kg' },
        poinDibutuhkan: { type: 'number', example: 60 },
        stok: { type: 'number', example: 30 },
        foto: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('foto', multerConfig))
  create(
    @Body() dto: CreateHadiahDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.hadiahService.create(dto, req, file);
  }

  // GET /api/v1/hadiah/:id - Publik
  @ApiOperation({ summary: 'Get Detail Barang / Hadiah' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hadiahService.findOne(id);
  }

  // PUT /api/v1/hadiah/:id - Khusus Admin
  @ApiOperation({ summary: 'Update Data Hadiah (Upload Foto)' })
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaHadiah: { type: 'string', example: 'Voucher Pulsa / E-Wallet Rp 50.000' },
        poinDibutuhkan: { type: 'number', example: 140 },
        stok: { type: 'number', example: 40 },
        foto: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @UseInterceptors(FileInterceptor('foto', multerConfig))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHadiahDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.hadiahService.update(id, dto, req, file);
  }

  // DELETE /api/v1/hadiah/:id - Khusus Admin
  @ApiOperation({ summary: 'Menghapus Data Hadiah' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hadiahService.remove(id);
  }
}