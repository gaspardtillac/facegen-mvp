import { Request, Response } from 'express';
import prisma from '../config/database';
import { textToImageService } from '../services/textToImageService';
import { avatarService } from '../services/avatarService';

export class ImageController {
async generateImage(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 'anonymous';      
      const { prompt, imageBase64, mimeType } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt required' 
});
      }

      const result = imageBase64 && mimeType
        ? await avatarService.generateWithFace(prompt, imageBase64, mimeType)
        : await textToImageService.generateImage(prompt);

      if (result.success) {
        await prisma.imageHistory.create({
          data: {
            userId,
            prompt,
            imageUrl: result.imageUrl || ''
          }
        });

        return res.json({ success: true, imageUrl: result.imageUrl });
      }

      return res.status(500).json({ success: false, message: result.error });
    } catch (error) {
      console.error('Error generating image:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
