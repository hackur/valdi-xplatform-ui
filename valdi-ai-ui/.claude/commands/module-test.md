# Module Test Agent

Test specific modules in isolation with comprehensive coverage.

## Usage

Arguments: `<module-name>`

Examples:
- `/module-test chat_core`
- `/module-test auth`
- `/module-test settings`

## Task

Run comprehensive tests for a specific module with detailed reporting.

## Testing Process

### 1. Module Discovery
```bash
# Find module path
MODULE_PATH="modules/${MODULE_NAME}"

# Verify module exists
if [ ! -d "$MODULE_PATH" ]; then
  echo "[FAIL] Module not found: $MODULE_NAME"
  exit 1
fi

# Find test files
TEST_FILES=$(find "$MODULE_PATH" -name "*.test.ts" -o -name "*.test.tsx")
echo "Found $(echo $TEST_FILES | wc -w) test files"
```

### 2. Module-Specific Tests
```bash
# Run module tests with coverage
npm test -- \
  --testPathPattern="${MODULE_NAME}" \
  --coverage \
  --coverageDirectory="coverage/${MODULE_NAME}" \
  --verbose

# Generate coverage report
npm test -- \
  --testPathPattern="${MODULE_NAME}" \
  --coverage \
  --coverageReporters=json-summary
```

### 3. Coverage Analysis

Check coverage for:
- **Services**: Target 90%+ coverage
- **ViewModels**: Target 85%+ coverage
- **Components**: Target 80%+ coverage
- **Utilities**: Target 95%+ coverage

```bash
# Parse coverage
LINES=$(cat coverage/${MODULE_NAME}/coverage-summary.json | jq '.total.lines.pct')
BRANCHES=$(cat coverage/${MODULE_NAME}/coverage-summary.json | jq '.total.branches.pct')
FUNCTIONS=$(cat coverage/${MODULE_NAME}/coverage-summary.json | jq '.total.functions.pct')
STATEMENTS=$(cat coverage/${MODULE_NAME}/coverage-summary.json | jq '.total.statements.pct')
```

### 4. Test Quality Checks

Verify:
- [PASS] No skipped tests (.skip)
- [PASS] No focused tests (.only)
- [PASS] All assertions meaningful
- [PASS] Mocks properly configured
- [PASS] Cleanup in afterEach/afterAll
- [PASS] Error cases tested

### 5. Identify Gaps

```bash
# Find files without tests
FILES_WITHOUT_TESTS=$(find "$MODULE_PATH/src" -name "*.ts" -o -name "*.tsx" | while read file; do
  basename="${file%.*}"
  if [ ! -f "$MODULE_PATH/__tests__/$(basename $basename).test.ts" ]; then
    echo "$file"
  fi
done)
```

### 6. Performance Testing

```bash
# Test execution time
time npm test -- --testPathPattern="${MODULE_NAME}"

# Slow tests (>1000ms)
npm test -- --testPathPattern="${MODULE_NAME}" --verbose | grep -A1 "PASS\|FAIL" | grep "ms"
```

## Module Test Patterns

### Service Tests
```typescript
describe('ChatService', () => {
  let service: ChatService;
  let mockRepository: jest.Mocked<ChatRepository>;

  beforeEach(() => {
    mockRepository = createMockChatRepository();
    service = new ChatService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      // Arrange
      const message = createTestMessage();
      mockRepository.save.mockResolvedValue(message);

      // Act
      const result = await service.sendMessage(message);

      // Assert
      expect(result).toEqual(message);
      expect(mockRepository.save).toHaveBeenCalledWith(message);
    });

    it('should handle network errors', async () => {
      // Test error case
    });

    it('should validate message format', () => {
      // Test validation
    });
  });
});
```

### ViewModel Tests
```typescript
describe('ChatViewModel', () => {
  let viewModel: ChatViewModel;

  beforeEach(() => {
    viewModel = new ChatViewModel();
  });

  afterEach(() => {
    viewModel.dispose();
  });

  it('should initialize with empty messages', () => {
    expect(viewModel.messages).toEqual([]);
  });

  it('should add message and update state', () => {
    const message = createTestMessage();
    viewModel.addMessage(message);
    expect(viewModel.messages).toContain(message);
  });
});
```

### Component Tests
```typescript
describe('ChatBubble', () => {
  it('should render message text', () => {
    const message = createTestMessage({ text: 'Hello' });
    const { getByText } = render(<ChatBubble message={message} />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('should handle press events', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<ChatBubble onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## Output Format

```
[TEST] Module Test Report: ${MODULE_NAME}
=====================================

Module: modules/${MODULE_NAME}
Test Files: 8
Tests: 56

Results:
  [PASS] Pass: 54
  [FAIL] Fail: 2
  ⏭️  Skip: 0
  [TIME]  Duration: 8.5s

Coverage:
  Lines:      87.5% [PASS] (target: 80%)
  Branches:   82.3% [PASS] (target: 75%)
  Functions:  91.2% [PASS] (target: 80%)
  Statements: 88.1% [PASS] (target: 80%)

Coverage by Type:
  Services:    92.1% [PASS]
  ViewModels:  88.4% [PASS]
  Components:  81.2% [PASS]
  Utilities:   95.0% [PASS]

[FAIL] Failing Tests:
  1. ChatService › sendMessage › should retry on network error
     - Expected retry count to be 3, received 2
     - File: __tests__/ChatService.test.ts:45

  2. ChatViewModel › loadMessages › should handle empty response
     - Expected messages to be empty array
     - File: __tests__/ChatViewModel.test.ts:78

[WARN]  Files Without Tests:
  - src/utils/messageFormatter.ts
  - src/components/ChatInput.tsx

🐌 Slow Tests (>1000ms):
  - ChatService integration tests: 2.3s
  - Message synchronization tests: 1.5s

[TARGET] Action Items:
  1. Fix 2 failing tests
  2. Add tests for messageFormatter.ts
  3. Add tests for ChatInput.tsx
  4. Optimize slow integration tests

[INFO] Recommendations:
  - Overall health: GOOD
  - Coverage meets targets
  - Test quality is high
  - Address failing tests before merging
```

## Quick Commands

After module test, you can:
- Fix failing tests: `/fix-tests ${MODULE_NAME}`
- Add missing tests: `/test-writer ${MODULE_NAME}`
- Review coverage: `npm test -- --testPathPattern="${MODULE_NAME}" --coverage --coverageReporters=html`

Use module testing to ensure each part of your application is thoroughly validated.
