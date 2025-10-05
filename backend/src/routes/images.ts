import { Router } from 'express';
import { imageController, generateTextToImage, generateImageToVideo } from '../controllers/imageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticate, imageController.generateImage.bind(imageController));
router.post('/text-to-image', authenticate, generateTextToImage);
router.post('/image-to-video', authenticate, generateImageToVideo);
router.get('/history', authenticate, imageController.getHistory.bind(imageController));

export default router;
