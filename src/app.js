import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import authRoutes from './routes/auth.js';
import photosRoutes from './routes/photos.js';
import albumsRoutes from './routes/albums.js';

const fastify = Fastify({ logger: true });

// Plugins
await fastify.register(cors, { origin: true });
await fastify.register(jwt, { secret: process.env.JWT_SECRET });

// Auth decorator
fastify.decorate('authenticate', async (request, reply) => {
  try {
    console.log('AUTH HEADER:', request.headers.authorization);
    await request.jwtVerify();
    console.log('JWT USER:', request.user);
  } catch (err) {
    console.log('JWT ERROR:', err.message);
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Routes
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(photosRoutes, {
  prefix: '/photos',
  preHandler: [fastify.authenticate],
});
await fastify.register(albumsRoutes, {
  prefix: '/albums',
  preHandler: [fastify.authenticate],
});

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

export default fastify;
