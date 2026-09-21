import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed (Testing)')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  // POST /api/v1/seed - Publik, tanpa auth (khusus testing/development)
  @ApiOperation({ summary: 'Generate Sample Dummy Data Lengkap untuk Pengujian Frontend' })
  @Post()
  seed() {
    return this.seedService.seed();
  }
}