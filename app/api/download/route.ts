import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

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

    // Get video download URL from SoraV2 API
    const videoUrl = await getVideoDownloadUrlFromSoraV2(videoId);
    
    // Redirect to the video file for download
    return NextResponse.redirect(videoUrl);

  } catch (error) {
    console.error('Error downloading video:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getVideoDownloadUrlFromSoraV2(videoId: string): Promise<string> {
  try {
    const response = await fetch(`${SORA_API_ENDPOINT}/videos/${videoId}/download`, {
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
    return data.download_url || data.video_url;
  } catch (error) {
    console.error('Error getting download URL from SoraV2:', error);
    throw error;
  }
}