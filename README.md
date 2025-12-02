# SoraV2 Video Generator

A Next.js 16 application for generating AI-powered videos using SoraV2 API. This project provides a complete frontend and API solution for video generation with TypeScript support and download functionality.

## Features

- **Video Generation**: Generate videos from text prompts using SoraV2 AI
- **Real-time Progress Tracking**: Monitor generation progress with live updates from SoraV2
- **Video Gallery**: View all generated videos in a responsive gallery
- **Download Support**: Download generated videos directly from SoraV2 storage
- **TypeScript Support**: Full TypeScript implementation with proper type definitions
- **Dark Mode**: Built-in dark mode support
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom React components
- **API**: Next.js API routes with SoraV2 integration
- **Image Optimization**: Next.js Image component

## Prerequisites

Before using this application, you need:

1. **SoraV2 API Key**: Obtain your API key from the SoraV2 dashboard
2. **Node.js**: Version 18 or higher
3. **npm or yarn**: Package manager

## Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your environment variables:**
   ```env
   SORA_V2_API_KEY=your_sora_v2_api_key_here
   SORA_V2_API_ENDPOINT=https://api.sora.v2/v1
   ```

   The `SORA_V2_API_KEY` is required. The `SORA_V2_API_ENDPOINT` defaults to the official SoraV2 API endpoint if not specified.

## Project Structure

```
sora/
├── app/
│   ├── api/
│   │   ├── gen/           # Video generation API
│   │   ├── download/      # Video download API
│   │   └── progress/      # Progress tracking API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── VideoGenerator.tsx # Video generation form
│   ├── ProgressTracker.tsx # Progress tracking component
│   ├── VideoGallery.tsx   # Video gallery component
│   └── index.ts           # Component exports
├── lib/
│   └── api.ts             # API client utilities
├── types/
│   ├── sora.ts            # Sora-specific types
│   └── index.ts           # Type exports
├── public/                # Static assets
└── README.md
```

## API Endpoints

### POST /api/gen
Generate a new video from a text prompt.

**Request Body:**
```typescript
{
  prompt: string;
  duration?: number;
  resolution?: '720p' | '1080p' | '4k';
  style?: 'realistic' | 'cinematic' | 'animated' | 'artistic';
  aspectRatio?: '16:9' | '9:16' | '1:1';
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    prompt: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    // ... other metadata
  };
  error?: string;
}
```

### GET /api/progress?id={videoId}
Get the progress of a video generation request.

### GET /api/download?id={videoId}
Download a generated video.

### GET /api/gen?id={videoId}
Get details of a specific video (or all videos if no ID is provided).

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your SoraV2 API key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Usage

1. **Generate a Video:**
   - Enter a descriptive prompt in the text area
   - Configure optional settings (duration, resolution, style, aspect ratio)
   - Click "Generate Video" to start the process

2. **Track Progress:**
   - View real-time progress updates
   - See current processing step and estimated time remaining

3. **View and Download:**
   - Browse all generated videos in the gallery
   - Click "View" to watch the video
   - Click "Download" to save it to your device

## TypeScript Types

The project includes comprehensive TypeScript types for type safety:

- `SoraVideoRequest` - Video generation request parameters
- `SoraVideoResponse` - Video generation response data
- `GenerationProgress` - Progress tracking information
- `ApiResponse` - Standardized API response format

## Development Notes

- This application integrates directly with the SoraV2 API for video generation
- All video processing and storage is handled by SoraV2 infrastructure
- API calls are authenticated using Bearer tokens
- The application supports both light and dark themes
- Error handling includes proper API error responses from SoraV2

## API Integration Details

### SoraV2 API Endpoints Used

1. **Video Generation**: `POST /v1/generate`
   - Submits video generation requests to SoraV2
   - Returns video ID and initial status

2. **Video Status**: `GET /v1/videos/{id}`
   - Retrieves current video status and metadata
   - Returns video URLs when generation is complete

3. **Progress Tracking**: `GET /v1/videos/{id}/progress`
   - Real-time progress updates during generation
   - Includes current step and estimated time remaining

4. **Download**: `GET /v1/videos/{id}/download`
   - Generates temporary download URLs for completed videos
   - Redirects to actual video file storage

### Error Handling

The application handles various SoraV2 API errors:
- Authentication failures (401/403)
- Rate limiting (429)
- Invalid requests (400)
- Video not found (404)
- Server errors (500)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is for demonstration purposes. Please check the license file for more information.