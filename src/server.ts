import Fastify from 'fastify';
import { userRoutes } from './controllers/users';

const port = 3333;
const fastify = Fastify();

fastify.register(userRoutes, { prefix: '/users' });

fastify.listen({ port }, (err) => {
  if (err) throw err;
  console.log(`Server is running!`);
});
