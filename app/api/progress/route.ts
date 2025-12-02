import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, GenerationProgress } from '@/types';

// SoraV2 API configuration
const SORA_API_KEY = process.env.SORA_V2_API_KEY;
const SORA_API_ENDPOINT = process.env.SORA_V2_API_ENDPOINT || 'https://api.sora.v2/v1';

if (!SORA_API_KEY) {
  console.warn('WARNING: SORA_V2_API_KEY environment variable is not set');
}

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

    // Validate API key
    if (!SORA_API_KEY) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'SoraV2 API key is not configured' },
        { status: 500 }
      );
    }

    // Get progress from SoraV2 API
    const progress = await getProgressFromSoraV2(videoId);

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

async function getProgressFromSoraV2(videoId: string): Promise<GenerationProgress> {
  try {
    const response = await fetch(`${SORA_API_ENDPOINT}/videos/${videoId}/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SORA_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Video not found');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`SoraV2 API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Transform SoraV2 response to our internal format
    return {
      id: data.id,
      progress: data.progress || 0,
      status: data.status,
      currentStep: data.current_step,
      estimatedTimeRemaining: data.estimated_time_remaining,
    };
  } catch (error) {
    console.error('Error getting progress from SoraV2:', error);
    throw error;
  }
}