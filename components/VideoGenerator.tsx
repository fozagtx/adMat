'use client';

import { useState } from 'react';
import { SoraVideoRequest } from '@/types';
import { SoraVideoAPI } from '@/lib/api';

interface VideoGeneratorProps {
  onVideoGenerated: (videoId: string) => void;
}

export default function VideoGenerator({ onVideoGenerated }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(10);
  const [resolution, setResolution] = useState<SoraVideoRequest['resolution']>('1080p');
  const [style, setStyle] = useState<SoraVideoRequest['style']>('realistic');
  const [aspectRatio, setAspectRatio] = useState<SoraVideoRequest['aspectRatio']>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const request: SoraVideoRequest = {
      prompt: prompt.trim(),
      duration,
      resolution,
      style,
      aspectRatio,
    };

    try {
      const response = await SoraVideoAPI.generateVideo(request);
      
      if (response.success && response.data) {
        onVideoGenerated(response.data.id);
        setPrompt('');
      } else {
        setError(response.error || 'Failed to generate video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const isApiConfigError = error?.toLowerCase().includes('api key') || error?.toLowerCase().includes('configured');

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Create Your Video
              </h2>
              <p className="text-blue-100 text-sm">Transform your ideas into stunning AI videos</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="prompt" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Describe Your Video
              </span>
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A serene sunset over the ocean with gentle waves, cinematic lighting, 4K quality..."
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200 resize-none placeholder:text-gray-400"
              rows={4}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duration
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="1"
                  max="60"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                  disabled={isGenerating}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">seconds</span>
              </div>
            </div>

            <div>
              <label htmlFor="resolution" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Resolution
                </span>
              </label>
              <select
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value as SoraVideoRequest['resolution'])}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                disabled={isGenerating}
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD</option>
                <option value="4k">4K Ultra HD</option>
              </select>
            </div>

            <div>
              <label htmlFor="style" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Style
                </span>
              </label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value as SoraVideoRequest['style'])}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                disabled={isGenerating}
              >
                <option value="realistic">Realistic</option>
                <option value="cinematic">Cinematic</option>
                <option value="animated">Animated</option>
                <option value="artistic">Artistic</option>
              </select>
            </div>

            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Aspect Ratio
                </span>
              </label>
              <select
                id="aspectRatio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as SoraVideoRequest['aspectRatio'])}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                disabled={isGenerating}
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="relative p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                    {isApiConfigError ? 'API Configuration Required' : 'Error'}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                  {isApiConfigError && (
                    <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                      <p className="font-semibold mb-2">Setup Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-1">
                        <li>Copy <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">.env.example</code> to <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">.env.local</code></li>
                        <li>Add your OpenAI API key to <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">OPENAI_API_KEY</code></li>
                        <li>Restart the development server</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="group relative w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating Your Video...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Generate Video</span>
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}