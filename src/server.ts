import Fastify from 'fastify';
import { userRoutes } from './controllers/users';
import { songRoutes } from './controllers/songs';

const port = 3333;
const fastify = Fastify();

fastify.register(userRoutes, { prefix: '/users' });
fastify.register(songRoutes, { prefix: '/songs' });

fastify.listen({ port }, (err) => {
  if (err) throw err;
  console.log(`Server is running!`);
});
