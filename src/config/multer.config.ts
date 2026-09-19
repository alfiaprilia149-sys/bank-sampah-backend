import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

/**
 * Konfigurasi Multer dipakai bersama di semua endpoint yang
 * menerima upload foto (Nasabah, Kategori Sampah, Hadiah).
 * File disimpan ke folder /uploads dengan nama unik (UUID)
 * supaya tidak ada tabrakan nama antar siswa/tenant.
 */
export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // maksimal 5MB
  },
};