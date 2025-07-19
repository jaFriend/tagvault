import { Router } from 'express';

const router = Router();
import * as TagController from '../../controllers/tags.js'
import ClerkJWTAuth from '../../validators/jwtauth.js';

router.post('/', ClerkJWTAuth, async (request, response) => {
  try {
    const newTag = await TagController.createTag(request.user, request.body.tagName);
    response.status(200).json({
      status: "success",
      data: newTag
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: "An unexpected error occurred while creating a tag. Please try again later.",
    })
  }
});

router.delete('/:tagId', ClerkJWTAuth, async (request, response) => {
  try {
    const deletedTag = await TagController.deleteTag(request.user, request.params.tagId);
    response.status(200).json({
      status: "success",
      data: deletedTag
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: "An unexpected error occurred while deleting the tag. Please try again later.",
    })
  }
});

router.get('/', ClerkJWTAuth, async (request, response) => {
  try {
    const tagList = await TagController.getTags(request.user);
    response.status(200).json({
      status: "success",
      data: {
        tags: tagList
      }
    })

  } catch (err) {
    response.status(500).json({
      status: 'error',
      message: "An unexpected error occurred while retrieving tags. Please try again later.",
    })
  }
});


export default router;
