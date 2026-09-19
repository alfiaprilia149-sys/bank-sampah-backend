-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'NASABAH') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nasabah` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `namaNasabah` VARCHAR(191) NOT NULL,
    `alamat` TEXT NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `saldoPoin` INTEGER NOT NULL DEFAULT 0,
    `foto` VARCHAR(255) NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nasabah_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_bank` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `namaUnit` VARCHAR(191) NOT NULL,
    `namaPengelola` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_bank_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori_sampah` (
    `id` VARCHAR(191) NOT NULL,
    `namaKategori` VARCHAR(191) NOT NULL,
    `hargaPerKg` DOUBLE NOT NULL,
    `poinPerKg` DOUBLE NOT NULL,
    `jenis` ENUM('plastik', 'kertas', 'logam', 'kaca') NOT NULL,
    `foto` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setor_sampah` (
    `id` VARCHAR(191) NOT NULL,
    `kodeSetor` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `idNasabah` VARCHAR(191) NOT NULL,
    `idAdmin` VARCHAR(191) NULL,
    `status` ENUM('menunggu_konfirmasi', 'diverifikasi', 'ditolak', 'selesai') NOT NULL DEFAULT 'menunggu_konfirmasi',
    `totalBeratKg` DOUBLE NOT NULL DEFAULT 0,
    `totalPoin` INTEGER NOT NULL DEFAULT 0,
    `catatan` TEXT NULL,
    `catatanAdmin` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `setor_sampah_kodeSetor_key`(`kodeSetor`),
    INDEX `setor_sampah_idNasabah_idx`(`idNasabah`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_setor` (
    `id` VARCHAR(191) NOT NULL,
    `idSetor` VARCHAR(191) NOT NULL,
    `idKategoriSampah` VARCHAR(191) NOT NULL,
    `beratKg` DOUBLE NOT NULL,
    `beratKgReal` DOUBLE NULL,
    `subtotalPoin` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `detail_setor_idSetor_idx`(`idSetor`),
    INDEX `detail_setor_idKategoriSampah_idx`(`idKategoriSampah`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hadiah` (
    `id` VARCHAR(191) NOT NULL,
    `namaHadiah` VARCHAR(191) NOT NULL,
    `poinDibutuhkan` INTEGER NOT NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `foto` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penukaran_poin` (
    `id` VARCHAR(191) NOT NULL,
    `kodePenukaran` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `idNasabah` VARCHAR(191) NOT NULL,
    `idHadiah` VARCHAR(191) NOT NULL,
    `poinTerpakai` INTEGER NOT NULL,
    `status` ENUM('diproses', 'selesai') NOT NULL DEFAULT 'diproses',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `penukaran_poin_kodePenukaran_key`(`kodePenukaran`),
    INDEX `penukaran_poin_idNasabah_idx`(`idNasabah`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `nasabah` ADD CONSTRAINT `nasabah_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_bank` ADD CONSTRAINT `admin_bank_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `setor_sampah` ADD CONSTRAINT `setor_sampah_idNasabah_fkey` FOREIGN KEY (`idNasabah`) REFERENCES `nasabah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `setor_sampah` ADD CONSTRAINT `setor_sampah_idAdmin_fkey` FOREIGN KEY (`idAdmin`) REFERENCES `admin_bank`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_setor` ADD CONSTRAINT `detail_setor_idSetor_fkey` FOREIGN KEY (`idSetor`) REFERENCES `setor_sampah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_setor` ADD CONSTRAINT `detail_setor_idKategoriSampah_fkey` FOREIGN KEY (`idKategoriSampah`) REFERENCES `kategori_sampah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penukaran_poin` ADD CONSTRAINT `penukaran_poin_idNasabah_fkey` FOREIGN KEY (`idNasabah`) REFERENCES `nasabah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penukaran_poin` ADD CONSTRAINT `penukaran_poin_idHadiah_fkey` FOREIGN KEY (`idHadiah`) REFERENCES `hadiah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
