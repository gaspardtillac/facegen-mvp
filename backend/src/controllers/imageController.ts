import { Request, Response } from 'express';
import prisma from '../config/database';
import { textToImageService } from '../services/textToImageService';
import { avatarService } from '../services/avatarService';

export class ImageController {
  async generateImage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      
      const { prompt, imageBase64, mimeType } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt required' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.credits < 1) {
        return res.status(400).json({ success: false, message: 'Insufficient credits' });
      }

      const result = imageBase64 && mimeType
        ? await avatarService.generateWithFace(prompt, imageBase64, mimeType)
        : await textToImageService.generateImage(prompt);

      if (result.success) {
        await prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } }
        });

        await prisma.imageHistory.create({
          data: {
            userId,
            prompt,
            imageUrl: result.imageUrl || ''
          }
        });

        return res.json({ success: true, imageUrl: result.imageUrl, credits: user.credits - 1 });
      }

      return res.status(500).json({ success: false, message: result.error });
    } catch (error) {
      console.error('Error generating image:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const history = await prisma.imageHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      return res.json({ success: true, history });
    } catch (error) {
      console.error('Error fetching history:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

export const imageController = new ImageController();

export const generateTextToImage = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!prompt?.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < 1) {
      return res.status(400).json({ success: false, message: 'Insufficient credits' });
    }

    const result = await textToImageService.generateImage(prompt);

    if (result.success) {
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      });

      await prisma.imageHistory.create({
        data: { userId, prompt, imageUrl: result.imageUrl || '' }
      });

      return res.json({ success: true, imageUrl: result.imageUrl, credits: user.credits - 1 });
    }

    return res.status(500).json({ success: false, message: result.error });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const generateImageToVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { imageUrl, imageBase64, mimeType, prompt } = req.body;
    
    if ((!imageUrl && !imageBase64) || !prompt) {
      return res.status(400).json({ success: false, message: 'Image and prompt required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < 5) {
      return res.status(400).json({ success: false, message: 'Insufficient credits' });
    }

    return res.json({ success: true, message: 'Video generation started' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
