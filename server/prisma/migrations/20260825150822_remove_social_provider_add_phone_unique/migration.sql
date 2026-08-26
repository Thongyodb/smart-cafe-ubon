/*
  Warnings:

  - The values [GOOGLE,FACEBOOK,INSTAGRAM] on the enum `users_provider` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `provider` ENUM('LOCAL') NOT NULL DEFAULT 'LOCAL';

-- CreateIndex
CREATE UNIQUE INDEX `users_phone_key` ON `users`(`phone`);
