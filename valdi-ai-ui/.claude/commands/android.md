# Build and Run on Android

Build and install the Valdi AI UI application on Android emulator or device.

```bash
npm run build:android
```

This runs:
```bash
bazel build //:valdi_ai_ui_android && valdi install android --app=//:valdi_ai_ui
```

For manual Valdi CLI usage:
```bash
valdi install android --app=//:valdi_ai_ui
```

Requirements:
- Android Studio
- Android SDK 24+ (Android 7.0+)
- Android emulator running or physical device connected
- Valdi CLI installed globally
