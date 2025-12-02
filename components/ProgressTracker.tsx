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
      <div className="w-full max-w-2xl mx-auto p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Generation Failed
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Initializing...</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: GenerationProgress['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generating Video
          </h3>
          <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(progress.status)}`}>
            {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
          </span>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>{progress.currentStep}</span>
            <span>{progress.progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(progress.status)}`}
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
        </div>

        {progress.estimatedTimeRemaining && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining)}s
          </p>
        )}
      </div>

      <div className="flex items-center justify-center">
        <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${progress.status === 'processing' ? 'border-blue-600' : 'border-gray-400'}`}></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          {progress.status === 'processing' ? 'Processing...' : 'Please wait...'}
        </span>
      </div>
    </div>
  );
}