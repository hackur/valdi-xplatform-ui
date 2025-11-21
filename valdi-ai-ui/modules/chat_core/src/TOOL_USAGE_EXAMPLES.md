# Tool Calling Infrastructure - Usage Examples

This document demonstrates how to use the tool calling infrastructure in the valdi-ai-ui chat_core module.

## Overview

The tool calling infrastructure consists of three main components:

1. **ToolDefinitions.ts** - Defines AI SDK v5 compatible tools using Zod schemas
2. **ToolExecutor.ts** - Executes tool calls and handles errors
3. **ChatService.ts** - Integrates tools into chat interactions

## Quick Start

### Basic Usage with Default Tools

```typescript
import { ChatService } from '@chat_core';
import { MessageStore } from '@chat_core';

// Initialize services
const messageStore = new MessageStore();
const chatService = new ChatService({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
  },
}, messageStore);

// Send a message with tools enabled
const response = await chatService.sendMessage({
  conversationId: 'conv-123',
  message: 'What is the weather in San Francisco?',
  toolsEnabled: true, // Enable tool calling
});

// Check if tools were used
if (response.toolCalls && response.toolCalls.length > 0) {
  console.log('Tools used:', response.toolCalls);
}
```

### Streaming with Tools

```typescript
await chatService.sendMessageStreaming({
  conversationId: 'conv-123',
  message: 'Calculate 25 * 4 + 10',
  toolsEnabled: true,
}, (event) => {
  if (event.type === 'tool-call') {
    console.log('Tool called:', event.toolCall);
  } else if (event.type === 'chunk') {
    console.log('Text chunk:', event.delta);
  } else if (event.type === 'complete') {
    console.log('Complete message:', event.message);
  }
});
```

## Available Default Tools

### 1. getWeather

Get weather information for a location.

```typescript
// Example usage in a chat:
// User: "What's the weather in New York?"
// AI will call: getWeather({ location: "New York" })
```

**Parameters:**
- `location` (string) - City name or location

**Returns:**
```typescript
{
  success: true,
  data: {
    location: "New York",
    temperature: 72,
    unit: "fahrenheit",
    condition: "Sunny",
    humidity: 65,
    windSpeed: 12,
    forecast: {
      today: "Sunny",
      tomorrow: "Cloudy"
    }
  },
  timestamp: "2025-11-21T..."
}
```

### 2. calculateExpression

Evaluate mathematical expressions.

```typescript
// Example usage in a chat:
// User: "What is (100 * 5) - 25?"
// AI will call: calculateExpression({ expression: "(100 * 5) - 25" })
```

**Parameters:**
- `expression` (string) - Mathematical expression to evaluate

**Returns:**
```typescript
{
  success: true,
  expression: "(100 * 5) - 25",
  result: 475,
  formattedResult: "475.00"
}
```

### 3. searchWeb

Search the web for information (mock implementation).

```typescript
// Example usage in a chat:
// User: "Search for React best practices"
// AI will call: searchWeb({ query: "React best practices" })
```

**Parameters:**
- `query` (string) - Search query

**Returns:**
```typescript
{
  success: true,
  query: "React best practices",
  resultsCount: 3,
  results: [
    {
      title: "Understanding React best practices - Comprehensive Guide",
      url: "https://example.com/...",
      snippet: "A comprehensive guide to...",
      relevance: 0.95
    },
    // ... more results
  ],
  timestamp: "2025-11-21T...",
  searchTime: 0.35
}
```

## Creating Custom Tools

### Define a Custom Tool

```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const getUserInfo = tool({
  description: 'Get information about a user by their ID',
  parameters: z.object({
    userId: z.string().describe('The user ID to look up'),
  }),
  execute: async ({ userId }) => {
    // Your implementation
    const user = await database.users.findById(userId);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  },
});
```

### Add Custom Tool to ChatService

```typescript
import { getUserInfo } from './customTools';

// Add a single tool
chatService.addTool('getUserInfo', getUserInfo);

// Or update all tools
chatService.updateTools({
  getUserInfo,
  getWeather,
  // ... other tools
});
```

### Use Specific Tools for a Request

```typescript
import { getWeather, calculateExpression } from '@chat_core/ToolDefinitions';

const response = await chatService.sendMessage({
  conversationId: 'conv-123',
  message: 'What is the weather in Boston and calculate 50 + 30?',
  toolsEnabled: true,
  tools: {
    getWeather,
    calculateExpression,
    // Only these tools will be available for this request
  },
});
```

## Advanced Usage

### Tool Executor Standalone Usage

