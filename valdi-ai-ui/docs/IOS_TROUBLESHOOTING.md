# iOS Troubleshooting Guide

This guide provides solutions to common issues encountered when building and running the Valdi AI UI application on iOS.

## Table of Contents

1. [Build Errors](#build-errors)
2. [Simulator Issues](#simulator-issues)
3. [Signing and Provisioning](#signing-and-provisioning)
4. [Runtime Errors](#runtime-errors)
5. [Performance Issues](#performance-issues)
6. [Development Environment](#development-environment)
7. [Dependency Issues](#dependency-issues)
8. [AI SDK Issues](#ai-sdk-issues)

---

## Build Errors

### Error: Repository '@@build_bazel_rules_apple' is not defined

**Symptom:**
```
ERROR: error loading package '': Unable to find package for @@build_bazel_rules_apple//apple:versioning.bzl
```

**Cause:** Missing Apple build rules dependency in Bazel configuration.

**Solution:**

1. Check if you have a `MODULE.bazel` or `WORKSPACE` file in your project root
2. Add the Apple build rules dependency:

**For MODULE.bazel (Bazel 6+):**
```python
bazel_dep(name = "rules_apple", version = "3.0.0")
```

**For WORKSPACE:**
```python
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "build_bazel_rules_apple",
    sha256 = "...",  # Get from rules_apple releases
    url = "https://github.com/bazelbuild/rules_apple/releases/download/3.0.0/rules_apple.3.0.0.tar.gz",
)

load("@build_bazel_rules_apple//apple:repositories.bzl", "apple_rules_dependencies")
apple_rules_dependencies()
```

3. Run `bazel clean --expunge` to clear cached state
4. Try building again: `bazel build //:valdi_ai_ui`

### Error: TypeScript compilation errors (38 errors)

**Symptom:**
```
modules/chat_core/src/ToolDefinitions.ts(26,3): error TS2769: No overload matches this call
modules/common/src/components/Avatar.tsx(153,6): error TS2315: Type 'Style' is not generic
```

**Cause:** Type mismatches between AI SDK, Valdi framework, and application code.

**Solution:**

1. **Tool Definition Errors:**
   - Update tool definitions to match AI SDK v5 API
   - Ensure `execute` functions are properly typed
   - Check that tool schemas match Zod expectations

   Example fix:
   ```typescript
   // Before (incorrect)
   export const weatherTool = {
     execute: async ({ location }) => { ... }
   };

   // After (correct)
   export const weatherTool = tool({
     parameters: z.object({ location: z.string() }),
     execute: async ({ location }) => { ... }
   });
   ```

2. **Style Generic Errors:**
   - Update Style type usage to match Valdi framework
   - Check `__mocks__/valdi_core/src/Style.ts` for correct type definition
   - Ensure Style<T> is used consistently

   Example fix:
   ```typescript
   // Before (incorrect)
   const containerStyle: Style = { ... };

   // After (correct)
   const containerStyle = Style({ ... });
   ```

3. **Import Errors:**
   - Use `import type` for type-only imports
   - Fix unused imports
   - Ensure all imports resolve correctly

   Example fix:
   ```typescript
   // Before (incorrect)
   import { Message } from '@chat_core/types';

   // After (correct)
   import type { Message } from '@chat_core/types';
   ```

4. Run `npm run type-check` to verify fixes

### Error: Bazel build fails with "No such file or directory"

**Symptom:**
```
ERROR: Missing input file '//modules/...'
```

**Cause:** Module files not properly registered in Bazel build rules.

**Solution:**

1. Ensure all TypeScript files are included in module BUILD.bazel files
2. Check that resource files (images, fonts) are listed in assets
3. Verify that all dependencies are declared in `deps` array
4. Clean and rebuild: `bazel clean && bazel build //:valdi_ai_ui`

---

## Simulator Issues

### Simulator not launching

**Symptom:** iOS Simulator doesn't open or app doesn't install.

**Solution:**

1. **Check Simulator Status:**
   ```bash
   xcrun simctl list devices
   ```

2. **Boot a Simulator:**
   ```bash
   xcrun simctl boot "iPhone 14 Pro"
   ```

3. **Reset Simulator:**
   ```bash
   xcrun simctl erase all
   ```

4. **Reinstall App:**
   ```bash
   npm run build:ios
   # or
   valdi install ios --app=//:valdi_ai_ui
   ```

### App crashes immediately on launch

**Symptom:** App opens and immediately closes on simulator.

**Solution:**

1. **Check Console Logs:**
   - Open Xcode Console (Cmd+Shift+C)
   - Filter by your app name
   - Look for crash logs

2. **Common Causes:**
   - Missing required frameworks
   - API key configuration errors
   - Storage initialization failures
   - JavaScript bundle loading errors

3. **Debug Steps:**
   ```bash
   # Enable debug logging
   export VALDI_DEBUG=1
   npm run build:ios

   # Check iOS logs
   xcrun simctl spawn booted log stream --predicate 'process == "valdi_ai_ui"'
   ```

### Simulator keyboard not showing

**Symptom:** Typing in text fields doesn't work.

**Solution:**

1. Toggle hardware keyboard: `Cmd+K` in Simulator
2. Ensure "Connect Hardware Keyboard" is disabled in Simulator menu
3. Try toggling: I/O → Keyboard → Toggle Software Keyboard

### Simulator runs slowly

**Symptom:** Poor performance, laggy animations.

**Solution:**

1. Reduce simulator scale: Window → Physical Size (Cmd+1)
2. Close other simulators
3. Restart simulator
4. Check available disk space
5. Consider using a physical device for testing

---

## Signing and Provisioning

### Code signing error

**Symptom:**
```
error: No signing certificate "iOS Development" found
```

**Solution:**

1. **For Development/Simulator:**
   - Simulator builds don't require signing
   - Ensure you're building for simulator: `bazel build //:valdi_ai_ui --ios_minimum_os=14.0`

2. **For Physical Device:**
   - Open Xcode
   - Go to Preferences → Accounts
   - Add your Apple ID
   - Download signing certificates
   - Configure signing in BUILD.bazel or Xcode project

### Provisioning profile error

**Symptom:**
```
error: Provisioning profile "..." doesn't include signing certificate
```

**Solution:**

1. Login to [Apple Developer Portal](https://developer.apple.com)
2. Go to Certificates, Identifiers & Profiles
3. Create/download appropriate provisioning profile
4. Install provisioning profile:
   ```bash
   open ~/Library/MobileDevice/Provisioning\ Profiles/
   ```
5. Double-click downloaded profile to install

### Bundle identifier mismatch

**Symptom:**
```
error: Bundle identifier "com.valdi.aiui" doesn't match provisioning profile
```

**Solution:**

1. Check BUILD.bazel for correct bundle ID:
   ```python
   ios_bundle_id = "com.valdi.aiui",
   ```

2. Ensure provisioning profile matches bundle ID
3. Update bundle ID in Apple Developer Portal if needed
4. Regenerate provisioning profile
5. Rebuild app

---

## Runtime Errors

### "localStorage is not defined" or "window is not defined"

**Symptom:**
```
ReferenceError: localStorage is not defined
ReferenceError: window is not defined
```

**Cause:** Browser APIs used in code that runs on iOS.

**Solution:**

1. **Identify Files Using Browser APIs:**
   ```bash
   grep -r "localStorage\|sessionStorage\|window\.\|document\." modules/
   ```

2. **Replace with Valdi APIs:**
   ```typescript
   // Before (browser-specific)
   localStorage.setItem('key', 'value');

   // After (Valdi persistence)
   import { Storage } from 'valdi_persistence/src/Storage';
   const storage = new Storage();
   await storage.set('key', 'value');
   ```

3. **Files Known to Use Browser APIs:**
   - `modules/chat_core/src/StorageProvider.ts`
   - `modules/settings/src/PreferencesStore.ts`
   - `modules/settings/src/ApiKeyStore.ts`
   - `modules/common/src/services/StorageProvider.ts`

4. **Temporary Polyfill (for testing only):**
   ```typescript
   // Create __mocks__/storage-polyfill.ts
   if (typeof localStorage === 'undefined') {
     global.localStorage = {
       getItem: () => null,
       setItem: () => {},
       removeItem: () => {},
       clear: () => {},
       key: () => null,
       length: 0,
     };
   }
   ```

### API request fails with network error

**Symptom:**
```
Error: Network request failed
Error: timeout of 30000ms exceeded
```

**Solution:**

1. **Check Network Connectivity:**
   - Simulator should have internet access by default
   - Test with Safari in simulator

2. **Check API Keys:**
   ```typescript
   // Verify keys are set
   console.log('API Key configured:', !!process.env.OPENAI_API_KEY);
   ```

3. **Check ATS (App Transport Security):**
   - iOS requires HTTPS by default
   - For development, you may need to configure Info.plist:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsArbitraryLoads</key>
     <true/>
   </dict>
   ```

4. **Enable Network Debugging:**
   ```typescript
   // Add to API client
   console.log('Request URL:', url);
   console.log('Request headers:', headers);
   ```

5. **Check Request Timeouts:**
   ```typescript
   // Increase timeout for slow connections
   const response = await fetch(url, {
     signal: AbortSignal.timeout(60000), // 60 seconds
   });
   ```

### Streaming responses not working

**Symptom:** Messages appear all at once instead of streaming.

**Solution:**

1. **Verify Streaming Support:**
   ```typescript
   import { streamText } from 'ai';

   // Ensure you're using streamText, not generateText
   const result = await streamText({
     model: openai('gpt-4'),
     prompt: 'Hello',
   });

   for await (const chunk of result.textStream) {
     // Process chunks
   }
   ```

2. **Check Component Updates:**
   ```typescript
   // Ensure component re-renders on state updates
   this.scheduleRender(); // Valdi
   ```

3. **Debug Streaming:**
   ```typescript
   for await (const chunk of stream) {
     console.log('Received chunk:', chunk);
   }
   ```

### Memory leaks and crashes

**Symptom:** App crashes after extended use or memory warnings.

**Solution:**

1. **Profile Memory Usage:**
   - Open Xcode
   - Product → Profile
   - Choose "Leaks" instrument
   - Run app and look for leaks

2. **Common Causes:**
   - Unsubscribed observables
   - Unreleased event listeners
   - Large message history in memory
   - Images not properly released

3. **Fix Patterns:**
   ```typescript
   // Use Valdi disposables
   class MyComponent extends Component {
     onCreate() {
       const subscription = observable.subscribe(...);
       this.registerDisposable(subscription);
     }
   }

   // Clear old messages
   if (messages.length > 100) {
     messages = messages.slice(-100); // Keep last 100
   }

   // Dispose of components properly
   onDestroy() {
     // Cleanup code here
   }
   ```

---

## Performance Issues

### App startup is slow (> 2 seconds)

**Symptom:** Long delay between app launch and first screen.

**Solution:**

1. **Profile Startup:**
   ```typescript
   console.time('Startup');
   // ... initialization code
   console.timeEnd('Startup');
   ```

2. **Optimize Initialization:**
   - Lazy load modules
   - Defer non-critical initialization
   - Use async initialization where possible
   - Cache expensive computations

3. **Reduce Bundle Size:**
   ```bash
   # Check bundle size
   bazel build //:valdi_ai_ui --verbose_failures

   # Analyze dependencies
   npm ls --depth=0
   ```

4. **Remove Unused Code:**
   - Remove unused imports
   - Tree-shake dependencies
   - Lazy load large dependencies

### Scrolling is janky

**Symptom:** Frame drops when scrolling message list.

**Solution:**

1. **Use Virtual Scrolling:**
   ```typescript
   // For long lists, render only visible items
   const visibleMessages = messages.slice(startIndex, endIndex);
   ```

2. **Optimize Renders:**
   ```typescript
   // Avoid expensive operations in render
   onRender() {
     // Don't do heavy computation here
     return <view>{this.cachedContent}</view>;
   }
   ```

3. **Use shouldComponentUpdate:**
   ```typescript
   onViewModelUpdate(previousViewModel) {
     // Only re-render if relevant props changed
     if (this.viewModel.message !== previousViewModel?.message) {
       this.scheduleRender();
     }
   }
   ```

4. **Reduce Re-renders:**
   - Memoize computed values
   - Use stable object references
   - Avoid creating new objects in render

### High memory usage

**Symptom:** App uses > 200MB of memory.

**Solution:**

1. **Monitor Memory:**
   ```bash
   # iOS memory monitor
   xcrun simctl io booted recordVideo --mask black mem.mov &
   ```

2. **Reduce Memory Footprint:**
   - Limit message history (100-200 messages)
   - Release old images
   - Clear unused caches
   - Paginate data

3. **Implement Memory Warning Handler:**
   ```typescript
   // Clear caches on memory warning
   onMemoryWarning() {
     this.clearCaches();
     this.limitMessageHistory();
   }
   ```

### Animations are choppy

**Symptom:** Animations don't run at 60fps.

**Solution:**

1. **Use Native Animations:**
   ```typescript
   // Use Valdi's animate API
   this.animate(
     { duration: 0.3, curve: 'easeInOut' },
     () => {
       // Animation code
     }
   );
   ```

2. **Avoid Layout Thrashing:**
   - Batch DOM updates
   - Avoid forced synchronous layouts
   - Use transforms instead of position changes

3. **Profile Animations:**
   - Use Xcode Time Profiler
   - Look for expensive operations during animation
   - Optimize or defer heavy work

---

## Development Environment

### Bazel cache issues

**Symptom:** Builds fail with cache errors or outdated code runs.

**Solution:**

1. **Clear Bazel cache:**
   ```bash
   bazel clean
   bazel clean --expunge  # More thorough
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

3. **Clear Xcode derived data:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

### Valdi CLI not found

**Symptom:**
```
command not found: valdi
```

**Solution:**

1. **Install Valdi CLI:**
   ```bash
   npm install -g @valdi/cli
   ```

2. **Check Installation:**
   ```bash
   which valdi
   valdi --version
   ```

3. **Add to PATH (if needed):**
   ```bash
   export PATH=$PATH:$(npm config get prefix)/bin
   ```

### Xcode command line tools issues

**Symptom:**
```
xcrun: error: unable to find utility
```

**Solution:**

1. **Install Command Line Tools:**
   ```bash
   xcode-select --install
   ```

2. **Set Correct Path:**
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   ```

3. **Verify Installation:**
   ```bash
   xcode-select -p
   xcrun --show-sdk-path
   ```

---

## Dependency Issues

### npm install fails

**Symptom:**
```
npm ERR! peer dependency conflict
```

**Solution:**

1. **Clear lock file and reinstall:**
   ```bash
   rm package-lock.json
   npm install
   ```

2. **Use legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Check Node version:**
   ```bash
   node --version  # Should be 18+
   ```

### AI SDK version mismatch

**Symptom:**
```
Error: Incompatible AI SDK version
```

**Solution:**

1. **Check installed versions:**
   ```bash
   npm ls ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
   ```

2. **Ensure compatible versions:**
   ```json
   "ai": "^5.0.0",
   "@ai-sdk/openai": "^1.0.0",
   "@ai-sdk/anthropic": "^1.0.0",
   "@ai-sdk/google": "^1.0.0"
   ```

3. **Update if needed:**
   ```bash
   npm install ai@latest @ai-sdk/openai@latest
   ```

### Missing TypeScript types

**Symptom:**
```
Could not find a declaration file for module 'xyz'
```

**Solution:**

1. **Install type definitions:**
   ```bash
   npm install --save-dev @types/node @types/uuid
   ```

2. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true,
       "types": ["node"]
     }
   }
   ```

---

## AI SDK Issues

### OpenAI API errors

**Symptom:**
```
OpenAI API error: 401 Unauthorized
OpenAI API error: 429 Too Many Requests
```

**Solution:**

1. **Check API Key:**
   ```typescript
   console.log('Key configured:', !!process.env.OPENAI_API_KEY);
   console.log('Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 7));
   ```

2. **Verify API Key Format:**
   - Should start with `sk-`
   - Should be 51 characters
   - Should have no spaces or special characters

3. **Check Rate Limits:**
   - Free tier: 3 requests/minute
   - Implement exponential backoff
   - Add request queuing

4. **Handle Errors:**
   ```typescript
   try {
     const result = await streamText({ ... });
   } catch (error) {
     if (error.status === 429) {
       // Rate limit - wait and retry
       await new Promise(resolve => setTimeout(resolve, 60000));
     } else if (error.status === 401) {
       // Invalid API key
       throw new Error('Invalid OpenAI API key');
     }
   }
   ```

### Anthropic streaming issues

**Symptom:** Anthropic messages don't stream properly.

**Solution:**

1. **Verify Anthropic Setup:**
   ```typescript
   import { anthropic } from '@ai-sdk/anthropic';

   const result = await streamText({
     model: anthropic('claude-3-5-sonnet-20241022'),
     prompt: 'Hello',
   });
   ```

2. **Check API Key:**
   - Should start with `sk-ant-`
   - Configure in environment

3. **Handle Anthropic-Specific Errors:**
   ```typescript
   // Anthropic requires explicit max tokens
   const result = await streamText({
     model: anthropic('claude-3-5-sonnet-20241022'),
     maxTokens: 1024,
     prompt: 'Hello',
   });
   ```

### Tool calling not working

**Symptom:** Tools are defined but never called.

**Solution:**

1. **Verify Tool Definition:**
   ```typescript
   import { tool } from 'ai';
   import { z } from 'zod';

   export const weatherTool = tool({
     description: 'Get weather for a location',
     parameters: z.object({
       location: z.string().describe('City name'),
     }),
     execute: async ({ location }) => {
       // Implementation
     },
   });
   ```

2. **Enable Tool Calling:**
   ```typescript
   const result = await streamText({
     model: openai('gpt-4'),
     tools: { weather: weatherTool },
     toolChoice: 'auto', // or 'required'
     prompt: 'What is the weather in London?',
   });
   ```

3. **Check Model Support:**
   - Not all models support tools
   - Use GPT-4, GPT-3.5-turbo, or Claude 3+

4. **Debug Tool Calls:**
   ```typescript
   for await (const part of result.fullStream) {
     if (part.type === 'tool-call') {
       console.log('Tool called:', part.toolName, part.args);
     }
   }
   ```

---

## Getting More Help

### Debug Logs

Enable verbose logging:
```bash
export VALDI_DEBUG=1
export AI_SDK_DEBUG=1
npm run build:ios
```

### Community Resources

- [Valdi Discord](https://discord.gg/valdi)
- [Valdi GitHub Issues](https://github.com/valdi/valdi/issues)
- [AI SDK GitHub Issues](https://github.com/vercel/ai/issues)
- [Stack Overflow - valdi tag](https://stackoverflow.com/questions/tagged/valdi)

### Report an Issue

When reporting issues, include:
1. Error message and stack trace
2. Steps to reproduce
3. Environment info (OS, Xcode, Node, Bazel versions)
4. Relevant code snippets
5. Build/run commands used

### Contact Support

- Valdi Support: support@valdi.dev
- AI SDK Support: https://github.com/vercel/ai/discussions
