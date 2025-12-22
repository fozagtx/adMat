'use client';

import { useState } from 'react';
import {
  VideoGenerator,
  ProgressTracker,
  VideoGallery,
  Sidebar,
  ChatPlayground,
} from '@/components';

type NavItem = 'playground' | 'video' | 'courses' | 'profiles' | 'tools';

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavItem>('playground');
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
    setGalleryRefresh((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="flex-1 overflow-hidden">
        {activeNav === 'playground' && <ChatPlayground />}

        {activeNav === 'video' && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto py-12 px-6">
              <header className="text-center mb-12">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/10 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Video Studio</h1>
                <p className="text-white/50 max-w-md mx-auto">
                  Generate videos from text prompts using Sora 2
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                    $0.10/sec
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                    720p / 1280p
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                    With Audio
                  </span>
                </div>
              </header>

              {!showProgress ? (
                <VideoGenerator onVideoGenerated={handleVideoGenerated} />
              ) : currentVideoId ? (
                <ProgressTracker
                  videoId={currentVideoId}
                  onComplete={handleGenerationComplete}
                />
              ) : null}

              <div className="mt-12">
                <VideoGallery refreshTrigger={galleryRefresh} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
