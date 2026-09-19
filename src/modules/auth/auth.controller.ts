import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
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
import { AuthService } from './auth.service';
import { RegisterNasabahDto } from './dto/register-nasabah.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { multerConfig } from '../../config/multer.config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/v1/auth/nasabah/register - Publik
  @ApiOperation({ summary: 'Registrasi Akun Nasabah Bank Sampah Baru (Upload Foto)' })
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
  @Post('nasabah/register')
  @UseInterceptors(FileInterceptor('foto', multerConfig))
  registerNasabah(
    @Body() dto: RegisterNasabahDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.registerNasabah(dto, req, file);
  }

  // POST /api/v1/auth/admin/register - Publik
  @ApiOperation({ summary: 'Pendaftaran Unit Admin Bank Sampah Baru' })
  @Post('admin/register')
  registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  // POST /api/v1/auth/login - Publik
  @ApiOperation({ summary: 'Login Akun User (Nasabah maupun Admin Bank)' })
  @Post('login')
  @HttpCode(201)
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  // GET /api/v1/auth/me - Auth: Bearer token
  @ApiOperation({ summary: 'Cek Profil & Role User yang Sedang Login' })
  @ApiBearerAuth('bearer')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }
}