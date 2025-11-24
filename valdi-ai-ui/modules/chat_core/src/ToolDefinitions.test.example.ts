/**
 * ToolDefinitions Test Examples
 *
 * Example test file demonstrating how to test the tool infrastructure.
 * Rename to .test.ts and adjust for your testing framework.
 */

import { ToolExecutor, ToolCallInput } from './ToolExecutor';
import {
  getWeather,
  calculateExpression,
  searchWeb,
  getAllTools,
} from './ToolDefinitions';

// Example 1: Test individual tool execution
async function testWeatherTool() {
  const executor = new ToolExecutor({ getWeather });

  const result = await executor.executeToolCall({
    toolCallId: 'test-1',
    toolName: 'getWeather',
    args: { location: 'San Francisco' },
  });

  console.log('Weather tool result:', result);
  console.assert(result.success === true, 'Weather tool should succeed');
  console.assert(
    result.result !== undefined,
    'Weather tool should return data',
  );
}

// Example 2: Test calculator with valid expression
async function testCalculatorValid() {
  const executor = new ToolExecutor({ calculateExpression });

  const result = await executor.executeToolCall({
    toolCallId: 'test-2',
    toolName: 'calculateExpression',
    args: { expression: '(10 + 5) * 2' },
  });

  console.log('Calculator result:', result);
  console.assert(result.success === true, 'Calculator should succeed');
  console.assert(
    (result.result as any)?.result === 30,
    'Calculator should return correct result',
  );
}

// Example 3: Test calculator with invalid expression
async function testCalculatorInvalid() {
  const executor = new ToolExecutor({ calculateExpression });

  const result = await executor.executeToolCall({
    toolCallId: 'test-3',
    toolName: 'calculateExpression',
    args: { expression: 'invalid expression!' },
  });

  console.log('Calculator invalid result:', result);
  console.assert(
    result.success === false,
    'Calculator should fail on invalid input',
  );
  console.assert(
    (result.result as any)?.error !== undefined,
    'Should return error message',
  );
}

// Example 4: Test search tool
async function testSearchTool() {
  const executor = new ToolExecutor({ searchWeb });

  const result = await executor.executeToolCall({
    toolCallId: 'test-4',
    toolName: 'searchWeb',
    args: { query: 'TypeScript best practices' },
  });

  console.log('Search result:', result);
  console.assert(result.success === true, 'Search should succeed');
  console.assert(
    (result.result as any)?.results?.length > 0,
    'Search should return results',
  );
}

// Example 5: Test non-existent tool
async function testNonExistentTool() {
  const executor = new ToolExecutor(getAllTools());

  const result = await executor.executeToolCall({
    toolCallId: 'test-5',
    toolName: 'nonExistentTool',
    args: {},
  });

  console.log('Non-existent tool result:', result);
  console.assert(result.success === false, 'Should fail for non-existent tool');
  console.assert(result.error !== undefined, 'Should return error message');
}

// Example 6: Test parallel execution
async function testParallelExecution() {
  const executor = new ToolExecutor(getAllTools());

  const toolCalls: ToolCallInput[] = [
    {
      toolCallId: 'call-1',
      toolName: 'getWeather',
      args: { location: 'New York' },
    },
    {
      toolCallId: 'call-2',
      toolName: 'getWeather',
      args: { location: 'Los Angeles' },
    },
    {
      toolCallId: 'call-3',
      toolName: 'calculateExpression',
      args: { expression: '100 + 200' },
    },
  ];

  const startTime = Date.now();
  const results = await executor.executeToolCalls(toolCalls);
  const totalTime = Date.now() - startTime;

  console.log('Parallel execution results:', results);
  console.log('Total execution time:', totalTime, 'ms');

  console.assert(results.length === 3, 'Should execute all three tools');
  console.assert(
    results.every((r) => r.success),
    'All tools should succeed',
  );
}

