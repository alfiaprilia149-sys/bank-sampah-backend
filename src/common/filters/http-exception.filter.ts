import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server.';
    let errors: any = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        // class-validator biasanya taruh array pesan di `message`
        if (Array.isArray(resObj.message)) {
          message = 'Validasi input gagal.';
          errors = resObj.message;
        } else {
          message = resObj.message ?? message;
        }
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = unique constraint violation
      if (exception.code === 'P2002') {
        statusCode = HttpStatus.BAD_REQUEST;
        const target = (exception.meta?.target as string[])?.join(', ');
        message = `Data dengan ${target ?? 'field unik'} tersebut sudah digunakan.`;
      } else if (exception.code === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Data yang dicari tidak ditemukan.';
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Terjadi kesalahan pada operasi database.';
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
    }

    response.status(statusCode).json({
      statusCode,
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
