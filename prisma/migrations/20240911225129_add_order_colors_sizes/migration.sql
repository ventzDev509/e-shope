/*
  Warnings:

  - Added the required column `colors` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizes` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `colors` VARCHAR(191) NOT NULL,
    ADD COLUMN `sizes` VARCHAR(191) NOT NULL;
