import prisma from '../prisma/prisma.js';
import { deleteFile } from './sasToken.js';

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
async function createFileArtifact(id, title, fileName, fileURL, fileSize, isImage) {
  return createArtifact(id, title, null, fileName, fileURL, fileSize, "FILE", isImage);
}

async function getArtifacts(userId, searchValue, tags, limit, cursor) {
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

  const queryConfig = {
    where: whereMethod,
    take: limit + 1,
    include: {
      tags: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  };

  if (cursor) {
    queryConfig.cursor = { id: cursor };
    queryConfig.skip = 1;
  }
  return prisma.artifact.findMany(queryConfig);
}


async function deleteArtifact(userId, artifactId) {
  const artifactWithTags = await prisma.artifact.findUnique({
    where: { id: artifactId },
    select: {
      tags: {
        select: { id: true }
      }
    }
  });


  const tagIds = artifactWithTags.tags.map(tag => tag.id);
  const artifact = await prisma.artifact.delete({
    where: {
      id: artifactId,
      userId: userId
    }
  });

  if (artifact.fileType === "FILE") deleteFile(userId, artifact.fileName);

  for (const tagId of tagIds) {
    const tagWithArtifacts = await prisma.tag.findUnique({
      where: { id: tagId },
      select: {
        artifacts: {
          select: { id: true }
        }
      }
    });

    if (tagWithArtifacts && tagWithArtifacts.artifacts.length === 0) {
      await prisma.tag.delete({
        where: { id: tagId }
      });
    }
  }
  return artifact;
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
  createFileArtifact,
  getArtifacts,
  deleteArtifact,
  addTagToArtifact,
  removeTagFromArtifact,
  updateArtifact

}
