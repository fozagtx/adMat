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

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Generate Sora Video
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Video Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to generate..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resolution
            </label>
            <select
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value as SoraVideoRequest['resolution'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isGenerating}
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4k">4K</option>
            </select>
          </div>

          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Style
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value as SoraVideoRequest['style'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isGenerating}
            >
              <option value="realistic">Realistic</option>
              <option value="cinematic">Cinematic</option>
              <option value="animated">Animated</option>
              <option value="artistic">Artistic</option>
            </select>
          </div>

          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aspect Ratio
            </label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as SoraVideoRequest['aspectRatio'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isGenerating}
            >
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="1:1">1:1 (Square)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md dark:bg-red-900 dark:border-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Video'}
        </button>
      </form>
    </div>
  );
}