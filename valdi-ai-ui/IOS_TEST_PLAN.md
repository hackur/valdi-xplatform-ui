# iOS Test Plan

## Overview

This document outlines the comprehensive testing strategy for the Valdi AI UI iOS application, including manual testing checklists, automated test scenarios, performance benchmarks, and device compatibility testing.

---

## 1. Manual Testing Checklist

### 1.1 Initial Launch & Setup

#### First Launch
- [ ] App installs successfully from build
- [ ] Launch screen displays correctly
- [ ] App icon appears on home screen
- [ ] App requests necessary permissions (if any)
- [ ] Initial setup/onboarding displays (if applicable)
- [ ] No crash on first launch
- [ ] Main screen loads within 2 seconds

#### Navigation
- [ ] Main navigation loads
- [ ] All navigation items are accessible
- [ ] Navigation transitions are smooth
- [ ] Back button works correctly
- [ ] Deep linking works (if implemented)

### 1.2 Chat Functionality

#### Message Input
- [ ] Text field is tappable and displays keyboard
- [ ] Keyboard displays correctly
- [ ] Can type multi-line messages
- [ ] Send button is visible and enabled
- [ ] Send button disabled when input is empty
- [ ] Character counter displays (if applicable)
- [ ] Input clears after sending
- [ ] Keyboard dismisses after sending

#### Message Display
- [ ] Messages appear in correct order
- [ ] User messages align right (or appropriate style)
- [ ] AI messages align left (or appropriate style)
- [ ] Timestamps display correctly
- [ ] Long messages wrap properly
- [ ] Code blocks render correctly (if applicable)
- [ ] Markdown renders correctly (if applicable)
- [ ] Links are tappable (if applicable)

#### Message Streaming
- [ ] Streaming starts immediately after send
- [ ] Text appears incrementally
- [ ] No flickering during streaming
- [ ] Streaming handles long responses
- [ ] Stop button works during streaming
- [ ] UI updates smoothly during streaming
- [ ] Scroll follows streaming content
- [ ] Cursor/typing indicator appears

#### Error Handling
- [ ] Network errors display user-friendly message
- [ ] API errors display appropriate message
- [ ] Invalid API key shows clear error
- [ ] Rate limit errors are handled gracefully
- [ ] Retry button works after error
- [ ] App doesn't crash on errors

### 1.3 AI Provider Management

#### Provider Selection
- [ ] Can switch between OpenAI, Anthropic, Google
- [ ] Provider change persists after app restart
- [ ] Active provider is clearly indicated
- [ ] Provider switch doesn't lose conversation
- [ ] Model list updates for selected provider

#### Model Configuration
- [ ] Can select different models
- [ ] Model selection persists
- [ ] Model parameters are adjustable (if applicable)
- [ ] Invalid models show error message

### 1.4 Tool Execution

#### Tool Calling
- [ ] Weather tool executes correctly
- [ ] Calculator tool executes correctly
- [ ] Search tool executes correctly
- [ ] Tool results display in chat
- [ ] Multiple tool calls work in sequence
- [ ] Tool errors are handled gracefully
- [ ] Tool execution shows loading state
- [ ] Can cancel tool execution (if applicable)

#### Tool UI
- [ ] Tool invocations are visually distinct
- [ ] Tool parameters display correctly
- [ ] Tool results are formatted properly
- [ ] Tool errors show clear messages

### 1.5 Conversation Management

#### Conversation List
- [ ] New conversation creates successfully
- [ ] Conversation list displays all conversations
- [ ] Can select conversation from list
- [ ] Can delete conversation
- [ ] Can rename conversation (if applicable)
- [ ] Conversation preview shows last message
- [ ] Timestamps show relative time
- [ ] Empty state displays for no conversations

#### Conversation Persistence
- [ ] Conversations persist after app restart
- [ ] Messages reload correctly
- [ ] Conversation state is preserved
- [ ] Can export conversation (if applicable)
- [ ] Can clear all conversations

### 1.6 Settings

#### API Key Management
- [ ] Can enter API keys
- [ ] API keys persist after restart
- [ ] API keys are masked in UI
- [ ] Can update API keys
- [ ] Can clear API keys
- [ ] Invalid keys show error
- [ ] Keys are stored securely

#### Preferences
- [ ] Theme selection works (if applicable)
- [ ] Dark mode toggle works (if applicable)
- [ ] Font size adjustment works (if applicable)
- [ ] Preferences persist after restart
- [ ] Reset to defaults works

