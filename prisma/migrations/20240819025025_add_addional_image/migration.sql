/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `productimage` table. All the data in the column will be lost.
  - Added the required column `imageUrls` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productimage` DROP COLUMN `imageUrl`,
    ADD COLUMN `imageUrls` VARCHAR(191) NOT NULL;
