'use client';

import { useState, useEffect } from 'react';
import { GenerationProgress } from '@/types';
import { SoraVideoAPI } from '@/lib/api';

interface ProgressTrackerProps {
  videoId: string;
  onComplete: () => void;
}

export default function ProgressTracker({ videoId, onComplete }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    let isCancelled = false;

    const fetchProgress = async () => {
      if (isCancelled) return;
      
      try {
        const response = await SoraVideoAPI.getProgress(videoId);
        
        if (isCancelled) return;
        
        if (response.success && response.data) {
          setProgress(response.data);
          
          if (response.data.status === 'completed') {
            onComplete();
            isCancelled = true;
          } else if (response.data.status === 'failed') {
            setError('Video generation failed');
            isCancelled = true;
          }
        } else {
          setError(response.error || 'Failed to fetch progress');
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        }
      }
    };

    // Initial fetch
    fetchProgress();

    // Set up polling
    const interval = setInterval(fetchProgress, 1000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [videoId, onComplete]);

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="backdrop-blur-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-2xl shadow-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center">
                  <svg className="h-8 w-8 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                  Video Generation Failed
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                  {error}
                </p>
                <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Please try again with a different prompt or check your API configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-600 dark:border-purple-400 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Initializing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Preparing your video generation...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: GenerationProgress['status']) => {
    switch (status) {
      case 'pending': return { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600', ring: 'ring-gray-400' };
      case 'processing': return { bg: 'bg-blue-600', gradient: 'from-purple-500 via-blue-500 to-indigo-500', ring: 'ring-blue-400' };
      case 'completed': return { bg: 'bg-green-500', gradient: 'from-green-400 to-emerald-600', ring: 'ring-green-400' };
      case 'failed': return { bg: 'bg-red-500', gradient: 'from-red-400 to-red-600', ring: 'ring-red-400' };
      default: return { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600', ring: 'ring-gray-400' };
    }
  };

  const statusColors = getStatusColor(progress.status);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className={`bg-gradient-to-r ${statusColors.gradient} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                {progress.status === 'processing' ? (
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 border-3 border-white/30 rounded-full"></div>
                    <div className="absolute inset-0 border-3 border-white rounded-full animate-spin border-t-transparent"></div>
                  </div>
                ) : (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {progress.status === 'processing' ? 'Creating Your Video' : 'Video Generation'}
                </h3>
                <p className="text-white/90 text-sm">
                  {progress.currentStep}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="px-3 py-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-sm rounded-full">
                {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {progress.progress}%
              </span>
            </div>

            <div className="relative w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${statusColors.gradient} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                style={{ width: `${progress.progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {progress.estimatedTimeRemaining && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Estimated Time Remaining</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.ceil(progress.estimatedTimeRemaining)} seconds
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="relative w-2 h-2">
              <div className={`absolute inset-0 ${statusColors.bg} rounded-full animate-ping opacity-75`}></div>
              <div className={`relative ${statusColors.bg} rounded-full w-2 h-2`}></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {progress.status === 'processing' ? 'AI is working its magic...' : 'Processing your request...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}