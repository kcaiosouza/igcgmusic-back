/*
  Warnings:

  - A unique constraint covering the columns `[playlist_id,song_id]` on the table `playlist_songs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `playlist_songs_playlist_id_song_id_key` ON `playlist_songs`(`playlist_id`, `song_id`);
