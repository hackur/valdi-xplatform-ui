# Valdi AI UI - Standalone Build Guide

This guide explains how to build and run Valdi AI UI as a **self-contained project** without requiring the parent Valdi workspace.

## Overview

By default, `valdi-ai-ui` is configured to work within the parent Valdi workspace for local development. However, it can be configured as a standalone project that depends on published Valdi releases from the Bazel Central Registry.

## Prerequisites

### Required Tools

1. **Bazel 7.0.0** - Build system
   ```bash
   # Install via Bazelisk (recommended)
   npm install -g @bazel/bazelisk

   # Or install directly from https://bazel.build/install
   ```

2. **Node.js 18+** and **npm 9+**
   ```bash
   node --version  # Should be 18.0.0 or higher
   npm --version   # Should be 9.0.0 or higher
   ```

3. **Valdi CLI** - For running on devices/simulators
   ```bash
   npm install -g valdi-cli
   ```

### Platform-Specific Requirements

**For iOS Development (macOS only):**
- Xcode 15+ with iOS SDK
- Command Line Tools installed
- iOS Simulator or physical device

**For Android Development:**
- Android Studio with SDK 24+
- Android SDK Build Tools
- Android Emulator or physical device
- `adb` in PATH

## Configuration for Standalone Mode

### 1. Update MODULE.bazel

The `MODULE.bazel` file controls whether the project uses the local Valdi workspace or a published version.

**For Standalone Mode** (default configuration):
```python
module(name = "valdi_ai_ui", version = "1.0.0")

# Use published Valdi from Bazel registry
bazel_dep(name = "valdi", version = "1.0.0")

# Local development override - COMMENTED OUT for standalone
# local_path_override(
#     module_name = "valdi",
#     path = "../Valdi",
# )
```

**For Local Development with Parent Workspace**:
```python
module(name = "valdi_ai_ui", version = "1.0.0")

# Use published Valdi from Bazel registry
bazel_dep(name = "valdi", version = "1.0.0")

# Local development override - UNCOMMENTED
local_path_override(
    module_name = "valdi",
    path = "../Valdi",
)
```

### 2. Verify .bazelversion

Ensure the `.bazelversion` file exists in the project root:

```bash
cat .bazelversion
# Should output: 7.0.0
```

This file ensures consistent Bazel versions across all developers.

### 3. Update BUILD.bazel Paths

The `BUILD.bazel` file should use paths relative to the valdi-ai-ui workspace:

```python
load("@valdi//bzl/valdi:valdi_application.bzl", "valdi_application")

valdi_application(
    name = "valdi_ai_ui",
    android_activity_theme_name = "Theme.ValdiAIUI.Launch",
    android_app_icon_name = "app_icon",
    ios_bundle_id = "com.valdi.aiui",
    ios_families = ["iphone", "ipad"],
    root_component_path = "App@main_app/src/App",
    title = "Valdi AI UI",
    version = "1.0.0",
    deps = [
        "//modules/main_app",
        "//modules/common",
        "//modules/chat_core",
        "//modules/chat_ui",
        "//modules/tools_demo",
        "//modules/workflow_demo",
        "//modules/settings",
    ],
)
```

**Key Points:**
- Paths use `//modules/...` (relative to valdi-ai-ui root)
- NOT `//apps/valdi-ai-ui/modules/...` (which assumes parent workspace)

## Installation

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd /path/to/valdi-ai-ui

# Install npm dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys (OpenAI, Anthropic, etc.)
```

### 2. Verify Configuration

```bash
# Check Bazel version
bazel version

# Verify module configuration
cat MODULE.bazel

# Check that paths are standalone-ready
cat BUILD.bazel
```

## Building the Application

### Build All Modules

```bash
# Build entire application
npm run build

# Or use Bazel directly
bazel build //:valdi_ai_ui
```

### Build for iOS

```bash
# Build and install to iOS simulator
npm run build:ios

# Or use Bazel + valdi CLI
bazel build //:valdi_ai_ui
valdi install ios --app=//:valdi_ai_ui
```

This will:
1. Build the Valdi application
2. Generate Xcode project
3. Install to iOS Simulator (or device if connected)
4. Output path: `bazel-bin/valdi_ai_ui.xcodeproj`

### Build for Android

```bash
# Build and install to Android emulator/device
npm run build:android

# Or use Bazel + valdi CLI
bazel build //:valdi_ai_ui_android
valdi install android --app=//:valdi_ai_ui
```

This will:
1. Build the Android APK
2. Install to connected device/emulator
3. Output path: `bazel-bin/valdi_ai_ui.apk`

## Running the Application

### iOS

**Option 1: Xcode**
```bash
# Build and open in Xcode
npm run build:ios
open bazel-bin/valdi_ai_ui.xcodeproj

# Then click "Run" in Xcode
```

**Option 2: Command Line**
```bash
# Install to simulator
valdi install ios --app=//:valdi_ai_ui

