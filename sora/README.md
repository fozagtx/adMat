# Sora Video Generator

A Next.js 16 application for generating AI-powered videos using Sora technology. This project provides a complete frontend and API solution for video generation with TypeScript support and download functionality.

## Features

- **Video Generation**: Generate videos from text prompts using AI
- **Real-time Progress Tracking**: Monitor generation progress with live updates
- **Video Gallery**: View all generated videos in a responsive gallery
- **Download Support**: Download generated videos directly to your device
- **TypeScript Support**: Full TypeScript implementation with proper type definitions
- **Dark Mode**: Built-in dark mode support
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom React components
- **API**: Next.js API routes
- **Image Optimization**: Next.js Image component

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

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
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

- The API currently uses mock data for demonstration purposes
- In production, replace the mock implementation with actual Sora API calls
- Video URLs and thumbnails are simulated for demo purposes
- The application supports both light and dark themes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is for demonstration purposes. Please check the license file for more information.