import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  success: true;
  message: string;
  data: T;
}

/**
 * Setiap service HANYA perlu `return { message, data }`.
 * Interceptor ini yang membungkusnya jadi format baku sesuai
 * Kontrak API bagian "Struktur Baku Response JSON":
 * { statusCode, success: true, message, data }
 *
 * Jika service cuma return data mentah (tanpa {message,data}),
 * interceptor tetap fallback pakai message default.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        // Konvensi: service return { message: string, data: any }
        if (result && typeof result === 'object' && 'message' in result && 'data' in result) {
          return {
            statusCode,
            success: true,
            message: result.message,
            data: result.data,
          };
        }

        // Fallback jika service cuma return data langsung
        return {
          statusCode,
          success: true,
          message: 'Request berhasil diproses',
          data: result,
        };
      }),
    );
  }
}
