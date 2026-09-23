/*
  Warnings:

  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "password" TEXT NOT NULL DEFAULT '$2b$10$defaultpasswordhash';

-- Update existing users with a default password (change on first login)
UPDATE "Usuario" SET "password" = '$2b$10$defaultpasswordhash' WHERE "password" = '$2b$10$defaultpasswordhash';