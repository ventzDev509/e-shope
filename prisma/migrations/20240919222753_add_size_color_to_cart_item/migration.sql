/*
  Warnings:

  - Added the required column `colors` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizes` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cartitem` ADD COLUMN `colors` VARCHAR(191) NOT NULL,
    ADD COLUMN `sizes` VARCHAR(191) NOT NULL;
