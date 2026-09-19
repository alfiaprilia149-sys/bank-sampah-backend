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
import { KategoriSampahService } from './kategori-sampah.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { multerConfig } from '../../config/multer.config';

@ApiTags('Kategori Sampah')
@Controller('kategori-sampah')
export class KategoriSampahController {
  constructor(private readonly kategoriSampahService: KategoriSampahService) {}

  // GET /api/v1/kategori-sampah - Publik (Nasabah & Admin, tanpa perlu login)
  @ApiOperation({ summary: 'Daftar Kategori Sampah, Harga/Kg & Poin/Kg' })
  @Get()
  findAll() {
    return this.kategoriSampahService.findAll();
  }

  // POST /api/v1/kategori-sampah - Khusus Admin
  @ApiOperation({ summary: 'Menambah Kategori Sampah Baru (Upload Foto)' })
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaKategori: { type: 'string', example: 'Tembaga Super' },
        hargaPerKg: { type: 'number', example: 75000 },
        poinPerKg: { type: 'number', example: 150 },
        jenis: { type: 'string', enum: ['plastik', 'kertas', 'logam', 'kaca'] },
        foto: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('foto', multerConfig))
  create(
    @Body() dto: CreateKategoriSampahDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.create(dto, req, file);
  }

  // GET /api/v1/kategori-sampah/:id - Publik
  @ApiOperation({ summary: 'Get Detail Kategori Sampah' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kategoriSampahService.findOne(id);
  }

  // PUT /api/v1/kategori-sampah/:id - Khusus Admin
  @ApiOperation({ summary: 'Update Kategori Sampah (Upload Foto)' })
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaKategori: { type: 'string', example: 'Botol Plastik PET Bersih & Kering' },
        hargaPerKg: { type: 'number', example: 4000 },
        poinPerKg: { type: 'number', example: 12 },
        jenis: { type: 'string', enum: ['plastik', 'kertas', 'logam', 'kaca'] },
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
    @Body() dto: UpdateKategoriSampahDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.update(id, dto, req, file);
  }

  // DELETE /api/v1/kategori-sampah/:id - Khusus Admin
  @ApiOperation({ summary: 'Menghapus Kategori Sampah' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kategoriSampahService.remove(id);
  }
}