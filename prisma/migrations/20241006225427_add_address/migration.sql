/*
  Warnings:

  - Added the required column `addressId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `addressId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `adress` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `telephone` VARCHAR(191) NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `Address`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
