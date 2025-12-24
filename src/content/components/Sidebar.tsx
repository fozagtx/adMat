import React, { useState, useEffect, useRef } from 'react';
import { ModelSelector } from './ModelSelector';
import { SettingsModal } from './SettingsModal';
import { Message, TypingIndicator } from './Message';
import {
  XIcon,
  SendIcon,
  FileTextIcon,
  RefreshIcon,
  SparklesIcon,
  SettingsIcon,
  TrashIcon,
} from './Icons';
import { AIModel, ChatMessage } from '../../shared/types';

const QUICK_ACTIONS = [
  { label: 'Analyze this page', prompt: 'Analyze the key points from this page. What are the main requirements or ideas presented?' },
  { label: 'Find pain points', prompt: 'Based on this content, what user pain points or problems could I address?' },
  { label: 'Suggest solutions', prompt: 'What innovative solutions would you suggest based on this context?' },
  { label: 'Tech recommendations', prompt: 'What technology stack would work well for building something based on this?' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageContext, setPageContext] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load models and API key on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_MODELS' }, (response) => {
      if (response?.success) {
        setModels(response.data);
        setSelectedModel(response.data[0]?.id || '');
      }
    });

    chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, (response) => {
      if (response?.success) {
        setApiKey(response.data || '');
      }
    });

    // Extract initial page context
    extractPageContext();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const extractPageContext = () => {
    const content: string[] = [];

    content.push(`Title: ${document.title}`);
    content.push(`URL: ${window.location.href}`);

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      content.push(`Description: ${(metaDesc as HTMLMetaElement).content}`);
    }

    const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content'];
    let mainContent = '';

    for (const selector of mainSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        mainContent = (el as HTMLElement).innerText;
        break;
      }
    }

    if (!mainContent) {
      mainContent = document.body.innerText;
    }

    mainContent = mainContent.replace(/\s+/g, ' ').trim().substring(0, 8000);
    content.push(`\nContent:\n${mainContent}`);

    setPageContext(content.join('\n'));
  };

  const handleRefreshContext = () => {
    setIsRefreshing(true);
    extractPageContext();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSaveApiKey = (key: string) => {
    chrome.runtime.sendMessage({ type: 'SET_API_KEY', data: key }, () => {
      setApiKey(key);
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chrome.runtime.sendMessage({
        type: 'CHAT_REQUEST',
        data: {
          model: selectedModel,
          messages: apiMessages,
          pageContext,
        },
      });

      if (response?.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.content,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${response?.error || 'Something went wrong'}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error: Failed to connect. Please check your settings.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <>
      <div className={`hdc-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="hdc-header">
          <div className="hdc-header-row">
            <div className="hdc-logo">
              <div className="hdc-logo-icon">DC</div>
              <span className="hdc-logo-text">Doc Chat</span>
            </div>
            <button className="hdc-close-btn" onClick={onClose}>
              <XIcon />
            </button>
          </div>

          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />
        </div>

        {/* Context Bar */}
        <div className="hdc-context-bar">
          <FileTextIcon />
          <span className="hdc-context-text">
            {pageContext ? 'Page context loaded' : 'Loading page context...'}
          </span>
          <button
            className={`hdc-context-btn ${isRefreshing ? 'loading' : ''}`}
            onClick={handleRefreshContext}
            title="Refresh context"
          >
            <RefreshIcon />
          </button>
        </div>

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="hdc-empty">
            <div className="hdc-empty-icon">
              <SparklesIcon />
            </div>
            <h3 className="hdc-empty-title">Design Thinking Partner</h3>
            <p className="hdc-empty-desc">
              I can help you analyze documents, brainstorm ideas, and develop strategies for your hackathon project.
            </p>
          </div>
        ) : (
          <div className="hdc-messages" ref={messagesRef}>
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="hdc-quick-actions">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                className="hdc-quick-action"
                onClick={() => handleSendMessage(action.prompt)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="hdc-input-area">
          <div className="hdc-input-wrapper">
            <textarea
              ref={textareaRef}
              className="hdc-textarea"
              placeholder="Ask about this page..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="hdc-send-btn"
              onClick={() => handleSendMessage(input)}
              disabled={isLoading || !input.trim()}
            >
              <SendIcon />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="hdc-footer">
          <button className="hdc-footer-btn" onClick={handleClearChat}>
            <TrashIcon />
            <span>Clear</span>
          </button>
          <button className="hdc-footer-btn" onClick={() => setShowSettings(true)}>
            <SettingsIcon />
            <span>Settings</span>
          </button>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          apiKey={apiKey}
          onSave={handleSaveApiKey}
        />
      </div>
    </>
  );
};
