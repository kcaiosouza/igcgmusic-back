import { FastifyInstance } from 'fastify';
import prisma from '../plugins/prisma';
import { z } from 'zod';
import bcrypt from "bcrypt";
import { decodeToken } from '../plugins/crypto';

// Schemas de validação para a rota de usuário
const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  image_url: z.string().url(),
  password: z.string().min(6)
});

const readUsernameSchema = z.object({
  username: z.string(),
})

const searchUserSchema = z.object({
  query: z.string().min(1),
});

const updateUserSchema = z.object({
  username: z.string().min(3).optional().transform((val) => val?.toLowerCase()),
  email: z.string().email().optional().transform((val) => val?.toLowerCase()),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  image_url: z.string().url().optional(),
});

const newPasswordUserSchema = z.object({
  old_password: z.string().min(6),
  new_password: z.string().min(6),
});

export async function userRoutes(fastify: FastifyInstance) {
  // Create
  fastify.post('/', async (request, reply) => {
    const data = createUserSchema.parse(request.body);
    const passwordHashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        username: (data.username).toLowerCase(),
        email: (data.email).toLowerCase(),
        first_name: data.first_name,
        last_name: data.last_name,
        image_url: data.image_url,
        password_hash: passwordHashed
      }
    });
    return reply.send(user);
  });

  // Read
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if(user) {
      return reply.send(user);
    }else {
      return reply.status(404).send({
        error: 404,
        message: 'Usuário não encontrado',
      })
    }
  });
  fastify.get<{ Params: { username: string } }>('/username/:username', async (request, reply) => {
    const { data } = readUsernameSchema.safeParse(request.params)
    const user = await prisma.user.findUnique({ where: { username: data?.username } });
    if(user) {
      return reply.send(user);
    }else {
      return reply.status(404).send({
        error: 404,
        message: 'Usuário não encontrado',
      })
    }
  });
  fastify.get('/search', async (request, reply) => {
    // const { query } = request.query as { query?: string };
    const { data } = searchUserSchema.safeParse(request.query)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { startsWith: data?.query?.toLowerCase(), } },
          { first_name: { startsWith: data?.query?.toLowerCase(), } },
          { last_name: { startsWith: data?.query?.toLowerCase(), } },
        ],
      },
    });
    if(users.length > 0) {
      return reply.send(users);
    }else {
      return reply.status(404).send({
        error: 404,
        message: 'Nenhum usuário encontrado',
      })
    }
  });

  // Update
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

          const parsedData = updateUserSchema.safeParse(request.body);
          if (!parsedData.success) {
            return reply.status(400).send(parsedData.error.format());
          }

          try {
            const updatedUser = await prisma.user.update({
              where: { id },
              data: parsedData.data,
            });
            return reply.send(updatedUser);
          } catch (error) {
            return reply.status(404).send({
              error: 404,
              message: 'Usuário não encontrado',
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

  // Delete
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

          try {
            await prisma.user.delete({
              where: { id },
            });
            return reply.send({ message: 'Usuário deletado com sucesso.' });
          } catch (error) {
            return reply.status(404).send({
              error: 404,
              message: 'Usuário não encontrado',
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

  // New password
  fastify.patch<{ Params: { id: string } }>('/:id/password', async (request, reply) => {
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
          const data = newPasswordUserSchema.safeParse(request.body);
          
          if (!data.success) {
            return reply.status(400).send(data.error.format());
          }

          try {
            const user = await prisma.user.findUnique({
              where: { id },
            });
            
            if (!user) {
              return reply.status(404).send({
                error: 404,
                message: 'Usuário não encontrado',
              })
            }

            const isPasswordValid = await bcrypt.compare(data.data.old_password, user.password_hash);
            if (!isPasswordValid) {
              return reply.status(401).send({
                error: 401,
                message: 'Senha atual incorreta.',
              });
            }

            const newHashedPassword = await bcrypt.hash(data.data.new_password, 10);

            await prisma.user.update({
              where: { id },
              data: { password_hash: newHashedPassword },
            });

            return reply.send({ error: false, message: 'Senha atualizada com sucesso.' });
          }catch (err) {
            console.log(err);
            return reply.status(500).send({ error: 'Erro ao atualizar a senha.' });
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

  // Recover user
  fastify.get('/recover', async (request, reply) => {
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
          return reply.send(user);
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
