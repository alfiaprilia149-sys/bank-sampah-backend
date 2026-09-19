import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  /**
   * Bangun URL publik dari file yang barusan diupload Multer.
   * File di-serve statis dari folder /uploads (lihat main.ts).
   */
  buildFileUrl(req: any, file?: Express.Multer.File): string | null {
    if (!file) return null;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${file.filename}`;
  }

  /**
   * Fallback avatar otomatis (inisial nama) kalau nasabah/admin
   * tidak upload foto. Dipakai supaya field `foto` di response
   * tetap selalu terisi (konsisten dengan contoh di Kontrak API),
   * tanpa mengarang data.
   */
  buildDefaultAvatar(name: string): string {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=16a34a&color=fff`;
  }
}