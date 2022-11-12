/*
  Warnings:

  - You are about to alter the column `userName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(15)` to `VarChar(13)`.
  - Added the required column `icon` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "icon" TEXT NOT NULL,
ALTER COLUMN "userName" SET DATA TYPE VARCHAR(13);
