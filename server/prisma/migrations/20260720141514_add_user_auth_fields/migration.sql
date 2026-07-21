/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,providerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `provider` ENUM('LOCAL', 'GOOGLE', 'FACEBOOK', 'INSTAGRAM') NOT NULL DEFAULT 'LOCAL',
    ADD COLUMN `providerId` VARCHAR(255) NULL,
    ADD COLUMN `username` VARCHAR(100) NULL,
    MODIFY `email` VARCHAR(150) NULL,
    MODIFY `password` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `users_provider_providerId_key` ON `users`(`provider`, `providerId`);
