import { NextRequest, NextResponse } from 'next/server';
import { SoraVideoRequest, SoraVideoResponse, ApiResponse } from '@/types';

// Mock storage for generated videos (in production, this would be a database)
const videoStore = new Map<string, SoraVideoResponse>();

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

    // Generate unique ID for the video
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create initial video response
    const videoResponse: SoraVideoResponse = {
      id: videoId,
      status: 'pending',
      prompt: body.prompt.trim(),
      duration: body.duration || 10,
      resolution: body.resolution || '1080p',
      style: body.style || 'realistic',
      aspectRatio: body.aspectRatio || '16:9',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in mock database
    videoStore.set(videoId, videoResponse);

    // Start video generation process
    startVideoGeneration(videoId);

    return NextResponse.json<ApiResponse<SoraVideoResponse>>({
      success: true,
      data: videoResponse,
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

    if (!videoId) {
      // Return all videos if no specific ID is provided
      const allVideos = Array.from(videoStore.values());
      return NextResponse.json<ApiResponse<SoraVideoResponse[]>>({
        success: true,
        data: allVideos
      });
    }

    // Return specific video
    const video = videoStore.get(videoId);
    if (!video) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<SoraVideoResponse>>({
      success: true,
      data: video
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function startVideoGeneration(videoId: string) {
  try {
    // Simulate video generation process
    // In production, this would call the actual Sora API
    
    // Update status to processing
    await updateVideoStatus(videoId, 'processing');

    // Simulate processing time (2-5 seconds)
    const processingTime = Math.random() * 3000 + 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Generate mock video URLs
    const mockVideoUrl = `https://example.com/videos/${videoId}.mp4`;
    const mockThumbnailUrl = `https://example.com/videos/${videoId}.jpg`;

    // Update to completed status
    const video = videoStore.get(videoId);
    if (video) {
      video.status = 'completed';
      video.videoUrl = mockVideoUrl;
      video.thumbnailUrl = mockThumbnailUrl;
      video.updatedAt = new Date().toISOString();
      videoStore.set(videoId, video);
    }

  } catch (error) {
    console.error('Error in video generation process:', error);
    // Update status to failed
    await updateVideoStatus(videoId, 'failed', 'Video generation failed');
  }
}

async function updateVideoStatus(videoId: string, status: SoraVideoResponse['status'], error?: string) {
  const video = videoStore.get(videoId);
  if (video) {
    video.status = status;
    video.updatedAt = new Date().toISOString();
    if (error) {
      video.error = error;
    }
    videoStore.set(videoId, video);
  }
}