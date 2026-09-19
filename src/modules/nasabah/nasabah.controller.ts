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
import { NasabahService } from './nasabah.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { multerConfig } from '../../config/multer.config';

@ApiTags('Admin - Nasabah')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/nasabah')
export class NasabahController {
  constructor(private readonly nasabahService: NasabahService) {}

  // GET /api/v1/admin/nasabah
  @ApiOperation({ summary: 'Mendapatkan Seluruh Data Nasabah Bank Sampah' })
  @Get()
  findAll() {
    return this.nasabahService.findAll();
  }

  // POST /api/v1/admin/nasabah
  @ApiOperation({ summary: 'Menambah Data Nasabah Baru (Upload Foto)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'nasabah_dewi' },
        password: { type: 'string', example: 'password123' },
        namaNasabah: { type: 'string', example: 'Dewi Lestari' },
        alamat: { type: 'string', example: 'Jl. Kenanga No. 5' },
        telp: { type: 'string', example: '081987654321' },
        foto: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('foto', multerConfig))
  create(
    @Body() dto: CreateNasabahDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.nasabahService.create(dto, req, file);
  }

  // GET /api/v1/admin/nasabah/:id
  @ApiOperation({ summary: 'Get Detail Data Nasabah Berdasarkan ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nasabahService.findOne(id);
  }

  // PUT /api/v1/admin/nasabah/:id
  @ApiOperation({ summary: 'Update Data Nasabah (Upload Foto)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaLengkap: { type: 'string', example: 'Ahmad Dahlan Putra' },
        noTelepon: { type: 'string', example: '081299998888' },
        alamat: { type: 'string', example: 'Jl. Sudirman No. 120' },
        tanggalLahir: { type: 'string', example: '2000-01-15' },
        foto: { type: 'string', format: 'binary' },
      },
    },
  })
  @Put(':id')
  @UseInterceptors(FileInterceptor('foto', multerConfig))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNasabahDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.nasabahService.update(id, dto, req, file);
  }

  // DELETE /api/v1/admin/nasabah/:id
  @ApiOperation({ summary: 'Menghapus Data Nasabah' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nasabahService.remove(id);
  }
}