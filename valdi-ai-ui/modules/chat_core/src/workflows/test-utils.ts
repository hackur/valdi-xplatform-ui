/**
 * Workflow Test Utilities
 *
 * Helper functions and mocks for testing agent workflows
 */

import { ChatService } from '../ChatService';
import { MessageStore } from '../MessageStore';
import { Message, MessageUtils } from 'common/types';
import {
  WorkflowExecutionOptions,
  WorkflowProgressEvent,
  AgentDefinition,
} from './index';

/**
 * Mock Chat Service for Testing
 */
export class MockChatService {
  private responses: Map<string, string> = new Map();

  /**
   * Set a mock response for a specific agent
   */
  setMockResponse(agentId: string, response: string): void {
    this.responses.set(agentId, response);
  }

  /**
   * Mock implementation of sendMessageStreaming
   */
  async sendMessageStreaming(
    options: any,
    callback: (event: any) => void,
  ): Promise<Message> {
    const agentId = this.extractAgentIdFromPrompt(options.systemPrompt || '');
    const response = this.responses.get(agentId) || 'Mock response';

    // Simulate streaming
    const chunks = response.split(' ');
    let fullContent = '';

    const messageId = MessageUtils.generateId();

    // Start event
    callback({ type: 'start', messageId });

    // Stream chunks
    for (const chunk of chunks) {
      fullContent += chunk + ' ';
      await this.delay(10); // Simulate network delay

      callback({
        type: 'chunk',
        messageId,
        content: fullContent,
        delta: chunk + ' ',
      });
    }

    // Complete event
    const message = MessageUtils.createAssistantMessageStub(
      options.conversationId,
    );
    message.content = fullContent.trim();
    message.status = 'completed';

    callback({ type: 'complete', messageId, message });

    return message;
  }

  /**
   * Mock implementation of sendMessage
   */
  async sendMessage(options: any): Promise<any> {
    const agentId = this.extractAgentIdFromPrompt(options.systemPrompt || '');
    const response = this.responses.get(agentId) || 'Mock response';

    const message = MessageUtils.createAssistantMessageStub(
      options.conversationId,
    );
    message.content = response;
    message.status = 'completed';

    return {
      message,
      finishReason: 'stop',
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
    };
  }