#### About Section
- [ ] App version displays correctly
- [ ] Privacy policy link works (if applicable)
- [ ] Terms of service link works (if applicable)
- [ ] License information displays

### 1.7 Edge Cases

#### Network Conditions
- [ ] Handles no internet connection
- [ ] Handles slow connection gracefully
- [ ] Shows appropriate loading states
- [ ] Queues messages when offline (if applicable)
- [ ] Syncs when connection restored

#### App Lifecycle
- [ ] Handles app backgrounding
- [ ] Handles app foregrounding
- [ ] Preserves state across lifecycle
- [ ] No data loss on backgrounding
- [ ] Resumes streaming after foregrounding

#### Input Edge Cases
- [ ] Handles empty messages
- [ ] Handles very long messages (1000+ chars)
- [ ] Handles special characters
- [ ] Handles emojis
- [ ] Handles rapid successive sends
- [ ] Handles paste operations

#### UI Edge Cases
- [ ] Handles device rotation (iPad)
- [ ] Handles split screen (iPad)
- [ ] Handles slide over (iPad)
- [ ] Handles dynamic type sizes
- [ ] Handles VoiceOver navigation

---

## 2. Automated Test Scenarios

### 2.1 Unit Tests

#### Chat Core Tests
```typescript
describe('ChatService', () => {
  test('initializes with correct provider', () => {
    const service = new ChatService('openai');
    expect(service.getCurrentProvider()).toBe('openai');
  });

  test('sends message successfully', async () => {
    const service = new ChatService('openai');
    const response = await service.sendMessage('Hello');
    expect(response).toBeDefined();
  });

  test('handles streaming responses', async () => {
    const service = new ChatService('openai');
    const chunks: string[] = [];

    await service.streamMessage('Hello', (chunk) => {
      chunks.push(chunk);
    });

    expect(chunks.length).toBeGreaterThan(0);
  });

  test('handles API errors gracefully', async () => {
    const service = new ChatService('openai', 'invalid-key');

    await expect(service.sendMessage('Hello')).rejects.toThrow();
  });
});
```

#### Tool Execution Tests
```typescript
describe('ToolDefinitions', () => {
  test('weather tool returns valid data', async () => {
    const result = await weatherTool.execute({ location: 'London' });

    expect(result.success).toBe(true);
    expect(result.data.temperature).toBeDefined();
    expect(result.data.condition).toBeDefined();
  });

  test('calculator tool computes correctly', async () => {
    const result = await calculatorTool.execute({ expression: '2 + 2' });

    expect(result.success).toBe(true);
    expect(result.result).toBe(4);
  });

  test('search tool returns results', async () => {
    const result = await searchTool.execute({ query: 'test' });

    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
  });
});
```

#### Conversation Manager Tests
```typescript
describe('ConversationManager', () => {
  test('creates new conversation', async () => {
    const manager = new ConversationManager();
    const conversation = await manager.createConversation();

    expect(conversation.id).toBeDefined();
    expect(conversation.messages).toEqual([]);
  });

  test('adds message to conversation', async () => {
    const manager = new ConversationManager();
    const conversation = await manager.createConversation();

    await manager.addMessage(conversation.id, {
      role: 'user',
      content: 'Hello',
    });

    const updated = await manager.getConversation(conversation.id);
    expect(updated.messages.length).toBe(1);
  });

  test('deletes conversation', async () => {
    const manager = new ConversationManager();
    const conversation = await manager.createConversation();

    await manager.deleteConversation(conversation.id);

    const result = await manager.getConversation(conversation.id);
    expect(result).toBeNull();
  });

  test('lists all conversations', async () => {
    const manager = new ConversationManager();
    await manager.createConversation();
    await manager.createConversation();

    const conversations = await manager.listConversations();
    expect(conversations.length).toBeGreaterThanOrEqual(2);
  });
});
```

