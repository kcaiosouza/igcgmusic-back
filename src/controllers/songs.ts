import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';

const songSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  album_id: z.string(),
  file_url: z.string().url(),
  artist_id: z.string(),
  language: z.enum(['pt_BR', 'en_US', 'es_ES', 'de_DE', 'fr_FR', 'it_IT', 'af_AF']), // Ajustar em caso de alteração no backend
  lyrics: z.string().optional(),
  chords: z.string().optional(),
  duration: z.number().positive(),
});

const languegeSchema = z.object({
  enum: z.enum(['pt_BR', 'en_US', 'es_ES', 'de_DE', 'fr_FR', 'it_IT', 'af_AF']), // Ajustar em caso de alteração no backend
});

const searchSongSchema = z.object({
  language: z.enum(['pt_BR', 'en_US', 'es_ES', 'de_DE', 'fr_FR', 'it_IT', 'af_AF']),
  query: z.string().min(1),
})

export async function songRoutes(fastify: FastifyInstance) {
  // Criar uma nova música
  fastify.post('/', async (request, reply) => {
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
          file_url: parsedData.data.file_url,
          lyrics: parsedData.data.lyrics ? parsedData.data.lyrics : null,
          chords: parsedData.data.chords ? parsedData.data.chords : null,
        }
      });

      return reply.status(201).send(newSong);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar a música.' });
    }
  });

  // Todas as músicas
  fastify.get('/all', async (request, reply) => {
    try {
      const musics = await prisma.song.findMany({
        include: {
          album: true,
          artist: true,
        }
      });
      return reply.send(musics);
    }catch(err) {
      return reply.status(500).send({
        error: 500,
        message: 'Erro no banco de dados',
      })
    }
  })
  
  // Todas as músicas por Idioma
  fastify.get<{ Params: { enum: string } }>('/all/language/:enum', async (request, reply) => {
    const data = languegeSchema.parse(request.params);

    try {
      const musics = await prisma.song.findMany({
        where: {
          language: data?.enum,
        },
        include: {
          album: true,
          artist: true,
        }
      });
      return reply.send(musics);
    }catch(err) {
      return reply.status(500).send({
        error: 500,
        message: 'Erro no banco de dados',
      })
    }
  })

  fastify.get('/search', async (request, reply) => {
    const { data } = searchSongSchema.safeParse(request.query);

    try {
      const musics = await prisma.song.findMany({
        where: {
          OR: [
            { title: { startsWith: data?.query?.toLowerCase(), } },
            { lyrics: { contains: data?.query?.toLowerCase(), } },
          ],
          AND: [
            { language: data?.language ? data?.language : undefined },
          ],
        },
      });
      if(musics.length > 0) {
        return reply.send(musics);
      }else {
        return reply.status(404).send({
          error: 404,
          message: 'Nenhuma música foi encontrada',
        })
      }
    }catch (error) {
      return reply.status(500).send({
        error: 500,
        message: 'Erro no banco de dados',
      })
    }
  })
}
