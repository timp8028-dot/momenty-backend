import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import authRoutes from './routes/auth.js';
import photosRoutes from './routes/photos.js';
import albumsRoutes from './routes/albums.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });
await fastify.register(jwt, { secret: process.env.JWT_SECRET });

// ВРЕМЕННО оставляем decorator, но не используем его на роуты
fastify.decorate('authenticate', async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.code(401).send({ error: 'Unauthorized: no authorization header' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Unauthorized: invalid authorization format' });
  }

  const token = authHeader.slice(7).trim();
  const decoded = fastify.jwt.decode(token);

  if (!decoded || !decoded.id) {
    return reply.code(401).send({ error: 'Unauthorized: invalid token payload' });
  }

  request.user = decoded;
});

// Auth
await fastify.register(authRoutes, { prefix: '/auth' });

// ВРЕМЕННО БЕЗ preHandler
await fastify.register(photosRoutes, { prefix: '/photos' });
await fastify.register(albumsRoutes, { prefix: '/albums' });

fastify.get('/health', async () => ({ status: 'ok' }));

export default fastify;
