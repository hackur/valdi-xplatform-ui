# Valdi Development: Lessons Learned

This document captures important lessons learned during the development of the Valdi AI UI application, documenting root causes of issues encountered and how they were resolved.

## 1. Import Path Alias `@common` Not Supported

**Problem:** Many files used `import { X } from '@common'` which failed to compile.

**Root Cause:** Valdi's module system doesn't support TypeScript path aliases defined in `tsconfig.json`. While TypeScript path mappings work for IDE autocomplete, Valdi's compiler requires explicit relative or module paths.

**Solution:** Replace all `@common` imports with the full module path: `'common/src/types'`

**Pattern:**
```typescript
// ❌ Does not work
import { Message } from '@common';

// ✅ Works in Valdi
import { Message } from 'common/src/types';
```

**Prevention:** Avoid using TypeScript path aliases in Valdi projects. Use explicit module paths from the start.

---

## 2. npm Packages Requiring JavaScript Runtime Cannot Be Used

**Problem:** Files importing from `'ai'`, `'@ai-sdk/openai'`, `'zod'`, and `'jest'` failed to compile.

**Root Cause:** Valdi compiles TypeScript directly to native code (iOS/Android). It does NOT include a JavaScript runtime. Packages like:
- **AI SDK** - Uses JavaScript fetch, streams, and runtime features
- **Zod** - Runtime schema validation requiring JavaScript execution
- **Jest** - Testing framework requiring Node.js runtime

These packages depend on JavaScript/Node.js features that don't exist after compilation to native code.

**Solution:**
- For AI APIs: Use `valdi_http` module with direct HTTP requests
- For validation: Implement TypeScript interfaces with manual runtime checks
- For testing: Keep test files separate from production code (exclude from BUILD.bazel)

**Pattern:**
```typescript
// ❌ Cannot compile to native
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// ✅ Works - uses Valdi's native HTTP
import { HTTPClient } from 'valdi_http/src/HTTPClient';

const client = new HTTPClient('https://api.openai.com/v1');
const response = await client.post('/chat/completions', encodedBody, headers);
```

**Prevention:** Before adding an npm package, verify it's pure TypeScript without JavaScript runtime dependencies. When in doubt, check if similar functionality exists in Valdi's built-in modules (`valdi_http`, `valdi_core`, etc.).

---

## 3. Test Files Must Be Excluded from Production Builds

**Problem:** Test files using Jest (`describe`, `it`, `expect`) were being compiled with production code and failing.

**Root Cause:** Bazel's `glob()` function by default includes ALL matching files. Unlike other build systems that automatically exclude test directories, Valdi/Bazel requires explicit exclusion.

**Solution:** Add `exclude` parameter to `glob()` in BUILD.bazel:

```python
valdi_module(
    name = "chat_core",
    srcs = glob(
        ["src/**/*.ts", "src/**/*.tsx"],
        exclude = [
            "**/__tests__/**",
            "**/*.test.ts",
            "**/*.spec.ts",
        ],
    ),
)
```

**Prevention:** Always use glob `exclude` patterns in BUILD.bazel files. Establish this as a standard practice from the start.

---

## 4. Valdi Style Properties vs CSS/React Native

**Problem:** Properties like `gap`, `paddingVertical`, `paddingHorizontal` caused TypeScript errors.

**Root Cause:** Valdi's `Style<View>` maps directly to native UI components (UIView on iOS, View on Android). These don't support:
- CSS flexbox `gap` property
- React Native-style shorthand properties (`paddingVertical`, `paddingHorizontal`)

**Solution:** Use individual directional properties:

```typescript
// ❌ Not supported
new Style<View>({
  gap: Spacing.base,
  paddingVertical: Spacing.sm,
  paddingHorizontal: Spacing.lg,
})

// ✅ Supported
new Style<View>({
  paddingTop: Spacing.sm,
  paddingBottom: Spacing.sm,
  paddingLeft: Spacing.lg,
  paddingRight: Spacing.lg,
  marginRight: Spacing.base,  // For spacing between elements
})
```

**Prevention:** Think "native first" when styling Valdi components. Use explicit properties that map directly to native UIView/View properties.

---

## 5. MessageStore API Signature Mismatch