  private extractAgentIdFromPrompt(prompt: string): string {
    // Try to extract agent identifier from system prompt
    const match = prompt.match(/You are (?:a |an )?([a-zA-Z\s]+)/i);
    return match ? match[1].toLowerCase().replace(/\s+/g, '-') : 'default';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create a test agent definition
 */
export function createTestAgent(
  id: string,
  name: string,
  role: string = 'test',
): AgentDefinition {
  return {
    id,
    name,
    role,
    systemPrompt: `You are ${name}. You are a test agent for ${role}.`,
  };
}

/**
 * Progress Event Collector
 *
 * Collects all progress events for testing
 */
export class ProgressEventCollector {
  private events: WorkflowProgressEvent[] = [];

  /**
   * Get callback function to pass to workflow
   */
  getCallback() {
    return (event: WorkflowProgressEvent) => {
      this.events.push(event);
    };
  }

  /**
   * Get all collected events
   */
  getEvents(): WorkflowProgressEvent[] {
    return [...this.events];
  }

  /**
   * Get events of specific type
   */
  getEventsByType<T extends WorkflowProgressEvent['type']>(
    type: T,
  ): Extract<WorkflowProgressEvent, { type: T }>[] {
    return this.events.filter((e) => e.type === type) as any[];
  }

  /**
   * Get count of events by type
   */
  getEventCount(type: WorkflowProgressEvent['type']): number {
    return this.events.filter((e) => e.type === type).length;
  }

  /**
   * Check if event type occurred
   */
  hasEvent(type: WorkflowProgressEvent['type']): boolean {
    return this.events.some((e) => e.type === type);
  }

  /**
   * Reset collected events
   */
  reset(): void {
    this.events = [];
  }

  /**
   * Wait for specific event
   */
  async waitForEvent(
    type: WorkflowProgressEvent['type'],
    timeout: number = 5000,
  ): Promise<WorkflowProgressEvent> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const event = this.events.find((e) => e.type === type);
      if (event) return event;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Event ${type} did not occur within ${timeout}ms`);
  }
}

/**
 * Mock Workflow Execution Options
 */
export function createMockExecutionOptions(
  input: string,
  conversationId: string = 'test-conv',
): WorkflowExecutionOptions {
  return {
    conversationId,
    input,
    context: {},
  };
}

/**
 * Assertion Helpers
 */
export const WorkflowAssertions = {
  /**
   * Assert workflow completed successfully
   */
  assertCompleted(events: WorkflowProgressEvent[]): void {
    const completeEvent = events.find((e) => e.type === 'workflow-complete');
    if (!completeEvent) {
      throw new Error('Workflow did not complete successfully');
    }
  },

  /**
   * Assert workflow had error
   */
  assertError(events: WorkflowProgressEvent[]): void {
    const errorEvent = events.find((e) => e.type === 'workflow-error');
    if (!errorEvent) {
      throw new Error('Workflow did not have expected error');
    }
  },

  /**
   * Assert specific number of steps
   */
  assertStepCount(events: WorkflowProgressEvent[], expected: number): void {
    const stepEvents = events.filter((e) => e.type === 'step-complete');
    if (stepEvents.length !== expected) {
      throw new Error(
        `Expected ${expected} steps, but got ${stepEvents.length}`,
      );
    }
  },

  /**
   * Assert step executed in order
   */
  assertStepOrder(events: WorkflowProgressEvent[], agentIds: string[]): void {
    const stepEvents = events.filter(
      (e) => e.type === 'step-complete',
    ) as Extract<WorkflowProgressEvent, { type: 'step-complete' }>[];

    const actualOrder = stepEvents.map((e) => e.step.agentId);

    if (JSON.stringify(actualOrder) !== JSON.stringify(agentIds)) {
      throw new Error(
        `Expected step order ${agentIds.join(', ')}, but got ${actualOrder.join(', ')}`,
      );
    }
  },
};

/**
 * Performance Metrics
 */
export class WorkflowMetrics {
  private startTime?: number;
  private endTime?: number;
  private stepTimes: Map<string, { start: number; end?: number }> = new Map();

  /**
   * Start tracking metrics
   */
  start(): void {
    this.startTime = Date.now();
  }

  /**
   * End tracking metrics
   */
  end(): void {
    this.endTime = Date.now();
  }

  /**
   * Track step start
   */
  stepStart(stepId: string): void {
    this.stepTimes.set(stepId, { start: Date.now() });
  }

  /**
   * Track step end
   */
  stepEnd(stepId: string): void {
    const step = this.stepTimes.get(stepId);
    if (step) {
      step.end = Date.now();
    }
  }

  /**
   * Get total execution time
   */
  getTotalTime(): number {
    if (!this.startTime || !this.endTime) {
      throw new Error('Metrics not properly tracked');
    }
    return this.endTime - this.startTime;
  }

  /**
   * Get step execution time
   */
  getStepTime(stepId: string): number {
    const step = this.stepTimes.get(stepId);
    if (!step || !step.end) {
      throw new Error(`Step ${stepId} not completed`);
    }
    return step.end - step.start;
  }

  /**
   * Get average step time
   */
  getAverageStepTime(): number {
    const times = Array.from(this.stepTimes.values())
      .filter((s) => s.end)
      .map((s) => s.end! - s.start);

    if (times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    totalTime: number;
    stepCount: number;
    averageStepTime: number;
    stepTimes: Record<string, number>;
  } {
    const stepTimes: Record<string, number> = {};

    this.stepTimes.forEach((value, key) => {
      if (value.end) {
        stepTimes[key] = value.end - value.start;
      }
    });

    return {
      totalTime: this.getTotalTime(),
      stepCount: this.stepTimes.size,
      averageStepTime: this.getAverageStepTime(),
      stepTimes,
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.startTime = undefined;
    this.endTime = undefined;
    this.stepTimes.clear();
  }
}

/**
 * Create metrics callback for workflow
 */
export function createMetricsCallback(metrics: WorkflowMetrics) {
  return (event: WorkflowProgressEvent) => {
    switch (event.type) {
      case 'workflow-start':
        metrics.start();
        break;
      case 'workflow-complete':
      case 'workflow-error':
        metrics.end();
        break;
      case 'step-start':
        metrics.stepStart(event.step.id);
        break;
      case 'step-complete':
        metrics.stepEnd(event.step.id);
        break;
    }
  };
}

/**
 * Test Data Generators
 */
export const TestDataGenerators = {
  /**
   * Generate test input
   */
  generateInput(length: number = 100): string {
    const words = [
      'test',
      'workflow',
      'agent',
      'example',
      'data',
      'process',
      'analyze',
      'generate',
    ];
    const result: string[] = [];

    while (result.join(' ').length < length) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }

    return result.join(' ').substring(0, length);
  },

  /**
   * Generate mock response
   */
  generateMockResponse(agentName: string, requestType: string): string {
    return `This is a mock response from ${agentName} for ${requestType} request.`;
  },
};

/**
 * Example Test Suite Structure
 */
export class WorkflowTestSuite {
  private chatService: MockChatService;
  private messageStore: MessageStore;

  constructor() {
    this.chatService = new MockChatService();
    this.messageStore = new MessageStore();
  }

  /**
   * Setup test environment
   */
  setup(): void {
    this.messageStore.reset();
  }

  /**
   * Teardown test environment
   */
  teardown(): void {
    this.messageStore.reset();
  }

  /**
   * Get chat service
   */
  getChatService(): ChatService {
    return this.chatService as any;
  }

  /**
   * Get message store
   */
  getMessageStore(): MessageStore {
    return this.messageStore;
  }

  /**
   * Configure mock responses
   */
  configureMocks(responses: Record<string, string>): void {
    Object.entries(responses).forEach(([agentId, response]) => {
      this.chatService.setMockResponse(agentId, response);
    });
  }
}

/**
 * Example Usage in Tests
 */
export async function exampleTestUsage() {
  // Setup
  const suite = new WorkflowTestSuite();
  suite.setup();

  // Configure mocks
  suite.configureMocks({
    researcher: 'Research findings: AI is transforming healthcare...',
    analyst: 'Analysis: Key trends include telemedicine and diagnostics...',
    summarizer: 'Summary: AI in healthcare shows promising results...',
  });

  // Collect events
  const collector = new ProgressEventCollector();

  // Track metrics
  const metrics = new WorkflowMetrics();

  // Execute workflow (example - you would create actual workflow here)
  // const workflow = createWorkflow(suite.getChatService(), suite.getMessageStore());
  // const result = await workflow.execute({
  //   conversationId: 'test-conv',
  //   input: 'Analyze AI in healthcare',
  //   onProgress: (event) => {
  //     collector.getCallback()(event);
  //     createMetricsCallback(metrics)(event);
  //   },
  // });

  // Assertions
  // WorkflowAssertions.assertCompleted(collector.getEvents());
  // WorkflowAssertions.assertStepCount(collector.getEvents(), 3);

  // Metrics
  // console.log('Metrics:', metrics.getSummary());

  // Teardown
  suite.teardown();
}
