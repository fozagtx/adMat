import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, GenerationProgress } from '@/types';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = 'https://api.openai.com/v1';

if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY environment variable is not set');
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
    if (!OPENAI_API_KEY) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'OpenAI API key is not configured' },
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Map Sora API status to our internal status
function mapSoraStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
  const statusMap: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {
    'queued': 'pending',
    'in_progress': 'processing',
    'processing': 'processing',
    'succeeded': 'completed',
    'completed': 'completed',
    'failed': 'failed',
    'cancelled': 'failed',
  };
  return statusMap[status] || 'pending';
}

async function getProgressFromSoraV2(videoId: string): Promise<GenerationProgress> {
  try {
    // Sora API uses the same endpoint for status - we derive progress from status
    const response = await fetch(`${OPENAI_API_BASE}/videos/generations/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Video not found');
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || response.statusText;
      throw new Error(`Sora API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();

    // Map status to progress percentage
    const statusToProgress: Record<string, number> = {
      'queued': 0,
      'in_progress': 50,
      'processing': 50,
      'succeeded': 100,
      'completed': 100,
      'failed': 0,
    };

    // Transform Sora API response to our internal format
    return {
      id: data.id,
      progress: data.progress || statusToProgress[data.status] || 0,
      status: mapSoraStatus(data.status),
      currentStep: data.current_step || data.status,
      estimatedTimeRemaining: data.estimated_time_remaining,
    };
  } catch (error) {
    console.error('Error getting progress from Sora API:', error);
    throw error;
  }
}