// Example 7: Test sequential execution
async function testSequentialExecution() {
  const executor = new ToolExecutor(getAllTools());

  const toolCalls: ToolCallInput[] = [
    {
      toolCallId: 'seq-1',
      toolName: 'searchWeb',
      args: { query: 'weather APIs' },
    },
    {
      toolCallId: 'seq-2',
      toolName: 'getWeather',
      args: { location: 'Seattle' },
    },
  ];

  const results = await executor.executeToolCallsSequentially(toolCalls);

  console.log('Sequential execution results:', results);
  console.assert(results.length === 2, 'Should execute both tools');
  console.assert(
    results[0].timestamp < results[1].timestamp,
    'Should execute in order',
  );
}

// Example 8: Test result formatting
async function testResultFormatting() {
  const executor = new ToolExecutor({ calculateExpression });

  const result = await executor.executeToolCall({
    toolCallId: 'format-1',
    toolName: 'calculateExpression',
    args: { expression: '50 * 2' },
  });

  const formatted = executor.formatToolResult(result);
  console.log('Formatted result:\n', formatted);

  const multipleResults = [result];
  const formattedMultiple = executor.formatToolResults(multipleResults);
  console.log('Formatted multiple results:\n', formattedMultiple);
}

// Example 9: Test tool management
async function testToolManagement() {
  const executor = new ToolExecutor({ getWeather });

  console.log('Initial tools:', executor.getAvailableToolNames());
  console.assert(
    executor.hasToolAvailable('getWeather'),
    'Should have weather tool',
  );

  // Add a tool
  executor.addTool('calculateExpression', calculateExpression);
  console.log('After adding calculator:', executor.getAvailableToolNames());
  console.assert(
    executor.hasToolAvailable('calculateExpression'),
    'Should have calculator tool',
  );

  // Remove a tool
  executor.removeTool('getWeather');
  console.log('After removing weather:', executor.getAvailableToolNames());
  console.assert(
    !executor.hasToolAvailable('getWeather'),
    'Should not have weather tool',
  );
}

// Example 10: Test execution time tracking
async function testExecutionTime() {
  const executor = new ToolExecutor(getAllTools());

  const result = await executor.executeToolCall({
    toolCallId: 'time-1',
    toolName: 'getWeather',
    args: { location: 'Chicago' },
  });

  console.log('Execution time:', result.executionTime, 'ms');
  console.assert(
    result.executionTime >= 0,
    'Execution time should be non-negative',
  );
  console.assert(result.timestamp !== undefined, 'Should have timestamp');
}

// Run all tests
async function runAllTests() {
  console.log('=== Running Tool Infrastructure Tests ===\n');

  try {
    console.log('Test 1: Weather Tool');
    await testWeatherTool();
    console.log('✓ Passed\n');

    console.log('Test 2: Calculator - Valid Expression');
    await testCalculatorValid();
    console.log('✓ Passed\n');

    console.log('Test 3: Calculator - Invalid Expression');
    await testCalculatorInvalid();
    console.log('✓ Passed\n');

    console.log('Test 4: Search Tool');
    await testSearchTool();
    console.log('✓ Passed\n');

    console.log('Test 5: Non-existent Tool');
    await testNonExistentTool();
    console.log('✓ Passed\n');

    console.log('Test 6: Parallel Execution');
    await testParallelExecution();
    console.log('✓ Passed\n');

    console.log('Test 7: Sequential Execution');
    await testSequentialExecution();
    console.log('✓ Passed\n');

    console.log('Test 8: Result Formatting');
    await testResultFormatting();
    console.log('✓ Passed\n');

    console.log('Test 9: Tool Management');
    await testToolManagement();
    console.log('✓ Passed\n');

    console.log('Test 10: Execution Time Tracking');
    await testExecutionTime();
    console.log('✓ Passed\n');

    console.log('=== All Tests Passed! ===');
  } catch (error) {
    console.error('✗ Test failed:', error);
    throw error;
  }
}

// Export for use as a module
export {
  testWeatherTool,
  testCalculatorValid,
  testCalculatorInvalid,
  testSearchTool,
  testNonExistentTool,
  testParallelExecution,
  testSequentialExecution,
  testResultFormatting,
  testToolManagement,
  testExecutionTime,
  runAllTests,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
