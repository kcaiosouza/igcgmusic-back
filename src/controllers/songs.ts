import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';

export async function songRoutes(fastify: FastifyInstance) {
  // Criar uma nova música
  fastify.post('/', async (request, reply) => {
    const songSchema = z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      album_id: z.string(),
      artist_id: z.string(),
      language: z.enum(['pt_BR', 'en_US', 'es_ES', 'de_DE', 'fr_FR', 'it_IT', 'af_AF']), // Ajustar em caso de alteração no backend
      lyrics: z.string().optional(),
      chords: z.string().optional(),
      duration: z.number().positive(),
    });

    const parsedData = songSchema.safeParse(request.body);
    if (!parsedData.success) {
      return reply.status(400).send(parsedData.error.format());
    }

    try {
      const newSong = await prisma.song.create({
        data: {
          title: parsedData.data.title,
          duration: parsedData.data.duration,
          language: parsedData.data.language,
          slug: parsedData.data.slug,
          album_id: parsedData.data.album_id,
          artist_id: parsedData.data.artist_id,
          lyrics: parsedData.data.lyrics ? parsedData.data.lyrics : null,
          chords: parsedData.data.chords ? parsedData.data.chords : null,
        }
      });
      return reply.status(201).send(newSong);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar a música.' });
    }
  });
}
