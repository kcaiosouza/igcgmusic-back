/*
  Warnings:

  - Added the required column `image_url` to the `albuns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `artists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_url` to the `songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `albuns` ADD COLUMN `image_url` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `artists` ADD COLUMN `image_url` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `playlists` ADD COLUMN `image_url` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `songs` ADD COLUMN `file_url` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `image_url` TEXT NOT NULL;
