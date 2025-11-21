# Valdi AI UI

**Open Source Cross-Platform AI Chat Client**

Built with [Valdi](../Valdi) and powered by [Vercel AI SDK v5](https://ai-sdk.dev)

---

## Overview

Valdi AI UI is a production-quality, open-source AI chat client that demonstrates how to build sophisticated conversational AI interfaces using native mobile technologies. It combines the power of Valdi's TypeScript-to-native compilation with Vercel's cutting-edge AI SDK to create a seamless chat experience on iOS and Android.

## Features

- **Multi-Model Support** - OpenAI, Anthropic (Claude), Google (Gemini), and more
- **Real-Time Streaming** - Live AI responses with token-by-token updates
- **Agent Workflows** - Sequential, routing, parallel, and evaluator patterns
- **Tool Calling** - Execute functions during conversations
- **Conversation Management** - Organize, search, and export chat history
- **Cross-Platform Native** - True native iOS and Android (no WebView)
- **Type-Safe** - Full TypeScript support with Zod validation
- **Extensible** - Easy to add custom agents and tools

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Bazel 7.0.0 (via Bazelisk recommended)
- Valdi CLI (installed via npm)
- iOS: Xcode 15+ (macOS only)
- Android: Android Studio with SDK 24+

See **[STANDALONE_BUILD.md](STANDALONE_BUILD.md)** for detailed setup instructions.

### Installation

```bash
# Clone repository (if not already cloned)
cd /path/to/valdi-ai-ui

# Install dependencies
npm install

# Set up API keys
cp .env.example .env
# Edit .env and add your API keys (OpenAI, Anthropic, etc.)
```

### Build & Run

**Standalone Mode** (recommended for independent development):

```bash
# Build application
npm run build

# iOS
npm run build:ios

# Android
npm run build:android
```

**With Parent Valdi Workspace** (for framework development):

See [STANDALONE_BUILD.md](STANDALONE_BUILD.md) for switching between modes.

```bash
# From valdi-ai-ui directory (ensure local_path_override is enabled)
cd ../Valdi
bazel build //apps/valdi_ai_ui:valdi_ai_ui
valdi install ios --app=//apps/valdi_ai_ui:valdi_ai_ui
```

## Project Structure

```
valdi-ai-ui/
├── modules/
│   ├── common/                 # Design system & shared components
│   ├── main_app/               # Root app & navigation
│   ├── chat_core/              # AI SDK integration
│   ├── chat_ui/                # Chat interface
│   ├── agent_manager/          # Agent workflows
│   ├── conversation_manager/   # Chat history
│   ├── model_config/           # Model settings
│   ├── tools_demo/             # Tool calling examples
│   ├── workflow_demo/          # Workflow patterns
│   └── settings/               # App preferences
├── PROJECT_PLAN.md             # Comprehensive plan
├── MODULE.bazel                # Bazel module config
└── BUILD.bazel                 # Build configuration
```

## Documentation

- **[Standalone Build Guide](STANDALONE_BUILD.md)** - Build independently without parent workspace
- **[Quick Start](QUICK_START.md)** - Fast setup and getting started
- **[Project Plan](PROJECT_PLAN.md)** - Comprehensive development plan
- **[Implementation Status](IMPLEMENTATION_STATUS.md)** - Current progress
- **[Architecture](ARCHITECTURE.md)** - System design and patterns (coming soon)
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines (coming soon)
- **[API Reference](docs/API.md)** - API documentation (coming soon)

## AI SDK v5 Integration

This project showcases Vercel AI SDK v5 features:

- **Streaming**: Real-time token streaming with `streamText()`
- **Tool Calling**: Function execution with Zod schemas
- **Agent System**: Autonomous agents with loop control
- **Workflow Patterns**: Sequential, routing, parallel, evaluator
- **Multi-Provider**: Support for OpenAI, Anthropic, Google, xAI

## Architecture Highlights

- **Modular Design** - Independent modules for each feature
- **Type Safety** - Full TypeScript with strict mode
- **Reactive State** - Valdi's StatefulComponent for reactive UI
- **Native Performance** - No WebView, true native rendering
- **Secure Storage** - API keys in iOS Keychain / Android Keystore

## Examples

### Basic Chat

```typescript
import { ChatService } from './modules/chat_core/src/ChatService';

const chat = new ChatService();
const stream = await chat.sendMessage('Hello!', conversationId);
```

### Tool Calling

```typescript
import { tool } from '@ai-sdk/core';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    return await getWeather(location);
  },
});
```

### Agent Workflow

```typescript
import { Agent } from '@ai-sdk/core';

const agent = new Agent({
  model: openai('gpt-4-turbo'),
  tools: { weather: weatherTool },
  maxSteps: 5,
});

const result = await agent.generateText({
  prompt: 'What\'s the weather in San Francisco?',
});
```

## Development Status

**Current Phase**: Planning & Foundation (Phase 1)

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed roadmap.

### Phase 1: Foundation ✅
- [x] Project structure defined
- [x] Comprehensive plan created
- [ ] Workspace initialized
- [ ] Common module created
- [ ] Basic navigation implemented

### Phase 2: Chat Core (Next)
- [ ] AI SDK integration
- [ ] Message streaming
- [ ] Basic chat UI

## Contributing

We welcome contributions! This is an open-source project designed to showcase best practices for AI integration with Valdi.

**How to Contribute**:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines (coming soon).

## Resources

### Official Documentation

- **[Vercel AI SDK](https://ai-sdk.dev)** - AI SDK v5 documentation
- **[Valdi Framework](../Valdi/docs/README.md)** - Valdi documentation
- **[AI SDK GitHub](https://github.com/vercel/ai)** - Source code and examples
- **[Vercel Academy](https://vercel.com/academy/ai-sdk)** - Video tutorials

### Community

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Questions and community chat
- **Discord** - (Coming soon)

## Tech Stack

- **Framework**: Valdi (TypeScript → Native iOS/Android)
- **AI**: Vercel AI SDK v5
- **Language**: TypeScript 5.x
- **Build**: Bazel
- **Validation**: Zod
- **Testing**: Jest + Valdi Test Utils

## License

[MIT License](LICENSE) (or specify your chosen license)

## Acknowledgments

- **Valdi Team** - For the amazing cross-platform framework
- **Vercel** - For the powerful AI SDK
- **Open Source Community** - For inspiration and contributions

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/valdi-ai-ui/issues)
- **Email**: your-email@example.com
- **Documentation**: [PROJECT_PLAN.md](PROJECT_PLAN.md)

---

**Built with ❤️ using Valdi and AI SDK v5**

Status: 🚧 Under Active Development

For detailed planning and implementation details, see [PROJECT_PLAN.md](PROJECT_PLAN.md).
