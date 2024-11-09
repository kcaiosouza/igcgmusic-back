import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';

const createLogSchema = z.object({
  user_id: z.string().uuid(),
  song_id: z.string().uuid(),
  duration_played: z.number().int(),
});

export async function logsRoutes(fastify: FastifyInstance) {
  // Salvar informações de um usuário
  fastify.post('/', async (request, reply) => {
    const data = createLogSchema.parse(request.body);

    try {
      const log = await prisma.songLog.create({
        data
      })
      return reply.status(201).send(log);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao salvar o log.' });
    }
  });

  // Coletar informações de um usuário
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const logs = await prisma.songLog.findMany({
        where: {
          user_id: id
        }
      });
      return reply.send(logs);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar os logs.' });
    }
  });

}