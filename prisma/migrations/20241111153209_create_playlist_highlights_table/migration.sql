-- CreateTable
CREATE TABLE `playlist_highlights` (
    `id` VARCHAR(191) NOT NULL,
    `month_year` DATETIME(3) NOT NULL,
    `playlist_id` VARCHAR(191) NOT NULL,
    `play_count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `playlist_highlights` ADD CONSTRAINT `playlist_highlights_playlist_id_fkey` FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
