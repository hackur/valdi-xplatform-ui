# Valdi Testing Guide - Jest Configuration & Patterns

This command provides comprehensive guidance on testing Valdi applications using Jest, including configuration, mocking patterns, and best practices.

## Table of Contents
1. [Jest Configuration](#jest-configuration)
2. [Valdi Mocks Pattern](#valdi-mocks-pattern)
3. [Test File Organization](#test-file-organization)
4. [Component Testing](#component-testing)
5. [Store Testing](#store-testing)
6. [Path Aliases in Tests](#path-aliases-in-tests)
7. [Common Patterns](#common-patterns)

## Jest Configuration

### Coverage Thresholds

The project requires 60% minimum coverage across all metrics:

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 60,
    functions: 60,
    lines: 60,
    statements: 60,
  },
}
```

### Test Patterns

Tests are discovered using these patterns:
```javascript
testMatch: [
  '**/__tests__/**/*.+(ts|tsx|js)',
  '**/?(*.)+(spec|test).+(ts|tsx|js)',
]
```

### TypeScript Configuration

Tests use a separate TypeScript config (`tsconfig.test.json`):
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "modules/**/*.test.ts",
    "modules/**/*.test.tsx",
    "modules/**/__tests__/**/*.ts",
    "modules/**/__tests__/**/*.tsx"
  ]
}
```

## Valdi Mocks Pattern

### Mock Directory Structure

Valdi core modules are mocked in `__mocks__/` directory:

```
__mocks__/
├── valdi_core/
│   └── src/
│       ├── Component.ts
│       ├── Style.ts
│       └── SystemFont.ts
├── valdi_tsx/
│   └── src/
│       └── NativeTemplateElements.ts
├── valdi_http/
│   └── src/
│       └── HTTPClient.ts
└── valdi_navigation/
    └── src/
        └── NavigationController.ts
```

### Component Mock

`__mocks__/valdi_core/src/Component.ts`:
```typescript
export class Component<TViewModel = any, TState = any> {
  viewModel: TViewModel;
  state: TState;

  constructor(viewModel: TViewModel) {
    this.viewModel = viewModel;
    this.state = {} as TState;
  }

  onRender(): void {}

  setState(newState: Partial<TState>): void {
    this.state = { ...this.state, ...newState };
  }

  // Lifecycle methods
  onCreate(): void {}
  onMount(): void {}
  onUpdate(): void {}
  onViewModelUpdate(_previousViewModel?: TViewModel): void {}
  onUnmount(): void {}
  onDestroy(): void {}
}

export class StatefulComponent<TProps = any, TState = any>
  extends Component<TProps, TState> {
  constructor(viewModel: TProps, initialState?: TState) {
    super(viewModel);
    if (initialState) {
      this.state = initialState;
    }
  }
}
```

### Style Mock

`__mocks__/valdi_core/src/Style.ts`:
```typescript
export class Style<T = any> {
  private styles: Record<string, any>;

  constructor(styles: Record<string, any> = {}) {
    this.styles = styles;
  }

  getStyles(): Record<string, any> {
    return this.styles;
  }
}
```

### HTTPClient Mock

`__mocks__/valdi_http/src/HTTPClient.ts`:
```typescript
export class HTTPClient {
  baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get(path: string, headers?: Record<string, string>): Promise<string> {
    return JSON.stringify({ mocked: true });
  }

  async post(
    path: string,
    body: string,
    headers?: Record<string, string>
  ): Promise<string> {
    return JSON.stringify({ mocked: true });
  }

  setHeader(key: string, value: string): void {}
}
```

### Module Name Mapping

Configure Jest to map Valdi modules to mocks:

```javascript
// jest.config.js
moduleNameMapper: {
  '^valdi_core/(.*)$': '<rootDir>/__mocks__/valdi_core/$1',
  '^valdi_tsx/(.*)$': '<rootDir>/__mocks__/valdi_tsx/$1',
  '^valdi_http/(.*)$': '<rootDir>/__mocks__/valdi_http/$1',
  '^valdi_navigation/(.*)$': '<rootDir>/__mocks__/valdi_navigation/$1',
}
```

## Test File Organization

### File Naming Conventions

Use one of these patterns:
1. `*.test.ts` or `*.test.tsx` - Colocated with source files
2. `*.spec.ts` or `*.spec.tsx` - Specification-style tests
3. `__tests__/ComponentName.test.ts` - Centralized test directory

### Example Structure

```
modules/chat_core/
├── src/
│   ├── __tests__/
│   │   ├── ChatService.test.ts
│   │   ├── MessageStore.test.ts
│   │   └── ConversationStore.test.ts
│   ├── ChatService.ts
│   ├── MessageStore.ts
│   └── ConversationStore.ts
└── BUILD.bazel
```

### Excluding Tests from Production

**CRITICAL:** Test files must be excluded from `BUILD.bazel`:

```python
valdi_module(
    name = "chat_core",
    srcs = glob(
        ["src/**/*.ts", "src/**/*.tsx"],
        exclude = [
            "**/__tests__/**",
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
        ],
    ),
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "//apps/valdi_ai_ui/modules/common",
    ],
)
```

Why: Valdi/Bazel includes ALL files by default. Test files use Jest globals (`describe`, `it`, `expect`) that don't exist in Valdi's runtime, causing compilation errors.

## Component Testing

### Testing Valdi Components

```typescript
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should initialize with viewModel', () => {
    // Arrange
    const viewModel = {
      title: 'Test Title',
      isVisible: true,
    };

    // Act
    const component = new MyComponent(viewModel);

    // Assert
    expect(component.viewModel).toEqual(viewModel);
  });

  it('should update state', () => {
    // Arrange
    const component = new MyComponent({ title: 'Test' });

    // Act
    component.setState({ count: 5 });

    // Assert
    expect(component.state.count).toBe(5);
  });

  it('should call lifecycle methods', () => {
    // Arrange
    const component = new MyComponent({ title: 'Test' });
    const onMountSpy = jest.spyOn(component, 'onMount');

    // Act
    component.onMount();

    // Assert
    expect(onMountSpy).toHaveBeenCalled();
  });
});
```

### Testing Component with State

```typescript
describe('StatefulComponent', () => {
  it('should initialize with initial state', () => {
    // Arrange
    const initialState = { count: 0, isLoading: false };

    // Act
    const component = new MyStatefulComponent({}, initialState);

    // Assert
    expect(component.state).toEqual(initialState);
  });

  it('should merge state updates', () => {
    // Arrange
    const component = new MyStatefulComponent(
      {},
      { count: 0, name: 'Initial' }
    );

    // Act
    component.setState({ count: 5 }); // Only update count

    // Assert
    expect(component.state).toEqual({ count: 5, name: 'Initial' });
  });
});
```

## Store Testing

### Pattern: Store with Subscriptions

```typescript
describe('MessageStore', () => {
  let store: MessageStore;
  let mockPersistence: jest.Mocked<MessagePersistence>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock persistence
    mockPersistence = {
      loadAllMessages: jest.fn().mockResolvedValue({}),
      saveMessagesDebounced: jest.fn().mockResolvedValue(undefined),
      deleteMessage: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Create store with mock
    store = new MessageStore(true, mockPersistence);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CRUD operations', () => {
    it('should create a message', async () => {
      // Arrange
      const message: Message = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      // Act
      await store.addMessage(message);

      // Assert
      const messages = store.getMessages('conv-1');
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
      expect(mockPersistence.saveMessagesDebounced).toHaveBeenCalled();
    });
  });

  describe('Subscriptions', () => {
    it('should notify subscribers on updates', async () => {
      // Arrange
      const listener = jest.fn();
      store.subscribe(listener);

      const message: Message = { /* ... */ };

      // Act
      await store.addMessage(message);

      // Assert
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          messagesByConversation: expect.objectContaining({
            'conv-1': [message],
          }),
        })
      );
    });

    it('should unsubscribe correctly', async () => {
      // Arrange
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      // Act
      unsubscribe();
      await store.addMessage({ /* ... */ });

      // Assert
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
```

### Pattern: Async Store Operations

```typescript
describe('ChatService', () => {
  it('should handle API calls', async () => {
    // Arrange
    const mockHTTPClient = {
      post: jest.fn().mockResolvedValue(
        JSON.stringify({ response: 'Test response' })
      ),
    } as any;

    const service = new ChatService(mockHTTPClient);

    // Act
    const result = await service.sendMessage('Hello');

    // Assert
    expect(result).toBe('Test response');
    expect(mockHTTPClient.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(Object)
    );
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const mockHTTPClient = {
      post: jest.fn().mockRejectedValue(new Error('Network error')),
    } as any;

    const service = new ChatService(mockHTTPClient);

    // Act & Assert
    await expect(service.sendMessage('Hello')).rejects.toThrow('Network error');
  });
});
```

## Path Aliases in Tests

### Usage: Tests Only

Path aliases (like `@common`, `@chat_core`) work in tests but NOT in production Valdi code:

```typescript
// [PASS] ALLOWED in test files
import { Message } from '@common';
import { ChatService } from '@chat_core';

// [FAIL] NOT ALLOWED in production code (src/*.ts)
// Must use full module path: 'common/src/types'
```

### Module Name Mapper Configuration

```javascript
// jest.config.js
moduleNameMapper: {
  '^@common$': '<rootDir>/modules/common/src/index.ts',
  '^@common/(.*)$': '<rootDir>/modules/common/src/$1',
  '^@chat_core$': '<rootDir>/modules/chat_core/src/index.ts',
  '^@chat_core/(.*)$': '<rootDir>/modules/chat_core/src/$1',
  // ... other module aliases
}
```

## Common Patterns

### Pattern: Mocking Dependencies

```typescript
// Mock external module
jest.mock('../MessagePersistence');

describe('MyClass', () => {
  it('should use mocked dependency', () => {
    const mock = new MessagePersistence() as jest.Mocked<MessagePersistence>;
    mock.loadAllMessages.mockResolvedValue({});

    // Use mock in test
  });
});
```

### Pattern: Spying on Console

```typescript
it('should log warning on error', async () => {
  // Arrange
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  // Act
  await functionThatWarns();

  // Assert
  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('Expected warning')
  );

  // Cleanup
  consoleSpy.mockRestore();
});
```

### Pattern: Testing Async Errors

```typescript
it('should throw on invalid input', async () => {
  // Act & Assert
  await expect(asyncFunction('invalid')).rejects.toThrow('Validation error');
});
```

### Pattern: Testing State Updates

```typescript
it('should update state incrementally', () => {
  // Arrange
  const component = new MyComponent({});
  component.setState({ count: 0, name: 'Test' });

  // Act
  component.setState({ count: 5 }); // Partial update

  // Assert
  expect(component.state).toEqual({ count: 5, name: 'Test' });
});
```

### Pattern: Testing with Timers

```typescript
jest.useFakeTimers();

it('should debounce calls', () => {
  // Arrange
  const callback = jest.fn();
  const debounced = debounce(callback, 1000);

  // Act
  debounced();
  debounced();
  debounced();

  jest.runAllTimers();

  // Assert
  expect(callback).toHaveBeenCalledTimes(1);
});
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- MessageStore.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests for Specific Module
```bash
npm test -- modules/chat_core
```

## Best Practices

1. **Always Exclude Tests from BUILD.bazel**
   - Use `exclude` glob pattern for all test files
   - Tests use Jest-specific APIs not available in Valdi runtime

2. **Mock Valdi Core Modules**
   - Create mocks in `__mocks__/valdi_core/`
   - Map them in `jest.config.js` moduleNameMapper

3. **Use Path Aliases Only in Tests**
   - Production code must use full module paths
   - Tests can use `@common`, `@chat_core`, etc.

4. **Maintain 60% Coverage**
   - Check coverage with `npm test -- --coverage`
   - Focus on critical business logic

5. **Test Async Operations**
   - Always use `async/await` in test functions
   - Test both success and error paths

6. **Clean Up After Tests**
   - Use `afterEach` to restore mocks
   - Clear timers and listeners

7. **Descriptive Test Names**
   - Use "should" statements
   - Clearly describe expected behavior

## Reference Documentation

- Main lessons learned: `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/VALDI_LESSONS_LEARNED.md`
- Jest configuration: `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/jest.config.js`
- TypeScript test config: `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/tsconfig.test.json`
- Example tests: `/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/modules/chat_core/src/__tests__/`

## Troubleshooting

### "Cannot find module '@common'"
- Check `moduleNameMapper` in `jest.config.js`
- Ensure path matches actual file location

### "describe is not defined"
- Test file is being compiled for production
- Add test file to `exclude` in BUILD.bazel

### "Property 'mock' does not exist"
- TypeScript config issue
- Ensure `tsconfig.test.json` includes `"types": ["jest"]`

### Tests timing out
- Check for unresolved promises
- Increase timeout: `jest.setTimeout(10000)`
- Ensure async operations complete
