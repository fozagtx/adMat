import React from 'react';
import { UserIcon, BotIcon } from './Icons';
import { ChatMessage } from '../../shared/types';

interface MessageProps {
  message: ChatMessage;
}

const formatContent = (content: string): string => {
  return content
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Line breaks (convert double newlines to paragraphs)
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
};

export const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className={`hdc-message ${message.role}`}>
      <div className="hdc-message-avatar">
        {message.role === 'user' ? <UserIcon /> : <BotIcon />}
      </div>
      <div className="hdc-message-content">
        <div
          className="hdc-message-text"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
      </div>
    </div>
  );
};

export const TypingIndicator: React.FC = () => (
  <div className="hdc-message assistant">
    <div className="hdc-message-avatar">
      <BotIcon />
    </div>
    <div className="hdc-message-content">
      <div className="hdc-typing">
        <div className="hdc-typing-dot" />
        <div className="hdc-typing-dot" />
        <div className="hdc-typing-dot" />
      </div>
    </div>
  </div>
);
