/*
  Warnings:

  - Added the required column `telephone` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `address` ADD COLUMN `telephone` VARCHAR(191) NOT NULL;