#### Storage Tests
```typescript
describe('StorageProvider', () => {
  test('stores and retrieves data', async () => {
    const storage = new StorageProvider();

    await storage.set('test-key', 'test-value');
    const value = await storage.get('test-key');

    expect(value).toBe('test-value');
  });

  test('stores complex objects', async () => {
    const storage = new StorageProvider();
    const obj = { name: 'test', count: 42 };

    await storage.set('test-obj', obj);
    const retrieved = await storage.get('test-obj');

    expect(retrieved).toEqual(obj);
  });

  test('removes data', async () => {
    const storage = new StorageProvider();

    await storage.set('test-key', 'test-value');
    await storage.remove('test-key');
    const value = await storage.get('test-key');

    expect(value).toBeNull();
  });

  test('clears all data', async () => {
    const storage = new StorageProvider();

    await storage.set('key1', 'value1');
    await storage.set('key2', 'value2');
    await storage.clear();

    const value1 = await storage.get('key1');
    const value2 = await storage.get('key2');

    expect(value1).toBeNull();
    expect(value2).toBeNull();
  });
});
```

### 2.2 Integration Tests

```typescript
describe('Chat Integration', () => {
  test('complete chat flow', async () => {
    // Create service
    const service = new ChatService('openai');

    // Send message
    const response = await service.sendMessage('Hello');
    expect(response).toBeDefined();

    // Verify conversation updated
    const conversation = await service.getCurrentConversation();
    expect(conversation.messages.length).toBe(2); // User + AI
  });

  test('tool calling flow', async () => {
    const service = new ChatService('openai');

    // Send message that triggers tool
    const response = await service.sendMessage('What is the weather in London?');

    // Verify tool was called
    expect(response.toolCalls?.length).toBeGreaterThan(0);
    expect(response.toolCalls?.[0]?.toolName).toBe('weather');
  });

  test('provider switching', async () => {
    const service = new ChatService('openai');

    // Send with OpenAI
    await service.sendMessage('Hello from OpenAI');

    // Switch to Anthropic
    service.setProvider('anthropic');

    // Send with Anthropic
    const response = await service.sendMessage('Hello from Anthropic');

    // Verify both messages in conversation
    const conversation = await service.getCurrentConversation();
    expect(conversation.messages.length).toBe(4);
  });
});
```

### 2.3 Component Tests

```typescript
describe('ChatView Component', () => {
  test('renders message list', () => {
    const component = new ChatView({
      messages: [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there!' },
      ],
    });

    component.onRender();

    // Assert messages rendered (implementation-specific)
    expect(component.messageCount).toBe(2);
  });

  test('handles send button click', () => {
    const onSend = jest.fn();
    const component = new ChatView({ onSend });

    component.handleSendClick('Test message');

    expect(onSend).toHaveBeenCalledWith('Test message');
  });
});
```

### 2.4 Test Execution

Run tests:
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# CI mode
npm run test:ci

