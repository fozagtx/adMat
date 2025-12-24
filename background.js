// Hackathon Doc Chat - Background Service Worker
// Handles API calls and extension lifecycle

// AI Models configuration (matching the main app)
const AI_MODELS = [
  {
    id: 'moonshotai/Kimi-K2-Instruct',
    name: 'Kimi K2',
    provider: 'Moonshot AI',
    type: 'text',
    supportsImage: false,
    icon: 'K2',
    color: '#10b981'
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-0528',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    type: 'text',
    supportsImage: false,
    icon: 'DS',
    color: '#3b82f6'
  },
  {
    id: 'Qwen/Qwen2.5-VL-72B-Instruct',
    name: 'Qwen 2.5 VL',
    provider: 'Alibaba',
    type: 'vision',
    supportsImage: true,
    icon: 'QW',
    color: '#f59e0b'
  },
  {
    id: 'mistralai/Pixtral-12B-2409',
    name: 'Pixtral 12B',
    provider: 'Mistral AI',
    type: 'vision',
    supportsImage: true,
    icon: 'PX',
    color: '#ec4899'
  }
];

// Design thinking partner system prompt
const DESIGN_THINKING_SYSTEM_PROMPT = `You are an expert Design Thinking Partner and Innovation Coach for hackathon participants. Your role is to help users ideate, analyze, and develop their hackathon projects using design thinking principles.

CONTEXT: You have access to the current webpage content that the user is viewing. Use this context to provide relevant, actionable insights.

YOUR CAPABILITIES:
1. **Empathize**: Help users understand their target users, identify pain points, and gather insights from the page content
2. **Define**: Assist in framing the problem statement clearly and identifying the core challenge
3. **Ideate**: Generate creative solutions, suggest features, and brainstorm innovative approaches
4. **Prototype**: Guide users on how to quickly prototype and validate their ideas
5. **Test**: Help design validation strategies and feedback loops

COMMUNICATION STYLE:
- Be concise but insightful
- Ask clarifying questions when needed
- Provide actionable suggestions
- Use bullet points for clarity
- Reference specific content from the page when relevant
- Be encouraging and collaborative

When analyzing hackathon documents or requirements:
- Extract key requirements and constraints
- Identify judging criteria
- Suggest winning strategies
- Point out common pitfalls to avoid
- Recommend technologies and approaches that fit the challenge

Always maintain a collaborative, encouraging tone while being direct and practical.`;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHAT_REQUEST') {
    handleChatRequest(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async response
  }

  if (request.type === 'GET_MODELS') {
    sendResponse({ success: true, data: AI_MODELS });
    return true;
  }

  if (request.type === 'GET_API_KEY') {
    chrome.storage.sync.get(['hyperbolicApiKey'], (result) => {
      sendResponse({ success: true, data: result.hyperbolicApiKey || '' });
    });
    return true;
  }

  if (request.type === 'SET_API_KEY') {
    chrome.storage.sync.set({ hyperbolicApiKey: request.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle chat API request
async function handleChatRequest({ model, messages, pageContext }) {
  // Get API key from storage
  const result = await chrome.storage.sync.get(['hyperbolicApiKey']);
  const apiKey = result.hyperbolicApiKey;

  if (!apiKey) {
    throw new Error('API key not configured. Please set your Hyperbolic API key in settings.');
  }

  // Build messages with system prompt and page context
  const systemMessage = {
    role: 'system',
    content: DESIGN_THINKING_SYSTEM_PROMPT + (pageContext ? `\n\nCURRENT PAGE CONTEXT:\n${pageContext}` : '')
  };

  const apiMessages = [systemMessage, ...messages];

  // Get model config
  const modelConfig = AI_MODELS.find(m => m.id === model);
  const isVisionModel = modelConfig?.supportsImage;

  // Make API request to Hyperbolic
  const response = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: apiMessages,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${response.status} - ${error}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    throw new Error('Invalid API response');
  }

  return {
    content: data.choices[0].message.content,
    model: model
  };
}

// Handle extension icon click - toggle sidebar
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
  } catch (error) {
    // Content script might not be loaded, inject it
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['styles/sidebar.css']
    });
    // Try again after injection
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
      } catch (e) {
        console.error('Failed to toggle sidebar:', e);
      }
    }, 100);
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Hackathon Doc Chat extension installed');
});
