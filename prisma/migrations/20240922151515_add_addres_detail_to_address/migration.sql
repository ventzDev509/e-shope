/*
  Warnings:

  - Added the required column `addressDetails` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `address` ADD COLUMN `addressDetails` VARCHAR(191) NOT NULL;
