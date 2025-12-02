import { SoraVideoRequest, SoraVideoResponse, ApiResponse, GenerationProgress } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class SoraVideoAPI {
  static async generateVideo(request: SoraVideoRequest): Promise<ApiResponse<SoraVideoResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<SoraVideoResponse> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async getVideo(videoId: string): Promise<ApiResponse<SoraVideoResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gen?id=${encodeURIComponent(videoId)}`);
      const data: ApiResponse<SoraVideoResponse> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async getAllVideos(): Promise<ApiResponse<SoraVideoResponse[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gen`);
      const data: ApiResponse<SoraVideoResponse[]> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch videos');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async getProgress(videoId: string): Promise<ApiResponse<GenerationProgress>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/progress?id=${encodeURIComponent(videoId)}`);
      const data: ApiResponse<GenerationProgress> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch progress');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static getDownloadUrl(videoId: string): string {
    return `${API_BASE_URL}/api/download?id=${encodeURIComponent(videoId)}`;
  }

  static downloadVideo(videoId: string): void {
    const downloadUrl = this.getDownloadUrl(videoId);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `sora-video-${videoId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}