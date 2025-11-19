# Android-Specific Setup & Notes

## Overview

This document covers Android-specific considerations, setup steps, known issues, and solutions for the Valdi Kitchen Sink application.

## Prerequisites

- **Android SDK** - Latest Android SDK installed and configured
- **Android Studio** (optional) - For easier debugging and device management
- **Bazel** - Required for building the Valdi project

## Building for Android

### Basic Build Command

```bash
bazel build //apps/kitchen_sink:kitchen_sink
```

### Installing on Device/Emulator

```bash
# Build and install in one command
bazel mobile-install //apps/kitchen_sink:kitchen_sink
```

### Running on Android Emulator

1. Start Android emulator:
   ```bash
   emulator -avd <your_avd_name>
   ```

2. Verify device is connected:
   ```bash
   adb devices
   ```

3. Install and run the app:
   ```bash
   bazel mobile-install //apps/kitchen_sink:kitchen_sink
   ```

## Known Issues & Solutions

### 1. NavigationPageComponent Runtime Error

**Issue:** App crashes on Android with error:
```
Cannot read property 'navigator' of undefined
at NavigationPageComponent.ts:19:85
```

**Root Cause:**

The `NavigationPageComponent` base class uses a class field initializer:

```typescript
navigationController = new NavigationController(this.context.navigator);
```

Class field initializers execute during object construction, BEFORE the component's context is initialized on Android. iOS has a different initialization order that allows this to work.

**Solution:**

Use `Component` + `@NavigationPage` decorator instead of extending `NavigationPageComponent`:

```typescript
// ❌ Breaks on Android
@NavigationPage(module)
export class MyPage extends NavigationPageComponent<MyViewModel> {
  // navigationController inherited from base class
}

// ✅ Works on both iOS and Android
@NavigationPage(module)
export class MyPage extends Component<MyViewModel> {
  // Access navigation via viewModel instead
  navigateToPage() {
    this.viewModel.navigationController.push(...);
  }
}
```

**Files Affected:**
- Fixed in `HomePage.tsx` (main landing page)
- Documented in `NavigationPageComponent.ts` (framework file)

**Testing Verification:**
- ✅ iOS Build: Passing
- ✅ Android Build: Passing
- ✅ Android Runtime: No errors in logcat

### 2. Asset Configuration

**Issue:** Assets may not be found at runtime if not properly configured.

**Solution:**

Ensure assets are properly declared in BUILD.bazel files:

```python
valdi_app(
    name = "kitchen_sink",
    assets = glob(["assets/**/*"]),  # Include all assets
    # ...
)
```

### 3. Context Initialization Timing

**Issue:** Components accessing framework services (navigation, etc.) during construction may fail on Android.

**Root Cause:** Android's component lifecycle initializes context later than iOS.

**Solution:**

- Avoid field initializers that access `this.context`
- Use lifecycle methods (`onCreate`, `onRender`) to access context
- Pass dependencies via viewModel/props when possible

**Example:**

```typescript
// ❌ May fail on Android
class MyComponent extends Component {
  myService = new Service(this.context.something);  // Executed during construction
}

// ✅ Works on both platforms
class MyComponent extends Component {
  private myService?: Service;

  onCreate() {
    // Context is guaranteed to be available here
    this.myService = new Service(this.context.something);
  }
}
```

## Debugging on Android

### Viewing Logs

Use logcat to view application logs:

```bash
# View all logs from Valdi runtime
adb logcat | grep Valdi

# View errors only
adb logcat | grep "E Valdi"

# View specific tag
adb logcat -s "Valdi:*"
```

### Common Log Messages

**Successful initialization:**
```
I Valdi : Valdi runtime initialized
I Valdi : Loading component: App@main_app/src/App
```

**Runtime errors:**
```
E Valdi : Uncaught JS error in 'main_app': [error message]
E Valdi : Stacktrace: [stack trace]
```

### Debugging Tools

1. **Chrome DevTools** (if supported by Valdi):
   ```bash
   # Forward debugging port
   adb forward tcp:9222 localabstract:valdi_debug
   # Open chrome://inspect in Chrome
   ```

2. **Android Studio Logcat Viewer**:
   - Filter by "Valdi" tag
   - Color-coded severity levels
   - Easy stack trace navigation

## Performance Considerations

### Android-Specific Optimizations

1. **Reduce Overdraw**
   - Use background colors sparingly
   - Avoid nested transparent views
   - Enable "Show GPU Overdraw" in Developer Options to visualize

2. **Memory Management**
   - Android has more aggressive memory limits than iOS
   - Test on low-end devices (1-2GB RAM)
   - Monitor memory usage with Android Profiler

