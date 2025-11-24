# Valdi AI UI

<div align="center">

**🚀 Open Source Cross-Platform AI Chat Client**

Built with [Valdi](https://valdi.dev) • Powered by [Vercel AI SDK v5](https://sdk.vercel.ai)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Valdi](https://img.shields.io/badge/Valdi-Native-green)](https://valdi.dev)
[![AI SDK](https://img.shields.io/badge/AI%20SDK-v5-purple)](https://sdk.vercel.ai)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📖 Overview

Valdi AI UI is a production-quality, open-source AI chat client that demonstrates how to build sophisticated conversational AI interfaces using **true native mobile technologies**. Unlike React Native or Flutter, Valdi compiles TypeScript directly to native iOS and Android code, resulting in better performance and smaller bundle sizes.

This project combines the power of **Valdi's TypeScript-to-native compilation** with **Vercel's cutting-edge AI SDK v5** to create a seamless, multi-provider chat experience with advanced features like agent workflows, tool calling, and real-time streaming.

### 🎯 Why Valdi AI UI?

- **True Native Performance** - No WebView, no JavaScript bridge, just pure native code
- **Multi-Provider AI** - Switch between OpenAI, Anthropic (Claude), and Google (Gemini) seamlessly
- **Advanced Agent Orchestration** - Build complex multi-agent workflows with ease
- **Production Ready** - Comprehensive testing, error handling, and state management
- **Developer Friendly** - Full TypeScript support, extensive documentation, modular architecture

---

## ✨ Features

### 🤖 AI Capabilities

- **Multi-Model Support**
  - OpenAI (GPT-4, GPT-3.5 Turbo)
  - Anthropic (Claude 3 Opus, Sonnet, Haiku)
  - Google (Gemini Pro, Gemini Pro Vision)
  - Easy to add more providers

- **Real-Time Streaming**
  - Token-by-token AI responses
  - Live typing indicators
  - Smooth, responsive UI updates

- **Advanced Agent Workflows**
  - **Sequential**: Execute agents one after another
  - **Parallel**: Run multiple agents simultaneously
  - **Routing**: Intelligent task delegation
  - **Evaluator-Optimizer**: Iterative refinement loops

- **Tool Calling**
  - Execute functions during conversations
  - Zod schema validation
  - Parallel tool execution
  - Built-in tools: Weather, Calculator, Web Search

### 💬 Chat Features

- **Conversation Management**
  - Organize and search chat history
  - Archive and restore conversations
  - Export to JSON, Markdown, TXT, HTML
  - Multi-select bulk operations

- **Rich Message Display**
  - User and AI message differentiation
  - Tool call visualization
  - Streaming status indicators
  - Error state handling

- **Smart Search**
  - Full-text search across conversations
  - Filter by date, status, model
  - Debounced search for performance

### 🎨 User Experience

- **Modern Design System**
  - 60+ semantic colors
  - Comprehensive typography system
  - Consistent spacing and shadows
  - Responsive layouts

- **Native Components**
  - Button (5 variants, 3 sizes)
  - Card (4 elevation levels)
  - Avatar (4 types, 4 sizes)
  - LoadingSpinner (3 sizes, fullscreen mode)

- **Cross-Platform Native**
  - iOS (iPhone & iPad)
  - Android (SDK 24+)
  - Platform-specific optimizations

### 🛠️ Developer Tools

- **Type-Safe**
  - Full TypeScript with strict mode
  - Zod runtime validation
  - Comprehensive type definitions

- **Extensible Architecture**
  - Modular design (10 modules)
  - Plugin system for agents and tools
  - Observable state management

- **Testing Infrastructure**
  - Jest with ts-jest
  - 33+ tests (growing)
  - Custom Valdi test utilities
  - CI/CD ready

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and **npm** 9+
- **Bazel** 7.0.0 (via [Bazelisk](https://github.com/bazelbuild/bazelisk) recommended)
- **Valdi CLI** (install via npm: `npm install -g valdi-cli`)
- **iOS Development** (macOS only):
  - Xcode 15+
  - iOS Simulator or physical device
- **Android Development**:
  - Android Studio
  - Android SDK 24+ (Android 7.0+)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/valdi-ai-ui.git
cd valdi-ai-ui

# 2. Install dependencies
npm install

# 3. Set up API keys
cp .env.example .env
# Edit .env and add your API keys:
# - OPENAI_API_KEY=your_key_here
# - ANTHROPIC_API_KEY=your_key_here
# - GOOGLE_API_KEY=your_key_here
```

### Build & Run

#### Option 1: Standalone Build (Recommended)

```bash
# Build the application
npm run build

# Run on iOS
npm run build:ios

# Run on Android
npm run build:android
```

#### Option 2: With Parent Valdi Workspace

If you're developing the Valdi framework itself:

```bash
# Ensure local_path_override is enabled in MODULE.bazel
cd ../Valdi
bazel build //apps/valdi_ai_ui:valdi_ai_ui

# iOS
valdi install ios --app=//apps/valdi_ai_ui:valdi_ai_ui

# Android
valdi install android --app=//apps/valdi_ai_ui:valdi_ai_ui_android
```

See [STANDALONE_BUILD.md](STANDALONE_BUILD.md) for detailed build instructions.

### Verification

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Run all checks
npm run validate
```

---

## 🏗️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Valdi** | 1.0.0 | TypeScript-to-native compiler |
| **TypeScript** | 5.7.2 | Type-safe development |
| **Vercel AI SDK** | v5 | Multi-provider AI integration |
| **Bazel** | 7.0.0 | Build system |
| **Zod** | 3.24.1 | Runtime type validation |
| **Jest** | 29.7.0 | Testing framework |

### AI Providers

- **[@ai-sdk/openai](https://www.npmjs.com/package/@ai-sdk/openai)** - OpenAI GPT models
- **[@ai-sdk/anthropic](https://www.npmjs.com/package/@ai-sdk/anthropic)** - Anthropic Claude models
- **[@ai-sdk/google](https://www.npmjs.com/package/@ai-sdk/google)** - Google Gemini models

### Development Tools

- **Prettier** - Code formatting
- **ESLint** - Code linting
- **ts-jest** - TypeScript Jest integration
- **date-fns** - Date manipulation
- **uuid** - UUID generation

---

## 📂 Project Structure

```
valdi-ai-ui/
├── modules/                      # Modular packages
│   ├── common/                   # Design system & shared utilities
│   │   ├── src/
│   │   │   ├── theme/           # Colors, Fonts, Spacing, Shadows
│   │   │   ├── components/      # Button, Card, Avatar, LoadingSpinner
│   │   │   ├── types/           # Message, Conversation types
│   │   │   ├── testing/         # Test utilities
│   │   │   └── utils/           # Shared utilities
│   │   └── BUILD.bazel
│   │
│   ├── main_app/                # Root application & navigation
│   │   ├── src/
│   │   │   ├── App.tsx          # Root component
│   │   │   └── HomePage.tsx     # Landing page
│   │   └── BUILD.bazel
│   │
│   ├── chat_core/               # AI SDK integration & services
│   │   ├── src/
│   │   │   ├── ChatService.ts          # Multi-provider chat service
│   │   │   ├── MessageStore.ts         # Reactive message state
│   │   │   ├── StreamHandler.ts        # Streaming handler
│   │   │   ├── ToolDefinitions.ts      # Tool schemas
│   │   │   ├── ToolExecutor.ts         # Tool execution
│   │   │   ├── AgentWorkflow.ts        # Base workflow
│   │   │   ├── SequentialWorkflow.ts   # Sequential pattern
│   │   │   ├── ParallelWorkflow.ts     # Parallel pattern
│   │   │   ├── RoutingWorkflow.ts      # Routing pattern
│   │   │   ├── EvaluatorOptimizerWorkflow.ts  # E-O pattern
│   │   │   ├── StorageProvider.ts      # Storage abstraction
│   │   │   ├── MessagePersistence.ts   # Message persistence
│   │   │   ├── ConversationPersistence.ts  # Conversation persistence
│   │   │   ├── ConversationStore.ts    # Conversation state
│   │   │   └── ExportService.ts        # Export functionality
│   │   └── BUILD.bazel
│   │
│   ├── chat_ui/                 # Chat interface components
│   │   ├── src/
│   │   │   ├── ChatView.tsx            # Main chat view
│   │   │   ├── MessageBubble.tsx       # Message display
│   │   │   ├── InputBar.tsx            # Input field
│   │   │   ├── ConversationList.tsx    # Conversation list
│   │   │   └── ConversationListItem.tsx  # List item
│   │   └── BUILD.bazel
│   │
│   ├── agent_manager/           # Agent orchestration
│   │   ├── src/
│   │   │   ├── AgentRegistry.ts        # Agent registration
│   │   │   ├── WorkflowEngine.ts       # Workflow execution
│   │   │   ├── LoopController.ts       # Loop management
│   │   │   └── types.ts                # Agent types
│   │   └── BUILD.bazel
│   │
│   ├── conversation_manager/    # History management
│   │   ├── src/
│   │   │   ├── HistoryManager.ts       # History service
│   │   │   ├── ConversationListView.tsx  # List view
│   │   │   ├── ConversationCard.tsx    # Card component
│   │   │   ├── SearchBar.tsx           # Search component
│   │   │   └── types.ts                # Manager types
│   │   └── BUILD.bazel
│   │
│   ├── model_config/            # Model configuration
│   │   └── BUILD.bazel
│   │
│   ├── tools_demo/              # Tool calling examples
│   │   └── BUILD.bazel
│   │
│   ├── workflow_demo/           # Workflow demonstrations
│   │   └── BUILD.bazel
│   │
│   └── settings/                # App preferences
│       └── BUILD.bazel
│
├── .claude/                     # Claude Code configuration
├── .env.example                 # Environment template
├── .eslintrc.js                # ESLint config
├── .prettierrc                  # Prettier config
├── BUILD.bazel                  # Root build config
├── MODULE.bazel                 # Bazel module config
├── jest.config.js               # Jest config
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tsconfig.test.json           # Test TypeScript config
│
├── CHANGELOG.md                 # Version history
├── README.md                    # This file
├── CONTRIBUTING.md              # Contribution guidelines
├── ARCHITECTURE.md              # System design
├── API_REFERENCE.md             # API documentation
├── CODE_OF_CONDUCT.md           # Community standards
├── SECURITY.md                  # Security policies
│
├── PROJECT_PLAN.md              # Development roadmap
├── IMPLEMENTATION_STATUS.md     # Progress tracking
├── QUICK_START.md               # Fast setup guide
├── STANDALONE_BUILD.md          # Build documentation
└── RESOURCES.md                 # External links
```

---

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Standalone Build Guide](STANDALONE_BUILD.md)** - Build independently
- **[Project Plan](PROJECT_PLAN.md)** - Comprehensive 10-week roadmap

### Build Guides
- **[iOS Build Guide](BUILD_IOS.md)** - Complete iOS build and deployment guide
- **[Android Build Guide](BUILD_ANDROID.md)** - Complete Android build and deployment guide
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment checklist

### Technical Documentation
- **[Architecture Guide](ARCHITECTURE.md)** - System design and patterns
- **[API Reference](API.md)** - Complete API documentation with examples
- **[Testing Guide](TESTING.md)** - Testing best practices and examples
- **[Implementation Status](IMPLEMENTATION_STATUS.md)** - Current progress

### Community
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards
- **[Security Policy](SECURITY.md)** - Reporting vulnerabilities

### Resources
- **[Changelog](CHANGELOG.md)** - Version history
- **[Resources](RESOURCES.md)** - External links and references

---

## 💻 Development Workflow

### Daily Development

```bash
# Start development
npm install                 # Install dependencies
npm run type-check:watch    # Watch for type errors
npm run test:watch          # Watch for test failures

# Make changes
# ... edit code ...

# Verify changes
npm run validate            # Run all checks (type-check + lint + test)
npm run format              # Format code

# Build and test
npm run build               # Build application
npm run build:ios           # Test on iOS
npm run build:android       # Test on Android
```

### Code Quality Standards

We maintain high code quality through:

- **TypeScript Strict Mode** - All strict flags enabled
- **100% Type Coverage** - No implicit `any`
- **ESLint** - Comprehensive linting rules
- **Prettier** - Consistent code formatting
- **Jest Testing** - Growing test coverage (target: 80%+)

### Testing Strategy

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts
```

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement Feature**
   - Follow existing patterns
   - Add TypeScript types
   - Write tests
   - Update documentation

3. **Verify Quality**
   ```bash
   npm run validate  # All checks must pass
   ```

4. **Submit Pull Request**
   - Describe changes
   - Link related issues
   - Ensure CI passes

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🧪 Testing

### Current Test Coverage

- **33 Tests** passing in common module
- **0 Tests** in chat_core (coming soon)
- **0 Tests** in chat_ui (coming soon)
- **Target:** 80%+ coverage

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run CI tests
npm run test:ci
```

### Writing Tests

```typescript
// Example test
import { MessageUtils } from '@common/types/Message';

describe('MessageUtils', () => {
  it('should generate unique IDs', () => {
    const id1 = MessageUtils.generateId();
    const id2 = MessageUtils.generateId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^msg_/);
  });
});
```

See [Testing Guide](docs/testing.md) for more examples.

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - [Open an issue](https://github.com/your-org/valdi-ai-ui/issues)
- 💡 **Suggest Features** - [Start a discussion](https://github.com/your-org/valdi-ai-ui/discussions)
- 📖 **Improve Documentation** - Submit a PR
- 🔧 **Fix Issues** - Check [good first issues](https://github.com/your-org/valdi-ai-ui/labels/good%20first%20issue)
- ✨ **Add Features** - Propose and implement new features

### Contribution Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Commit** your changes
4. **Push** to your fork
5. **Submit** a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Valdi AI UI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgments

### Built With

- **[Valdi](https://valdi.dev)** - TypeScript-to-native compilation framework
- **[Vercel AI SDK](https://sdk.vercel.ai)** - Multi-provider AI integration
- **[OpenAI](https://openai.com)** - GPT models
- **[Anthropic](https://anthropic.com)** - Claude models
- **[Google](https://ai.google.dev)** - Gemini models

### Inspiration

This project was inspired by:
- Modern AI chat interfaces
- Native mobile app best practices
- Open-source community contributions

---

## 📞 Support

### Get Help

- 📖 **Documentation** - Check our comprehensive docs
- 💬 **Discussions** - [GitHub Discussions](https://github.com/your-org/valdi-ai-ui/discussions)
- 🐛 **Issues** - [Report bugs](https://github.com/your-org/valdi-ai-ui/issues)
- 📧 **Email** - contact@valdi-ai-ui.dev _(update with actual email)_

### Community

- **Discord** - [Join our server](https://discord.gg/valdi-ai) _(update with actual link)_
- **Twitter** - [@ValdiAIUI](https://twitter.com/valdiai ui) _(update with actual handle)_
- **Blog** - [Read our updates](https://blog.valdi-ai-ui.dev) _(update with actual URL)_

---

## 🗺️ Roadmap

### Current Status: v0.1.0 (Phase 1 Complete - 48%)

### Upcoming Milestones

- **v0.2.0** (Phase 2) - Core Features Complete
  - [ ] Model Config UI
  - [ ] Full navigation wiring
  - [ ] Real streaming integration
  - [ ] Error handling patterns
  - [ ] 60%+ test coverage

- **v0.3.0** (Phase 3) - Advanced Features
  - [ ] Multi-modal support (images, voice)
  - [ ] Advanced workflow builder
  - [ ] Custom tool creation UI
  - [ ] Offline support

- **v0.4.0** (Phase 4) - Polish & Optimization
  - [ ] Performance optimization
  - [ ] Animations and transitions
  - [ ] Accessibility features
  - [ ] Bundle size optimization

- **v1.0.0** (Phase 5) - Production Ready
  - [ ] 80%+ test coverage
  - [ ] Complete documentation
  - [ ] Security audit
  - [ ] App store release

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for the complete roadmap.

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star!

[![Star History Chart](https://api.star-history.com/svg?repos=your-org/valdi-ai-ui&type=Date)](https://star-history.com/#your-org/valdi-ai-ui&Date)

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/your-org/valdi-ai-ui?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-org/valdi-ai-ui?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-org/valdi-ai-ui)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-org/valdi-ai-ui)
![GitHub last commit](https://img.shields.io/github/last-commit/your-org/valdi-ai-ui)

---

<div align="center">

**Made with ❤️ by the Valdi AI UI Team**

[Website](https://valdi-ai-ui.dev) • [Documentation](./docs) • [Blog](https://blog.valdi-ai-ui.dev)

_Building the future of conversational AI, one commit at a time._

</div>
