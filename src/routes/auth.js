import prisma from '../db.js';

export default async function authRoutes(fastify) {
  // POST /auth/google — принимает данные от Google OAuth
  fastify.post('/google', async (request, reply) => {
    const { googleId, email, name, avatar } = request.body;

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await prisma.user.create({
        data: { googleId, email, name, avatar },
      });
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email });
    return { token, user };
  });

  // GET /auth/me — текущий пользователь
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
    return prisma.user.findUnique({ where: { id: request.user.id } });
  });
}
