import { Router } from 'express';
import { imageController } from '../controllers/imageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/generate', imageController.generateImage.bind(imageController));
router.get('/history', authenticate, imageController.getHistory.bind(imageController));

export default router;
