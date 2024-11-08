import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';
import Slugfy from 'slugify';

const creataArtistSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  slug: z.string().optional(),
  image_url: z.string().url(),
});

export async function artistRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const data = creataArtistSchema.parse(request.body);

    try {
      const artist = await prisma.artist.create({
        data: {
          name: data.name,
          bio: data.bio ? data.bio : "Nenhuma descrição",
          slug: data.slug ? data.slug : Slugfy(data.name).toLowerCase(),
          image_url: data.image_url,
        },
      });
      return reply.status(201).send(artist);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao criar o artista.' });
    }
  });

  // Listar todos os artistas
  fastify.get('/', async (request, reply) => {
    try {
      const artists = await prisma.artist.findMany();
      return reply.send(artists);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar os artistas.' });
    }
  });

  // Obter um artista específico pelo ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const artist = await prisma.artist.findUnique({
        where: { id },
      });

      if (!artist) {
        return reply.status(404).send({ error: 'Artista não encontrado.' });
      }

      return reply.send(artist);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar o artista.' });
    }
  });

  // Atualizar um artista
  fastify.put<{ Params: { id: string }; Body: { name?: string; bio?: string } }>('/:id', async (request, reply) => {
    const artistUpdateSchema = z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      slug: z.string().optional(),
      image_url: z.string().optional(),
    });

    const parsedData = artistUpdateSchema.safeParse(request.body);

    if (!parsedData.success) {
      return reply.status(400).send(parsedData.error.format());
    }

    const { id } = request.params;
    const data = parsedData.data;

    try {
      const updatedArtist = await prisma.artist.update({
        where: { id },
        data,
      });

      return reply.send(updatedArtist);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao atualizar o artista.' });
    }
  });

  // Deletar um artista
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.artist.delete({
        where: { id },
      });
      return reply.send({ message: 'Artista deletado com sucesso.' });
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao deletar o artista.' });
    }
  });
}