# Valdi AI UI - Quick Start Guide

Get up and running with Valdi AI UI in minutes!

---

## Prerequisites

Before starting, ensure you have:

- ✅ **macOS** (for iOS development) or **Linux/Windows** (for Android only)
- ✅ **Node.js** 18+ and npm
- ✅ **Valdi Framework** installed
- ✅ **Bazel** build tool
- ✅ **Xcode** 15+ (iOS, macOS only)
- ✅ **Android Studio** (Android development)
- ✅ **API Keys** for at least one AI provider (OpenAI, Anthropic, or Google)

---

## Step 1: Navigate to Project

```bash
cd /Users/sarda/valdi-xplatform-ui/valdi-ai-ui
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Vercel AI SDK v5 (`ai`, `@ai-sdk/*`)
- Zod for schema validation
- TypeScript and linting tools

---

## Step 3: Configure API Keys

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

Example `.env` file:
```env
OPENAI_API_KEY=sk-your-actual-key-here
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
GOOGLE_API_KEY=your-google-key-here
```

**Important**: Never commit `.env` to git! It's already in `.gitignore`.

---

## Step 4: Verify Valdi Setup

```bash
# Navigate to Valdi directory
cd ../Valdi

# Verify Valdi is installed
valdi --version

# If not installed, run setup
valdi dev_setup
```

---

## Step 5: Build the Project

### Option A: Build from Valdi directory

```bash
cd /Users/sarda/valdi-xplatform-ui/Valdi

# Build the app
bazel build //apps/valdi-ai-ui:valdi_ai_ui
```

### Option B: Build from project directory

```bash
cd /Users/sarda/valdi-xplatform-ui/valdi-ai-ui

# Use npm script
npm run build
```

---

## Step 6: Run on iOS Simulator

```bash
# From Valdi directory
cd /Users/sarda/valdi-xplatform-ui/Valdi

# Install for iOS
valdi install ios --app=//apps/valdi-ai-ui:valdi_ai_ui

# Open in Xcode
open bazel-bin/apps/valdi-ai-ui/valdi_ai_ui.xcodeproj

# Or run directly
xcodebuild -project bazel-bin/apps/valdi-ai-ui/valdi_ai_ui.xcodeproj \
  -scheme valdi_ai_ui \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  run
```

---

## Step 7: Run on Android Emulator

```bash
# From Valdi directory
cd /Users/sarda/valdi-xplatform-ui/Valdi

# Install for Android
valdi install android --app=//apps/valdi-ai-ui:valdi_ai_ui

# Build APK
bazel build //apps/valdi-ai-ui:valdi_ai_ui_android

# Start emulator (replace with your AVD name)
emulator -avd Pixel_7_API_34 &

# Install and run
adb install -r bazel-bin/apps/valdi-ai-ui/valdi_ai_ui.apk
adb shell am start -n com.valdi.aiui/.MainActivity
```

---

## Step 8: Enable Hot Reload (Optional)

For rapid development with instant updates:

```bash
# Start hot reload server
valdi hotreload

# In another terminal, run your app
# Changes to .ts/.tsx files will reload automatically
```

---

## Development Workflow

### Making Changes

1. Edit files in `modules/*/src/`
2. Save the file
3. If hot reload is running, changes appear instantly
4. Otherwise, rebuild and redeploy

### Running Tests

```bash
# Run all tests
npm test

# Or with Bazel
bazel test //...

# Run specific module tests
bazel test //modules/chat_core:test
```

### Linting

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix

# Type checking
npm run type-check
```

---

## Project Structure Overview

```
valdi-ai-ui/
├── modules/                    # All app modules
│   ├── common/                # Shared design system
│   ├── chat_core/             # AI SDK integration
│   ├── chat_ui/               # Chat interface
│   └── ...                    # Other modules
├── PROJECT_PLAN.md            # Comprehensive plan
├── README.md                  # Project overview
├── QUICK_START.md             # This file
├── RESOURCES.md               # Documentation links
└── package.json               # Dependencies
```

---

## Next Steps

### For New Developers

1. **Read the Plan**: Check out [PROJECT_PLAN.md](PROJECT_PLAN.md) for architecture and features
2. **Explore Modules**: Look at module structure in `modules/` directory
3. **Check Resources**: Browse [RESOURCES.md](RESOURCES.md) for documentation links
4. **Reference Kitchen Sink**: See `../valdi-kitchen-sink` for Valdi patterns

### Start Building

**Phase 1 Tasks** (Current):
- [ ] Create common module with design system
- [ ] Build reusable UI components
- [ ] Set up main app with navigation
- [ ] Write initial documentation

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed implementation phases.

---

## Troubleshooting

### Issue: `valdi: command not found`

**Solution**: Install Valdi CLI
```bash
cd /Users/sarda/valdi-xplatform-ui/Valdi/npm_modules/cli/
npm run cli:install
```

### Issue: Build errors with Bazel

**Solution**: Clean and rebuild
```bash
bazel clean --expunge
bazel build //apps/valdi-ai-ui:valdi_ai_ui
```

### Issue: Module not found errors

**Solution**: Verify directory structure
```bash
ls -la modules/*/src/
```

### Issue: API key not working

**Solution**:
1. Verify key is correct in `.env`
2. Check key has proper permissions
3. Ensure environment file is loaded

### Issue: iOS Simulator not starting

**Solution**: Reset simulator
```bash
xcrun simctl erase "iPhone 15"
xcrun simctl boot "iPhone 15"
```

### Issue: Android emulator issues

**Solution**: Restart ADB
```bash
adb kill-server
adb start-server
adb devices
```

---

## Getting Help

- **Documentation**: [PROJECT_PLAN.md](PROJECT_PLAN.md), [RESOURCES.md](RESOURCES.md)
- **GitHub Issues**: Report bugs and request features
- **Valdi Docs**: `../Valdi/docs/README.md`
- **AI SDK Docs**: [ai-sdk.dev](https://ai-sdk.dev)

---

## Development Tips

1. **Use Hot Reload**: Speeds up development significantly
2. **Start Simple**: Get basic chat working before adding agents
3. **Test Early**: Write tests as you build features
4. **Follow Patterns**: Reference kitchen sink app for Valdi patterns
5. **Read Docs**: AI SDK v5 docs are comprehensive and helpful

---

## What's Next?

Once you have the app running:

1. **Explore the Code**: Look at existing module structure
2. **Try Examples**: Test different AI models and features
3. **Add Features**: Implement your own agents or tools
4. **Contribute**: Submit PRs to improve the project
5. **Share**: Tell others about your experience!

---

**Happy Building! 🚀**

For detailed planning and architecture, see [PROJECT_PLAN.md](PROJECT_PLAN.md).
