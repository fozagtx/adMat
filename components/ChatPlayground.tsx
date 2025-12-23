'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AI_MODELS, AIModel } from '@/types';
import Artifact, { ArtifactType } from './Artifact';
import {
  Send,
  Mic,
  ChevronDown,
  X,
  Loader2,
  Bot,
  User,
  Image as ImageIcon,
  FileText,
  Check,
  Code,
  Sparkles,
} from 'lucide-react';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  hasArtifact?: boolean;
  artifactType?: ArtifactType;
  artifactTitle?: string;
  artifactContent?: string;
  artifactLanguage?: string;
}

interface ArtifactData {
  isOpen: boolean;
  type: ArtifactType;
  title: string;
  content: string;
  language?: string;
}

const chatModels = AI_MODELS.filter((m) => m.type !== 'video');

// Helper to detect and extract artifacts from response
function extractArtifact(content: string): { cleanContent: string; artifact: Omit<ArtifactData, 'isOpen'> | null } {
  // Check for code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
  const codeMatch = content.match(codeBlockRegex);

  if (codeMatch) {
    const language = codeMatch[1] || 'code';
    const code = codeMatch[2].trim();
    const cleanContent = content.replace(codeBlockRegex, '[Code generated - click to view]').trim();
    return {
      cleanContent,
      artifact: {
        type: 'code',
        title: `Generated ${language.charAt(0).toUpperCase() + language.slice(1)}`,
        content: code,
        language,
      },
    };
  }

  // Check for profile generation patterns
  const profilePatterns = [/profile:?\s*\n/i, /^(name|title|bio|about):/im];
  for (const pattern of profilePatterns) {
    if (pattern.test(content) && content.length > 200) {
      return {
        cleanContent: 'Profile generated - click to view',
        artifact: {
          type: 'profile',
          title: 'Generated Profile',
          content,
        },
      };
    }
  }

  return { cleanContent: content, artifact: null };
}

export default function ChatPlayground() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(chatModels[0]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; data: string; type: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<ArtifactData>({
    isOpen: false,
    type: 'code',
    title: '',
    content: '',
  });
  const [artifactExpanded, setArtifactExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  const openArtifact = (message: DisplayMessage) => {
    if (message.hasArtifact && message.artifactContent) {
      setArtifact({
        isOpen: true,
        type: message.artifactType || 'text',
        title: message.artifactTitle || 'Generated Content',
        content: message.artifactContent,
        language: message.artifactLanguage,
      });
    }
  };

  const closeArtifact = () => {
    setArtifact((prev) => ({ ...prev, isOpen: false }));
    setArtifactExpanded(false);
  };

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
        const responseContent = data.data.content;
        const { cleanContent, artifact: extractedArtifact } = extractArtifact(responseContent);

        const assistantMessage: DisplayMessage = {
          role: 'assistant',
          content: cleanContent,
        };

        if (extractedArtifact) {
          assistantMessage.hasArtifact = true;
          assistantMessage.artifactType = extractedArtifact.type;
          assistantMessage.artifactTitle = extractedArtifact.title;
          assistantMessage.artifactContent = extractedArtifact.content;
          assistantMessage.artifactLanguage = extractedArtifact.language;

          // Auto-open artifact for generated content
          setArtifact({
            isOpen: true,
            ...extractedArtifact,
          });
        }

        setMessages((prev) => [...prev, assistantMessage]);
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
    <div className={cn(
      'flex flex-col h-full bg-[#0a0a0a] transition-all duration-300',
      artifact.isOpen && !artifactExpanded && 'md:pr-[480px]',
      artifact.isOpen && artifactExpanded && 'md:pr-[66.666667%]'
    )}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
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
          <div className="max-w-3xl mx-auto py-4 px-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                    message.role === 'user'
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-white/10 text-white/60'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>
                <div
                  className={cn(
                    'flex-1 max-w-[85%] min-w-0',
                    message.role === 'user' ? 'text-right' : ''
                  )}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attached"
                      className="max-w-[200px] max-h-[150px] object-contain rounded-lg mb-2 inline-block"
                    />
                  )}
                  <div
                    className={cn(
                      'inline-block px-3 py-2 rounded-xl text-sm',
                      message.role === 'user'
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/5 text-white/90 border border-white/10'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    {message.hasArtifact && (
                      <button
                        onClick={() => openArtifact(message)}
                        className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg text-xs transition-colors"
                      >
                        {message.artifactType === 'code' ? (
                          <Code className="w-3.5 h-3.5" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        View {message.artifactTitle || 'Generated Content'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white/60" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Hidden file input for image upload */}
          {selectedModel.supportsImage && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
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

            <div className="flex items-center justify-end p-3 pt-0">
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

      {/* Artifact Panel */}
      <Artifact
        isOpen={artifact.isOpen}
        onClose={closeArtifact}
        type={artifact.type}
        title={artifact.title}
        content={artifact.content}
        language={artifact.language}
        onExpandChange={setArtifactExpanded}
      />
    </div>
  );
}
