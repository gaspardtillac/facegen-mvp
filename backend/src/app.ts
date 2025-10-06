import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import authRoutes from './routes/auth';
import imageRoutes from './routes/images';
import './workers/videoWorker';
import { PrismaClient } from '@prisma/client';
import { authenticate } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use('/api/', apiLimiter);
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/images', imageRoutes);

app.post('/api/payment/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Payment success:', session.id);
      
      const credits = parseInt(session.metadata?.credits || '0');
      const userId = session.metadata?.userId;
      
      if (!userId) {
        console.error('Missing userId in metadata');
        return res.json({ received: true });
      }
      
      if (credits > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: credits } }
        });
        
        await prisma.payment.create({
          data: {
            userId,
            stripePaymentId: session.payment_intent as string || session.id,
            amount: session.amount_total || 0,
            credits,
            status: 'COMPLETED'
          }
        });
        
        console.log(`Added ${credits} credits to user ${userId}`);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/payment/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { packageType = 'starter' } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const packages: Record<string, { credits: number; price: number; name: string }> = {
      starter: { credits: 10, price: 9.99, name: 'Pack Starter' },
      standard: { credits: 50, price: 39.99, name: 'Pack Standard' },
      premium: { credits: 100, price: 69.99, name: 'Pack Premium' }
    };

    const pkg = packages[packageType];
    if (!pkg) {
      return res.status(400).json({ success: false, message: 'Invalid package' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: pkg.name },
          unit_amount: Math.round(pkg.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        packageType,
        credits: pkg.credits.toString(),
        userId
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/payment/packages', (req, res) => {
  const packages = {
    starter: { id: 'starter', name: 'Pack Starter', credits: 10, price: 9.99, popular: false },
    standard: { id: 'standard', name: 'Pack Standard', credits: 50, price: 39.99, popular: true },
    premium: { id: 'premium', name: 'Pack Premium', credits: 100, price: 69.99, popular: false }
  };
  res.json({ success: true, packages });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
