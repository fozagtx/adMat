# Hackathon Doc Chat

A Chrome extension that lets you chat with any webpage using AI. Your design thinking partner for hackathon projects.

## Features

- **Claude-inspired UI** - Clean, minimal design with warm color palette
- **Toggle Sidebar** - Slides in from the right, adjusting page content
- **Multi-model Support** - Choose from 4 AI models:
  - Kimi K2 (Moonshot AI)
  - DeepSeek R1 (DeepSeek)
  - Qwen 2.5 VL (Alibaba) - Vision
  - Pixtral 12B (Mistral AI) - Vision
- **Page Context** - Automatically extracts content from the current page
- **Quick Actions** - One-click prompts for common tasks
- **Settings** - Configure your API key in the extension

## Installation

### Build from Source

```bash
# Install dependencies
npm install

# Build the extension
npm run build
```

### Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `dist` folder

### Setup

1. Click the extension icon or the floating button on any page
2. Click **Settings** in the sidebar footer
3. Enter your **Hyperbolic API Key**
4. Click **Save**

## Usage

1. Navigate to any webpage
2. Click the floating chat button (bottom right)
3. The sidebar opens with page context loaded
4. Select your preferred AI model
5. Start chatting or use quick actions:
   - **Analyze this page** - Extract key points
   - **Find pain points** - Identify user problems
   - **Suggest solutions** - Get innovative ideas
   - **Tech recommendations** - Get stack suggestions

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development with watch mode
npm run dev
```

## Project Structure

```
├── src/
│   ├── background/       # Service worker
│   │   └── index.ts
│   ├── content/          # React sidebar app
│   │   ├── components/
│   │   │   ├── App.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── Message.tsx
│   │   │   └── Icons.tsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   └── index.tsx
│   └── shared/           # Shared types
│       ├── types.ts
│       └── constants.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── scripts/
│   └── create-icons.cjs
├── dist/                 # Build output (load this in Chrome)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Tech Stack

- **React 18** - UI components
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Chrome Extension Manifest V3**

## API

Uses the [Hyperbolic API](https://hyperbolic.xyz) for AI chat completions.

## License

MIT
