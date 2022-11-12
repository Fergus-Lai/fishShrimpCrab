/*
  Warnings:

  - The primary key for the `Table` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bets" DROP CONSTRAINT "Bets_tableID_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tableID_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Bets" ALTER COLUMN "tableID" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Table" DROP CONSTRAINT "Table_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Table_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Table_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "password",
ALTER COLUMN "tableID" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tableID_fkey" FOREIGN KEY ("tableID") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bets" ADD CONSTRAINT "Bets_tableID_fkey" FOREIGN KEY ("tableID") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
