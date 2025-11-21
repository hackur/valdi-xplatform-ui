/**
 * ToolDefinitions
 *
 * Defines example tools using Zod schemas for AI SDK v5.
 * Tools are AI SDK compatible and can be passed directly to streamText() or generateText().
 */

import { tool } from 'ai';
import { z } from 'zod';

/**
 * Weather Tool
 *
 * Mock weather API that returns simulated weather data for any location.
 */
export const getWeather = tool({
  description: 'Get current weather information for a specific location. Returns temperature, conditions, and forecast.',
  parameters: z.object({
    location: z.string().describe('City name or location (e.g., "San Francisco", "New York, NY")'),
  }),
  execute: async ({ location }) => {
    // Mock weather data - in production, this would call a real weather API
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Stormy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 40) + 50; // 50-90°F

    const weatherData = {
      location,
      temperature: randomTemp,
      unit: 'fahrenheit',
      condition: randomCondition,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 mph
      forecast: {
        today: randomCondition,
        tomorrow: conditions[Math.floor(Math.random() * conditions.length)],
      },
    };

    return {
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString(),
    };
  },
});

/**
 * Calculator Tool
 *
 * Evaluates mathematical expressions safely.
 * Supports basic arithmetic operations: +, -, *, /, (), and decimal numbers.
 */
export const calculateExpression = tool({
  description: 'Calculate the result of a mathematical expression. Supports basic arithmetic: addition (+), subtraction (-), multiplication (*), division (/), and parentheses.',
  parameters: z.object({
    expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 2", "(10 * 5) - 3")'),
  }),
  execute: async ({ expression }) => {
    try {
      // Sanitize expression - only allow numbers, operators, spaces, and parentheses
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

      if (sanitized !== expression) {
        return {
          success: false,
          error: 'Invalid characters in expression. Only numbers, +, -, *, /, (), and . are allowed.',
        };
      }

      // Evaluate using Function constructor (safer than eval for this controlled case)
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${sanitized}`)();

      if (!isFinite(result)) {
        return {
          success: false,
          error: 'Result is not a finite number. Check for division by zero or overflow.',
        };
      }

      return {
        success: true,
        expression,
        result,
        formattedResult: typeof result === 'number' ? result.toFixed(2) : result.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to evaluate expression',
        expression,
      };
    }
  },
});

/**
 * Web Search Tool
 *
 * Mock web search that returns simulated search results.
 */
export const searchWeb = tool({
  description: 'Search the web for information on a specific topic or query. Returns relevant search results with titles, URLs, and snippets.',
  parameters: z.object({
    query: z.string().describe('Search query or keywords to search for'),
  }),
  execute: async ({ query }) => {
    // Mock search results - in production, this would call a real search API
    const mockResults = [
      {
        title: `Understanding ${query} - Comprehensive Guide`,
        url: `https://example.com/guide/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `A comprehensive guide to ${query}. Learn everything you need to know about this topic, including best practices and expert insights.`,
        relevance: 0.95,
      },
      {
        title: `${query} - Wikipedia`,
        url: `https://wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
        snippet: `${query} refers to... This article covers the history, development, and current state of ${query}.`,
        relevance: 0.88,
      },
      {
        title: `Latest News about ${query}`,
        url: `https://news.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Stay up to date with the latest news and developments about ${query}. Recent updates and trending discussions.`,
        relevance: 0.82,
      },
    ];

    return {
      success: true,
      query,
      resultsCount: mockResults.length,
      results: mockResults,
      timestamp: new Date().toISOString(),
      searchTime: Math.random() * 0.5 + 0.1, // Mock search time: 0.1-0.6 seconds
    };
  },
});

/**
 * All available tools
 *
 * Export as a record for easy integration with ChatService
 */
export const availableTools = {
  getWeather,
  calculateExpression,
  searchWeb,
};

/**
 * Tool names type
 */
export type ToolName = keyof typeof availableTools;

/**
 * Helper to get tools by name
 */
export function getToolsByName(toolNames: ToolName[]) {
  const tools: Record<string, typeof availableTools[ToolName]> = {};

  for (const name of toolNames) {
    if (name in availableTools) {
      tools[name] = availableTools[name];
    }
  }

  return tools;
}

/**
 * Get all tools
 */
export function getAllTools() {
  return availableTools;
}
