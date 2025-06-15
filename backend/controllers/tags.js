import prisma from '../prisma/prisma.js';

async function createTag(userId, tagName) {
  return prisma.tag.create({
    data: {
      userId: userId,
      name: tagName
    }
  });
}

async function getTags(userId) {
  return prisma.tag.findMany({
    where: {
      userId: userId
    },
    include: {
      artifacts: true
    },
    orderBy: {
      name: 'asc'
    }
  })
}

async function deleteTag(userId, tagId) {
  return prisma.tag.delete({
    where: {
      userId: userId,
      id: tagId
    }
  })
}

export {
  createTag,
  getTags,
  deleteTag
}
