/*
  Warnings:

  - You are about to drop the `Identity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Identity" DROP CONSTRAINT "Identity_userId_fkey";

-- DropTable
DROP TABLE "Identity";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Provider";