3. **Animation Performance**
   - Some Android devices have lower frame rates
   - Test animations on real hardware, not just emulator
   - Consider reducing animation complexity on older devices

4. **Build Size**
   - Android APK size affects download and installation
   - Use ProGuard/R8 for release builds (if supported)
   - Monitor APK size with `apkanalyzer`

## Testing on Android

### Recommended Test Matrix

| Device Category | Example | Min API | Notes |
|----------------|---------|---------|-------|
| Low-end | Moto E | API 21 | Test performance |
| Mid-range | Pixel 4a | API 28 | Common baseline |
| High-end | Pixel 8 | API 34 | Latest features |
| Tablet | Galaxy Tab | API 29 | Large screen layout |

### Testing Checklist

- [ ] App launches without crashes
- [ ] All demos are accessible via HomePage
- [ ] Navigation works (push/pop)
- [ ] Animations run smoothly (>30fps)
- [ ] Text is readable at all font sizes
- [ ] Touch targets are appropriately sized (min 48dp)
- [ ] App doesn't crash on rotation (if supported)
- [ ] Back button navigation works correctly

## Platform Differences: iOS vs Android

### Component Lifecycle

| Aspect | iOS | Android |
|--------|-----|---------|
| Context initialization | Early (during construction) | Late (after construction) |
| Field initializer timing | Before context setup | Before context setup |
| Impact | Can access context in initializers | Cannot access context in initializers |

### Build System

| Aspect | iOS | Android |
|--------|-----|---------|
| Build command | `bazel build //apps/kitchen_sink:kitchen_sink_ios` | `bazel build //apps/kitchen_sink:kitchen_sink` |
| Install command | Simulator or device | `bazel mobile-install` |
| Asset handling | Automatic | Requires explicit configuration |

### UI Rendering

| Feature | iOS | Android |
|---------|-----|---------|
| Text rendering | CoreText | TextView/Canvas |
| Animation | Core Animation | Property Animation |
| Layout | Auto Layout concepts | ConstraintLayout concepts |
| Performance | Generally consistent | Varies by device tier |

## Troubleshooting

### App Won't Install

1. **Check device connection:**
   ```bash
   adb devices
   ```

2. **Uninstall previous version:**
   ```bash
   adb uninstall com.valdi.kitchen_sink
   ```

3. **Clean and rebuild:**
   ```bash
   bazel clean
   bazel build //apps/kitchen_sink:kitchen_sink
   ```

### App Crashes on Launch

1. **Check logcat for errors:**
   ```bash
   adb logcat | grep -i error
   ```

2. **Verify BUILD.bazel configuration:**
   - Root component path is correct
   - All dependencies are listed
   - Assets are included

3. **Check for Android-specific code issues:**
   - NavigationPageComponent usage (see Known Issues)
   - Context access in field initializers
   - Platform-specific APIs

### Navigation Not Working

1. **Verify @NavigationPage decorator** is used
2. **Check NavigationController is passed** via viewModel
3. **Ensure dependencies include** `valdi_navigation` module
4. **Review logs** for navigation-related errors

## Best Practices for Android Development

1. **Test Early and Often**
   - Don't assume iOS behavior matches Android
   - Test on real devices, not just emulator
   - Include low-end devices in test matrix

2. **Follow Android Guidelines**
   - Use appropriate touch target sizes (min 48dp)
   - Respect system fonts and accessibility settings
   - Handle back button navigation properly

3. **Optimize for Performance**
   - Profile on actual hardware
   - Monitor memory usage
   - Test animations at various frame rates

4. **Handle Lifecycle Correctly**
   - Don't access context in field initializers
   - Use onCreate() for initialization
   - Clean up in onDestroy()

5. **Document Platform Differences**
   - Comment Android-specific workarounds
   - Explain why certain patterns are used
   - Reference this doc for common issues

## Additional Resources

- [Android Developer Documentation](https://developer.android.com/)
- [Valdi Framework Documentation](https://github.com/valdi-labs/valdi)
- [Bazel Android Rules](https://bazel.build/tutorials/android-app)
- TROUBLESHOOTING.md for common issues across platforms
- ARCHITECTURE.md for overall project structure

## Contributing

When contributing Android-specific code:

1. **Test on both platforms** before submitting PR
2. **Document Android-specific behavior** in code comments
3. **Update this document** if you discover new issues or solutions
4. **Follow the patterns** established in existing components (see `HomePage.tsx`)

## Support

For Android-specific issues:

1. Check TROUBLESHOOTING.md
2. Search existing GitHub issues
3. Create new issue with:
   - Android version
   - Device model
   - Logcat output
   - Steps to reproduce
