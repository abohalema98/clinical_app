/*
  Warnings:

  - Added the required column `created_at` to the `clinical_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clinical_data` ADD COLUMN `created_at` DATETIME(3) NOT NULL;
