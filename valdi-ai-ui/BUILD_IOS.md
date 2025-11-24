# iOS Build Guide

Complete guide for building and deploying Valdi AI UI to iOS devices and simulators.

---

## Prerequisites

### System Requirements

- **macOS** 12.0 (Monterey) or later
- **Xcode** 15.0 or later
- **Command Line Tools** for Xcode
- **CocoaPods** 1.12.0 or later
- **Node.js** 18+ and **npm** 9+
- **Bazel** 7.0.0 (via Bazelisk recommended)
- **Valdi CLI** installed globally

### Verify Prerequisites

```bash
# Check Xcode version
xcodebuild -version
# Should show: Xcode 15.0 or higher

# Check Command Line Tools
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer

# Check CocoaPods
pod --version
# Should show: 1.12.0 or higher

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

### 1. Install Xcode

Download and install Xcode from the Mac App Store or [Apple Developer](https://developer.apple.com/xcode/).

```bash
# Install Command Line Tools
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept
```

### 2. Install CocoaPods

```bash
# Using Homebrew (recommended)
brew install cocoapods

# Or using gem
sudo gem install cocoapods

# Verify installation
pod --version
```

### 3. Install Valdi CLI

```bash
# Install globally via npm
npm install -g valdi-cli

# Verify installation
valdi --version
```

### 4. Install Dependencies

```bash
# Navigate to project root
cd /path/to/valdi-ai-ui

# Install npm dependencies
npm install

# Install iOS pods (if needed)
cd ios && pod install && cd ..
```

---

## Building for iOS

### Method 1: Using npm Scripts (Recommended)

```bash
# Build and install to iOS simulator
npm run build:ios

# This runs:
# 1. bazel build //:valdi_ai_ui
# 2. valdi install ios --app=//:valdi_ai_ui
```

### Method 2: Using Bazel Directly

```bash
# Build the iOS target
bazel build //:valdi_ai_ui

# Install to simulator
valdi install ios --app=//:valdi_ai_ui

# Or specify device
valdi install ios --app=//:valdi_ai_ui --device="iPhone 15 Pro"
```

### Method 3: Using Xcode

```bash
# Generate Xcode project
bazel run //:valdi_ai_ui_xcode

# Open in Xcode
open -a Xcode ios/ValdiAIUI.xcodeproj

# Then build and run from Xcode (⌘R)
```

---

## Running on Simulator

### List Available Simulators

```bash
# List all simulators
xcrun simctl list devices available

# List booted simulators
xcrun simctl list devices | grep Booted
```

### Launch Specific Simulator

```bash
# Boot simulator
xcrun simctl boot "iPhone 15 Pro"

# Open Simulator app
open -a Simulator

# Install and run app
npm run build:ios
```

### Simulator Shortcuts

- **⌘ + Shift + H**: Home button
- **⌘ + K**: Toggle software keyboard
- **⌘ + R**: Rotate device
- **⌘ + →/←**: Rotate left/right
- **⌘ + D**: Open debug menu (if available)

---

## Running on Physical Device

### 1. Device Setup

```bash
# Connect device via USB
# Unlock device and trust computer

# Verify device is connected
xcrun xctrace list devices

# Or using instruments
instruments -s devices
```

### 2. Configure Signing

```bash
# Open Xcode project
open ios/ValdiAIUI.xcodeproj

# In Xcode:
# 1. Select project in navigator
# 2. Select target "ValdiAIUI"
# 3. Go to "Signing & Capabilities"
# 4. Select your team
# 5. Ensure "Automatically manage signing" is checked
```

### 3. Deploy to Device

```bash
# Build and install
valdi install ios --app=//:valdi_ai_ui --device="Your Device Name"

# Or let Valdi select connected device
npm run build:ios
```

### 4. Trust Developer Certificate

On your device:
1. Go to **Settings > General > Device Management**
2. Select your developer profile
3. Tap **Trust**
4. Confirm by tapping **Trust** again

---

## Build Configurations

### Debug Build

```bash
# Default debug build
bazel build //:valdi_ai_ui --compilation_mode=dbg

# Install debug build
valdi install ios --app=//:valdi_ai_ui --mode=debug
```

Features:
- Source maps enabled
- Debug symbols included
- Assertions enabled
- Larger bundle size
- Not optimized

### Release Build

```bash
# Optimized release build
bazel build //:valdi_ai_ui --compilation_mode=opt

# Install release build
valdi install ios --app=//:valdi_ai_ui --mode=release
```

Features:
- Minified code
- Dead code elimination
- Optimizations enabled
- Smaller bundle size
- No debug symbols

### Profile Build

```bash
# Profile build with some debug info
bazel build //:valdi_ai_ui --compilation_mode=fastbuild
```

---

## Testing

### Simulator Testing

```bash
# Run tests on simulator
bazel test //... --test_output=all

# Run specific test
bazel test //modules/common:tests --test_output=all

# Run with coverage
bazel coverage //... --combined_report=lcov
```

### Device Testing

```bash
# Connect device and run tests
bazel test //... --ios_simulator=device

