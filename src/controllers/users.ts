import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';
import bcrypt from "bcrypt";

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  plan: z.enum(['free', 'premium']),
  first_name: z.string(),
  last_name: z.string(),
  password: z.string()
});

export async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/users', async (request, reply) => {
    const data = createUserSchema.parse(request.body);
    const passwordHashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password_hash: passwordHashed
      }
    });
    reply.send(user);
  });

  fastify.get('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await prisma.user.findUnique({ where: { id } });
    reply.send(user || { error: 'User not found' });
  });
}
