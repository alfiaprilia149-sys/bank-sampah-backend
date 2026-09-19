import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Semua endpoint di Kontrak API diawali /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Serve folder /uploads sebagai file statis, contoh akses:
  // http://localhost:3000/uploads/<nama-file>.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // Validasi otomatis semua DTO (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // buang field yang tidak terdaftar di DTO
      forbidNonWhitelisted: false,
      transform: true, // auto-transform payload ke instance DTO/type
    }),
  );

  // Format response sukses & error yang seragam (sesuai spec)
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bank Sampah Digital & Daur Ulang API')
    .setDescription(
      'Dokumentasi RESTful API untuk UKK RPL 2026/2027 - Eco-Waste Management System. ' +
        'Endpoint yang butuh login Nasabah/Admin wajib Bearer token dari /auth/login.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer', // nama security scheme, dipakai di @ApiBearerAuth('bearer')
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Bank Sampah API running on http://localhost:${port}/api/v1`);
  console.log(`📄 Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();