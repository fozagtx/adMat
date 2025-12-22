'use client';

import { useState } from 'react';
import {
  VideoGenerator,
  ProgressTracker,
  VideoGallery,
  Sidebar,
  ChatPlayground,
} from '@/components';
import { AI_MODELS, AIModel } from '@/types';

export default function Home() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [galleryRefresh, setGalleryRefresh] = useState(0);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [activeView, setActiveView] = useState<'video' | 'chat'>('video');

  const handleVideoGenerated = (videoId: string) => {
    setCurrentVideoId(videoId);
    setShowProgress(true);
  };

  const handleGenerationComplete = () => {
    setShowProgress(false);
    setCurrentVideoId(null);
    setGalleryRefresh((prev) => prev + 1);
  };

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
  };

  const handleViewChange = (view: 'video' | 'chat') => {
    setActiveView(view);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        selectedModel={selectedModel}
        onModelSelect={handleModelSelect}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'video' ? (
          <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950 relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-float-delayed"></div>
              <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-float"></div>
            </div>

            <div className="container mx-auto py-12 px-4 relative z-10">
              <header className="text-center mb-16">
                <div className="inline-flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                    <svg
                      className="w-9 h-9 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="text-6xl font-black mb-6">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Sora 2
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {' '}
                    Video Studio
                  </span>
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
                  Transform your ideas into stunning videos with AI-powered
                  generation.
                  <br />
                  <span className="text-base text-gray-600 dark:text-gray-400">
                    Simply describe your vision and watch it come to life in
                    seconds.
                  </span>
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                  <div className="px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-800 shadow-sm">
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      $0.10/sec
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-blue-200 dark:border-blue-800 shadow-sm">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      720p/1280p
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                      With Audio
                    </span>
                  </div>
                </div>
              </header>

              <main className="space-y-12">
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

              <footer className="mt-20 text-center">
                <div className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Powered by Sora 2 AI
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Next-generation video synthesis technology
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
                  2024 AI Studio All videos generated are for demonstration
                  purposes
                </p>
              </footer>
            </div>
          </div>
        ) : (
          <ChatPlayground model={selectedModel} />
        )}
      </div>
    </div>
  );
}
