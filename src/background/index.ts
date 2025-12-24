// AI Models configuration
const AI_MODELS = [
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

const SYSTEM_PROMPT = `You are an expert Design Thinking Partner and Innovation Coach for hackathon participants. Your role is to help users ideate, analyze, and develop their hackathon projects.

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

interface ChatRequestData {
  model: string;
  messages: { role: string; content: string }[];
  pageContext: string;
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'CHAT_REQUEST') {
    handleChatRequest(request.data)
      .then((response) => sendResponse({ success: true, data: response }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
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

async function handleChatRequest({ model, messages, pageContext }: ChatRequestData) {
  const result = await chrome.storage.sync.get(['hyperbolicApiKey']);
  const apiKey = result.hyperbolicApiKey;

  if (!apiKey) {
    throw new Error('Please add your API key in settings');
  }

  const systemMessage = {
    role: 'system',
    content: SYSTEM_PROMPT + (pageContext ? `\n\nCURRENT PAGE CONTEXT:\n${pageContext}` : ''),
  };

  const apiMessages = [systemMessage, ...messages];

  const response = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.choices?.[0]) {
    throw new Error('Invalid API response');
  }

  return {
    content: data.choices[0].message.content,
    model,
  };
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content.css'],
    });
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(tab.id!, { type: 'TOGGLE_SIDEBAR' });
      } catch (e) {
        console.error('Failed to toggle sidebar:', e);
      }
    }, 100);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Hackathon Doc Chat installed');
});
