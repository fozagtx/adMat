import { AIModel } from './types';

export const AI_MODELS: AIModel[] = [
  {
    id: 'moonshotai/Kimi-K2-Instruct',
    name: 'Kimi K2',
    provider: 'Moonshot AI',
    type: 'text',
    supportsImage: false,
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-0528',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    type: 'text',
    supportsImage: false,
  },
  {
    id: 'Qwen/Qwen2.5-VL-72B-Instruct',
    name: 'Qwen 2.5 VL',
    provider: 'Alibaba',
    type: 'vision',
    supportsImage: true,
  },
  {
    id: 'mistralai/Pixtral-12B-2409',
    name: 'Pixtral 12B',
    provider: 'Mistral AI',
    type: 'vision',
    supportsImage: true,
  },
];

export const SYSTEM_PROMPT = `You are an expert Design Thinking Partner and Innovation Coach for hackathon participants. Your role is to help users ideate, analyze, and develop their hackathon projects.

CONTEXT: You have access to the current webpage content. Use this context to provide relevant, actionable insights.

YOUR APPROACH:
1. Empathize - Understand users, identify pain points, gather insights
2. Define - Frame problems clearly, identify core challenges
3. Ideate - Generate creative solutions, suggest features, brainstorm
4. Prototype - Guide on quick validation approaches
5. Test - Help design feedback loops

STYLE:
- Be concise and direct
- Use clear formatting with bullet points
- Ask clarifying questions when needed
- Reference page content when relevant
- Be encouraging but practical

When analyzing hackathon docs:
- Extract key requirements and constraints
- Identify judging criteria
- Suggest winning strategies
- Point out common pitfalls
- Recommend fitting technologies`;

export const QUICK_ACTIONS = [
  { label: 'Analyze this page', prompt: 'Analyze the key points from this page. What are the main requirements or ideas presented?' },
  { label: 'Find pain points', prompt: 'Based on this content, what user pain points or problems could I address?' },
  { label: 'Suggest solutions', prompt: 'What innovative solutions would you suggest based on this context?' },
  { label: 'Tech recommendations', prompt: 'What technology stack would work well for building something based on this?' },
];
