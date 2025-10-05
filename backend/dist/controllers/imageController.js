"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImageToVideo = exports.generateTextToImage = exports.imageController = exports.ImageController = void 0;
const database_1 = __importDefault(require("../config/database"));
const textToImageService_1 = require("../services/textToImageService");
const avatarService_1 = require("../services/avatarService");
class ImageController {
    async generateImage(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Not authenticated' });
            }
            const { prompt, imageBase64, mimeType } = req.body;
            if (!prompt) {
                return res.status(400).json({ success: false, message: 'Prompt required' });
            }
            const user = await database_1.default.user.findUnique({ where: { id: userId } });
            if (!user || user.credits < 1) {
                return res.status(400).json({ success: false, message: 'Insufficient credits' });
            }
            const result = imageBase64 && mimeType
                ? await avatarService_1.avatarService.generateWithFace(prompt, imageBase64, mimeType)
                : await textToImageService_1.textToImageService.generateImage(prompt);
            if (result.success) {
                await database_1.default.user.update({
                    where: { id: userId },
                    data: { credits: { decrement: 1 } }
                });
                await database_1.default.imageHistory.create({
                    data: {
                        userId,
                        prompt,
                        imageUrl: result.imageUrl || ''
                    }
                });
                return res.json({ success: true, imageUrl: result.imageUrl, credits: user.credits - 1 });
            }
            return res.status(500).json({ success: false, message: result.error });
        }
        catch (error) {
            console.error('Error generating image:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
    async getHistory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Not authenticated' });
            }
            const history = await database_1.default.imageHistory.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 20
            });
            return res.json({ success: true, history });
        }
        catch (error) {
            console.error('Error fetching history:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}
exports.ImageController = ImageController;
exports.imageController = new ImageController();
const generateTextToImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        if (!prompt?.trim()) {
            return res.status(400).json({ success: false, message: 'Prompt required' });
        }
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user || user.credits < 1) {
            return res.status(400).json({ success: false, message: 'Insufficient credits' });
        }
        const result = await textToImageService_1.textToImageService.generateImage(prompt);
        if (result.success) {
            await database_1.default.user.update({
                where: { id: userId },
                data: { credits: { decrement: 1 } }
            });
            await database_1.default.imageHistory.create({
                data: { userId, prompt, imageUrl: result.imageUrl || '' }
            });
            return res.json({ success: true, imageUrl: result.imageUrl, credits: user.credits - 1 });
        }
        return res.status(500).json({ success: false, message: result.error });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.generateTextToImage = generateTextToImage;
const generateImageToVideo = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const { imageUrl, imageBase64, mimeType, prompt } = req.body;
        if ((!imageUrl && !imageBase64) || !prompt) {
            return res.status(400).json({ success: false, message: 'Image and prompt required' });
        }
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user || user.credits < 5) {
            return res.status(400).json({ success: false, message: 'Insufficient credits' });
        }
        return res.json({ success: true, message: 'Video generation started' });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.generateImageToVideo = generateImageToVideo;
