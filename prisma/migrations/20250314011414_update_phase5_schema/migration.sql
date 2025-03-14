/*
  Warnings:

  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "priority" "Priority" DEFAULT 'LOW';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
