import Fastify from 'fastify';
import { userRoutes } from './controllers/users';
import { songRoutes } from './controllers/songs';
import { artistRoutes } from './controllers/artists';
import { albumRoutes } from './controllers/albuns';
import { playlistRoutes } from './controllers/playlists';
import { logsRoutes } from './controllers/logs';
import { lyricsSubmissionRoutes } from './controllers/lyricsSubmissions';
import { musicHighlightRoutes } from './controllers/musicsHighlights';
import { playlistHighlightRoutes } from './controllers/playlistsHighlights';

const port = 3333;
const fastify = Fastify();

fastify.register(userRoutes, { prefix: '/users' });
fastify.register(songRoutes, { prefix: '/songs' });
fastify.register(artistRoutes, { prefix: '/artists' });
fastify.register(albumRoutes, { prefix: '/albums' });
fastify.register(playlistRoutes, { prefix: '/playlists' });
fastify.register(logsRoutes, { prefix: '/logs' });
fastify.register(lyricsSubmissionRoutes, { prefix: '/lyrics-submissions' });
fastify.register(musicHighlightRoutes, { prefix: '/music-highlights' });
fastify.register(playlistHighlightRoutes, { prefix: '/playlist-highlights' });

fastify.listen({ port }, (err) => {
  if (err) throw err;
  console.log(`Server is running!`);
});
