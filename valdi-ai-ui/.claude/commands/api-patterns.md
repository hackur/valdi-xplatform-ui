# API Patterns - OpenAI Compatible

## Usage
Reference this for implementing OpenAI-compatible API integrations in Valdi.

## CRITICAL: Cannot Use AI SDK v5 Directly!

**IMPORTANT**: Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`) CANNOT be used in Valdi production code!

**Reason**: Valdi compiles TypeScript to native code without a JavaScript runtime. AI SDK depends on:
- JavaScript `fetch` API
- Stream processing
- Node.js runtime features

**Solution**: Use `valdi_http` module with direct HTTP API calls.

## HTTP Client Pattern

### Basic API Call
```typescript
import { HTTPClient } from 'valdi_http/src/HTTPClient';

// Create client
const client = new HTTPClient();

// Make request
const response = await client.post(
  'https://api.openai.com/v1/chat/completions',
  JSON.stringify({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  }),
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
  }
);

const data = JSON.parse(response.body);
const message = data.choices[0].message.content;
```

### Service Class Pattern
```typescript
import { HTTPClient } from 'valdi_http/src/HTTPClient';

export interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIChatService {
  private client: HTTPClient;
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.client = new HTTPClient();
    this.apiKey = apiKey;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const body = JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 1000,
      stream: false,
    });

    const response = await this.client.post(
      `${this.baseUrl}/chat/completions`,
      body,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.statusCode !== 200) {
      throw new Error(`API error: ${response.statusCode} - ${response.body}`);
    }

    return JSON.parse(response.body) as ChatResponse;
  }
}
```

### Multi-Provider Pattern
```typescript
export interface AIProvider {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest, onChunk: (chunk: string) => void): Promise<void>;
}

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: HTTPClient;
  private apiKey: string;

  constructor(apiKey: string) {
    this.client = new HTTPClient();
    this.apiKey = apiKey;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Implementation
  }

  async streamChat(request: ChatRequest, onChunk: (chunk: string) => void): Promise<void> {
    // Streaming implementation
  }
}

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: HTTPClient;
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    this.client = new HTTPClient();
    this.apiKey = apiKey;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Convert to Anthropic format
    const body = JSON.stringify({
      model: request.model,
      messages: request.messages,
      max_tokens: request.maxTokens ?? 1024,
    });

    const response = await this.client.post(
      `${this.baseUrl}/messages`,
      body,
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    // Parse and convert to standard format
    const data = JSON.parse(response.body);
    return this.convertToStandardFormat(data);
  }

  private convertToStandardFormat(anthropicResponse: any): ChatResponse {
    return {
      id: anthropicResponse.id,
      choices: [{
        message: {
          role: 'assistant',
          content: anthropicResponse.content[0].text,
        },
        finish_reason: anthropicResponse.stop_reason,
      }],
      usage: {
        prompt_tokens: anthropicResponse.usage.input_tokens,
        completion_tokens: anthropicResponse.usage.output_tokens,
        total_tokens: anthropicResponse.usage.input_tokens + anthropicResponse.usage.output_tokens,
      },
    };
  }

  async streamChat(request: ChatRequest, onChunk: (chunk: string) => void): Promise<void> {
    // Streaming implementation
  }
}
```

### Provider Factory Pattern
```typescript
export type ProviderType = 'openai' | 'anthropic' | 'google';

export interface ProviderConfig {
  type: ProviderType;
  apiKey: string;
  baseUrl?: string;
}

export class AIProviderFactory {
  static create(config: ProviderConfig): AIProvider {
    switch (config.type) {
      case 'openai':
        return new OpenAIProvider(config.apiKey);
      case 'anthropic':
        return new AnthropicProvider(config.apiKey);
      case 'google':
        return new GoogleProvider(config.apiKey);
      default:
        throw new Error(`Unknown provider: ${config.type}`);
    }
  }
}

