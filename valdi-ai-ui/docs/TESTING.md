# Testing Guide

Comprehensive guide for testing Valdi AI UI applications.

---

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Best Practices](#testing-best-practices)
- [Mock Data Guide](#mock-data-guide)
- [Coverage Reports](#coverage-reports)
- [E2E Testing](#e2e-testing)
- [Continuous Integration](#continuous-integration)

---

## Overview

Valdi AI UI uses **Jest** as the primary testing framework with **ts-jest** for TypeScript support.

### Test Stack

- **Jest** 29.7.0 - Testing framework
- **ts-jest** 29.1.1 - TypeScript preprocessor
- **@types/jest** 29.5.11 - TypeScript definitions
- **Valdi Test Utilities** - Custom test helpers

### Current Coverage

```
Modules:
  common/         ✓ 33 tests passing
  chat_core/      ⏳ Coming soon
  chat_ui/        ⏳ Coming soon
  agent_manager/  ⏳ Coming soon

Target: 80%+ overall coverage
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Run Specific Tests

```bash
# Run tests in a specific file
npm test -- path/to/test.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="MessageUtils"

# Run tests in a specific module
npm test -- modules/common

# Run only changed tests
npm test -- --onlyChanged
```

### Run with Options

```bash
# Run with verbose output
npm test -- --verbose

# Run with coverage
npm test -- --coverage

# Run with specific reporter
npm test -- --reporters=default --reporters=jest-junit

# Run in band (no parallelization)
npm test -- --runInBand

# Update snapshots
npm test -- --updateSnapshot
```

---

## Writing Tests

### Test File Structure

Tests should be colocated with source files or in `__tests__` directories:

```
modules/
  common/
    src/
      types/
        Message.ts
        Message.test.ts    ← Test file
      utils/
        __tests__/         ← Test directory
          formatDate.test.ts
```

### Basic Test Template

```typescript
// Message.test.ts
import { MessageUtils } from './Message';

describe('MessageUtils', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = MessageUtils.generateId();
      const id2 = MessageUtils.generateId();

      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct prefix', () => {
      const id = MessageUtils.generateId();

      expect(id).toMatch(/^msg_/);
    });
  });

  describe('createUserMessage', () => {
    it('should create a user message', () => {
      const message = MessageUtils.createUserMessage(
        'conv_123',
        'Hello, world!'
      );

      expect(message.role).toBe('user');
      expect(message.conversationId).toBe('conv_123');
      expect(message.content).toBe('Hello, world!');
      expect(message.status).toBe('completed');
    });

    it('should set timestamps', () => {
      const before = new Date();
      const message = MessageUtils.createUserMessage('conv_123', 'Test');
      const after = new Date();

      expect(message.createdAt).toBeInstanceOf(Date);
      expect(message.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(message.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
```

### Testing Async Code

```typescript
describe('ChatService', () => {
  it('should send a message', async () => {
    const response = await chatService.sendMessage({
      conversationId: 'conv_123',
      message: 'Hello',
    });

    expect(response.message).toBeDefined();
    expect(response.message.role).toBe('assistant');
  });

  it('should handle errors', async () => {
    await expect(
      chatService.sendMessage({
        conversationId: 'invalid',
        message: '',
      })
    ).rejects.toThrow('Message cannot be empty');
  });
});
```

### Testing with Mocks

```typescript
import { MessageStore } from './MessageStore';
import { MessagePersistence } from './MessagePersistence';

// Mock the persistence layer
jest.mock('./MessagePersistence');

describe('MessageStore', () => {
  let store: MessageStore;
  let mockPersistence: jest.Mocked<MessagePersistence>;

  beforeEach(() => {
    mockPersistence = {
      loadAllMessages: jest.fn().mockResolvedValue({}),
      saveMessagesDebounced: jest.fn().mockResolvedValue(undefined),
      deleteMessage: jest.fn().mockResolvedValue(undefined),
    } as any;

    store = new MessageStore(true, mockPersistence);
  });

  it('should load messages on init', async () => {
    await store.init();

    expect(mockPersistence.loadAllMessages).toHaveBeenCalled();
  });

  it('should save messages when added', async () => {
    const message = MessageUtils.createUserMessage('conv_123', 'Test');

    await store.addMessage(message);

    expect(mockPersistence.saveMessagesDebounced).toHaveBeenCalledWith(
      'conv_123',
      expect.arrayContaining([message])
    );
  });
});
```

### Testing React Components

```typescript
import { render, fireEvent } from '@valdi/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('should render with label', () => {
    const { getByText } = render(
      <Button label="Click me" onPress={() => {}} />
    );

    expect(getByText('Click me')).toBeDefined();
  });

  it('should call onPress when clicked', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button label="Click me" onPress={onPress} />
    );

    fireEvent.click(getByText('Click me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button label="Click me" onPress={onPress} loading={true} />
    );

    fireEvent.click(getByText('Click me'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Testing with Snapshots

```typescript
describe('MessageBubble', () => {
  it('should match snapshot for user message', () => {
    const message = MessageUtils.createUserMessage('conv_123', 'Hello');
    const { container } = render(<MessageBubble message={message} />);

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for assistant message', () => {
    const message = MessageUtils.createAssistantMessage('conv_123', 'Hi');
    const { container } = render(<MessageBubble message={message} />);

    expect(container).toMatchSnapshot();
  });
});
```

---

## Testing Best Practices

### 1. Follow the AAA Pattern

```typescript
it('should do something', () => {
  // Arrange - Set up test data
  const input = 'test input';
  const expected = 'expected output';

  // Act - Execute the code under test
  const result = functionUnderTest(input);

  // Assert - Verify the result
  expect(result).toBe(expected);
});
```

### 2. Test One Thing at a Time

```typescript
// ✅ Good - Tests one behavior
it('should create user message with correct role', () => {
  const message = MessageUtils.createUserMessage('conv_123', 'Test');
  expect(message.role).toBe('user');
});

// ❌ Bad - Tests multiple behaviors
it('should create message correctly', () => {
  const message = MessageUtils.createUserMessage('conv_123', 'Test');
  expect(message.role).toBe('user');
  expect(message.content).toBe('Test');
  expect(message.status).toBe('completed');
  expect(message.createdAt).toBeInstanceOf(Date);
});
```

### 3. Use Descriptive Test Names

```typescript
// ✅ Good - Clear and descriptive
it('should return empty array when no messages exist', () => {});
it('should throw error when message is empty', () => {});

// ❌ Bad - Unclear
it('works', () => {});
it('test1', () => {});
```

### 4. Test Edge Cases

```typescript
describe('divide', () => {
  it('should divide positive numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should divide negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it('should handle zero dividend', () => {
    expect(divide(0, 5)).toBe(0);
  });

  it('should throw error for zero divisor', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle decimal results', () => {
    expect(divide(10, 3)).toBeCloseTo(3.333, 3);
  });
});
```

### 5. Use Setup and Teardown

```typescript
describe('MessageStore', () => {
  let store: MessageStore;

  beforeEach(() => {
    // Setup before each test
    store = new MessageStore(false);
  });

  afterEach(() => {
    // Cleanup after each test
    store.reset();
  });

  it('should start empty', () => {
    expect(store.getState().messagesByConversation).toEqual({});
  });
});
```

### 6. Mock External Dependencies

```typescript
// Mock HTTP requests
jest.mock('valdi_http/src/HTTPClient');

// Mock storage
jest.mock('./StorageProvider');

// Mock timers
jest.useFakeTimers();

describe('ChatService', () => {
  it('should retry failed requests', async () => {
    jest.useFakeTimers();

    const promise = chatService.sendMessage(options);

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    await promise;

    jest.useRealTimers();
  });
});
```

### 7. Test Error Handling

```typescript
describe('ChatService', () => {
  it('should handle API authentication errors', async () => {
    // Arrange
    const config = {
      apiKeys: { openai: '' }, // Invalid key
      defaultModelConfig: mockConfig,
    };
    const service = new ChatService(config, messageStore);

    // Act & Assert
    await expect(
      service.sendMessage({
        conversationId: 'conv_123',
        message: 'Test',
      })
    ).rejects.toThrow('OpenAI API key not configured');
  });
});
```

---

## Mock Data Guide

### Mock Messages

```typescript
// __mocks__/messages.ts
export const mockUserMessage: Message = {
  id: 'msg_user_1',
  conversationId: 'conv_123',
  role: 'user',
  content: 'Hello, AI!',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  status: 'completed',
};

export const mockAssistantMessage: Message = {
  id: 'msg_assistant_1',
  conversationId: 'conv_123',
  role: 'assistant',
  content: 'Hello! How can I help you?',
  createdAt: new Date('2024-01-01T10:00:05Z'),
  updatedAt: new Date('2024-01-01T10:00:05Z'),
  status: 'completed',
};

export const mockStreamingMessage: Message = {
  id: 'msg_streaming_1',
  conversationId: 'conv_123',
  role: 'assistant',
  content: 'This is a partial response...',
  createdAt: new Date('2024-01-01T10:00:10Z'),
  updatedAt: new Date('2024-01-01T10:00:10Z'),
  status: 'streaming',
};
```

### Mock Conversations

```typescript
// __mocks__/conversations.ts
export const mockConversation: Conversation = {
  id: 'conv_123',
  title: 'Test Conversation',
  modelConfig: {
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  },
  systemPrompt: 'You are a helpful assistant.',
  createdAt: new Date('2024-01-01T09:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  lastMessageAt: new Date('2024-01-01T10:00:05Z'),
  messageCount: 2,
  status: 'active',
  isPinned: false,
  tags: ['test'],
};
```

### Mock Services

```typescript
// __mocks__/ChatService.ts
export class MockChatService {
  async sendMessage(options: ChatRequestOptions): Promise<ChatResponse> {
    return {
      message: mockAssistantMessage,
      finishReason: 'stop',
    };
  }

  async sendMessageStreaming(
    options: ChatRequestOptions,
    callback: StreamCallback
  ): Promise<Message> {
    callback({ type: 'start', messageId: 'msg_123' });
    callback({
      type: 'chunk',
      messageId: 'msg_123',
      content: 'Test response',
      delta: 'Test response',
    });
    callback({
      type: 'complete',
      messageId: 'msg_123',
      message: mockAssistantMessage,
    });

    return mockAssistantMessage;
  }
}
```

### Mock HTTP Responses

```typescript
// __mocks__/http-responses.ts
export const mockOpenAIResponse = {
  choices: [
    {
      message: {
        role: 'assistant',
        content: 'This is a test response',
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30,
  },
};

export const mockAnthropicResponse = {
  content: [
    {
      type: 'text',
      text: 'This is a test response',
    },
  ],
  stop_reason: 'end_turn',
  usage: {
    input_tokens: 10,
    output_tokens: 20,
  },
};
```

---

## Coverage Reports

### Generate Coverage

```bash
# Generate coverage report
npm run test:coverage

# Coverage files are generated in:
# coverage/
#   lcov-report/index.html  ← HTML report
#   lcov.info               ← LCOV format
#   coverage-final.json     ← JSON format
```

### View Coverage Report

```bash
# Open HTML report
open coverage/lcov-report/index.html

# Or on Linux
xdg-open coverage/lcov-report/index.html
```

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
module.exports = {
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Ignore Files from Coverage

```javascript
// jest.config.js
module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/__mocks__/',
    '/dist/',
    '/coverage/',
  ],
};
```

---

## E2E Testing

### E2E Test Setup (Coming Soon)

```bash
# Install E2E testing tools
npm install --save-dev @valdi/e2e-testing

# Run E2E tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless
```

### E2E Test Example

```typescript
// e2e/chat-flow.spec.ts
import { test, expect } from '@valdi/test';

test.describe('Chat Flow', () => {
  test('should send message and receive response', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Click new conversation
    await page.click('[data-testid="new-conversation"]');

    // Type message
    await page.fill('[data-testid="input-field"]', 'Hello, AI!');

    // Send message
    await page.click('[data-testid="send-button"]');

    // Wait for response
    await page.waitForSelector('[data-testid="assistant-message"]');

    // Verify response
    const response = await page.textContent('[data-testid="assistant-message"]');
    expect(response).toBeTruthy();
  });
});
```

---

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
```

### Pre-commit Hooks

Tests are run automatically on commit via Husky:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test:ci
npm run lint
npm run type-check
```

---

## Troubleshooting

### Tests Failing Randomly

```bash
# Run in band (no parallelization)
npm test -- --runInBand

# Increase timeout
npm test -- --testTimeout=10000
```

### Mock Not Working

```bash
# Clear Jest cache
npm test -- --clearCache

# Or manually
rm -rf node_modules/.cache/jest
```

### Coverage Not Updating

```bash
# Clean coverage directory
rm -rf coverage

# Regenerate
npm run test:coverage
```

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Valdi Testing Guide](https://valdi.dev/docs/testing)

---

**Questions?** Open an issue on [GitHub](https://github.com/your-org/valdi-ai-ui/issues).
