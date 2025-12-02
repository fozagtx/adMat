import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

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

    // In a real implementation, you would fetch the video from storage or database
    // For now, we'll redirect to a mock video URL
    const mockVideoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
    
    // Redirect to the video file for download
    return NextResponse.redirect(mockVideoUrl);

  } catch (error) {
    console.error('Error downloading video:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}