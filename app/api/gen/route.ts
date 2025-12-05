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
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
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
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function callSoraV2API(request: SoraVideoRequest): Promise<SoraVideoResponse> {
  try {
    const response = await fetch(`${OPENAI_API_BASE}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt.trim(),
        duration: request.duration || 10,
        resolution: request.resolution || '1080p',
        style: request.style || 'realistic',
        aspect_ratio: request.aspectRatio || '16:9',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`SoraV2 API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Transform SoraV2 response to our internal format
    return {
      id: data.id,
      status: data.status,
      prompt: data.prompt,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      resolution: data.resolution,
      style: data.style,
      aspectRatio: data.aspect_ratio,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      error: data.error,
    };
  } catch (error) {
    console.error('Error calling SoraV2 API:', error);
    throw error;
  }
}

async function getVideoStatusFromSoraV2(videoId: string): Promise<SoraVideoResponse> {
  try {
    const response = await fetch(`${OPENAI_API_BASE}/videos/${videoId}`, {
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
      throw new Error(`SoraV2 API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Transform SoraV2 response to our internal format
    return {
      id: data.id,
      status: data.status,
      prompt: data.prompt,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      duration: data.duration,
      resolution: data.resolution,
      style: data.style,
      aspectRatio: data.aspect_ratio,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      error: data.error,
    };
  } catch (error) {
    console.error('Error getting video status from SoraV2:', error);
    throw error;
  }
}