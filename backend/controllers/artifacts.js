import prisma from '../prisma/prisma.js';

async function createArtifact(id, title, textContent, fileName, fileUrl, fileSize, fileType, isImage) {
  return prisma.artifact.create({
    data: {
      userId: id,
      title: title,
      textContent: textContent,
      fileName: fileName,
      fileUrl: fileUrl,
      fileSize: fileSize,
      fileType: fileType,
      isImage: isImage

    }
  });
}

async function createTextArtifact(id, title, textContent) {
  return createArtifact(id, title, textContent, null, null, null, "TEXT", false);
}

async function getArtifacts(userId, searchValue, tags) {
  const whereMethod = { userId: userId };

  if (searchValue !== '') {
    whereMethod.OR = [
      { title: { contains: searchValue, mode: 'insensitive' } },
      { textContent: { contains: searchValue, mode: 'insensitive' } },
      { fileName: { contains: searchValue, mode: 'insensitive' } },
      {
        tags: {
          some: {
            name: {
              contains: searchValue,
              mode: 'insensitive'
            }
          }
        }
      }
    ];
  }
  if (tags && tags.length > 0) {
    whereMethod.AND = tags
      .filter(tagId => tagId?.length)
      .map(tagId => ({
        tags: { some: { id: tagId } }
      }));
  }


  return prisma.artifact.findMany({
    where: whereMethod,
    include: {
      tags: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}


async function deleteArtifact(userId, artifactId) {
  return prisma.artifact.delete({
    where: {
      userId: userId,
      id: artifactId
    }
  })
}

async function addTagToArtifact(userId, artifactId, tagName) {
  const tag = await prisma.tag.upsert({
    where: {
      userId_name: {
        userId: userId,
        name: tagName
      }
    },
    update: {},
    create: {
      userId: userId,
      name: tagName
    }
  });

  const updatedArtifact = await prisma.artifact.update({
    where: {
      id: artifactId,
      userId: userId
    },
    data: {
      tags: {
        connect: {
          id: tag.id
        }
      }
    },
    include: {
      tags: true,
    }
  });

  return {
    artifact: updatedArtifact,
    addedTag: { id: tag.id, name: tag.name }
  }

}


async function removeTagFromArtifact(userId, artifactId, tagId) {
  const updatedArtifact = await prisma.artifact.update({
    where: {
      id: artifactId,
      userId: userId
    },
    data: {
      tags: {
        disconnect: {
          id: tagId
        }
      }
    },
    include: {
      tags: true,
    }
  });

  const tag = await prisma.tag.findUnique({
    where: {
      id: tagId,
    },
    include: {
      artifacts: {
        select: { id: true },
      },
    },
  });

  if (tag && tag.artifacts.length === 0) {
    await prisma.tag.delete({
      where: {
        id: tagId,
      },
    });
  }

  return updatedArtifact;

}

async function updateArtifact(userId, artifactId, title, textContent) {
  const dataFields = { title };
  if (textContent && textContent.length > 0) {
    dataFields.textContent = textContent;
  }

  return prisma.artifact.update({
    where: {
      id: artifactId,
      userId: userId
    },
    data: dataFields,
    include: {
      tags: true
    }
  });
}




export {
  createArtifact,
  createTextArtifact,
  getArtifacts,
  deleteArtifact,
  addTagToArtifact,
  removeTagFromArtifact,
  updateArtifact

}
