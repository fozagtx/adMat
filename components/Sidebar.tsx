'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AI_MODELS, AIModel, ModelType } from '@/types';
import {
  Video,
  MessageSquare,
  Image,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  Eye,
} from 'lucide-react';

interface SidebarProps {
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
  activeView: 'video' | 'chat';
  onViewChange: (view: 'video' | 'chat') => void;
}

const modelTypeIcons: Record<ModelType, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  text: <MessageSquare className="w-4 h-4" />,
  vision: <Eye className="w-4 h-4" />,
};

const modelTypeLabels: Record<ModelType, string> = {
  video: 'Video Generation',
  text: 'Text Models',
  vision: 'Vision Models',
};

export default function Sidebar({
  selectedModel,
  onModelSelect,
  activeView,
  onViewChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const videoModels = AI_MODELS.filter((m) => m.type === 'video');
  const textModels = AI_MODELS.filter((m) => m.type === 'text');
  const visionModels = AI_MODELS.filter((m) => m.type === 'vision');

  const renderModelGroup = (models: AIModel[], type: ModelType) => (
    <div className="space-y-1">
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider",
        isCollapsed && "justify-center"
      )}>
        {modelTypeIcons[type]}
        {!isCollapsed && <span>{modelTypeLabels[type]}</span>}
      </div>
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => {
            onModelSelect(model);
            if (model.type === 'video') {
              onViewChange('video');
            } else {
              onViewChange('chat');
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
            selectedModel.id === model.id
              ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? model.name : undefined}
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            selectedModel.id === model.id
              ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          )}>
            {model.type === 'video' ? (
              <Video className="w-4 h-4" />
            ) : model.type === 'vision' ? (
              <Eye className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium truncate">{model.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {model.provider}
              </div>
            </div>
          )}
          {!isCollapsed && selectedModel.id === model.id && (
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "h-screen flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Studio
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Frontrunners
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {renderModelGroup(videoModels, 'video')}
        {renderModelGroup(textModels, 'text')}
        {renderModelGroup(visionModels, 'vision')}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-1">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Help" : undefined}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Help</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
