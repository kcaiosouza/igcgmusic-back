-- AlterTable
ALTER TABLE `albuns` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `artists` MODIFY `bio` TEXT NULL,
    MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `lyrics_submissions` MODIFY `submitted_lyrics` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `playlists` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `songs` MODIFY `lyrics` TEXT NULL,
    MODIFY `chords` TEXT NULL,
    MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `transactions` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `birth_date` DATETIME(3) NULL,
    MODIFY `updated_at` DATETIME(3) NULL;
