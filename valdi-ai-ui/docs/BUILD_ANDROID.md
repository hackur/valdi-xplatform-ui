# Android Build Guide

Complete guide for building and deploying Valdi AI UI to Android devices and emulators.

---

## Prerequisites

### System Requirements

- **macOS**, **Linux**, or **Windows** 10/11
- **Android Studio** 2023.1.1 (Hedgehog) or later
- **Android SDK** 24+ (Android 7.0+)
- **Android NDK** r25 or later
- **Java JDK** 17 or later
- **Node.js** 18+ and **npm** 9+
- **Bazel** 7.0.0 (via Bazelisk recommended)
- **Valdi CLI** installed globally

### Verify Prerequisites

```bash
# Check Android Studio version
# Open Android Studio > About Android Studio

# Check Java version
java -version
# Should show: Java 17 or higher

# Check Android SDK
echo $ANDROID_HOME
# Should show path to Android SDK

# Check Node.js
node --version
# Should show: v18.0.0 or higher

# Check Bazel
bazel --version
# Should show: bazel 7.0.0 or higher

# Check Valdi CLI
valdi --version
# Should show installed version
```

---

## Installation

### 1. Install Android Studio

Download from [Android Developer](https://developer.android.com/studio).

**During installation, ensure these components are selected:**
- Android SDK
- Android SDK Platform
- Android Virtual Device (AVD)
- Android SDK Build-Tools
- Android Emulator

### 2. Configure Android SDK

```bash
# Set ANDROID_HOME environment variable

# On macOS/Linux (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# On Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\emulator"

# Verify
echo $ANDROID_HOME
adb --version
```

### 3. Install Required SDK Components

```bash
# Using Android Studio:
# 1. Open Android Studio
# 2. Go to Settings/Preferences > Appearance & Behavior > System Settings > Android SDK
# 3. Install:
#    - Android 14.0 (API 34) - Latest
#    - Android 13.0 (API 33)
#    - Android 12.0 (API 31)
#    - Android 11.0 (API 30)
#    - Android 10.0 (API 29)
#    - Android 7.0 (API 24) - Minimum

# Or using sdkmanager CLI:
sdkmanager "platform-tools" "platforms;android-34" "platforms;android-24" "build-tools;34.0.0"
sdkmanager "ndk;25.2.9519653"
```

### 4. Install Valdi CLI

```bash
# Install globally via npm
npm install -g valdi-cli

# Verify installation
valdi --version
```

### 5. Install Dependencies

```bash
# Navigate to project root
cd /path/to/valdi-ai-ui

# Install npm dependencies
npm install
```

---

## Building for Android

### Method 1: Using npm Scripts (Recommended)

```bash
# Build and install to Android emulator/device
npm run build:android

# This runs:
# 1. bazel build //:valdi_ai_ui_android
# 2. valdi install android --app=//:valdi_ai_ui
```

### Method 2: Using Bazel Directly

```bash
# Build the Android target
bazel build //:valdi_ai_ui_android

# Install to device/emulator
valdi install android --app=//:valdi_ai_ui

# Or specify device
valdi install android --app=//:valdi_ai_ui --device="emulator-5554"
```

### Method 3: Using Android Studio

```bash
# Generate Android Studio project
bazel run //:valdi_ai_ui_android_studio

# Open in Android Studio
cd android
open -a "Android Studio" .

# Then build and run from Android Studio (⇧F10)
```

---

## Running on Emulator

### Create Emulator (AVD)

**Using Android Studio:**
1. Open Android Studio
2. Tools > Device Manager
3. Click "Create Device"
4. Select device (e.g., Pixel 7)
5. Select system image (e.g., Android 14.0 - API 34)
6. Configure AVD settings
7. Click "Finish"

**Using Command Line:**

```bash
# List available system images
sdkmanager --list | grep system-images

# Download system image
sdkmanager "system-images;android-34;google_apis;x86_64"

# Create AVD
avdmanager create avd -n Pixel_7_API_34 -k "system-images;android-34;google_apis;x86_64" -d "pixel_7"

# List AVDs
avdmanager list avd
```

### Launch Emulator

```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd Pixel_7_API_34

# Or start with specific options
emulator -avd Pixel_7_API_34 -gpu host -no-snapshot-load

# Start headless (no UI)
emulator -avd Pixel_7_API_34 -no-window -no-audio
```

### Install and Run App

```bash
# Wait for emulator to boot
adb wait-for-device

# Build and install
npm run build:android

# Or manually
adb install -r bazel-bin/valdi_ai_ui_android.apk

# Launch app
adb shell am start -n com.valdi.aiui/.MainActivity
```

### Emulator Shortcuts

- **⌘/Ctrl + M**: Open menu
- **⌘/Ctrl + R**: Rotate device
- **⌘/Ctrl + ↑/↓**: Volume up/down
- **⌘/Ctrl + P**: Power button
- **⌘/Ctrl + H**: Home button
- **⌘/Ctrl + B**: Back button

---

## Running on Physical Device

### 1. Enable Developer Options

On your Android device:
1. Go to **Settings > About phone**
2. Tap **Build number** 7 times
3. Developer options will appear in Settings

### 2. Enable USB Debugging

1. Go to **Settings > System > Developer options**
2. Enable **USB debugging**
3. (Optional) Enable **Install via USB**

### 3. Connect Device

```bash
# Connect device via USB
# On device: Allow USB debugging when prompted

# Verify device is connected
adb devices
# Should show device serial number

# Check device info
adb shell getprop ro.build.version.release
```

### 4. Deploy to Device

```bash
# Build and install
npm run build:android

# Or specify device
valdi install android --app=//:valdi_ai_ui --device="<device-serial>"

# Or using adb
adb -s <device-serial> install -r bazel-bin/valdi_ai_ui_android.apk
```

---

## Build Configurations

### Debug Build

```bash
# Default debug build
bazel build //:valdi_ai_ui_android --compilation_mode=dbg

# Install debug build
valdi install android --app=//:valdi_ai_ui --mode=debug
```

Features:
- Source maps enabled
- Debug symbols included
- Logging enabled
- Larger APK size
- Not obfuscated

### Release Build

```bash
# Optimized release build
bazel build //:valdi_ai_ui_android --compilation_mode=opt

# Install release build
valdi install android --app=//:valdi_ai_ui --mode=release
```

Features:
- Minified code
- ProGuard/R8 enabled
- Optimizations enabled
- Smaller APK size
- Obfuscated code

### Profile Build

```bash
# Profile build with some debug info
bazel build //:valdi_ai_ui_android --compilation_mode=fastbuild
```

---

## Testing

### Emulator Testing

```bash
# Start emulator
emulator -avd Pixel_7_API_34

# Run tests
bazel test //... --test_output=all

# Run specific test
bazel test //modules/common:tests --test_output=all

# Run with coverage
bazel coverage //... --combined_report=lcov
```

### Device Testing

```bash
# Connect device
adb devices

# Run tests on device
bazel test //... --android_device=<device-serial>

# Or using Android Studio
# Open project and press ⌃R (Ctrl+Shift+F10)
```

### UI Testing

```bash
# Run instrumented tests
bazel test //android/src/androidTest:tests

# Or using adb
adb shell am instrument -w com.valdi.aiui.test/androidx.test.runner.AndroidJUnitRunner
```

---

## Troubleshooting

### Issue: ANDROID_HOME Not Set

```bash
# Find Android SDK location
# Usually: ~/Library/Android/sdk (macOS)
#          %LOCALAPPDATA%\Android\Sdk (Windows)
#          ~/Android/Sdk (Linux)

# Set environment variable (see Installation section)
export ANDROID_HOME=$HOME/Library/Android/sdk

# Add to ~/.bashrc or ~/.zshrc to make permanent
```

### Issue: ADB Not Found

```bash
# Add platform-tools to PATH
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Or use full path
$ANDROID_HOME/platform-tools/adb devices
```

### Issue: Device Not Detected

```bash
# Check USB debugging is enabled
adb devices

# Restart ADB server
adb kill-server
adb start-server

# On device:
# Revoke USB debugging authorizations and reconnect
# Settings > Developer options > Revoke USB debugging authorizations
```

### Issue: Emulator Won't Start

```bash
# Check available system images
sdkmanager --list | grep system-images

# Delete and recreate AVD
avdmanager delete avd -n Pixel_7_API_34
# Then recreate (see Create Emulator section)

# Check virtualization is enabled in BIOS
# Intel: VT-x
# AMD: AMD-V
```

### Issue: Build Fails with SDK Not Found

```bash
# Install required SDK versions
sdkmanager "platforms;android-34" "build-tools;34.0.0"

# Verify installation
sdkmanager --list_installed

# Update ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### Issue: Gradle Sync Failed

```bash
# Clean Gradle cache
./gradlew clean

# Or delete Gradle cache
rm -rf ~/.gradle/caches/

# Rebuild
npm run build:android
```

### Issue: App Crashes on Launch

```bash
# View logcat
adb logcat | grep "com.valdi.aiui"

# Or filter by tag
adb logcat -s ValdiAIUI:* AndroidRuntime:E

# Save logs to file
adb logcat > crash.log
```

### Issue: Out of Memory

```bash
# Increase heap size in gradle.properties
echo "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m" >> android/gradle.properties

# Or set environment variable
export GRADLE_OPTS="-Xmx4g"
```

### Issue: Build Cache Issues

```bash
# Clean Bazel cache
bazel clean

# Clean Gradle cache
cd android && ./gradlew clean && cd ..

# Delete build artifacts
rm -rf bazel-*

# Rebuild
npm run build:android
```

---

## Performance Optimization

### Build Performance

```bash
# Use remote cache (if available)
bazel build //:valdi_ai_ui_android --remote_cache=<cache-url>

# Increase build parallelism
bazel build //:valdi_ai_ui_android --jobs=8

# Use disk cache
bazel build //:valdi_ai_ui_android --disk_cache=~/.cache/bazel
```

### Runtime Performance

1. **Enable Release Mode**
   ```bash
   npm run build:android -- --mode=release
   ```

2. **Profile with Android Profiler**
   ```bash
   # Open Android Studio
   # View > Tool Windows > Profiler
   # Select device and app
   # Profile CPU, Memory, Network
   ```

3. **Optimize APK Size**
   ```bash
   # Enable ProGuard/R8
   # Edit android/app/build.gradle:
   # buildTypes {
   #   release {
   #     minifyEnabled true
   #     shrinkResources true
   #   }
   # }

   # Analyze APK
   bazel build //:valdi_ai_ui_android --output_groups=+size_analysis

   # View APK size
   ls -lh bazel-bin/valdi_ai_ui_android.apk
   ```

---

## Advanced Configuration

### Custom Build Flags

```bash
# Enable verbose logging
bazel build //:valdi_ai_ui_android --verbose_failures

# Show compilation commands
bazel build //:valdi_ai_ui_android --subcommands

# Use custom NDK
bazel build //:valdi_ai_ui_android --android_ndk_version=25.2.9519653
```

### Build Variants

```bash
# Build specific ABI
bazel build //:valdi_ai_ui_android --android_cpu=arm64-v8a

# Build universal APK (all ABIs)
bazel build //:valdi_ai_ui_android --fat_apk_cpu=arm64-v8a,armeabi-v7a,x86_64,x86

# Build App Bundle (AAB) for Play Store
bazel build //:valdi_ai_ui_android --output_groups=+android_app_bundle
```

### Environment Variables

```bash
# Set minimum SDK version
export ANDROID_MIN_SDK=24

# Set target SDK version
export ANDROID_TARGET_SDK=34

# Build with custom config
npm run build:android
```

---

## Deployment Checklist

Before deploying to Play Store:

- [ ] Test on multiple Android versions (7.0+)
- [ ] Test on different devices (phones, tablets)
- [ ] Test in both portrait and landscape
- [ ] Verify all API keys are configured
- [ ] Check app icon and splash screen
- [ ] Test offline behavior
- [ ] Verify permissions are correct
- [ ] Run performance profiling
- [ ] Test memory usage
- [ ] Review crash reports
- [ ] Update version code and name
- [ ] Sign APK with release key
- [ ] Generate App Bundle (AAB)
- [ ] Test signed build thoroughly
- [ ] Submit to Play Store for review

---

## Additional Resources

### Android Documentation
- [Android Developer Guide](https://developer.android.com/guide)
- [App Distribution Guide](https://developer.android.com/distribute)
- [Android Studio User Guide](https://developer.android.com/studio/intro)

### Valdi Documentation
- [Valdi Official Docs](https://valdi.dev/docs)
- [Valdi Android Guide](https://valdi.dev/docs/platforms/android)
- [Valdi CLI Reference](https://valdi.dev/docs/cli)

### Community Support
- [Valdi Discord](https://discord.gg/valdi)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/valdi)
- [GitHub Issues](https://github.com/your-org/valdi-ai-ui/issues)

---

**Need more help?** Check the main [README.md](README.md) or open an issue on GitHub.