```typescript
import { ToolExecutor } from '@chat_core/ToolExecutor';
import { getAllTools } from '@chat_core/ToolDefinitions';

const executor = new ToolExecutor(getAllTools());

// Execute a single tool call
const result = await executor.executeToolCall({
  toolCallId: 'call-1',
  toolName: 'getWeather',
  args: { location: 'Seattle' },
});

console.log(executor.formatToolResult(result));
```

### Parallel Tool Execution

```typescript
const results = await executor.executeToolCalls([
  {
    toolCallId: 'call-1',
    toolName: 'getWeather',
    args: { location: 'Seattle' },
  },
  {
    toolCallId: 'call-2',
    toolName: 'getWeather',
    args: { location: 'Portland' },
  },
  {
    toolCallId: 'call-3',
    toolName: 'calculateExpression',
    args: { expression: '10 + 20' },
  },
]);

// All three tools execute in parallel
```

### Sequential Tool Execution

```typescript
const results = await executor.executeToolCallsSequentially([
  {
    toolCallId: 'call-1',
    toolName: 'getUserInfo',
    args: { userId: '123' },
  },
  {
    toolCallId: 'call-2',
    toolName: 'updateUser',
    args: { userId: '123', data: {...} },
  },
]);

// Tools execute one after another
// Stops if a critical error occurs
```

### Error Handling

```typescript
const result = await executor.executeToolCall({
  toolCallId: 'call-1',
  toolName: 'calculateExpression',
  args: { expression: 'invalid!' },
});

if (!result.success) {
  console.error('Tool execution failed:', result.error);
  console.log('Execution time:', result.executionTime, 'ms');
}
```

## Tool Management

### List Available Tools

```typescript
const toolNames = chatService.getAvailableToolNames();
console.log('Available tools:', toolNames);
// Output: ['getWeather', 'calculateExpression', 'searchWeb']
```

### Remove a Tool

```typescript
chatService.removeTool('searchWeb');
```

### Check Tool Availability

```typescript
const executor = chatService.getToolExecutor();
const hasWeatherTool = executor.hasToolAvailable('getWeather');
```

## Integration with Streaming

```typescript
let toolCallsUsed = false;

await chatService.sendMessageStreaming({
  conversationId: 'conv-123',
  message: 'Get weather for Tokyo and calculate 100 * 50',
  toolsEnabled: true,
}, (event) => {
  switch (event.type) {
    case 'start':
      console.log('Stream started');
      break;

    case 'chunk':
      console.log('Text:', event.delta);
      break;

    case 'tool-call':
      toolCallsUsed = true;
      console.log('Tool:', event.toolCall.toolName);
      console.log('Result:', event.toolCall.result);
      break;

    case 'complete':
      if (toolCallsUsed) {
        console.log('Response used tools!');
      }
      console.log('Final message:', event.message);
      break;

    case 'error':
      console.error('Error:', event.error);
      break;
  }
});
```

## Best Practices

1. **Enable tools only when needed** - Set `toolsEnabled: true` only for requests that might benefit from tools
2. **Use specific tools** - Pass only relevant tools in the `tools` parameter to reduce token usage
3. **Handle errors gracefully** - Always check `success` field in tool results
4. **Monitor execution time** - Use `executionTime` to track performance
5. **Validate tool results** - Verify tool output before presenting to users

## TypeScript Types

```typescript
import {
  ToolCallInput,
  ToolCallResult,
  ToolExecutor,
} from '@chat_core/ToolExecutor';

import {
  ToolName,
  getToolsByName,
  getAllTools,
} from '@chat_core/ToolDefinitions';

// Tool call input
const input: ToolCallInput = {
  toolCallId: 'call-1',
  toolName: 'getWeather',
  args: { location: 'Boston' },
};

// Tool call result
const result: ToolCallResult = {
  toolCallId: 'call-1',
  toolName: 'getWeather',
  success: true,
  result: {...},
  executionTime: 150,
  timestamp: '2025-11-21T...',
};
```

## Testing Tools

```typescript
import { ToolExecutor } from '@chat_core/ToolExecutor';
import { calculateExpression } from '@chat_core/ToolDefinitions';

describe('ToolExecutor', () => {
  it('should execute calculator tool', async () => {
    const executor = new ToolExecutor({ calculateExpression });

    const result = await executor.executeToolCall({
      toolCallId: 'test-1',
      toolName: 'calculateExpression',
      args: { expression: '2 + 2' },
    });

    expect(result.success).toBe(true);
    expect(result.result).toMatchObject({
      result: 4,
    });
  });
});
```

## Notes

- All default tools are **mock implementations** for demonstration purposes
- In production, replace mock implementations with real API calls
- Tool results are stored in message metadata for history/debugging
- Tools support async execution for API calls and database queries
- The AI SDK v5 automatically handles tool calling in multi-step conversations
