import prisma from '../prisma/prisma.js';

async function createUser(userData) {
  return prisma.user.create({
    data: {
      clerkId: userData.id,
      username: userData.username
    }
  })
}
async function deleteUser(userId) {
  return prisma.user.delete({
    where: {
      clerkId: userId,
    }
  });
}

export {
  createUser,
  deleteUser
}
