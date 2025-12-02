export interface SoraVideoRequest {
  prompt: string;
  duration?: number;
  resolution?: '720p' | '1080p' | '4k';
  style?: 'realistic' | 'cinematic' | 'animated' | 'artistic';
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface SoraVideoResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  resolution?: string;
  style?: string;
  aspectRatio?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface SoraVideoGeneration {
  id: string;
  prompt: string;
  status: SoraVideoResponse['status'];
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  metadata: {
    duration?: number;
    resolution?: string;
    fileSize?: number;
    format?: string;
  };
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerationProgress {
  id: string;
  progress: number;
  status: SoraVideoResponse['status'];
  currentStep?: string;
  estimatedTimeRemaining?: number;
}