import express, { Router } from 'express';

const router = Router();
import * as UserController from '../../controllers/users.js'
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

router.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  if (!CLERK_WEBHOOK_SECRET) {
    return response.status(500).json({
      status: "error",
      message: "Webhook signature cannot be verified.",
    });
  }
  const rawBody = request.body;
  const signature = request.header('Clerk-Signature');

  if (!signature) {
    return res.status(400).json({ status: "error", message: "Missing Clerk-Signature header" });
  }

  const expectedSignature = crypto
    .createHmac('sha256', CLERK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const valid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );

  if (!valid) {
    return res.status(403).json({ status: "error", message: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf-8'));
  } catch (err) {
    return res.status(400).json({ status: "error", message: "Invalid JSON payload" });
  }

  try {
    switch (event.type) {
      case 'user.created':
        await UserController.createUser(event.data);
        break;
      case 'user.deleted':
        await UserController.deleteUser(event.data.id);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }

    res.status(200).json({ status: "success" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
