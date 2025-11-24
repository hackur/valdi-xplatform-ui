# Contributing to Valdi AI UI

Thank you for your interest in contributing to Valdi AI UI! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Bazel 7.0.0
- Valdi CLI
- Git

### Setup Development Environment

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/valdi-ai-ui.git
cd valdi-ai-ui

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Add your API keys to .env

# 4. Verify setup
npm run validate
```

---

## Development Workflow

### Daily Development

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Start development
npm run type-check:watch    # Terminal 1: Watch types
npm run test:watch          # Terminal 2: Watch tests

# 3. Make changes
# ... edit code ...

# 4. Verify changes
npm run validate           # Run all checks

# 5. Commit and push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 6. Create Pull Request
# Go to GitHub and create PR
```

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates
- `chore/description` - Build/tooling changes

---

## Coding Standards

### TypeScript Standards

#### Strict Type Safety

```typescript
// ✅ GOOD: Explicit types
interface UserMessage {
  id: string;
  content: string;
  timestamp: Date;
}

function createMessage(content: string): UserMessage {
  return {
    id: generateId(),
    content,
    timestamp: new Date(),
  };
}

// ❌ BAD: Implicit any
function createMessage(content) {
  return { content };
}
```

#### Naming Conventions

```typescript
// Classes: PascalCase
class MessageStore { }

// Interfaces/Types: PascalCase
interface Message { }
type MessageRole = 'user' | 'assistant';

// Functions/Variables: camelCase
const messageStore = new MessageStore();
function sendMessage() { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Components: PascalCase
export class ChatView extends Component { }

// Private members: prefix with _
private _internalState: State;
```

#### JSDoc Comments

```typescript
/**
 * Sends a message to the AI and streams the response
 *
 * @param conversationId - The conversation to send the message to
 * @param content - The message content
 * @param config - Optional model configuration
 * @returns Promise resolving to the AI's response
 * @throws {Error} If the API key is invalid
 *
 * @example
 * ```typescript
 * const response = await chatService.sendMessage(
 *   'conv_123',
 *   'Hello, world!',
 *   { temperature: 0.7 }
 * );
 * ```
 */
async sendMessage(
  conversationId: string,
  content: string,
  config?: ModelConfig,
): Promise<Message> {
  // Implementation
}
```

### Code Style

#### Formatting

- Use Prettier for formatting
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multiline
- Max line length: 80 characters (flexible)

```bash
# Format all code
npm run format

# Check formatting
npm run format:check
```

#### File Organization

```typescript
// 1. Imports (grouped)
import { Component } from 'valdi_core/src/Component';  // External
import { Colors } from '@common/theme';                 // Internal

// 2. Types/Interfaces
export interface Props { }
export interface State { }

// 3. Constants
const DEFAULT_TIMEOUT = 5000;

// 4. Component/Class
export class MyComponent extends Component<Props> {
  // Implementation
}

// 5. Helper functions
function helperFunction() { }

// 6. Exports
export { helperFunction };
```

### Valdi Component Standards

```typescript
// StatefulComponent example
export class ChatView extends StatefulComponent<Props, State> {
  // State initialization
  state: State = {
    messages: [],
    isLoading: false,
  };

  // Lifecycle methods
  async componentDidMount() {
    await this.loadMessages();
  }

  componentWillUnmount() {
    this.cleanup();
  }

  // Render method
  onRender() {
    const { messages, isLoading } = this.state;

    return (
      <view style={styles.container}>
        {isLoading ? <LoadingSpinner /> : this.renderMessages()}
      </view>
    );
  }

  // Helper methods (private)
  private renderMessages() {
    // Implementation
  }

  // Event handlers
  private handleSend = async (text: string) => {
    // Implementation
  };
}

// Styles at bottom
const styles = {
  container: new Style<View>({
    flex: 1,
    backgroundColor: Colors.background,
  }),
};
```

---

## Testing Guidelines

### Test Structure