# Or using Xcode
open ios/ValdiAIUI.xcodeproj
# Press ⌘U to run tests
```

---

## Troubleshooting

### Issue: Xcode Command Line Tools Not Found

```bash
# Install Command Line Tools
xcode-select --install

# Set Xcode path
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Verify
xcode-select -p
```

### Issue: CocoaPods Installation Fails

```bash
# Update gem
sudo gem update --system

# Clear CocoaPods cache
pod cache clean --all

# Reinstall
sudo gem uninstall cocoapods
sudo gem install cocoapods
```

### Issue: Simulator Won't Boot

```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Restart CoreSimulator service
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService

# Reboot simulator
xcrun simctl boot "iPhone 15 Pro"
```

### Issue: Device Not Recognized

```bash
# Reset location and privacy
# On device: Settings > General > Reset > Reset Location & Privacy

# Restart usbmuxd service
sudo killall -9 usbmuxd

# Reconnect device
# Unplug and replug USB cable
# Unlock device and trust computer
```

### Issue: Signing Certificate Issues

```bash
# Open Keychain Access
open -a "Keychain Access"

# Verify certificates:
# - "Apple Development" certificate should be present
# - Certificate should be valid (not expired)

# If missing, download from Apple Developer portal:
# https://developer.apple.com/account/resources/certificates
```

### Issue: Build Cache Issues

```bash
# Clean Bazel cache
bazel clean

# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clean pods
cd ios && pod deintegrate && pod install && cd ..

# Rebuild
npm run build:ios
```

### Issue: App Crashes on Launch

```bash
# Check crash logs
open ~/Library/Logs/DiagnosticReports/

# Or using Console app
open -a Console

# Filter by process name: "ValdiAIUI"
```

### Issue: Provisioning Profile Errors

1. Open Xcode
2. Go to **Preferences > Accounts**
3. Select your Apple ID
4. Click **Download Manual Profiles**
5. Try building again

### Issue: Valdi CLI Not Found

```bash
# Reinstall Valdi CLI
npm uninstall -g valdi-cli
npm install -g valdi-cli

# Or use npx
npx valdi-cli install ios --app=//:valdi_ai_ui
```

---

## Performance Optimization

### Build Performance

```bash
# Use remote cache (if available)
bazel build //:valdi_ai_ui --remote_cache=<cache-url>

# Increase build parallelism
bazel build //:valdi_ai_ui --jobs=8

# Use disk cache
bazel build //:valdi_ai_ui --disk_cache=~/.cache/bazel
```

### Runtime Performance

1. **Enable Release Mode**
   ```bash
   npm run build:ios -- --mode=release
   ```

2. **Profile with Instruments**
   ```bash
   # Open Instruments
   open -a Instruments

   # Select Time Profiler or Allocations
   # Attach to ValdiAIUI process
   # Record and analyze
   ```

3. **Optimize Bundle Size**
   ```bash
   # Analyze bundle
   bazel build //:valdi_ai_ui --output_groups=+size_analysis

   # View bundle size
   ls -lh bazel-bin/valdi_ai_ui.ipa
   ```

---

## Advanced Configuration

### Custom Build Flags

```bash
# Enable verbose logging
bazel build //:valdi_ai_ui --verbose_failures

# Show compilation commands
bazel build //:valdi_ai_ui --subcommands

# Use custom SDK
bazel build //:valdi_ai_ui --ios_sdk_version=17.0
```

### Environment Variables

```bash
# Set deployment target
export IPHONEOS_DEPLOYMENT_TARGET=14.0

# Set architecture
export ARCHS="arm64"

# Build with custom config
npm run build:ios
```

### Xcode Build Settings

Edit `ios/ValdiAIUI.xcodeproj/project.pbxproj` or use Xcode UI:

- **Deployment Target**: iOS 14.0+
- **Swift Version**: Swift 5.9+
- **Optimization Level**: -Os (release)
- **Dead Code Stripping**: Yes
- **Strip Debug Symbols**: Yes (release)

---

## Deployment Checklist

Before deploying to TestFlight or App Store:

- [ ] Test on multiple iOS versions (14.0+)
- [ ] Test on different devices (iPhone, iPad)
- [ ] Test in both portrait and landscape
- [ ] Verify all API keys are configured
- [ ] Check app icon and launch screen
- [ ] Test offline behavior
- [ ] Verify accessibility features
- [ ] Run performance profiling
- [ ] Test memory usage
- [ ] Review crash reports
- [ ] Update version and build number
- [ ] Archive and export IPA
- [ ] Submit to TestFlight for beta testing

---

## Additional Resources

### Apple Documentation
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [App Distribution Guide](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)
- [iOS App Programming Guide](https://developer.apple.com/library/archive/documentation/iPhone/Conceptual/iPhoneOSProgrammingGuide/)

### Valdi Documentation
- [Valdi Official Docs](https://valdi.dev/docs)
- [Valdi iOS Guide](https://valdi.dev/docs/platforms/ios)
- [Valdi CLI Reference](https://valdi.dev/docs/cli)

### Community Support
- [Valdi Discord](https://discord.gg/valdi)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/valdi)
- [GitHub Issues](https://github.com/your-org/valdi-ai-ui/issues)

---

**Need more help?** Check the main [README.md](README.md) or open an issue on GitHub.
