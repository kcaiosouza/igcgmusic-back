import Fastify from 'fastify';
import { userRoutes } from './controllers/users';
import { songRoutes } from './controllers/songs';
import { artistRoutes } from './controllers/artists';
import { albumRoutes } from './controllers/albuns';

const port = 3333;
const fastify = Fastify();

fastify.register(userRoutes, { prefix: '/users' });
fastify.register(songRoutes, { prefix: '/songs' });
fastify.register(artistRoutes, { prefix: '/artists' });
fastify.register(albumRoutes, { prefix: '/albums' });

fastify.listen({ port }, (err) => {
  if (err) throw err;
  console.log(`Server is running!`);
});
