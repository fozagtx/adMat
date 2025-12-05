import { NextRequest, NextResponse } from 'next/server';
import { SoraVideoRequest, SoraVideoResponse, ApiResponse } from '@/types';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = 'https://api.openai.com/v1';

if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY environment variable is not set');
}

export async function POST(request: NextRequest) {
  try {
    const body: SoraVideoRequest = await request.json();

    // Validate request
    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Prompt is required and must be a non-empty string' },
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

    // Call SoraV2 API to generate video
    const soraResponse = await callSoraV2API(body);

    return NextResponse.json<ApiResponse<SoraVideoResponse>>({
      success: true,
      data: soraResponse,
      message: 'Video generation started successfully'
    });

  } catch (error) {
    console.error('Error in video generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!OPENAI_API_KEY) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    if (!videoId) {
      // SoraV2 API doesn't support listing all videos
      // Return empty array with explanation
      return NextResponse.json<ApiResponse<SoraVideoResponse[]>>({
        success: true,
        data: [],
        message: 'SoraV2 API does not support listing all videos. Please use specific video IDs to retrieve individual videos.'
      });
    }

    // Get video status from SoraV2 API
    const videoStatus = await getVideoStatusFromSoraV2(videoId);

    return NextResponse.json<ApiResponse<SoraVideoResponse>>({
      success: true,
      data: videoStatus
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

async function callSoraV2API(request: SoraVideoRequest): Promise<SoraVideoResponse> {
  try {
    // Map resolution to size format expected by Sora API
    const sizeMap: Record<string, string> = {
      '720p': '1280x720',
      '1080p': '1920x1080',
      '4k': '3840x2160',
    };

    // Map aspect ratio to size adjustments
    const aspectRatioSizeMap: Record<string, Record<string, string>> = {
      '16:9': { '720p': '1280x720', '1080p': '1920x1080', '4k': '3840x2160' },
      '9:16': { '720p': '720x1280', '1080p': '1080x1920', '4k': '2160x3840' },
      '1:1': { '720p': '720x720', '1080p': '1080x1080', '4k': '2160x2160' },
    };

    const resolution = request.resolution || '1080p';
    const aspectRatio = request.aspectRatio || '16:9';
    const size = aspectRatioSizeMap[aspectRatio]?.[resolution] || sizeMap[resolution] || '1920x1080';

    const response = await fetch(`${OPENAI_API_BASE}/videos/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sora',
        prompt: request.prompt.trim(),
        size: size,
        duration: request.duration || 10,
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || response.statusText;
      throw new Error(`Sora API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();

    // Handle Sora API response format (returns data array for generations)
    const videoData = data.data?.[0] || data;

    // Transform Sora API response to our internal format
    return {
      id: videoData.id,
      status: mapSoraStatus(videoData.status),
      prompt: request.prompt.trim(),
      videoUrl: videoData.url || videoData.video_url,
      thumbnailUrl: videoData.thumbnail_url,
      duration: request.duration || 10,
      resolution: request.resolution || '1080p',
      style: request.style || 'realistic',
      aspectRatio: request.aspectRatio || '16:9',
      createdAt: videoData.created_at || new Date().toISOString(),
      updatedAt: videoData.updated_at || new Date().toISOString(),
      error: videoData.error,
    };
  } catch (error) {
    console.error('Error calling Sora API:', error);
    throw error;
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

async function getVideoStatusFromSoraV2(videoId: string): Promise<SoraVideoResponse> {
  try {
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

    // Transform Sora API response to our internal format
    return {
      id: data.id,
      status: mapSoraStatus(data.status),
      prompt: data.prompt || '',
      videoUrl: data.url || data.video_url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      resolution: data.resolution,
      style: data.style,
      aspectRatio: data.aspect_ratio,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
      error: data.error,
    };
  } catch (error) {
    console.error('Error getting video status from Sora API:', error);
    throw error;
  }
}