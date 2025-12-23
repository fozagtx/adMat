'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  X,
  Copy,
  Download,
  Check,
  Code,
  FileText,
  User,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export type ArtifactType = 'code' | 'document' | 'profile' | 'text';

interface ArtifactProps {
  isOpen: boolean;
  onClose: () => void;
  type: ArtifactType;
  title: string;
  content: string;
  language?: string;
  onExpandChange?: (expanded: boolean) => void;
}

const typeConfig = {
  code: { icon: Code, label: 'Code', color: 'text-green-400' },
  document: { icon: FileText, label: 'Document', color: 'text-blue-400' },
  profile: { icon: User, label: 'Profile', color: 'text-violet-400' },
  text: { icon: FileText, label: 'Text', color: 'text-white/60' },
};

export default function Artifact({
  isOpen,
  onClose,
  type,
  title,
  content,
  language,
  onExpandChange,
}: ArtifactProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandChange?.(expanded);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
      onExpandChange?.(false);
    }
  }, [isOpen, onExpandChange]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = type === 'code' ? (language || 'txt') : 'txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-50 flex flex-col bg-[#0d0d0d] border-l border-white/10 transition-all duration-300',
        isExpanded ? 'w-full md:w-2/3' : 'w-full md:w-[480px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center bg-white/5',
              config.color
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{title}</h3>
            <p className="text-xs text-white/40">{config.label}{language && ` - ${language}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleExpand(!isExpanded)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {type === 'code' ? (
          <div className="relative">
            <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 overflow-x-auto">
              <code className="text-sm text-white/90 font-mono whitespace-pre">
                {content}
              </code>
            </pre>
          </div>
        ) : type === 'profile' ? (
          <div className="space-y-4">
            <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{title}</h4>
                  <p className="text-sm text-white/50">Generated Profile</p>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-white/80 whitespace-pre-wrap">{content}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-white/80 whitespace-pre-wrap">{content}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/80 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg text-sm text-white transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}
