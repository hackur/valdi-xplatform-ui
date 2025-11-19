# Troubleshooting Guide

This guide covers common issues you may encounter while working with the Valdi Kitchen Sink application, and their solutions.

## Table of Contents

- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Navigation Issues](#navigation-issues)
- [Android-Specific Issues](#android-specific-issues)
- [Performance Problems](#performance-problems)
- [Development Workflow](#development-workflow)

---

## Build Issues

### Build Fails with "Target not found"

**Symptoms:**
```
ERROR: Skipping '//apps/kitchen_sink:kitchen_sink': no such target
```

**Solutions:**

1. Verify you're in the correct directory:
   ```bash
   cd /path/to/valdi-xplatform-ui/Valdi
   ```

2. Check BUILD.bazel file exists:
   ```bash
   ls apps/kitchen_sink/BUILD.bazel
   ```

3. Ensure target name matches:
   ```python
   # In BUILD.bazel
   valdi_app(name = "kitchen_sink", ...)  # Must match target name
   ```

### Module Not Found / Import Errors

**Symptoms:**
```
Cannot find module 'valdi_core/src/Component'
```

**Solutions:**

1. Check module is listed in deps:
   ```python
   valdi_module(
       deps = [
           "//src/valdi_modules/src/valdi/valdi_core",  # Add if missing
       ]
   )
   ```

2. Verify import path is correct (relative to module name, not file system)

3. Clean and rebuild:
   ```bash
   bazel clean
   bazel build //apps/kitchen_sink:kitchen_sink
   ```

### TypeScript Compilation Errors

**Symptoms:**
```
ERROR: TypeScript compilation failed
```

**Solutions:**

1. Check type definitions match:
   ```typescript
   // Ensure interface matches usage
   interface MyViewModel {
     title: string;  // Must match prop type
   }
   ```

2. Verify all files are included in BUILD.bazel:
   ```python
   srcs = glob(["src/**/*.ts", "src/**/*.tsx"]),  # Includes all TS/TSX files
   ```

---

## Runtime Errors

### "Cannot read property 'navigator' of undefined" (Android)

**Symptoms:**
- App crashes on Android immediately after launch
- Error in logcat: `Cannot read property 'navigator' of undefined`
- Error location: `NavigationPageComponent.ts:19:85`

**Root Cause:**

Component extends `NavigationPageComponent`, which has a field initializer that executes before context is available on Android.

**Solution:**

Change component to extend `Component` instead:

```typescript
// ❌ BEFORE (breaks on Android)
@NavigationPage(module)
export class MyPage extends NavigationPageComponent<MyViewModel> {
  // Inherits navigationController from base class
}

// ✅ AFTER (works on both iOS and Android)
@NavigationPage(module)
export class MyPage extends Component<MyViewModel> {
  // Access navigation via viewModel.navigationController
  navigateToDemo() {
    this.viewModel.navigationController.push(...);
  }
}
```

**See Also:**
- ANDROID.md for detailed explanation
- `HomePage.tsx` for working example
- `NavigationPageComponent.ts` for technical documentation

### State Not Updating

**Symptoms:**
- Changed state values but UI doesn't update
- Component not re-rendering

**Solutions:**

1. **Always use setState()** - Never mutate state directly:
   ```typescript
   // ❌ Wrong
   this.state.counter++;

   // ✅ Correct
   this.setState({ counter: this.state.counter + 1 });
   ```

2. **Use immutable updates for arrays/objects**:
   ```typescript
   // ❌ Wrong (mutates existing array)
   this.state.items.push(newItem);

   // ✅ Correct (creates new array)
   this.setState({ items: [...this.state.items, newItem] });
   ```

3. **Group related updates**:
   ```typescript
   // ✅ Single setState call for multiple properties
   this.setState({
     counter: this.state.counter + 1,
     lastUpdate: Date.now(),
   });
   ```

---

## Navigation Issues

### Navigation Not Working / Page Won't Open

**Symptoms:**
- Tapping demo card does nothing
- Console shows navigation attempt but no page opens

**Solutions:**

1. **Verify @NavigationPage decorator**:
   ```typescript
   @NavigationPage(module)  // Must be present
   export class MyDemo extends Component { ... }
   ```

2. **Check navigationController is passed**:
   ```typescript
   navController.push(
     MyDemo,
     { navigationController: navController },  // Must pass controller
     {}
   );
   ```

3. **Ensure module dependency is added** in BUILD.bazel:
   ```python
   deps = [
       "//apps/kitchen_sink/modules/my_demo",  # Must be listed
   ]
   ```

4. **Verify component is imported** in HomePage:
   ```typescript
   import { MyDemo } from '../../my_demo/src/MyDemo';
   ```

### Back Button Not Working

**Symptoms:**
- Back button visible but doesn't navigate back
- No error in console

**Solutions:**

1. **Call navigationController.pop()**:
   ```typescript
   <Header
     showBack={true}
     onBack={() => this.viewModel.navigationController.pop()}  // Must call pop
   />
   ```

2. **Ensure navigationController is available**:
   ```typescript
   // Check viewModel has navigationController
   export interface MyViewModel {
     navigationController: NavigationController;  // Required
   }
   ```

---

## Android-Specific Issues

### App Crashes Only on Android (Works on iOS)

**Common Causes:**

1. **Context access in field initializers** - See "Cannot read property 'navigator' of undefined" above

2. **Platform-specific API usage** - Check if code uses iOS-only APIs

3. **Different initialization order** - Move initialization from constructor to `onCreate()`

**Debugging Steps:**

1. Check Android logcat:
   ```bash
   adb logcat | grep Valdi
   ```

2. Compare component structure to working examples (HomePage, TextDemo, etc.)

3. See ANDROID.md for detailed Android-specific issues

### Assets Not Loading on Android

**Symptoms:**
- Images or other assets work on iOS but not Android
- "Asset not found" errors in logcat

**Solutions:**

1. **Verify assets are declared in BUILD.bazel**:
   ```python
   valdi_app(
       assets = glob(["assets/**/*"]),  # Include all assets
   )
   ```

2. **Check asset paths are correct**:
   ```typescript
   // Use paths relative to assets directory
   <image src="images/logo.png" />  // Not "/assets/images/logo.png"
   ```

---

## Performance Problems

### Animations Stuttering / Low Frame Rate

**Symptoms:**
- Animations look choppy
- UI feels sluggish

**Solutions:**

1. **Use transform/opacity** instead of layout properties:
   ```typescript
   // ❌ Slower (forces layout recalculation)
   animate(() => this.setState({ width: 200 }), ...);

   // ✅ Faster (GPU-accelerated)
   animate(() => this.setState({ scale: 2 }), ...);
   ```

2. **Reduce animation duration**:
   ```typescript
   // Keep under 400ms for better perceived performance
   { duration: 300, curve: AnimationCurve.easeInOut }
   ```

3. **Test on actual hardware** - Emulator may not reflect real performance

4. **Limit concurrent animations** - Too many at once can cause frame drops

### App Feels Slow / Unresponsive

**Solutions:**

1. **Check for unnecessary re-renders**:
   - Keep state minimal
   - Derive computed values in render
   - Avoid deep component nesting

2. **Optimize state updates**:
   - Batch updates with single setState
   - Use immutable patterns (faster change detection)

3. **Profile on low-end devices**:
   - Test on older Android devices (2-3 years old)
   - Check memory usage with Android Profiler

---

## Development Workflow

### Changes Not Appearing After Rebuild

**Solutions:**

1. **Hard rebuild**:
   ```bash
   bazel clean
   bazel build //apps/kitchen_sink:kitchen_sink
   ```

2. **Clear app data on device**:
   ```bash
   adb shell pm clear com.valdi.kitchen_sink
   ```

3. **Restart ADB**:
   ```bash
   adb kill-server
   adb start-server
   ```

### Bazel Build is Slow

**Solutions:**

1. **Use remote cache** (if available):
   ```bash
   bazel build --remote_cache=...
   ```

2. **Build only what changed**:
   ```bash
   # Builds incrementally
   bazel build //apps/kitchen_sink:kitchen_sink
   ```

3. **Clean only when necessary** - `bazel clean` forces full rebuild

---

## Common Mistakes & How to Avoid Them

### 1. Mutating State Directly

**Mistake:**
```typescript
this.state.items.push(newItem);  // ❌ Mutates state
```

**Fix:**
```typescript
this.setState({ items: [...this.state.items, newItem] });  // ✅ Creates new array
```

### 2. Forgetting to Pass NavigationController

**Mistake:**
```typescript
navController.push(MyDemo, {}, {});  // ❌ Missing navigationController
```

**Fix:**
```typescript
navController.push(
  MyDemo,
  { navigationController: navController },  // ✅ Passed correctly
  {}
);
```

### 3. Accessing Context in Field Initializers

**Mistake:**
```typescript
class MyComponent extends Component {
  service = new Service(this.context.api);  // ❌ Context not ready yet
}
```

**Fix:**
```typescript
class MyComponent extends Component {
  private service?: Service;

  onCreate() {
    this.service = new Service(this.context.api);  // ✅ Context available
  }
}
```

### 4. Missing Module Dependencies

**Mistake:**
```python
# BUILD.bazel - forgot to add dependency
deps = [
    "//src/valdi_modules/src/valdi/valdi_core",
    # Missing: "//apps/kitchen_sink/modules/common",
]
```

**Fix:**
```python
deps = [
    "//src/valdi_modules/src/valdi/valdi_core",
    "//apps/kitchen_sink/modules/common",  # ✅ Added
]
```

---

## Getting Help

If you're still stuck after trying these solutions:

1. **Check existing documentation**:
   - README.md - Project overview and setup
   - ARCHITECTURE.md - Project structure and patterns
   - ANDROID.md - Android-specific issues
   - Code comments - Most components have detailed explanations

2. **Search existing issues**:
   - GitHub Issues for Valdi framework
   - Look for similar error messages

3. **Create a new issue**:
   - Describe the problem clearly
   - Include error messages and stack traces
   - Specify platform (iOS/Android) and version
   - Provide steps to reproduce
   - Include relevant code snippets

4. **Useful debugging commands**:
   ```bash
   # View Android logs
   adb logcat | grep Valdi

   # Check Bazel build graph
   bazel query --output=graph //apps/kitchen_sink:kitchen_sink

   # Verify dependencies
   bazel query 'deps(//apps/kitchen_sink:kitchen_sink)'
   ```

---

## Reference

- [Valdi Framework Documentation](https://github.com/valdi-labs/valdi)
- [Bazel Build System](https://bazel.build/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- ARCHITECTURE.md - Overall project architecture
- ANDROID.md - Android-specific details
- CONTRIBUTING.md - Development guidelines
