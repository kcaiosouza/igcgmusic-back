import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';

export async function lyricsSubmissionRoutes(fastify: FastifyInstance) {
  // Criar uma nova submissão de letra
  fastify.post<{ Body: { user_id: string; song_id: string; submitted_lyrics: string } }>('/', async (request, reply) => {
    const submissionSchema = z.object({
      user_id: z.string().uuid(),
      song_id: z.string().uuid(),
      submitted_lyrics: z.string().min(1, 'A letra submetida é obrigatória.'),
    });

    const parsedData = submissionSchema.safeParse(request.body);

    if (!parsedData.success) {
      return reply.status(400).send(parsedData.error.format());
    }

    const { user_id, song_id, submitted_lyrics } = parsedData.data;

    try {
      const submission = await prisma.lyricsSubmission.create({
        data: {
          user_id,
          song_id,
          submitted_lyrics,
        },
      });
      return reply.status(201).send(submission);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar a submissão de letra.' });
    }
  });

  // Listar todas as submissões de letras
  fastify.get('/', async (request, reply) => {
    try {
      const submissions = await prisma.lyricsSubmission.findMany({
        include: { user: true, song: true },
      });
      return reply.send(submissions);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar as submissões de letras.' });
    }
  });

  // Obter uma submissão específica pelo ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const submission = await prisma.lyricsSubmission.findUnique({
        where: { id },
        include: { user: true, song: true },
      });

      if (!submission) {
        return reply.status(404).send({ error: 'Submissão de letra não encontrada.' });
      }

      return reply.send(submission);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar a submissão de letra.' });
    }
  });

  // Atualizar o status de uma submissão de letra
  fastify.put<{ Params: { id: string }; Body: { status?: string } }>('/:id', async (request, reply) => {
    const statusSchema = z.object({
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    })
    const { id } = request.params;
    const { status } = statusSchema.parse(request.body);

    try {
      const updatedSubmission = await prisma.lyricsSubmission.update({
        where: { id },
        data: { status },
      });

      return reply.send(updatedSubmission);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar a submissão de letra.' });
    }
  });

  // Deletar uma submissão de letra
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.lyricsSubmission.delete({
        where: { id },
      });
      return reply.send({ message: 'Submissão de letra deletada com sucesso.' });
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao deletar a submissão de letra.' });
    }
  });
}
