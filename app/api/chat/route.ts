import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS, ChatResponse, ApiResponse } from '@/types';

const HYPERBOLIC_API_KEY = process.env.HYPERBOLIC_API_KEY;

if (!HYPERBOLIC_API_KEY) {
  console.warn('WARNING: HYPERBOLIC_API_KEY environment variable is not set');
}

interface ChatRequestBody {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    image?: string;
  }>;
  image?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { model: modelId, messages } = body;

    // Validate request
    if (!messages || messages.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Find the model configuration
    const modelConfig = AI_MODELS.find((m) => m.id === modelId);
    if (!modelConfig) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    // Check if it's a video model (not supported for chat)
    if (modelConfig.type === 'video') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Video models are not supported for chat' },
        { status: 400 }
      );
    }

    // Validate API key
    if (!HYPERBOLIC_API_KEY) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Hyperbolic API key is not configured' },
        { status: 500 }
      );
    }

    // Build the messages array for the API
    const apiMessages = messages.map((msg) => {
      // If model supports images and message has an image
      if (modelConfig.supportsImage && msg.image) {
        return {
          role: msg.role,
          content: [
            {
              type: 'text',
              text: msg.content || 'What is in this image?',
            },
            {
              type: 'image_url',
              image_url: {
                url: msg.image,
              },
            },
          ],
        };
      }
      // Text only message
      return {
        role: msg.role,
        content: msg.content,
      };
    });

    // Call Hyperbolic API
    const response = await fetch(modelConfig.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HYPERBOLIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: apiMessages,
        max_tokens: modelConfig.defaultParams.max_tokens,
        temperature: modelConfig.defaultParams.temperature,
        top_p: modelConfig.defaultParams.top_p,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Hyperbolic API error:', errorData);
      throw new Error(
        `API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json<ApiResponse<ChatResponse['data']>>({
      success: true,
      data: {
        content,
        model: modelId,
      },
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
