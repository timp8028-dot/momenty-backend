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

fastify.decorate('authenticate', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized: no authorization header' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Unauthorized: invalid authorization format' });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized: empty token' });
    }

    const decoded = fastify.jwt.verify(token);
    request.user = decoded;

    console.log('AUTH HEADER OK');
    console.log('DECODED USER:', decoded);
  } catch (err) {
    console.log('JWT VERIFY ERROR:', err.message);
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(photosRoutes, {
  prefix: '/photos',
  preHandler: [fastify.authenticate],
});
await fastify.register(albumsRoutes, {
  prefix: '/albums',
  preHandler: [fastify.authenticate],
});

fastify.get('/health', async () => ({ status: 'ok' }));

export default fastify;
