import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  buildFileUrl(req: any, file?: Express.Multer.File): string | null {
    if (!file) return null;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${file.filename}`;
  }

  buildDefaultAvatar(name: string): string {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=16a34a&color=fff`;
  }
}