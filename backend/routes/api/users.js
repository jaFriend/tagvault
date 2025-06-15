import { Router } from 'express';

const router = Router();
import * as UserController from '../../controllers/users.js'

router.post('/create', async (request, response) => {
  try {
    const newUser = await UserController.createUser(request.body.data);
    response.status(200).json({
      status: "success",
      data: newUser
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: err.message
    })
  }
});

router.post('/delete', async (request, response) => {
  try {
    const deletedUser = await UserController.deleteUser(request.body.data.id);
    response.status(200).json({
      status: "success",
      data: deletedUser
    });

  } catch (err) {
    response.status(500).json({
      status: "error",
      message: err.message
    })
  }
});
export default router
