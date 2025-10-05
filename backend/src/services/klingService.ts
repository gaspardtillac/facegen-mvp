export const klingService = {
  async createVideoTask(imageUrl: string, prompt: string) {
    try {
      const response = await fetch('https://api.klingai.com/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.KLING_ACCESS_KEY_ID}`
        },
        body: JSON.stringify({ imageUrl, prompt })
      });

      const data: any = await response.json();

      if (!response.ok) {
        return { success: false, error: data?.message || 'Unknown error' };
      }

      const taskId = data?.data?.task_id;
      if (!taskId) {
        return { success: false, error: 'No task ID returned' };
      }

      return { success: true, taskId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getTaskStatus(taskId: string) {
    try {
      const response = await fetch(`https://api.klingai.com/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.KLING_ACCESS_KEY_ID}`
        }
      });

      const data: any = await response.json();
      const status = data?.data?.task_status;

      if (status === 'completed') {
        const videoUrl = data?.data?.task_result?.videos?.[0]?.url;
        return { success: true, status, videoUrl };
      }

      return { success: true, status };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
