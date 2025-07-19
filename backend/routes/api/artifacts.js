import { Router } from 'express';
import { validationResult, matchedData } from 'express-validator';

const router = Router();
import * as ArtifactController from '../../controllers/artifacts.js'
import { baseArtifactValidator, conditionalValidator, getArtifactsValidator } from '../../validators/artifacts.js'
import ClerkJWTAuth from '../../validators/jwtauth.js';

router.get('/', getArtifactsValidator, ClerkJWTAuth, async (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    return response.status(400).json({
      status: "error",
      message: "Invalid request paramteres."
    });
  }

  const data = matchedData(request, { locations: ['query', 'params'] });

  try {
    const artifacts = await ArtifactController.getArtifacts(request.user, data.searchValue, data.tags, data.limit, data.cursor);
    const hasMoreArtifacts = artifacts.length === data.limit + 1;
    if (hasMoreArtifacts) artifacts.pop();
    const lastArtifact = artifacts[artifacts.length - 1];
    const nextCursor = lastArtifact ? lastArtifact.id : null;
    response.status(200).json({
      status: "success",
      data: {
        artifacts: artifacts,
        nextCursor: nextCursor,
        hasMoreArtifacts: hasMoreArtifacts
      }
    })

  } catch (err) {
    response.status(500).json({
      status: 'error',
      message: "An unexpected error occurred while retrieving artifacts. Please try again later."
    })
  }
});


router.post('/', baseArtifactValidator, conditionalValidator, ClerkJWTAuth, async (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    console.log(errors)
    return response.status(400).json({
      status: "error",
      message: "Invalid request paramteres."
    });
  }

  try {
    if (request.body.fileType === "TEXT") {
      response.status(200).json({
        status: "success",
        data: await ArtifactController.createTextArtifact(request.user, request.body.title, request.body.textContent)
      });
    } else if (request.body.fileType === "FILE") {
      const body = request.body;
      response.status(200).json({
        status: "success",
        data: await ArtifactController.createFileArtifact(request.user, body.title, body.filename, body.fileUrl, body.fileSize, body.isImage)
      });
    } else {
      response.status(500).json({
        status: "error",
        message: "Unknown fileType"
      })
    }
  } catch (err) {
    response.status(500).json({
      status: "error",
      message: "An unexpected error occurred while creating the artifact. Please try again later.",
    })
  }
});

router.delete('/:tagId', ClerkJWTAuth, async (request, response) => {
  try {
    const deletedArtifact = await ArtifactController.deleteArtifact(request.user, request.params.tagId);
    response.status(200).json({
      status: "success",
      data: deletedArtifact
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: "An unexpected error occurred while deleting the artifact. Please try again later.",
    })
  }
});

router.post('/:artifactId/tags', ClerkJWTAuth, async (request, response) => {
  try {
    const { artifactId } = request.params;
    const tagName = request.body.tagName;

    response.status(200).json({
      status: "success",
      data: await ArtifactController.addTagToArtifact(request.user, artifactId, tagName)
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: "An unexpected error occurred while adding the tag. Please try again later.",
    });
  }
});

router.delete('/:artifactId/tags/:tagId', ClerkJWTAuth, async (request, response) => {
  try {
    const { artifactId, tagId } = request.params;

    response.status(200).json({
      status: "success",
      data: await ArtifactController.removeTagFromArtifact(request.user, artifactId, tagId)
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: "An unexpected error occurred while removing the tag. Please try again later.",
    });
  }
});

router.patch('/text/:artifactId', ClerkJWTAuth, async (request, response) => {
  try {
    const { artifactId } = request.params;

    response.status(200).json({
      status: "success",
      data: await ArtifactController.updateArtifact(request.user, artifactId, request.body.title, request.body.textContent)
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: "An unexpected error occurred while updating the artifact. Please try again later.",
    });
  }
});

export default router;
