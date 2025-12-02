'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SoraVideoResponse } from '@/types';
import { SoraVideoAPI } from '@/lib/api';

interface VideoGalleryProps {
  refreshTrigger?: number;
}

export default function VideoGallery({ refreshTrigger }: VideoGalleryProps) {
  const [videos, setVideos] = useState<SoraVideoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [refreshTrigger]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await SoraVideoAPI.getAllVideos();
      
      if (response.success && response.data) {
        setVideos(response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setError(response.error || 'Failed to fetch videos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (videoId: string) => {
    SoraVideoAPI.downloadVideo(videoId);
  };

  const getStatusBadge = (status: SoraVideoResponse['status']) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading videos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No videos yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate your first video to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Your Videos
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.prompt}
                  width={320}
                  height={180}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                {getStatusBadge(video.status)}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(video.createdAt)}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                {video.prompt}
              </h3>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                <p>Duration: {video.duration}s</p>
                <p>Resolution: {video.resolution}</p>
                <p>Style: {video.style}</p>
                <p>Aspect Ratio: {video.aspectRatio}</p>
              </div>
              
              {video.error && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                  {video.error}
                </div>
              )}
              
              <div className="flex gap-2">
                {video.status === 'completed' && video.videoUrl && (
                  <>
                    <button
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(video.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                    >
                      Download
                    </button>
                  </>
                )}
                
                {video.status === 'processing' && (
                  <button
                    disabled
                    className="w-full px-3 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded cursor-not-allowed"
                  >
                    Processing...
                  </button>
                )}
                
                {video.status === 'pending' && (
                  <button
                    disabled
                    className="w-full px-3 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded cursor-not-allowed"
                  >
                    Pending...
                  </button>
                )}
                
                {video.status === 'failed' && (
                  <button
                    disabled
                    className="w-full px-3 py-2 bg-red-300 text-red-700 text-sm font-medium rounded cursor-not-allowed"
                  >
                    Failed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}