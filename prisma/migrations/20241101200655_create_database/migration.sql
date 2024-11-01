-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,
    `plan` ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `plan` ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'PREMIUM',
    `status` ENUM('PENDING', 'APPROVED', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'BRL',
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `payment_method` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PIX') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `songs` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `album_id` VARCHAR(191) NOT NULL,
    `artist_id` VARCHAR(191) NOT NULL,
    `language` ENUM('pt_BR', 'en_US', 'es_ES', 'de_DE', 'fr_FR', 'it_IT', 'af_AF') NOT NULL,
    `lyrics` VARCHAR(191) NULL,
    `chords` VARCHAR(191) NULL,
    `duration` INTEGER NOT NULL,
    `play_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `songs_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `albuns` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `release_date` DATETIME(3) NOT NULL,
    `artist_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `albuns_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artists` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `artists_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `playlists` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `is_public` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `playlist_songs` (
    `id` VARCHAR(191) NOT NULL,
    `playlist_id` VARCHAR(191) NOT NULL,
    `song_id` VARCHAR(191) NOT NULL,
    `added_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `playlist_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `song_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `song_id` VARCHAR(191) NOT NULL,
    `played_at` DATETIME(3) NOT NULL,
    `duration_played` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lyrics_submissions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `song_id` VARCHAR(191) NOT NULL,
    `submitted_lyrics` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `musics_highlights` (
    `id` VARCHAR(191) NOT NULL,
    `month_year` DATETIME(3) NOT NULL,
    `song_id` VARCHAR(191) NOT NULL,
    `play_count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `songs` ADD CONSTRAINT `songs_album_id_fkey` FOREIGN KEY (`album_id`) REFERENCES `albuns`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `songs` ADD CONSTRAINT `songs_artist_id_fkey` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `albuns` ADD CONSTRAINT `albuns_artist_id_fkey` FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `playlists` ADD CONSTRAINT `playlists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `playlist_songs` ADD CONSTRAINT `playlist_songs_playlist_id_fkey` FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `playlist_songs` ADD CONSTRAINT `playlist_songs_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_playlist_id_fkey` FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_logs` ADD CONSTRAINT `song_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_logs` ADD CONSTRAINT `song_logs_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lyrics_submissions` ADD CONSTRAINT `lyrics_submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lyrics_submissions` ADD CONSTRAINT `lyrics_submissions_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `musics_highlights` ADD CONSTRAINT `musics_highlights_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
