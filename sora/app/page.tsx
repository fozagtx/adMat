'use client';

import { useState } from 'react';
import { VideoGenerator, ProgressTracker, VideoGallery } from '@/components';

export default function Home() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [galleryRefresh, setGalleryRefresh] = useState(0);

  const handleVideoGenerated = (videoId: string) => {
    setCurrentVideoId(videoId);
    setShowProgress(true);
  };

  const handleGenerationComplete = () => {
    setShowProgress(false);
    setCurrentVideoId(null);
    setGalleryRefresh(prev => prev + 1); // Trigger gallery refresh
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto py-8 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Sora Video Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create stunning videos from text prompts using AI-powered generation.
            Simply describe your vision and watch it come to life.
          </p>
        </header>

        <main className="space-y-8">
          {!showProgress ? (
            <VideoGenerator onVideoGenerated={handleVideoGenerated} />
          ) : currentVideoId ? (
            <ProgressTracker
              videoId={currentVideoId}
              onComplete={handleGenerationComplete}
            />
          ) : null}

          <VideoGallery refreshTrigger={galleryRefresh} />
        </main>

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Sora AI • Generated videos are for demonstration purposes</p>
        </footer>
      </div>
    </div>
  );
}