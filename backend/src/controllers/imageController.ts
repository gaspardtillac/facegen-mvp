import { Request, Response } from 'express';
import prisma from '../config/database';
import { geminiService } from '../services/geminiService';

export class ImageController {
  async generateImage(req: Request, res: Response) {
    try {
      const { prompt, imageBase64, mimeType } = req.body;
      const user = req.user!;

      if (!prompt || !imageBase64 || !mimeType) {
        return res.status(400).json({
          success: false,
          message: 'Prompt, image et type MIME requis'
        });
      }

      if (user.credits <= 0) {
        return res.status(403).json({
          success: false,
          message: 'Crédits insuffisants'
        });
      }

      // Génération de l'image
      const result = await geminiService.generateImage(prompt, imageBase64, mimeType);
      
      if (!result.success || !result.imageUrl) {
        return res.status(500).json({
          success: false,
          message: result.error || 'Erreur lors de la génération'
        });
      }

      // Transaction pour décrémenter les crédits et sauvegarder l'historique
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Décrémenter les crédits
        const user = await tx.user.update({
          where: { id: req.user!.id },
          data: { credits: { decrement: 1 } },
          select: { id: true, credits: true }
        });

        // Sauvegarder dans l'historique
        await tx.imageHistory.create({
          data: {
            userId: user.id,
            prompt,
            imageUrl: result.imageUrl!
          }
        });

        return user;
      });

      res.json({
        success: true,
        imageUrl: result.imageUrl,
        creditsRemaining: updatedUser.credits,
        message: 'Image générée avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const user = req.user!;

      const history = await prisma.imageHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          prompt: true,
          imageUrl: true,
          createdAt: true
        }
      });

      res.json({
        success: true,
        history
      });

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

export const imageController = new ImageController();
