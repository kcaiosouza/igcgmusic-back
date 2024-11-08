import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';
import Slugify from 'slugify';

export async function albumRoutes(fastify: FastifyInstance) {
  
  // Criar um novo álbum
  fastify.post<{ Body: { title: string; releaseDate?: string; artistId: string } }>('/', async (request, reply) => {
    const albumSchema = z.object({
      title: z.string().min(1),
      release_date: z.string(),
      artistId: z.string().uuid('ID de artista inválido.'),
      image_url: z.string().url(),
      slug: z.string().optional(),
    });

    const parsedData = albumSchema.safeParse(request.body);

    if (!parsedData.success) {
      return reply.status(400).send(parsedData.error.format());
    }

    const data = parsedData.data;

    try {
      const album = await prisma.album.create({
        data: {
          title: data.title,
          release_date: new Date(data.release_date),
          artist: { connect: { id: data.artistId } },
          image_url: data.image_url,
          slug: data.slug ? data.slug : Slugify(data.title).toLowerCase(),
        },
      });
      return reply.status(201).send(album);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar o álbum.' });
    }
  });

  // Listar todos os álbuns
  fastify.get('/', async (request, reply) => {
    try {
      const albums = await prisma.album.findMany({
        include: {
          artist: true, // Inclui informações do artista
        },
      });
      return reply.send(albums);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar os álbuns.' });
    }
  });

  // Obter um álbum específico pelo ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const album = await prisma.album.findUnique({
        where: { id },
        include: {
          artist: true, // Inclui informações do artista
        },
      });

      if (!album) {
        return reply.status(404).send({ error: 'Álbum não encontrado.' });
      }

      return reply.send(album);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar o álbum.' });
    }
  });

  // Atualizar um álbum
  fastify.put<{ Params: { id: string }; Body: { title?: string; releaseDate?: string; artistId?: string } }>('/:id', async (request, reply) => {
    const albumUpdateSchema = z.object({
      title: z.string().optional(),
      release_date: z.string().optional(),
      artistId: z.string().uuid().optional(),
      image_url: z.string().url().optional(),
      slug: z.string().optional(),
    });

    const parsedData = albumUpdateSchema.safeParse(request.body);

    if (!parsedData.success) {
      return reply.status(400).send(parsedData.error.format());
    }

    const { id } = request.params;
    const data = parsedData.data;

    try {
      const updatedAlbum = await prisma.album.update({
        where: { id },
        data,
      });

      return reply.send(updatedAlbum);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar o álbum.' });
    }
  });

  // Deletar um álbum
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.album.delete({
        where: { id },
      });
      return reply.send({ message: 'Álbum deletado com sucesso.' });
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao deletar o álbum.' });
    }
  });
}
