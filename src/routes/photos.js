import prisma from '../db.js';
import { uploadPhoto, deletePhoto } from '../storage.js';

export default async function photosRoutes(fastify) {
  // GET /photos — список фото пользователя
  fastify.get('/', async (request) => {
    const { albumId } = request.query;
    const userId = request.user.id;

    return prisma.photo.findMany({
      where: { userId, ...(albumId ? { albumId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  });

  // POST /photos — загрузка фото (multipart)
  fastify.post('/', async (request, reply) => {
    const userId = request.user.id;
    const data = await request.file();

    if (!data) return reply.code(400).send({ error: 'No file provided' });

    const buffer = await data.toBuffer();
    const { path, url } = await uploadPhoto(userId, data.filename, buffer, data.mimetype);

    const albumId = request.query.albumId || null;

    const photo = await prisma.photo.create({
      data: {
        url,
        filename: data.filename,
        size: buffer.length,
        storagePath: path,
        userId,
        albumId,
      },
    });

    return reply.code(201).send(photo);
  });

  // DELETE /photos/:id — удаление фото
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.id;

    const photo = await prisma.photo.findFirst({ where: { id, userId } });
    if (!photo) return reply.code(404).send({ error: 'Photo not found' });

    if (photo.storagePath) await deletePhoto(photo.storagePath);
    await prisma.photo.delete({ where: { id } });

    return { success: true };
  });
}
