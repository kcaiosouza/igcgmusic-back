import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';

export async function playlistHighlightRoutes(fastify: FastifyInstance) {
  // Criar um novo destaque de playlist
  fastify.post<{ Body: { month_year: string; playlist_id: string; play_count?: number } }>('/', async (request, reply) => {
    const highlightSchema = z.object({
      month_year: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data inválida. Use o formato ISO (YYYY-MM-DD).',
      }),
      playlist_id: z.string().uuid(),
      play_count: z.number().int().min(0).optional(),
    });

    const parsedData = highlightSchema.safeParse(request.body);

    if (!parsedData.success) {
      return reply.status(400).send(parsedData.error.format());
    }

    const { month_year, playlist_id, play_count } = parsedData.data;

    try {
      const playlistHighlight = await prisma.playlistHighlight.create({
        data: {
          month_year: new Date(month_year),
          playlist_id,
          play_count: play_count || 0,
        },
      });
      return reply.status(201).send(playlistHighlight);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar destaque de playlist.' });
    }
  });

  // Listar todos os destaques de playlists
  fastify.get('/', async (request, reply) => {
    try {
      const highlights = await prisma.playlistHighlight.findMany({
        include: { playlist: true },
      });
      return reply.send(highlights);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar destaques de playlists.' });
    }
  });

  // Obter um destaque de playlist específico pelo ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const highlight = await prisma.playlistHighlight.findUnique({
        where: { id },
        include: { playlist: true },
      });

      if (!highlight) {
        return reply.status(404).send({ error: 'Destaque de playlist não encontrado.' });
      }

      return reply.send(highlight);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar o destaque de playlist.' });
    }
  });

  // Atualizar o play_count de um destaque de playlist
  fastify.put<{ Params: { id: string }; Body: { play_count: number } }>('/:id', async (request, reply) => {
    const playCountSchema = z.number().int().min(0);
    const { id } = request.params;
    const { play_count } = request.body;

    if (!playCountSchema.safeParse(play_count).success) {
      return reply.status(400).send({ error: 'play_count inválido. Deve ser um número inteiro não negativo.' });
    }

    try {
      const updatedHighlight = await prisma.playlistHighlight.update({
        where: { id },
        data: { play_count },
      });

      return reply.send(updatedHighlight);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar o destaque de playlist.' });
    }
  });

  // Deletar um destaque de playlist
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.playlistHighlight.delete({
        where: { id },
      });
      return reply.send({ message: 'Destaque de playlist deletado com sucesso.' });
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao deletar o destaque de playlist.' });
    }
  });
}
