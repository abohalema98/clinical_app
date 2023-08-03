/*
  Warnings:

  - You are about to drop the `clinical_data` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `clinical_data`;

-- CreateTable
CREATE TABLE `clinicaldata` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `status` VARCHAR(50) NULL,
    `files` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
