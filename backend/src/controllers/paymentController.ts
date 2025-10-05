import { Request, Response } from 'express';

export class PaymentController {
  async createCheckoutSession(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

export const paymentController = new PaymentController();
