/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `name` VARCHAR(100) NULL,
    MODIFY `role` VARCHAR(50) NULL;
