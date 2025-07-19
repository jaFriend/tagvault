import { Router } from 'express';

const router = Router();
import * as SasController from '../../controllers/sasToken.js'
import ClerkJWTAuth from '../../validators/jwtauth.js';

router.post('/upload', ClerkJWTAuth, async (request, response) => {
  try {
    const sasToken = await SasController.getUploadUrl(request.user, request.body.filename);
    response.status(200).json({
      status: "success",
      data: sasToken

    })

  } catch (err) {
    response.status(500).json({
      status: 'error',
      message: "An unexpected error occurred while genereating sas token. Please try again later.",
    })
  }
});

export default router;

