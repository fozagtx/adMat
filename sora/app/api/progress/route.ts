import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, GenerationProgress } from '@/types';

// Mock progress storage (in production, this would be connected to the generation system)
const progressStore = new Map<string, GenerationProgress>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Get or create progress entry
    let progress = progressStore.get(videoId);
    
    if (!progress) {
      progress = {
        id: videoId,
        progress: 0,
        status: 'pending',
        currentStep: 'Initializing...',
        estimatedTimeRemaining: undefined,
      };
      progressStore.set(videoId, progress);
      
      // Start progress simulation
      simulateProgress(videoId);
    }

    return NextResponse.json<ApiResponse<GenerationProgress>>({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function simulateProgress(videoId: string) {
  const steps = [
    { progress: 10, step: 'Processing prompt...', status: 'processing' as const },
    { progress: 30, step: 'Generating storyboard...', status: 'processing' as const },
    { progress: 50, step: 'Creating video frames...', status: 'processing' as const },
    { progress: 75, step: 'Applying effects and transitions...', status: 'processing' as const },
    { progress: 90, step: 'Finalizing video...', status: 'processing' as const },
    { progress: 100, step: 'Complete!', status: 'completed' as const },
  ];

  for (const { progress, step, status } of steps) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate time
    
    const currentProgress = progressStore.get(videoId);
    if (currentProgress) {
      currentProgress.progress = progress;
      currentProgress.currentStep = step;
      currentProgress.status = status;
      currentProgress.estimatedTimeRemaining = progress < 100 ? Math.max(1, (100 - progress) * 0.1) : undefined;
      progressStore.set(videoId, currentProgress);
    }
  }
}