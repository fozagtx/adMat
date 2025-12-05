import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

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

    // Get video download URL from SoraV2 API
    const videoUrl = await getVideoDownloadUrlFromSoraV2(videoId);
    
    // Redirect to the video file for download
    return NextResponse.redirect(videoUrl);

  } catch (error) {
    console.error('Error downloading video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

async function getVideoDownloadUrlFromSoraV2(videoId: string): Promise<string> {
  try {
    // Get video details from Sora API to retrieve the video URL
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

    // Check if video is ready
    if (data.status !== 'succeeded' && data.status !== 'completed') {
      throw new Error(`Video is not ready for download. Current status: ${data.status}`);
    }

    const videoUrl = data.url || data.video_url || data.download_url;
    if (!videoUrl) {
      throw new Error('Video URL not available');
    }

    return videoUrl;
  } catch (error) {
    console.error('Error getting download URL from Sora API:', error);
    throw error;
  }
}