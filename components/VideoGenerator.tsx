'use client';

import { useState } from 'react';
import { SoraVideoRequest } from '@/types';
import { SoraVideoAPI } from '@/lib/api';
import { Loader2, Video } from 'lucide-react';

interface VideoGeneratorProps {
  onVideoGenerated: (videoId: string) => void;
}

export default function VideoGenerator({ onVideoGenerated }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
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

  const isApiConfigError =
    error?.toLowerCase().includes('api key') || error?.toLowerCase().includes('configured');

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-white/80 mb-3">
            Describe your video
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A serene sunset over the ocean with gentle waves, cinematic lighting..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent resize-none"
            rows={4}
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">Orientation</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              disabled={isGenerating}
              className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                aspectRatio === '16:9'
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              Landscape (1280x720)
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              disabled={isGenerating}
              className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                aspectRatio === '9:16'
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              Portrait (720x1280)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
            {isApiConfigError && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg text-xs text-white/50">
                <p className="font-medium mb-2 text-white/70">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Copy .env.example to .env.local</li>
                  <li>Add your OpenAI API key to OPENAI_API_KEY</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-4 px-6 bg-violet-500 text-white font-medium rounded-xl hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span>Generate Video</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
