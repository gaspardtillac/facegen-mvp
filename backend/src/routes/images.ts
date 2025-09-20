import { Router } from 'express';
import { imageController } from '../controllers/imageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticate, imageController.generateImage);
router.get('/history', authenticate, imageController.getHistory);

export default router;
