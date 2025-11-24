# Build and Run on iOS

Build and install the Valdi AI UI application on iOS simulator or device.

```bash
npm run build:ios
```

This runs:
```bash
bazel build //:valdi_ai_ui && valdi install ios --app=//:valdi_ai_ui
```

For manual Valdi CLI usage:
```bash
valdi install ios --app=//:valdi_ai_ui
```

Requirements:
- macOS with Xcode 15+
- iOS Simulator or physical iOS device
- Valdi CLI installed globally