// Usage
const provider = AIProviderFactory.create({
  type: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await provider.chat({
  model: 'gpt-4-turbo',
  messages: conversationMessages,
});
```

## Streaming Pattern

### Server-Sent Events (SSE)
```typescript
export interface StreamChunk {
  type: 'start' | 'chunk' | 'complete' | 'error';
  content?: string;
  error?: string;
}

export class StreamingChatService {
  private client: HTTPClient;

  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const body = JSON.stringify({
      ...request,
      stream: true,
    });

    onChunk({ type: 'start' });

    try {
      // Note: Streaming implementation depends on valdi_http capabilities
      // This is a conceptual example
      const response = await this.client.post(
        `${this.baseUrl}/chat/completions`,
        body,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          stream: true, // If supported by valdi_http
        }
      );

      // Parse SSE stream
      const lines = response.body.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onChunk({ type: 'complete' });
            break;
          }

          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            onChunk({ type: 'chunk', content });
          }
        }
      }
    } catch (error) {
      onChunk({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
```

### Integration with MessageStore
```typescript
export class ChatService {
  private provider: AIProvider;
  private messageStore: MessageStore;

  async sendMessage(
    conversationId: string,
    userMessage: string
  ): Promise<void> {
    // Add user message
    const userMsg: Message = {
      id: generateId(),
      conversationId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    await this.messageStore.addMessage(userMsg);

    // Get conversation history
    const messages = this.messageStore.getMessages(conversationId);
    const apiMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      // Call AI API
      const response = await this.provider.chat({
        model: 'gpt-4-turbo',
        messages: apiMessages,
      });

      // Add assistant message
      const assistantMsg: Message = {
        id: response.id,
        conversationId,
        role: 'assistant',
        content: response.choices[0].message.content,
        timestamp: Date.now(),
        usage: response.usage,
      };
      await this.messageStore.addMessage(assistantMsg);
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async sendMessageStreaming(
    conversationId: string,
    userMessage: string
  ): Promise<void> {
    // Add user message
    const userMsg: Message = {
      id: generateId(),
      conversationId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    await this.messageStore.addMessage(userMsg);

    // Get conversation history
    const messages = this.messageStore.getMessages(conversationId);
    const apiMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Create assistant message placeholder
    const assistantMsg: Message = {
      id: generateId(),
      conversationId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    await this.messageStore.addMessage(assistantMsg);

    // Stream response
    let fullContent = '';
    await this.provider.streamChat(
      {
        model: 'gpt-4-turbo',
        messages: apiMessages,
      },
      (chunk) => {
        if (chunk.type === 'chunk' && chunk.content) {
          fullContent += chunk.content;
          // Update message in store
          assistantMsg.content = fullContent;
          this.messageStore.updateMessage(assistantMsg);
        } else if (chunk.type === 'error') {
          console.error('Streaming error:', chunk.error);
        }
      }
    );
  }
}
```

## Error Handling Pattern
```typescript
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public response: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ChatService {
  private async makeRequest(url: string, body: string): Promise<any> {
    try {
      const response = await this.client.post(url, body, {
        headers: this.getHeaders(),
      });

      if (response.statusCode === 401) {
        throw new APIError(401, response.body, 'Invalid API key');
      }

      if (response.statusCode === 429) {
        throw new APIError(429, response.body, 'Rate limit exceeded');
      }

      if (response.statusCode >= 400) {
        throw new APIError(
          response.statusCode,
          response.body,
          `API error: ${response.statusCode}`
        );
      }

      return JSON.parse(response.body);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new Error(`Network error: ${error}`);
    }
  }
}
```

## Testing Pattern
```typescript
// __tests__/ChatService.test.ts
import { ChatService } from '../ChatService';
import { MessageStore } from '../MessageStore';

// Mock valdi_http
jest.mock('valdi_http/src/HTTPClient');

describe('ChatService', () => {
  let chatService: ChatService;
  let messageStore: MessageStore;
  let mockHttpClient: any;

  beforeEach(() => {
    messageStore = new MessageStore();
    mockHttpClient = {
      post: jest.fn(),
    };
    chatService = new ChatService('test-api-key', messageStore);
    (chatService as any).client = mockHttpClient;
  });

  it('should send message and store response', async () => {
    const mockResponse = {
      statusCode: 200,
      body: JSON.stringify({
        id: 'msg_123',
        choices: [{
          message: { role: 'assistant', content: 'Hello!' },
          finish_reason: 'stop',
        }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    };

    mockHttpClient.post.mockResolvedValue(mockResponse);

    await chatService.sendMessage('conv_1', 'Hi there');

    const messages = messageStore.getMessages('conv_1');
    expect(messages).toHaveLength(2); // user + assistant
    expect(messages[1].content).toBe('Hello!');
  });
});
```

## Key Principles
1. **No AI SDK** - Use valdi_http directly
2. **Provider abstraction** - Support multiple AI providers
3. **Error handling** - Handle rate limits, auth errors, network errors
4. **Type safety** - Define request/response interfaces
5. **Streaming support** - Implement SSE parsing if needed
6. **Store integration** - Connect with MessageStore for state management
7. **Testing** - Mock HTTP client for unit tests