# Bazel tests
npm run test:bazel
```

---

## 3. Performance Benchmarks

### 3.1 Startup Performance

**Target: < 2 seconds cold start**

Test procedure:
1. Kill app completely
2. Clear app from background
3. Tap app icon
4. Measure time to first interactive screen

Measurements:
- Time to app launch
- Time to first render
- Time to interactive
- Memory usage at startup

### 3.2 Runtime Performance

**Target: 60fps scrolling, < 100MB memory idle**

Test scenarios:
1. Scroll through 100 messages
2. Stream a long response (1000+ tokens)
3. Execute multiple tools in sequence
4. Switch between conversations
5. Rapid message sending

Measurements:
- Frame rate (fps)
- Memory usage
- CPU usage
- Network bandwidth
- Battery drain

### 3.3 Performance Test Script

```typescript
describe('Performance Tests', () => {
  test('message rendering performance', () => {
    const start = performance.now();

    // Render 100 messages
    for (let i = 0; i < 100; i++) {
      renderMessage({ id: `${i}`, content: `Message ${i}` });
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // < 1 second
  });

  test('streaming performance', async () => {
    const service = new ChatService('openai');
    const chunks: string[] = [];
    const start = performance.now();

    await service.streamMessage('Generate a long response', (chunk) => {
      chunks.push(chunk);
    });

    const duration = performance.now() - start;
    const timePerChunk = duration / chunks.length;

    expect(timePerChunk).toBeLessThan(100); // < 100ms per chunk
  });

  test('conversation switching performance', async () => {
    const manager = new ConversationManager();

    // Create 10 conversations
    const conversations = await Promise.all(
      Array.from({ length: 10 }, () => manager.createConversation())
    );

    // Switch between conversations
    const start = performance.now();

    for (const conversation of conversations) {
      await manager.switchToConversation(conversation.id);
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // < 1 second for 10 switches
  });
});
```

### 3.4 Benchmark Results Template

| Test | Target | Actual | Status |
|------|--------|--------|--------|
| Cold start | < 2s | ___ | ⏱️ |
| Warm start | < 1s | ___ | ⏱️ |
| 100 message scroll | 60fps | ___ | ⏱️ |
| Message streaming | 60fps | ___ | ⏱️ |
| Memory idle | < 100MB | ___ | ⏱️ |
| Memory under load | < 200MB | ___ | ⏱️ |
| Battery drain (1hr) | < 10% | ___ | ⏱️ |

---

## 4. Device Compatibility Matrix

### 4.1 iOS Versions

| iOS Version | Status | Priority | Notes |
|-------------|--------|----------|-------|
| iOS 14.0 | ⏱️ Not tested | Low | Minimum supported |
| iOS 15.0 | ⏱️ Not tested | Medium | |
| iOS 16.0 | ⏱️ Not tested | High | |
| iOS 17.0 | ⏱️ Not tested | High | Current |
| iOS 18.0 beta | ⏱️ Not tested | Low | Future |

### 4.2 Device Models

#### iPhone

| Device | Screen Size | iOS Version | Status | Notes |
|--------|-------------|-------------|--------|-------|
| iPhone SE (2020) | 4.7" | 14+ | ⏱️ Not tested | Small screen |
| iPhone 12 | 6.1" | 14+ | ⏱️ Not tested | Standard |
| iPhone 13 | 6.1" | 15+ | ⏱️ Not tested | Standard |
| iPhone 14 | 6.1" | 16+ | ⏱️ Not tested | Standard |
| iPhone 14 Pro | 6.1" | 16+ | ⏱️ Not tested | Dynamic Island |
| iPhone 14 Pro Max | 6.7" | 16+ | ⏱️ Not tested | Large screen |
| iPhone 15 | 6.1" | 17+ | ⏱️ Not tested | Current gen |
| iPhone 15 Pro | 6.1" | 17+ | ⏱️ Not tested | Current gen |

#### iPad

| Device | Screen Size | iOS Version | Status | Notes |
|--------|-------------|-------------|--------|-------|
| iPad (9th gen) | 10.2" | 15+ | ⏱️ Not tested | Standard |
| iPad Air | 10.9" | 15+ | ⏱️ Not tested | Standard |
| iPad Pro 11" | 11" | 14+ | ⏱️ Not tested | Pro features |
| iPad Pro 12.9" | 12.9" | 14+ | ⏱️ Not tested | Large screen |
| iPad mini | 8.3" | 15+ | ⏱️ Not tested | Small tablet |

### 4.3 Device-Specific Features

| Feature | iPhone | iPad | Notes |
|---------|--------|------|-------|
| Orientation | Portrait only | Both | iPad should support landscape |
| Split screen | N/A | Yes | Test multitasking |
| Slide over | N/A | Yes | Test overlay mode |
| Dynamic Island | 14 Pro+ | N/A | Test notification handling |
| Safe areas | All | All | Test notch/island areas |
| Home indicator | X+ | Pro | Test gesture areas |

### 4.4 Testing Priority

1. **High Priority (Must Test)**
   - iPhone 14 Pro (iOS 16+)
   - iPhone 15 (iOS 17)
   - iPad Air (iOS 16+)
   - iOS 16.0 and iOS 17.0

2. **Medium Priority (Should Test)**
   - iPhone SE (small screen)
   - iPhone 14 Pro Max (large screen)
   - iPad Pro 12.9" (large tablet)
   - iOS 15.0

3. **Low Priority (Nice to Test)**
   - Older devices (iPhone 12, 13)
   - iOS 14.0
   - iOS 18.0 beta

---

## 5. Accessibility Testing

### 5.1 VoiceOver Testing

- [ ] All interactive elements have labels
- [ ] Navigation is logical
- [ ] Messages are announced correctly
- [ ] Send button is clearly labeled
- [ ] Settings are accessible
- [ ] Tool results are announced

### 5.2 Dynamic Type

- [ ] App supports Dynamic Type
- [ ] Layout adjusts to larger text
- [ ] No text truncation at largest size
- [ ] UI remains usable at smallest size

### 5.3 Color & Contrast

- [ ] Text meets WCAG contrast ratios
- [ ] UI is usable without color
- [ ] Dark mode has sufficient contrast
- [ ] Color blind friendly

### 5.4 Motion

- [ ] Reduced motion preference respected
- [ ] Animations can be disabled
- [ ] No parallax effects with reduced motion

---

## 6. Security Testing

### 6.1 Data Security

- [ ] API keys stored in Keychain (not UserDefaults)
- [ ] No sensitive data in logs
- [ ] No data leakage to clipboard
- [ ] Secure network connections (HTTPS)
- [ ] Certificate pinning (if applicable)

### 6.2 Privacy

- [ ] No tracking without consent
- [ ] No analytics of message content
- [ ] Conversation data is local
- [ ] Clear data deletion works
- [ ] Export doesn't include keys

---

## 7. Regression Testing

### 7.1 Pre-Release Checklist

Before each release, verify:
- [ ] All critical paths work
- [ ] No new crashes
- [ ] Performance hasn't regressed
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual smoke test complete
- [ ] Device compatibility verified
- [ ] Accessibility checked

### 7.2 Smoke Test (Quick Verification)

1. Launch app (< 2s)
2. Create new conversation
3. Send message
4. Verify response received
5. Execute a tool
6. Switch providers
7. Check settings
8. Restart app and verify persistence

Expected duration: 5 minutes

---

## 8. Test Reporting

### 8.1 Test Results Template

```markdown
## Test Run Report

**Date:** YYYY-MM-DD
**Build:** vX.Y.Z
**Tester:** Name
**Device:** iPhone 15 Pro / iOS 17.0

### Summary
- Total Tests: ___
- Passed: ___
- Failed: ___
- Blocked: ___
- Pass Rate: ___%

### Critical Issues
1. [Issue description]
2. [Issue description]

### Non-Critical Issues
1. [Issue description]
2. [Issue description]

### Performance Results
- Cold start: ___s
- Memory usage: ___MB
- Scroll FPS: ___fps

### Notes
[Additional observations]
```

### 8.2 Bug Report Template

```markdown
## Bug Report

**Title:** [Clear, concise title]

**Severity:** Critical / High / Medium / Low

**Device:** iPhone 15 Pro
**iOS Version:** 17.0
**App Version:** 1.0.0

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots/Videos:**
[Attach if applicable]

**Console Logs:**
```
[Relevant logs]
```

**Additional Context:**
[Any other relevant information]
```

---

## 9. Continuous Testing

### 9.1 Pre-Commit Tests

Run before each commit:
```bash
npm run type-check  # TypeScript
npm run lint        # ESLint
npm test            # Jest unit tests
```

### 9.2 CI/CD Pipeline Tests

Run on each PR:
```bash
npm run validate    # Type check + lint + test
npm run test:ci     # CI-optimized tests
npm run test:coverage  # Coverage report
bazel test //...    # Bazel tests
```

### 9.3 Nightly Tests

Run nightly:
- Full test suite
- Performance benchmarks
- Memory leak detection
- Integration tests
- Device farm tests (if available)

---

## 10. Test Coverage Goals

### 10.1 Coverage Targets

| Module | Target | Current | Status |
|--------|--------|---------|--------|
| chat_core | 80% | 60% | 🟡 |
| chat_ui | 70% | 60% | 🟡 |
| common | 80% | 60% | 🟡 |
| agent_manager | 70% | 60% | 🟡 |
| conversation_manager | 80% | 60% | 🟡 |
| model_config | 80% | 60% | 🟡 |
| settings | 70% | 60% | 🟡 |
| tools_demo | 60% | 60% | 🟢 |
| workflow_demo | 60% | 60% | 🟢 |
| **Overall** | **70%** | **60%** | 🟡 |

### 10.2 Coverage Report

Generate coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## 11. Test Maintenance

### 11.1 Test Review Schedule

- Weekly: Review failed tests
- Monthly: Update test scenarios
- Quarterly: Review coverage gaps
- Per release: Update compatibility matrix

### 11.2 Test Deprecation

Mark tests as deprecated when:
- Feature is removed
- Test is superseded
- Test is flaky and unfixable
- Test no longer provides value

### 11.3 Test Documentation

- Keep test plan updated
- Document new test scenarios
- Update benchmarks regularly
- Share results with team

---

## Summary

This test plan provides comprehensive coverage for the Valdi AI UI iOS application. Following this plan will ensure:

1. **Functional correctness** - All features work as expected
2. **Performance targets** - App meets speed and memory goals
3. **Device compatibility** - Works across iOS versions and devices
4. **Quality assurance** - High code coverage and low defect rate
5. **User experience** - Smooth, responsive, accessible interface

Regular execution of manual tests, automated tests, and performance benchmarks will maintain quality throughout development and releases.
