// Hackathon Doc Chat - Content Script
// Injects sidebar UI and handles page interaction

(function() {
  'use strict';

  // Prevent multiple injections
  if (window.__hackathonDocChatInjected) return;
  window.__hackathonDocChatInjected = true;

  // State
  let state = {
    isOpen: false,
    messages: [],
    isLoading: false,
    selectedModel: 'moonshotai/Kimi-K2-Instruct',
    models: [],
    pageContext: '',
    showModelDropdown: false,
    showSettings: false,
    apiKey: ''
  };

  // SVG Icons
  const icons = {
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
    lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
  };

  // Quick actions for design thinking
  const quickActions = [
    { label: 'Analyze requirements', prompt: 'Analyze the key requirements and constraints from this page. What are the main things I need to focus on?' },
    { label: 'Identify user pain points', prompt: 'Based on this content, what are the potential user pain points I should address?' },
    { label: 'Suggest features', prompt: 'What innovative features would you suggest for this hackathon challenge?' },
    { label: 'Winning strategy', prompt: 'What would be a winning strategy for this hackathon? What do judges typically look for?' },
    { label: 'Tech stack ideas', prompt: 'What technology stack would you recommend for building a solution to this challenge?' }
  ];

  // Extract page content for context
  function extractPageContext() {
    const content = [];

    // Get title
    const title = document.title;
    if (title) content.push(`Page Title: ${title}`);

    // Get URL
    content.push(`URL: ${window.location.href}`);

    // Get meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) content.push(`Description: ${metaDesc.content}`);

    // Get main content - try various selectors
    const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content', '.post', '.entry'];
    let mainContent = '';

    for (const selector of mainSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        mainContent = el.innerText;
        break;
      }
    }

    // Fallback to body if no main content found
    if (!mainContent) {
      mainContent = document.body.innerText;
    }

    // Clean and truncate content
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .substring(0, 8000); // Limit context size

    content.push(`\nPage Content:\n${mainContent}`);

    return content.join('\n');
  }

  // Create sidebar HTML
  function createSidebarHTML() {
    const selectedModel = state.models.find(m => m.id === state.selectedModel) || state.models[0];

    return `
      <div id="hackathon-doc-chat-sidebar">
        <!-- Header -->
        <div class="hdc-header">
          <div class="hdc-header-top">
            <div class="hdc-logo">
              <div class="hdc-logo-icon">PI</div>
              <div class="hdc-logo-text">Doc <span>Chat</span></div>
            </div>
            <button class="hdc-close-btn" id="hdc-close-btn">${icons.close}</button>
          </div>

          <!-- Model Selector -->
          <div class="hdc-model-selector">
            <button class="hdc-model-button" id="hdc-model-btn">
              <div class="hdc-model-info">
                <div class="hdc-model-icon" style="background: linear-gradient(135deg, ${selectedModel?.color || '#8b5cf6'} 0%, ${selectedModel?.color || '#8b5cf6'}88 100%)">
                  ${selectedModel?.icon || 'AI'}
                </div>
                <span class="hdc-model-name">${selectedModel?.name || 'Select Model'}</span>
                <span class="hdc-model-provider">${selectedModel?.provider || ''}</span>
              </div>
              ${icons.chevronDown}
            </button>
            <div class="hdc-model-dropdown ${state.showModelDropdown ? 'open' : ''}" id="hdc-model-dropdown">
              ${state.models.map(model => `
                <div class="hdc-model-option ${model.id === state.selectedModel ? 'selected' : ''}" data-model-id="${model.id}">
                  <div class="hdc-model-option-icon" style="background: linear-gradient(135deg, ${model.color} 0%, ${model.color}88 100%)">
                    ${model.icon}
                  </div>
                  <div class="hdc-model-option-details">
                    <div class="hdc-model-option-name">${model.name}</div>
                    <div class="hdc-model-option-provider">${model.provider}</div>
                  </div>
                  ${model.type === 'vision' ? '<span class="hdc-model-option-badge">Vision</span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Context Bar -->
        <div class="hdc-context-bar">
          <div class="hdc-context-icon">${icons.document}</div>
          <div class="hdc-context-text" id="hdc-context-text">${state.pageContext ? 'Page context loaded' : 'Loading page context...'}</div>
          <button class="hdc-context-refresh" id="hdc-refresh-context" title="Refresh context">
            ${icons.refresh}
          </button>
        </div>

        <!-- Messages -->
        <div class="hdc-messages" id="hdc-messages">
          ${state.messages.length === 0 ? `
            <div class="hdc-empty-state">
              <div class="hdc-empty-icon">${icons.lightbulb}</div>
              <div class="hdc-empty-title">Your Design Thinking Partner</div>
              <div class="hdc-empty-description">
                I can help you analyze hackathon docs, brainstorm ideas, identify requirements, and develop winning strategies. Ask me anything!
              </div>
            </div>
          ` : state.messages.map(msg => `
            <div class="hdc-message ${msg.role}">
              <div class="hdc-message-avatar">
                ${msg.role === 'user' ? icons.user : icons.bot}
              </div>
              <div class="hdc-message-content">
                <div class="hdc-message-text">${formatMessage(msg.content)}</div>
              </div>
            </div>
          `).join('')}
          ${state.isLoading ? `
            <div class="hdc-message assistant">
              <div class="hdc-message-avatar">${icons.bot}</div>
              <div class="hdc-message-content">
                <div class="hdc-typing">
                  <div class="hdc-typing-dot"></div>
                  <div class="hdc-typing-dot"></div>
                  <div class="hdc-typing-dot"></div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Quick Actions -->
        ${state.messages.length === 0 ? `
          <div class="hdc-quick-actions">
            ${quickActions.map((action, i) => `
              <button class="hdc-quick-action" data-action-index="${i}">${action.label}</button>
            `).join('')}
          </div>
        ` : ''}

        <!-- Input Area -->
        <div class="hdc-input-area">
          <div class="hdc-input-wrapper">
            <textarea
              class="hdc-textarea"
              id="hdc-textarea"
              placeholder="Ask about the document or ideate..."
              rows="1"
            ></textarea>
            <button class="hdc-send-btn" id="hdc-send-btn" ${state.isLoading ? 'disabled' : ''}>
              ${icons.send}
            </button>
          </div>
        </div>

        <!-- Settings Row -->
        <div class="hdc-settings-row">
          <button class="hdc-settings-btn" id="hdc-clear-btn">
            ${icons.trash}
            <span>Clear chat</span>
          </button>
          <button class="hdc-settings-btn" id="hdc-settings-btn">
            ${icons.settings}
            <span>Settings</span>
          </button>
        </div>

        <!-- Settings Modal -->
        <div class="hdc-settings-modal ${state.showSettings ? 'open' : ''}" id="hdc-settings-modal">
          <div class="hdc-settings-content">
            <div class="hdc-settings-title">Settings</div>
            <div class="hdc-settings-field">
              <label class="hdc-settings-label">Hyperbolic API Key</label>
              <input
                type="password"
                class="hdc-settings-input"
                id="hdc-api-key-input"
                placeholder="Enter your API key..."
                value="${state.apiKey}"
              />
            </div>
            <div class="hdc-settings-actions">
              <button class="hdc-settings-cancel" id="hdc-settings-cancel">Cancel</button>
              <button class="hdc-settings-save" id="hdc-settings-save">Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Format message content (basic markdown)
  function formatMessage(content) {
    return content
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  // Create toggle button
  function createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'hackathon-doc-chat-toggle';
    btn.innerHTML = icons.chat;
    btn.title = 'Toggle Hackathon Doc Chat';
    return btn;
  }

  // Initialize the extension
  async function init() {
    // Get models from background
    const modelsResponse = await chrome.runtime.sendMessage({ type: 'GET_MODELS' });
    if (modelsResponse.success) {
      state.models = modelsResponse.data;
      state.selectedModel = state.models[0]?.id;
    }

    // Get API key
    const apiKeyResponse = await chrome.runtime.sendMessage({ type: 'GET_API_KEY' });
    if (apiKeyResponse.success) {
      state.apiKey = apiKeyResponse.data;
    }

    // Create root container
    const root = document.createElement('div');
    root.id = 'hackathon-doc-chat-root';
    document.body.appendChild(root);

    // Create toggle button
    const toggleBtn = createToggleButton();
    root.appendChild(toggleBtn);

    // Create sidebar container
    const sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'hackathon-doc-chat-sidebar-container';
    root.appendChild(sidebarContainer);

    // Initial render
    render();

    // Extract page context
    state.pageContext = extractPageContext();
    render();

    // Bind events
    bindEvents();
  }

  // Render the sidebar
  function render() {
    const container = document.getElementById('hackathon-doc-chat-sidebar-container');
    if (container) {
      container.innerHTML = createSidebarHTML();

      // Update sidebar state
      const sidebar = document.getElementById('hackathon-doc-chat-sidebar');
      const toggle = document.getElementById('hackathon-doc-chat-toggle');

      if (sidebar) {
        sidebar.classList.toggle('open', state.isOpen);
      }
      if (toggle) {
        toggle.classList.toggle('sidebar-open', state.isOpen);
      }

      // Toggle page shrink
      document.body.classList.toggle('hackathon-doc-chat-page-shrink', state.isOpen);

      // Scroll messages to bottom
      const messages = document.getElementById('hdc-messages');
      if (messages) {
        messages.scrollTop = messages.scrollHeight;
      }

      // Re-bind events after render
      bindSidebarEvents();
    }
  }

  // Bind global events
  function bindEvents() {
    // Toggle button click
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('#hackathon-doc-chat-toggle');
      if (toggle) {
        toggleSidebar();
      }
    });

    // Listen for messages from background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'TOGGLE_SIDEBAR') {
        toggleSidebar();
        sendResponse({ success: true });
      }
      return true;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.hdc-model-selector') && state.showModelDropdown) {
        state.showModelDropdown = false;
        render();
      }
    });
  }

  // Bind sidebar-specific events
  function bindSidebarEvents() {
    // Close button
    const closeBtn = document.getElementById('hdc-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => toggleSidebar());
    }

    // Model selector
    const modelBtn = document.getElementById('hdc-model-btn');
    if (modelBtn) {
      modelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.showModelDropdown = !state.showModelDropdown;
        render();
      });
    }

    // Model options
    const modelOptions = document.querySelectorAll('.hdc-model-option');
    modelOptions.forEach(option => {
      option.addEventListener('click', () => {
        state.selectedModel = option.dataset.modelId;
        state.showModelDropdown = false;
        render();
      });
    });

    // Refresh context
    const refreshBtn = document.getElementById('hdc-refresh-context');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('loading');
        state.pageContext = extractPageContext();
        setTimeout(() => {
          refreshBtn.classList.remove('loading');
          render();
        }, 500);
      });
    }

    // Quick actions
    const quickActionBtns = document.querySelectorAll('.hdc-quick-action');
    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.actionIndex);
        const action = quickActions[index];
        if (action) {
          sendMessage(action.prompt);
        }
      });
    });

    // Textarea
    const textarea = document.getElementById('hdc-textarea');
    if (textarea) {
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const message = textarea.value.trim();
          if (message && !state.isLoading) {
            sendMessage(message);
            textarea.value = '';
          }
        }
      });

      // Auto-resize
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      });
    }

    // Send button
    const sendBtn = document.getElementById('hdc-send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const textarea = document.getElementById('hdc-textarea');
        const message = textarea?.value.trim();
        if (message && !state.isLoading) {
          sendMessage(message);
          textarea.value = '';
        }
      });
    }

    // Clear chat
    const clearBtn = document.getElementById('hdc-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.messages = [];
        render();
      });
    }

    // Settings button
    const settingsBtn = document.getElementById('hdc-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        state.showSettings = true;
        render();
      });
    }

    // Settings modal
    const settingsCancel = document.getElementById('hdc-settings-cancel');
    if (settingsCancel) {
      settingsCancel.addEventListener('click', () => {
        state.showSettings = false;
        render();
      });
    }

    const settingsSave = document.getElementById('hdc-settings-save');
    if (settingsSave) {
      settingsSave.addEventListener('click', async () => {
        const input = document.getElementById('hdc-api-key-input');
        const apiKey = input?.value || '';
        await chrome.runtime.sendMessage({ type: 'SET_API_KEY', data: apiKey });
        state.apiKey = apiKey;
        state.showSettings = false;
        render();
      });
    }

    // Close settings on backdrop click
    const settingsModal = document.getElementById('hdc-settings-modal');
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
          state.showSettings = false;
          render();
        }
      });
    }
  }

  // Toggle sidebar
  function toggleSidebar() {
    state.isOpen = !state.isOpen;
    render();
  }

  // Send message
  async function sendMessage(content) {
    // Check for API key
    if (!state.apiKey) {
      state.showSettings = true;
      render();
      return;
    }

    // Add user message
    state.messages.push({ role: 'user', content });
    state.isLoading = true;
    render();

    try {
      // Prepare messages for API
      const apiMessages = state.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Send to background script
      const response = await chrome.runtime.sendMessage({
        type: 'CHAT_REQUEST',
        data: {
          model: state.selectedModel,
          messages: apiMessages,
          pageContext: state.pageContext
        }
      });

      if (response.success) {
        state.messages.push({
          role: 'assistant',
          content: response.data.content
        });
      } else {
        state.messages.push({
          role: 'assistant',
          content: `Error: ${response.error || 'Something went wrong. Please try again.'}`
        });
      }
    } catch (error) {
      state.messages.push({
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to connect. Please check your settings.'}`
      });
    }

    state.isLoading = false;
    render();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
