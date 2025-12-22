'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AI_MODELS, AIModel } from '@/types';
import {
  Send,
  Upload,
  Link,
  Mic,
  ChevronDown,
  X,
  Loader2,
  Bot,
  User,
  Image as ImageIcon,
  FileText,
  Check,
} from 'lucide-react';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

const chatModels = AI_MODELS.filter((m) => m.type !== 'video');

export default function ChatPlayground() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(chatModels[0]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; data: string; type: string }[]>(
    []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(e.target as Node)) {
        setShowModelSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith('image/') && selectedModel.supportsImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachedFiles((prev) => [
            ...prev,
            { name: file.name, data: reader.result as string, type: 'image' },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && attachedFiles.length === 0) return;

    const imageFile = attachedFiles.find((f) => f.type === 'image');
    const userMessage: DisplayMessage = {
      role: 'user',
      content: input.trim(),
      image: imageFile?.data,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          })),
          image: userMessage.image,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.data.content }]);
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Prompt Playground</h2>
            <p className="text-white/50 text-center max-w-md text-sm">
              Select a model and start chatting. Upload images with vision models for analysis.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn('flex gap-4', message.role === 'user' ? 'flex-row-reverse' : '')}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    message.role === 'user'
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-white/10 text-white/60'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'flex-1 max-w-[80%]',
                    message.role === 'user' ? 'text-right' : ''
                  )}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attached"
                      className="max-w-xs rounded-lg mb-2 inline-block"
                    />
                  )}
                  <div
                    className={cn(
                      'inline-block px-4 py-3 rounded-2xl text-sm',
                      message.role === 'user'
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/5 text-white/90 border border-white/10'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white/60" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Drop Zone - Only show for vision models */}
          {selectedModel.supportsImage && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'mb-4 border-2 border-dashed rounded-xl p-6 text-center transition-colors',
                isDragging
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <p className="text-violet-400 font-medium mb-1">Drop anything here or browse</p>
              <p className="text-white/40 text-sm mb-4">Images for vision analysis</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center hover:bg-violet-500/30 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center hover:bg-violet-500/30 transition-colors">
                  <Link className="w-5 h-5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                >
                  {file.type === 'image' ? (
                    <img src={file.data} alt={file.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <FileText className="w-4 h-4 text-white/60" />
                  )}
                  <span className="text-sm text-white/80 max-w-[100px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Input */}
          <div className="bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 p-3 border-b border-white/5">
              {/* Model Selector */}
              <div ref={modelSelectorRef} className="relative">
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white/80 transition-colors"
                >
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span>{selectedModel.name}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-white/40 transition-transform',
                      showModelSelector && 'rotate-180'
                    )}
                  />
                </button>

                {showModelSelector && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#141414] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-2 border-b border-white/5">
                      <p className="text-xs text-white/40 px-2">Select Model</p>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {chatModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setShowModelSelector(false);
                            setAttachedFiles([]);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                            selectedModel.id === model.id
                              ? 'bg-violet-500/20 text-white'
                              : 'text-white/70 hover:bg-white/5'
                          )}
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center',
                              selectedModel.id === model.id
                                ? 'bg-violet-500/30 text-violet-400'
                                : 'bg-white/10 text-white/40'
                            )}
                          >
                            {model.supportsImage ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{model.name}</div>
                            <div className="text-xs text-white/40 truncate">{model.provider}</div>
                          </div>
                          {selectedModel.id === model.id && (
                            <Check className="w-4 h-4 text-violet-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Upload Button - Only for vision models */}
              {selectedModel.supportsImage && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-white/40 hover:text-violet-400 transition-colors"
                  title="Upload image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask a follow-up. Use @ to tag docs or files."
                rows={1}
                className="w-full bg-transparent text-white placeholder:text-white/30 resize-none focus:outline-none text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-3 pt-0">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/60 flex items-center gap-1.5 transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  Generate a document
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                  className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
