import express, { Router } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';
import * as UserController from '../../controllers/users.js';

const CLERK_WEBHOOK_SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

const router = Router();
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {

  let evt;
  try {
    evt = await verifyWebhook(req, { signingSecret: CLERK_WEBHOOK_SIGNING_SECRET });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(403).json({ status: 'error', message: 'Invalid webhook signature' });
  }

  try {
    switch (evt.type) {
      case 'user.created':
        await UserController.createUser(evt.data);
        break;
      case 'user.deleted':
        await UserController.deleteUser(evt.data.id);
        break;
      default:
        console.log('Unhandled webhook event type:', evt.type);
    }

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Webhook handling error:', err.message);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