**Problem:** `ChatService` called `messageStore.getConversation(id)` and `messageStore.addMessage(id, msg)` which don't exist.

**Root Cause:** API mismatch between what ChatService expected vs what MessageStore actually provided. The `conversationId` is a property of the `Message` object itself, not a separate parameter.

**Solution:**
```typescript
// ❌ Wrong - getConversation doesn't exist
const conversation = messageStore.getConversation(conversationId);

// ✅ Correct - just get messages
const messages = messageStore.getMessages(conversationId);

// ❌ Wrong - addMessage takes only Message
messageStore.addMessage(conversationId, userMsg);

// ✅ Correct - conversationId is on the message
userMsg.conversationId = conversationId;
await messageStore.addMessage(userMsg);
```

**Prevention:** Always read the actual implementation/interface of dependencies before using them. Don't assume API shapes.

---

## 6. Workflow Config Type Requirements

**Problem:** Helper functions `createRoutingWorkflow` and `createEvaluatorOptimizerWorkflow` had type errors about `agents` property.

**Root Cause:** The base `WorkflowConfig` interface requires `agents: AgentDefinition[]` as a non-optional property. When using spread operator `...options`, if `options.agents` is `undefined`, it overrides any default.

**Solution:** Explicitly provide the `agents` array based on the workflow type:

```typescript
// For routing workflow - router + all route agents
export function createRoutingWorkflow(...): RoutingWorkflowConfig {
  const routeAgents = routes.map(r => r.agent);
  return {
    type: 'routing',
    agents: [routerAgent, ...routeAgents],  // ✅ Required property
    routerAgent,
    routes,
    ...options,
  };
}

// For evaluator-optimizer - all three agents
export function createEvaluatorOptimizerWorkflow(...): EvaluatorOptimizerWorkflowConfig {
  return {
    type: 'evaluator-optimizer',
    agents: [generatorAgent, evaluatorAgent, optimizerAgent],  // ✅ Required
    generatorAgent,
    evaluatorAgent,
    optimizerAgent,
    ...options,
  };
}
```

**Prevention:** When using spread operators with config objects, always explicitly set required properties BEFORE spreading optional overrides.

---

## 7. Promise.allSettled Not Available (ES2020 Feature)

**Problem:** `Promise.allSettled()` caused error: "Property 'allSettled' does not exist on type 'PromiseConstructor'".

**Root Cause:** Valdi's TypeScript compilation targets ES2015 (ES6), which doesn't include `Promise.allSettled` (added in ES2020).

**Solution:** Implement manual version using `Promise.all` with try-catch wrappers:

```typescript
// ❌ ES2020 - not available
const settled = await Promise.allSettled(promises);

// ✅ ES2015 compatible
const settled = await Promise.all(
  promises.map(p =>
    p.then(value => ({ status: 'fulfilled' as const, value }))
     .catch(reason => ({ status: 'rejected' as const, reason }))
  )
);
const fulfilled = settled
  .filter((r): r is { status: 'fulfilled'; value: any } => r.status === 'fulfilled')
  .map(r => r.value);
```

**Prevention:** Assume ES2015 (ES6) compatibility only. Avoid ES2017+ features like:
- `Promise.allSettled` (ES2020)
- `Object.entries` / `Object.values` (ES2017)
- Async iteration (ES2018)
- Optional chaining `?.` (ES2020)
- Nullish coalescing `??` (ES2020)

---

## Summary: Valdi Development Mental Model

**Think Native First:**
- Valdi compiles to native code, not JavaScript
- No JavaScript runtime = no npm packages requiring JS execution
- Styles map to native UI components (UIView/Android View)
- Use Valdi's built-in modules (`valdi_http`, `valdi_core`, etc.)

**TypeScript Constraints:**
- ES2015 (ES6) target only
- No path aliases - use explicit module paths
- Pure TypeScript types only (no runtime validation like Zod)

**Build System:**
- Explicitly declare all dependencies in BUILD.bazel
- Explicitly exclude test files from production builds
- Import paths must match Bazel module structure

**The Golden Rule:**
When encountering errors, investigate the root cause first rather than deleting/commenting out code. Document why something doesn't work in Valdi's architecture to prevent repeating the mistake.