# Or install to connected device
valdi install ios --app=//:valdi_ai_ui --device
```

### Android

**Option 1: Android Studio**
```bash
# Install APK
npm run build:android

# Then launch from Android Studio or device
```

**Option 2: Command Line**
```bash
# Install to connected device/emulator
adb install -r bazel-bin/valdi_ai_ui.apk

# Launch the app
adb shell am start -n com.valdi.aiui/.MainActivity
```

## Testing

```bash
# Run all tests
npm test

# Or use Bazel directly
bazel test //...

# Run specific module tests
bazel test //modules/chat_core:all
bazel test //modules/common:all
```

## Development Workflow

### 1. Code → Build → Test Cycle

```bash
# Make code changes in modules/

# Build to check for errors
npm run build

# Run tests
npm test

# Install on device for manual testing
npm run build:ios   # or build:android
```

### 2. Type Checking

```bash
# Check TypeScript types without building
npm run type-check
```

### 3. Linting

```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Troubleshooting

### Build Cache Issues

```bash
# Clear Bazel cache
bazel clean --expunge

# Rebuild from scratch
bazel build //:valdi_ai_ui
```

### Dependency Issues

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Bazel external dependencies
bazel sync --configure
```

### Module Resolution Errors

If you see errors like `module 'valdi' not found`:

1. Check `MODULE.bazel` - ensure `local_path_override` is commented out
2. Verify Bazel version: `bazel version` (should be 7.0.0)
3. Clear cache: `bazel clean --expunge`
4. Rebuild: `bazel build //:valdi_ai_ui`

### iOS Build Issues

```bash
# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Rebuild
npm run build:ios
```

### Android Build Issues

```bash
# Check Android SDK location
echo $ANDROID_HOME

# Verify adb connection
adb devices

# Rebuild
npm run build:android
```

## Switching Between Standalone and Local Development

### To Standalone Mode (Published Valdi)

1. Edit `MODULE.bazel`:
   ```python
   # Comment out local_path_override
   # local_path_override(
   #     module_name = "valdi",
   #     path = "../Valdi",
   # )
   ```

2. Clean and rebuild:
   ```bash
   bazel clean --expunge
   bazel build //:valdi_ai_ui
   ```

### To Local Development Mode

1. Edit `MODULE.bazel`:
   ```python
   # Uncomment local_path_override
   local_path_override(
       module_name = "valdi",
       path = "../Valdi",
   )
   ```

2. Ensure parent Valdi workspace exists at `../Valdi`

3. Clean and rebuild:
   ```bash
   bazel clean --expunge
   bazel build //:valdi_ai_ui
   ```

## Directory Structure

When running standalone, the project structure is:

```
valdi-ai-ui/                    # Project root
├── .bazelversion               # Bazel version (7.0.0)
├── MODULE.bazel                # Bazel module config
├── BUILD.bazel                 # Root build file
├── WORKSPACE                   # Optional workspace file
├── package.json                # npm dependencies
├── tsconfig.json               # TypeScript config
├── .env                        # Environment variables (API keys)
├── modules/                    # Feature modules
│   ├── common/                 # Shared components
│   ├── main_app/               # Root app
│   ├── chat_core/              # AI SDK integration
│   └── ...                     # Other modules
└── bazel-bin/                  # Build outputs (generated)
    ├── valdi_ai_ui.xcodeproj   # iOS project
    └── valdi_ai_ui.apk         # Android APK
```

## Publishing and Distribution

### Creating a Release Build

**iOS:**
```bash
# Build release version
bazel build //:valdi_ai_ui --compilation_mode=opt

# Archive for App Store
# (Follow Apple's guidelines for signing and submission)
```

**Android:**
```bash
# Build release APK
bazel build //:valdi_ai_ui_android --compilation_mode=opt

# Sign APK
# (Follow Android's guidelines for signing and submission)
```

### Environment-Specific Builds

Use `.env` files for different environments:

```bash
# Development
cp .env.development .env

# Staging
cp .env.staging .env

# Production
cp .env.production .env
```

## Additional Resources

- **[Main README](README.md)** - Project overview
- **[Project Plan](PROJECT_PLAN.md)** - Development roadmap
- **[Quick Start](QUICK_START.md)** - Getting started guide
- **[Valdi Docs](https://valdi.dev/docs)** - Valdi framework documentation
- **[Bazel Docs](https://bazel.build/docs)** - Bazel build system

## Support

If you encounter issues with standalone builds:

1. Check this guide's Troubleshooting section
2. Review [QUICK_START.md](QUICK_START.md) for general setup
3. Open an issue on GitHub with:
   - Error message
   - Output of `bazel version`
   - Output of `node --version`
   - Operating system and version
   - Contents of `MODULE.bazel` (first 20 lines)

---

**Happy Building!**

For questions about the Valdi framework itself, see the [Valdi documentation](https://valdi.dev/docs).
