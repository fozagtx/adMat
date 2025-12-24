export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'vision';
  supportsImage: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface PageContext {
  title: string;
  url: string;
  content: string;
}

export type MessageType =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'GET_MODELS' }
  | { type: 'GET_API_KEY' }
  | { type: 'SET_API_KEY'; data: string }
  | { type: 'CHAT_REQUEST'; data: ChatRequestData };

export interface ChatRequestData {
  model: string;
  messages: { role: string; content: string }[];
  pageContext: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    content: string;
    model: string;
  };
  error?: string;
}
