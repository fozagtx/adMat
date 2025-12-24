# Hackathon Doc Chat - AI Design Thinking Partner

A Chrome extension that lets you chat with any hackathon document page using AI. Acts as your design thinking partner to help ideate, analyze requirements, and develop winning strategies.

## Features

- **Toggle Sidebar UI** - Claude Code-style sidebar that takes a portion of the page
- **Multi-Model Support** - Choose from 4 AI models:
  - Kimi K2 (Moonshot AI) - Fast text model
  - DeepSeek R1 (DeepSeek) - Reasoning model
  - Qwen 2.5 VL (Alibaba) - Vision model
  - Pixtral 12B (Mistral AI) - Vision model
- **Page Context Extraction** - Automatically extracts content from the current page
- **Design Thinking Partner** - AI trained to help with:
  - Analyzing requirements and constraints
  - Identifying user pain points
  - Suggesting innovative features
  - Recommending tech stacks
  - Developing winning strategies
- **Quick Actions** - One-click prompts for common tasks
- **Beautiful UI** - Dark theme matching the main app aesthetic

## Installation

### Load as Unpacked Extension (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. The extension icon will appear in your toolbar

### Setup

1. Click the extension icon or the floating chat button on any page
2. Click **Settings** in the sidebar
3. Enter your **Hyperbolic API Key**
   - Get one from [Hyperbolic](https://hyperbolic.xyz)
4. Click **Save**

## Usage

1. **Navigate to any hackathon document page** (DevPost, Notion, GitHub, etc.)
2. **Click the floating chat button** (bottom right) or extension icon
3. **The sidebar opens** and automatically extracts page content
4. **Select your preferred AI model** from the dropdown
5. **Start chatting** - ask questions or use quick actions:
   - "Analyze requirements" - Extract key requirements
   - "Identify user pain points" - Find problems to solve
   - "Suggest features" - Get innovative feature ideas
   - "Winning strategy" - Get tips on impressing judges
   - "Tech stack ideas" - Get technology recommendations

## File Structure

```
extension/
├── manifest.json         # Chrome extension manifest (v3)
├── background.js         # Service worker for API calls
├── content.js            # Content script for sidebar UI
├── styles/
│   └── sidebar.css       # Sidebar styling
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── create-icons.js       # Icon generation script
├── generate-icons.html   # Manual icon generation
└── README.md             # This file
```

## Development

### Regenerate Icons

```bash
cd extension
node create-icons.js
```

### Test Changes

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload the page you're testing on

## API

The extension uses the **Hyperbolic API** for AI chat completions, compatible with the same models used in the main application.

### Supported Models

| Model | Provider | Type | Vision |
|-------|----------|------|--------|
| Kimi K2 | Moonshot AI | Text | No |
| DeepSeek R1 | DeepSeek | Text | No |
| Qwen 2.5 VL | Alibaba | Vision | Yes |
| Pixtral 12B | Mistral AI | Vision | Yes |

## Permissions

- `activeTab` - Access current tab content
- `storage` - Store API key and preferences
- `scripting` - Inject content script dynamically

## License

Part of the AI Frontrunners hackathon project.
