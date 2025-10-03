import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' }) : null;

router.post('/intent', async (req, res, next) => {
  try {
    if (!stripe) {
      res.status(503).json({ message: 'Stripe not configured' });
      return;
    }

    const { amount, currency = 'usd' } = req.body;
    const intent = await stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true } });
    res.json({ clientSecret: intent.client_secret });
  } catch (error) {
    next(error);
  }
});

export default router;
