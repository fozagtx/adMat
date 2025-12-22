export type ModelType = 'text' | 'vision' | 'video';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  description: string;
  supportsImage: boolean;
  apiEndpoint: string;
  defaultParams: {
    max_tokens: number;
    temperature: number;
    top_p: number;
  };
}

export const AI_MODELS: AIModel[] = [
  // Video Generation
  {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    type: 'video',
    description: 'Flagship video generation with synced audio',
    supportsImage: false,
    apiEndpoint: 'https://api.openai.com/v1/videos',
    defaultParams: {
      max_tokens: 0,
      temperature: 0,
      top_p: 0,
    },
  },
  // Text Models
  {
    id: 'moonshotai/Kimi-K2-Instruct',
    name: 'Kimi K2',
    provider: 'Moonshot AI',
    type: 'text',
    description: 'Advanced instruction-following model',
    supportsImage: false,
    apiEndpoint: 'https://api.hyperbolic.xyz/v1/chat/completions',
    defaultParams: {
      max_tokens: 512,
      temperature: 0.1,
      top_p: 0.9,
    },
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-0528',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    type: 'text',
    description: 'Powerful reasoning and code generation',
    supportsImage: false,
    apiEndpoint: 'https://api.hyperbolic.xyz/v1/chat/completions',
    defaultParams: {
      max_tokens: 508,
      temperature: 0.1,
      top_p: 0.9,
    },
  },
  // Vision Models
  {
    id: 'Qwen/Qwen2.5-VL-72B-Instruct',
    name: 'Qwen 2.5 VL',
    provider: 'Alibaba',
    type: 'vision',
    description: 'Advanced vision-language understanding',
    supportsImage: true,
    apiEndpoint: 'https://api.hyperbolic.xyz/v1/chat/completions',
    defaultParams: {
      max_tokens: 512,
      temperature: 0.1,
      top_p: 0.001,
    },
  },
  {
    id: 'mistralai/Pixtral-12B-2409',
    name: 'Pixtral 12B',
    provider: 'Mistral AI',
    type: 'vision',
    description: 'Multimodal vision and text model',
    supportsImage: true,
    apiEndpoint: 'https://api.hyperbolic.xyz/v1/chat/completions',
    defaultParams: {
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.9,
    },
  },
];

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  image?: string; // base64 encoded image
}

export interface ChatResponse {
  success: boolean;
  data?: {
    content: string;
    model: string;
  };
  error?: string;
}
