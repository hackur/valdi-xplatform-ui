/**
 * ToolExecutor
 *
 * Handles execution of tool calls from AI responses.
 * Provides error handling, result formatting, and async execution support.
 */

import { Tool } from 'ai';

/**
 * Tool Call Input
 *
 * Represents a tool call request from the AI
 */
export interface ToolCallInput {
  /** Unique identifier for this tool call */
  toolCallId: string;

  /** Name of the tool to execute */
  toolName: string;

  /** Arguments/parameters for the tool */
  args: Record<string, unknown>;
}

/**
 * Tool Call Result
 *
 * Result of a tool execution
 */
export interface ToolCallResult {
  /** Unique identifier matching the input */
  toolCallId: string;

  /** Name of the tool that was executed */
  toolName: string;

  /** Whether execution was successful */
  success: boolean;

  /** Result data from the tool (if successful) */
  result?: unknown;

  /** Error message (if failed) */
  error?: string;

  /** Execution time in milliseconds */
  executionTime: number;

  /** Timestamp when the tool was executed */
  timestamp: string;
}

/**
 * Tool Executor Class
 *
 * Executes tool calls and handles errors gracefully
 */
export class ToolExecutor {
  private tools: Record<string, Tool>;

  /**
   * Constructor
   *
   * @param tools - Available tools mapped by name
   */
  constructor(tools: Record<string, Tool>) {
    this.tools = tools;
  }

  /**
   * Execute a single tool call
   *
   * @param toolCall - Tool call to execute
   * @returns Tool call result
   */
  async executeToolCall(toolCall: ToolCallInput): Promise<ToolCallResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // Validate tool exists
      const tool = this.tools[toolCall.toolName];

      if (!tool) {
        return {
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          success: false,
          error: `Tool '${toolCall.toolName}' not found. Available tools: ${Object.keys(this.tools).join(', ')}`,
          executionTime: Date.now() - startTime,
          timestamp,
        };
      }

      // Check if execute function exists
      if (!tool.execute) {
        return {
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          success: false,
          error: `Tool '${toolCall.toolName}' has no execute function`,
          executionTime: Date.now() - startTime,
          timestamp,
        };
      }

      // Execute the tool
      // Note: AI SDK v5 tool.execute() requires args and options parameters
      const result = await tool.execute(toolCall.args, {
        messages: [],
        toolCallId: toolCall.toolCallId,
      } as any);

      return {
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        success: true,
        result,
        executionTime: Date.now() - startTime,
        timestamp,
      };
    } catch (error) {
      // Handle execution errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error during tool execution';

      return {
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
        timestamp,
      };
    }
  }

  /**
   * Execute multiple tool calls in parallel
   *
   * @param toolCalls - Array of tool calls to execute
   * @returns Array of tool call results
   */
  async executeToolCalls(
    toolCalls: ToolCallInput[],
  ): Promise<ToolCallResult[]> {
    if (toolCalls.length === 0) {
      return [];
    }

    // Execute all tool calls in parallel
    const resultPromises = toolCalls.map((toolCall) =>
      this.executeToolCall(toolCall),
    );

    return Promise.all(resultPromises);
  }

  /**
   * Execute multiple tool calls sequentially
   *
   * Useful when tool calls depend on each other's results
   *
   * @param toolCalls - Array of tool calls to execute
   * @returns Array of tool call results
   */
  async executeToolCallsSequentially(
    toolCalls: ToolCallInput[],
  ): Promise<ToolCallResult[]> {
    const results: ToolCallResult[] = [];

    for (const toolCall of toolCalls) {
      const result = await this.executeToolCall(toolCall);
      results.push(result);

      // Stop execution if a critical error occurs
      if (!result.success && this.isCriticalError(result.error)) {
        break;
      }
    }

    return results;
  }

  /**
   * Update available tools
   *
   * @param tools - New tools to use
   */
  updateTools(tools: Record<string, Tool>): void {
    this.tools = tools;
  }

  /**
   * Add a tool
   *
   * @param name - Tool name
   * @param tool - Tool implementation
   */
  addTool(name: string, tool: Tool): void {
    this.tools[name] = tool;
  }

  /**
   * Remove a tool
   *
   * @param name - Tool name to remove
   */
  removeTool(name: string): void {
    delete this.tools[name];
  }

  /**
   * Get available tool names
   *
   * @returns Array of available tool names
   */
  getAvailableToolNames(): string[] {
    return Object.keys(this.tools);
  }

  /**
   * Check if a tool is available
   *
   * @param name - Tool name
   * @returns True if tool exists
   */
  hasToolAvailable(name: string): boolean {
    return name in this.tools;
  }

  /**
   * Format tool result for display
   *
   * @param result - Tool call result
   * @returns Formatted string
   */
  formatToolResult(result: ToolCallResult): string {
    if (result.success) {
      return `Tool '${result.toolName}' executed successfully in ${result.executionTime}ms.\nResult: ${JSON.stringify(result.result, null, 2)}`;
    } else {
      return `Tool '${result.toolName}' failed after ${result.executionTime}ms.\nError: ${result.error}`;
    }
  }

  /**
   * Format multiple tool results for display
   *
   * @param results - Array of tool call results
   * @returns Formatted string
   */
  formatToolResults(results: ToolCallResult[]): string {
    if (results.length === 0) {
      return 'No tool calls were executed.';
    }

    const formattedResults = results.map((result, index) => {
      return `[${index + 1}/${results.length}] ${this.formatToolResult(result)}`;
    });

    return formattedResults.join('\n\n');
  }

  /**
   * Check if an error is critical and should stop execution
   *
   * @param error - Error message
   * @returns True if error is critical
   */
  private isCriticalError(error?: string): boolean {
    if (!error) return false;

    // Define critical error patterns
    const criticalPatterns = [
      /authentication failed/i,
      /authorization denied/i,
      /rate limit exceeded/i,
      /service unavailable/i,
      /internal server error/i,
    ];

    return criticalPatterns.some((pattern) => pattern.test(error));
  }
}

/**
 * Create a tool executor instance
 *
 * @param tools - Available tools
 * @returns ToolExecutor instance
 */
export function createToolExecutor(
  tools: Record<string, Tool>,
): ToolExecutor {
  return new ToolExecutor(tools);
}
