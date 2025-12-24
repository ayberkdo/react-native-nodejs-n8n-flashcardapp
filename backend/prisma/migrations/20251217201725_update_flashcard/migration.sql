-- CreateTable
CREATE TABLE `flashcards` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `words` JSON NOT NULL,
    `languageId` INTEGER NOT NULL,
    `lastStudiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `flashcards` ADD CONSTRAINT `flashcards_languageId_fkey` FOREIGN KEY (`languageId`) REFERENCES `languages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
