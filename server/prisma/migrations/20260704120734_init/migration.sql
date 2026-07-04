-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `avatarUrl` VARCHAR(255) NULL,
    `role` ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `districts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `districts_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cafes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `description` TEXT NULL,
    `address` TEXT NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `openTime` VARCHAR(20) NOT NULL,
    `closeTime` VARCHAR(20) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `facebookUrl` VARCHAR(255) NULL,
    `instagramUrl` VARCHAR(255) NULL,
    `websiteUrl` VARCHAR(255) NULL,
    `coverImageUrl` VARCHAR(255) NULL,
    `priceMin` INTEGER NULL,
    `priceMax` INTEGER NULL,
    `averageRating` DOUBLE NOT NULL DEFAULT 0,
    `totalReviews` INTEGER NOT NULL DEFAULT 0,
    `totalViews` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `districtId` INTEGER NOT NULL,

    UNIQUE INDEX `cafes_slug_key`(`slug`),
    INDEX `cafes_categoryId_idx`(`categoryId`),
    INDEX `cafes_districtId_idx`(`districtId`),
    INDEX `cafes_latitude_longitude_idx`(`latitude`, `longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cafe_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cafeId` INTEGER NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `caption` VARCHAR(255) NULL,
    `isCover` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cafe_images_cafeId_idx`(`cafeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `photo_spots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cafeId` INTEGER NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(255) NULL,
    `bestTime` VARCHAR(100) NULL,
    `cameraAngle` VARCHAR(150) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `photo_spots_cafeId_idx`(`cafeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `cafeId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(150) NULL,
    `comment` TEXT NULL,
    `imageUrl` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reviews_cafeId_idx`(`cafeId`),
    UNIQUE INDEX `reviews_userId_cafeId_key`(`userId`, `cafeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `cafeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favorites_cafeId_idx`(`cafeId`),
    UNIQUE INDEX `favorites_userId_cafeId_key`(`userId`, `cafeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('STYLE', 'COLOR', 'VIEW', 'TIME', 'FEATURE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tags_name_type_key`(`name`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cafe_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cafeId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    INDEX `cafe_tags_tagId_idx`(`tagId`),
    UNIQUE INDEX `cafe_tags_cafeId_tagId_key`(`cafeId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visit_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `cafeId` INTEGER NOT NULL,
    `ipAddress` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `visit_history_userId_idx`(`userId`),
    INDEX `visit_history_cafeId_idx`(`cafeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cafes` ADD CONSTRAINT `cafes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cafes` ADD CONSTRAINT `cafes_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `districts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cafe_images` ADD CONSTRAINT `cafe_images_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `cafes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `photo_spots` ADD CONSTRAINT `photo_spots_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `cafes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `cafes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `cafes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cafe_tags` ADD CONSTRAINT `cafe_tags_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `cafes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cafe_tags` ADD CONSTRAINT `cafe_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visit_history` ADD CONSTRAINT `visit_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visit_history` ADD CONSTRAINT `visit_history_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `cafes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