```typescript
// Message.test.ts
describe('MessageUtils', () => {
  describe('generateId', () => {
    it('should generate unique message IDs', () => {
      const id1 = MessageUtils.generateId();
      const id2 = MessageUtils.generateId();

      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with msg_ prefix', () => {
      const id = MessageUtils.generateId();
      expect(id.startsWith('msg_')).toBe(true);
    });
  });

  describe('createUserMessage', () => {
    it('should create a valid user message', () => {
      const message = MessageUtils.createUserMessage('conv_1', 'Hello');

      expect(message).toMatchObject({
        conversationId: 'conv_1',
        role: 'user',
        content: 'Hello',
        status: 'pending',
      });
    });
  });
});
```

### Test Coverage Requirements

- **Unit Tests**: 80%+ coverage for utilities and services
- **Component Tests**: All UI components
- **Integration Tests**: Critical user flows

```bash
# Run tests with coverage
npm run test:coverage

# Coverage report in coverage/lcov-report/index.html
```

### Writing Good Tests

```typescript
// ✅ GOOD: Descriptive, focused, isolated
it('should return null when message is not found', () => {
  const store = new MessageStore();
  const result = store.getMessage('nonexistent');
  expect(result).toBeNull();
});

// ❌ BAD: Vague, multiple assertions, dependent
it('works', () => {
  const store = new MessageStore();
  store.addMessage(msg1);
  expect(store.getAll().length).toBe(1);
  store.addMessage(msg2);
  expect(store.getAll().length).toBe(2);
});
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Build/tooling changes
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(chat): add streaming support for messages"

# Bug fix
git commit -m "fix(storage): handle quota exceeded error"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api)!: change message format

BREAKING CHANGE: Message.content is now always a string"
```

---

## Pull Request Process

### Before Submitting

1. ✅ **Run all checks**
   ```bash
   npm run validate
   ```

2. ✅ **Update tests**
   - Add tests for new features
   - Update existing tests if needed

3. ✅ **Update documentation**
   - Update README if needed
   - Add JSDoc comments
   - Update CHANGELOG

4. ✅ **Rebase on main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests pass (`npm test`)
- [ ] Types are correct (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] CHANGELOG is updated

## Screenshots (if applicable)

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks** - CI must pass
2. **Code Review** - At least one approval required
3. **Testing** - Manual testing if needed
4. **Merge** - Squash and merge to main

---

## Issue Reporting

### Bug Reports

Use the bug report template and include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered list
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**:
  - OS and version
  - Node.js version
  - Valdi version
  - Device/simulator
- **Screenshots**: If applicable
- **Logs**: Console output

### Feature Requests

Use the feature request template and include:

- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Other solutions considered
- **Additional Context**: Any other information

---

## Project-Specific Guidelines

### Module Structure

When creating a new module:

```
modules/my_module/
├── BUILD.bazel           # Bazel build configuration
├── src/
│   ├── types.ts         # Type definitions
│   ├── MyService.ts     # Main service
│   ├── MyComponent.tsx  # Main component
│   ├── __tests__/       # Tests
│   │   └── MyService.test.ts
│   └── index.ts         # Exports
└── README.md            # Module documentation
```

### State Management Pattern

```typescript
// 1. Define state interface
interface State {
  data: Data[];
  isLoading: boolean;
  error?: string;
}

// 2. Observable pattern
class Store {
  private state: State = { data: [], isLoading: false };
  private observers = new Set<(state: State) => void>();

  subscribe(observer: (state: State) => void) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notify() {
    this.observers.forEach((obs) => obs(this.state));
  }

  // 3. Immutable updates
  setState(partial: Partial<State>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }
}
```

### Error Handling Pattern

```typescript
// Custom error classes
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handling
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    this.handleApiError(error);
  } else {
    // Handle unknown errors
    console.error('Unexpected error:', error);
    throw error;
  }
}
```

---

## Getting Help

- 📖 **Documentation** - Read the [docs](./docs)
- 💬 **Discussions** - [GitHub Discussions](https://github.com/your-org/valdi-ai-ui/discussions)
- 🐛 **Issues** - [GitHub Issues](https://github.com/your-org/valdi-ai-ui/issues)
- 💼 **Email** - contact@valdi-ai-ui.dev

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for significant contributions
- Annual contributor spotlight

Thank you for contributing to Valdi AI UI! 🎉
