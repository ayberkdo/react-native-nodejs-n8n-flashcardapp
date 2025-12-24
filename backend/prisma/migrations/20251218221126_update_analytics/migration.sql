-- CreateTable
CREATE TABLE `word_analytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flashcardId` VARCHAR(191) NOT NULL,
    `wordKey` VARCHAR(255) NOT NULL,
    `correctCount` INTEGER NOT NULL DEFAULT 0,
    `wrongCount` INTEGER NOT NULL DEFAULT 0,
    `skippedCount` INTEGER NOT NULL DEFAULT 0,
    `difficultyLevel` DOUBLE NULL DEFAULT 0,
    `aiMnemonic` TEXT NULL,

    UNIQUE INDEX `word_analytics_flashcardId_wordKey_key`(`flashcardId`, `wordKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `study_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flashcardId` VARCHAR(191) NOT NULL,
    `knownCount` INTEGER NOT NULL,
    `unknownCount` INTEGER NOT NULL,
    `skippedCount` INTEGER NOT NULL,
    `aiFeedback` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `word_analytics` ADD CONSTRAINT `word_analytics_flashcardId_fkey` FOREIGN KEY (`flashcardId`) REFERENCES `flashcards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `study_sessions` ADD CONSTRAINT `study_sessions_flashcardId_fkey` FOREIGN KEY (`flashcardId`) REFERENCES `flashcards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
