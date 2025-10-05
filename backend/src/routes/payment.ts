import express from 'express';
import { authenticate } from '../middleware/auth';
import { CREDIT_PACKAGES } from '../config/packages';

const router = express.Router();

router.get('/packages', (req, res) => {
  res.json({ success: true, packages: CREDIT_PACKAGES });
});

router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { packageType = 'starter' } = req.body;
    
    const pkg = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];
    if (!pkg) {
      return res.status(400).json({ success: false, message: 'Package not found' });
    }

    res.json({
      success: true,
      url: `https://checkout.stripe.com/pay/test_${packageType}`,
      package: pkg
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating session' 
    });
  }
});

export default router;
