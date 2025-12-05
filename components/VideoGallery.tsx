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
        
        // Show info message if no videos due to API limitation
        if (response.data.length === 0 && response.message) {
          console.info(response.message);
        }
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
        <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 dark:border-purple-400 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Loading your videos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="backdrop-blur-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-2xl shadow-2xl border-2 border-red-300 dark:border-red-700 p-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="backdrop-blur-xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/90 dark:to-blue-900/20 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Videos Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Generate your first AI video to see it here. Your creative journey starts with a single prompt.
            </p>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium mb-1">Note about SoraV2 API</p>
              <p className="text-xs">The SoraV2 API doesn&apos;t support listing all videos. Videos will appear here during active sessions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Your Video Library
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="group backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.prompt}
                  width={384}
                  height={216}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3">
                {getStatusBadge(video.status)}
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                <span className="text-xs font-semibold text-white">
                  {formatDate(video.createdAt).split(',')[0]}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-sm leading-relaxed">
                {video.prompt}
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{video.duration}s</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{video.resolution}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="capitalize">{video.style}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span>{video.aspectRatio}</span>
                </div>
              </div>

              {video.error && (
                <div className="mb-3 p-2.5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
                  {video.error}
                </div>
              )}

              <div className="flex gap-2">
                {video.status === 'completed' && video.videoUrl && (
                  <>
                    <button
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch
                    </button>
                    <button
                      onClick={() => handleDownload(video.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </>
                )}

                {video.status === 'processing' && (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 text-white text-sm font-medium rounded-xl cursor-not-allowed"
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </button>
                )}

                {video.status === 'pending' && (
                  <button
                    disabled
                    className="w-full px-3 py-2.5 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl cursor-not-allowed"
                  >
                    Pending...
                  </button>
                )}

                {video.status === 'failed' && (
                  <button
                    disabled
                    className="w-full px-3 py-2.5 bg-gradient-to-r from-red-500/50 to-orange-500/50 text-white text-sm font-medium rounded-xl cursor-not-allowed"
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