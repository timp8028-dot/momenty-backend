import prisma from '../db.js';

export default async function albumsRoutes(fastify) {
  // GET /albums
  fastify.get('/', async (request) => {
    const userId = request.user.id;
    return prisma.album.findMany({
      where: { userId },
      include: { _count: { select: { photos: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  // POST /albums
  fastify.post('/', async (request, reply) => {
    const userId = request.user.id;
    const { name } = request.body;

    const album = await prisma.album.create({
      data: { name, userId },
    });

    return reply.code(201).send(album);
  });

  // PATCH /albums/:id
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.id;
    const { name, coverPhoto } = request.body;

    const album = await prisma.album.findFirst({ where: { id, userId } });
    if (!album) return reply.code(404).send({ error: 'Album not found' });

    return prisma.album.update({
      where: { id },
      data: { ...(name && { name }), ...(coverPhoto && { coverPhoto }) },
    });
  });

  // DELETE /albums/:id
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    const album = await prisma.album.findFirst({ where: { id, userId } });
    if (!album) return reply.code(404).send({ error: 'Album not found' });

    await prisma.album.delete({ where: { id } });
    return { success: true };
  });
}
