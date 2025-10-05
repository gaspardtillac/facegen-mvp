"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const klingService_1 = require("../services/klingService");
const prisma = new client_1.PrismaClient();
async function checkPendingTasks() {
    try {
        const pendingTasks = await prisma.videoTask.findMany({
            where: {
                status: { in: ['pending', 'processing'] }
            },
            take: 10
        });
        for (const task of pendingTasks) {
            try {
                const result = await klingService_1.klingService.getTaskStatus(task.taskId);
                if (!result.success) {
                    console.error(`Error checking task ${task.taskId}:`, result.error);
                    continue;
                }
                if (result.status === 'completed' && result.videoUrl) {
                    await prisma.videoTask.update({
                        where: { id: task.id },
                        data: {
                            status: 'completed',
                            videoUrl: result.videoUrl
                        }
                    });
                    await prisma.imageHistory.create({
                        data: {
                            userId: task.userId,
                            prompt: task.prompt,
                            imageUrl: result.videoUrl
                        }
                    });
                    console.log(`Video ${task.taskId} completed`);
                }
                else if (result.status === 'failed') {
                    await prisma.videoTask.update({
                        where: { id: task.id },
                        data: { status: 'failed' }
                    });
                    console.log(`Video ${task.taskId} failed`);
                }
            }
            catch (error) {
                console.error(`Error checking task ${task.taskId}:`, error);
            }
        }
    }
    catch (error) {
        console.error('Worker error:', error);
    }
}
setInterval(checkPendingTasks, 60000);
checkPendingTasks();
console.log('Video worker started');
