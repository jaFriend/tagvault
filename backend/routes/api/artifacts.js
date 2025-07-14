import { Router } from 'express';
import { validationResult, matchedData } from 'express-validator';

const router = Router();
import * as ArtifactController from '../../controllers/artifacts.js'
import { artifactValidator, getArtifactsValidator } from '../../validators/artifacts.js'
import ClerkJWTAuth from '../../validators/jwtauth.js';

router.get('/:userId', getArtifactsValidator, ClerkJWTAuth, async (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    return response.status(500).json({
      status: "error",
      message: errors.array()
    });
  }

  const data = matchedData(request, { locations: ['query', 'params'] });
  const artifacts = await ArtifactController.getArtifacts(data.userId, data.searchValue, data.tags, data.limit, data.cursor);
  const hasMoreArtifacts = artifacts.length === data.limit + 1;
  if (hasMoreArtifacts) artifacts.pop();
  const lastArtifact = artifacts[artifacts.length - 1];
  const nextCursor = lastArtifact ? lastArtifact.id : null;

  try {
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
      message: err.message
    })
  }
});


router.post('/:userId', artifactValidator, ClerkJWTAuth, async (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    return response.status(500).json({
      status: "error",
      message: errors.array()
    });
  }
  try {
    if (request.body.fileType === "TEXT") {
      response.status(200).json({
        status: "success",
        data: await ArtifactController.createTextArtifact(request.params.userId, request.body.title, request.body.textContent)
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
      message: err.message
    })
  }
});
router.delete('/:userId/:tagId', ClerkJWTAuth, async (request, response) => {
  try {
    const deletedArtifact = await ArtifactController.deleteArtifact(request.params.userId, request.params.tagId);
    response.status(200).json({
      status: "success",
      data: deletedArtifact
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: err.message
    })
  }
});

router.post('/:userId/:artifactId/tags', ClerkJWTAuth, async (request, response) => {
  try {
    const { userId, artifactId } = request.params;
    const tagName = request.body.tagName;

    response.status(200).json({
      status: "success",
      data: await ArtifactController.addTagToArtifact(userId, artifactId, tagName)
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

router.delete('/:userId/:artifactId/tags/:tagId', ClerkJWTAuth, async (request, response) => {
  try {
    const { userId, artifactId, tagId } = request.params;

    response.status(200).json({
      status: "success",
      data: await ArtifactController.removeTagFromArtifact(userId, artifactId, tagId)
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

router.patch('/text/:userId/:artifactId', ClerkJWTAuth, async (request, response) => {
  try {
    const { userId, artifactId } = request.params;

    response.status(200).json({
      status: "success",
      data: await ArtifactController.updateArtifact(userId, artifactId, request.body.title, request.body.textContent)
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

export default router;
