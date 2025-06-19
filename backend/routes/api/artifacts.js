import { Router } from 'express';
import { validationResult } from 'express-validator';

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

  try {
    response.status(200).json({
      status: "success",
      data: {
        artifacts: await ArtifactController.getArtifacts(request.params.userId, request.query.searchValue, request.query.tags)
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
