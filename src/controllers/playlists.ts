import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';
import { decodeToken } from '../plugins/crypto';

const createPlaylistSchema = z.object({
  user_id: z.string().uuid().min(1),
  title: z.string().min(1),
  is_public: z.boolean(),
  image_url: z.string().url()
});

const getPlaylistByIdSchema = z.object({
  id: z.string().uuid().min(1),
});

const updatePlaylistSchema = z.object({
  title: z.string().min(1).optional(),
  is_public: z.boolean().optional(),
  image_url: z.string().url().optional(),
});

const addMusicPlaylistSchema = z.object({
  playlist_id: z.string().uuid().min(1),
  song_id: z.string().uuid().min(1),
});

export async function playlistRoutes(fastify: FastifyInstance) {
  // Criar uma playlist
  fastify.post('/', async (request, reply) => {
    const data = createPlaylistSchema.parse(request.body);

    try {
      const playlist = await prisma.playlist.create({
        data: {
          user_id: data.user_id,
          title: data.title,
          image_url: data.image_url,
          is_public: data.is_public,
        }
      });

      return reply.status(201).send(playlist)
    }catch(err) {
      return reply.status(500).send({ error: 'Erro ao criar a playlist.' });
    }
  })

  // Adicionar uma música à playlist
  fastify.post('/add-music', async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 401,
        message: "Token de autenticação ausente ou inválido",
      });
    }

    const authToken = authHeader.substring(7);
    const { token } = decodeToken({token: authToken})

    if(token && token != null) {
      try {
        const user = await prisma.user.findUnique({ where: { id: token[0] } });
        if(user?.username == token[1]) {
          const data = addMusicPlaylistSchema.parse(request.body);

          const playlist = await prisma.playlist.findUnique({
            where: { id: data.playlist_id }
          });

          if(!playlist) {
            return reply.status(404).send({
              error: 404,
              message: "Playlist não existente"
            })
          }

          if(playlist && playlist.user_id == token[0]) {
            try{
              const addMusic = await prisma.playlistSong.create({
                data
              })

              return reply.status(201).send(addMusic)
            }catch(err) {
              return reply.status(500).send({
                error: 500,
                message: "Não foi possível adicionar essa música a playlist"
              })
            }
          }else {
            return reply.status(401).send({
              error: 401,
              message: 'Você não pode adicionar musicas à uma playlist que não é sua',
            })
          }

        }else {
          return reply.status(401).send({
            error: 401,
            message: 'Token de autenticação inválido',
          })
        }
      }catch(err) {
        return reply.status(500).send({
          error: 500,
          message: 'Erro no banco de dados',
        })
      }
    }else {
      return reply.status(401).send({
        error: 401,
        message: 'Token de autenticação inválido',
      })
    }
  });

  // Ver as playlists do usuário logado
  fastify.get('/user/all', async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 401,
        message: "Token de autenticação ausente ou inválido",
      });
    }

    const authToken = authHeader.substring(7);
    const { token } = decodeToken({token: authToken})

    if(token && token != null) {
      try {
        const user = await prisma.user.findUnique({ where: { id: token[0] } });
        if(user?.username == token[1]) {
          // válido... oq vamos fazer?
          const playlists = await prisma.playlist.findMany({
            where: {
              user_id: token[0]
            },
            include: {
              PlaylistSongs: {
                include: {
                  song: {
                    include: {
                      album: true,
                      artist: true,
                    }
                  },
                }
              },
            }
          });

          return reply.send(playlists);
        }else {
          return reply.status(401).send({
            error: 401,
            message: 'Token de autenticação inválido',
          })
        }
      }catch(err) {
        return reply.status(500).send({
          error: 500,
          message: 'Erro no banco de dados',
        })
      }
    }else {
      return reply.status(401).send({
        error: 401,
        message: 'Token de autenticação inválido',
      })
    }
  })

  // Ver uma playlist específica
  fastify.get('/:id', async (request, reply) => {
    const data = getPlaylistByIdSchema.parse(request.params);

    try{
      const playlist = await prisma.playlist.findUnique({
        where: {
          id: data.id,
        },
        include: {
          PlaylistSongs: {
            include: {
              song: {
                include: {
                  album: true,
                  artist: true,
                }
              },
            }
          },
        }
      });

      if(playlist && playlist.is_public) {
        return reply.send(playlist);
      }else {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({
            error: 401,
            message: "Token de autenticação ausente ou inválido",
          });
        }

        const authToken = authHeader.substring(7);
        const { token } = decodeToken({token: authToken})

        if(token && token[0] == playlist?.user_id) {
          return reply.send(playlist);
        }else {
          return reply.status(401).send({
            error: 401,
            message: "Você não tem acesso a essa playlist",
          });
        }
      }
    }catch(err) {
      return reply.status(500).send({
        error: 500,
        message: "Erro no banco de dados",
      });
    }
  });

  // Atualizando um playlist
  fastify.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 401,
        message: "Token de autenticação ausente ou inválido",
      });
    }

    const authToken = authHeader.substring(7);
    const { token } = decodeToken({token: authToken})

    if(token && token != null) {
      try {
        const user = await prisma.user.findUnique({ where: { id: token[0] } });
        if(user?.username == token[1]) {
          const { id } = request.params;

          const playlist = await prisma.playlist.findUnique({
            where: { id }
          });

          if(playlist && playlist.user_id == token[0]) {
            const parsedData = updatePlaylistSchema.safeParse(request.body);
            if (!parsedData.success) {
              return reply.status(400).send(parsedData.error.format());
            }
  
            try {
              const updatedPlaylist = await prisma.playlist.update({
                where: { id },
                data: parsedData.data,
              });
              return reply.send(updatedPlaylist);
            } catch (error) {
              return reply.status(404).send({
                error: 404,
                message: 'Playlist não encontrada',
              })
            }
          }else {
            return reply.status(401).send({
              error: 401,
              message: 'Você não pode alterar uma playlist que não é sua',
            })
          }

        }else {
          return reply.status(401).send({
            error: 401,
            message: 'Token de autenticação inválido',
          })
        }
      }catch(err) {
        return reply.status(500).send({
          error: 500,
          message: 'Erro no banco de dados',
        })
      }
    }else {
      return reply.status(401).send({
        error: 401,
        message: 'Token de autenticação inválido',
      })
    }
  })

  // Apagando um playlist
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 401,
        message: "Token de autenticação ausente ou inválido",
      });
    }

    const authToken = authHeader.substring(7);
    const { token } = decodeToken({token: authToken})

    if(token && token != null) {
      try {
        const user = await prisma.user.findUnique({ where: { id: token[0] } });
        if(user?.username == token[1]) {
          const { id } = request.params;

          const playlist = await prisma.playlist.findUnique({
            where: { id }
          });

          if(playlist && playlist.user_id == token[0]) {
            await prisma.playlist.delete({
              where: { id },
            });
            return reply.send({ message: 'Playlist deletada com sucesso.' });
          }else {
            return reply.status(401).send({
              error: 401,
              message: 'Você não pode deletar uma playlist que não é sua',
            })
          }

        }else {
          return reply.status(401).send({
            error: 401,
            message: 'Token de autenticação inválido',
          })
        }
      }catch(err) {
        return reply.status(500).send({
          error: 500,
          message: 'Erro no banco de dados',
        })
      }
    }else {
      return reply.status(401).send({
        error: 401,
        message: 'Token de autenticação inválido',
      })
    }
  })
}