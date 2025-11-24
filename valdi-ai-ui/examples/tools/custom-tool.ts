/**
 * Custom Tool Creation Example
 *
 * This example demonstrates how to create custom tools for AI agents using
 * Zod schemas and the AI SDK v5 tool() function.
 *
 * Custom tools extend agent capabilities by providing:
 * - External API integrations
 * - Database operations
 * - File system access
 * - Calculations and data processing
 * - Any custom business logic
 */

import { tool } from 'ai';
import { z } from 'zod';

/**
 * Example 1: Database Query Tool
 *
 * A tool that simulates querying a user database.
 * In production, this would connect to a real database.
 */
export const queryUserDatabase = tool({
  description:
    'Query the user database to find user information by ID, email, or other criteria. Returns user details including name, email, registration date, and account status.',
  parameters: z.object({
    searchType: z
      .enum(['id', 'email', 'username'])
      .describe('The type of search to perform'),
    searchValue: z
      .string()
      .describe('The value to search for (e.g., user ID, email address, username)'),
    includeMetadata: z
      .boolean()
      .optional()
      .describe('Whether to include additional metadata like login history'),
  }),
  execute: async ({ searchType, searchValue, includeMetadata }) => {
    try {
      // Simulate database query delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Mock database data
      const mockUsers = {
        '12345': {
          id: '12345',
          username: 'john_doe',
          email: 'john@example.com',
          name: 'John Doe',
          registeredAt: '2024-01-15T10:30:00Z',
          status: 'active',
          role: 'user',
        },
        'jane@example.com': {
          id: '67890',
          username: 'jane_smith',
          email: 'jane@example.com',
          name: 'Jane Smith',
          registeredAt: '2024-02-20T14:20:00Z',
          status: 'active',
          role: 'admin',
        },
      };

      // Perform lookup
      let user = null;
      if (searchType === 'id' || searchType === 'email') {
        user = mockUsers[searchValue as keyof typeof mockUsers];
      } else if (searchType === 'username') {
        user = Object.values(mockUsers).find((u) => u.username === searchValue);
      }

      if (!user) {
        return {
          success: false,
          error: `User not found with ${searchType}: ${searchValue}`,
        };
      }

      const result: Record<string, unknown> = {
        success: true,
        user,
      };

      // Add metadata if requested
      if (includeMetadata) {
        result.metadata = {
          lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          loginCount: Math.floor(Math.random() * 100) + 50,
          lastIpAddress: '192.168.1.100',
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Database query failed',
      };
    }
  },
});

/**
 * Example 2: External API Integration Tool
 *
 * A tool that fetches data from an external API.
 * This example shows how to integrate with REST APIs.
 */
export const fetchGitHubRepository = tool({
  description:
    'Fetch information about a GitHub repository including stars, forks, issues, and recent activity. Useful for researching open source projects.',
  parameters: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    includeContributors: z
      .boolean()
      .optional()
      .describe('Whether to include top contributors list'),
  }),
  execute: async ({ owner, repo, includeContributors }) => {
    try {
      // In production, this would make actual API calls
      // For demo, we return mock data
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockRepoData = {
        success: true,
        repository: {
          fullName: `${owner}/${repo}`,
          description: 'A comprehensive AI workflow orchestration platform',
          stars: 1247,
          forks: 186,
          openIssues: 23,
          language: 'TypeScript',
          license: 'MIT',
          createdAt: '2023-06-10T08:00:00Z',
          updatedAt: new Date().toISOString(),
          topics: ['ai', 'workflow', 'agents', 'typescript'],
        },
        activity: {
          lastCommit: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          commitsLastMonth: 87,
          pullRequestsOpen: 5,
          pullRequestsMerged: 42,
        },
      };

      if (includeContributors) {
        mockRepoData['contributors'] = [
          { username: 'contributor1', contributions: 342 },
          { username: 'contributor2', contributions: 156 },
          { username: 'contributor3', contributions: 89 },
        ];
      }

      return mockRepoData;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch repository',
      };
    }
  },
});

/**
 * Example 3: Data Processing Tool
 *
 * A tool that performs complex data transformations and analysis.
 */
export const analyzeTextMetrics = tool({
  description:
    'Analyze text to provide detailed metrics including word count, sentence count, reading time, complexity score, and sentiment indicators.',
  parameters: z.object({
    text: z.string().describe('The text to analyze'),
    includeKeywords: z
      .boolean()
      .optional()
      .describe('Whether to extract top keywords'),
  }),
  execute: async ({ text, includeKeywords }) => {
    try {
      // Basic metrics
      const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;

      // Reading time (average 200 words per minute)
      const readingTimeMinutes = Math.ceil(words.length / 200);

      // Complexity score (based on average word length and sentence length)
      const avgWordLength =
        words.reduce((sum, word) => sum + word.length, 0) / words.length;
      const avgSentenceLength = words.length / sentences.length;
      const complexityScore = Math.min(
        100,
        Math.round((avgWordLength * 5 + avgSentenceLength) * 2),
      );

      // Basic sentiment (simplified)
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
      const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'horrible'];
      const lowerText = text.toLowerCase();

      const positiveCount = positiveWords.filter((word) =>
        lowerText.includes(word),
      ).length;
      const negativeCount = negativeWords.filter((word) =>
        lowerText.includes(word),
      ).length;

      let sentiment = 'neutral';
      if (positiveCount > negativeCount) sentiment = 'positive';
      if (negativeCount > positiveCount) sentiment = 'negative';

      const result: Record<string, unknown> = {
        success: true,
        metrics: {
          wordCount: words.length,
          sentenceCount: sentences.length,
          characterCount: characters,
          characterCountNoSpaces: charactersNoSpaces,
          paragraphCount: text.split(/\n\n+/).length,
          avgWordLength: Math.round(avgWordLength * 10) / 10,
          avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
          readingTimeMinutes,
          complexityScore,
          sentiment,
        },
      };

      // Extract keywords if requested
      if (includeKeywords) {
        const wordFrequency: Record<string, number> = {};
        const stopWords = new Set([
          'the',
          'a',
          'an',
          'and',
          'or',
          'but',
          'in',
          'on',
          'at',
          'to',
          'for',
        ]);

        words
          .map((w) => w.toLowerCase().replace(/[^a-z]/g, ''))
          .filter((w) => w.length > 3 && !stopWords.has(w))
          .forEach((w) => {
            wordFrequency[w] = (wordFrequency[w] || 0) + 1;
          });

        const topKeywords = Object.entries(wordFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word, count]) => ({ word, count }));

        result.keywords = topKeywords;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  },
});

/**
 * Example 4: File System Tool
 *
 * A tool that interacts with the file system (simulated).
 */
export const readProjectFile = tool({
  description:
    'Read a file from the project directory. Useful for analyzing code, configuration files, or documentation.',
  parameters: z.object({
    filePath: z
      .string()
      .describe('Path to the file relative to project root'),
    encoding: z
      .enum(['utf8', 'base64', 'hex'])
      .optional()
      .describe('File encoding (default: utf8)'),
  }),
  execute: async ({ filePath, encoding = 'utf8' }) => {
    try {
      // In production, use fs.readFile or similar
      // For demo, return mock content
      await new Promise((resolve) => setTimeout(resolve, 100));

      const mockFiles: Record<string, string> = {
        'package.json': JSON.stringify(
          {
            name: 'valdi-ai-ui',
            version: '1.0.0',
            description: 'AI Workflow UI Platform',
          },
          null,
          2,
        ),
        'README.md': '# Valdi AI UI\n\nA comprehensive AI workflow platform...',
        '.env.example': 'OPENAI_API_KEY=your_key_here\nANTHROPIC_API_KEY=your_key_here',
      };

      const content = mockFiles[filePath];

      if (!content) {
        return {
          success: false,
          error: `File not found: ${filePath}`,
        };
      }

      return {
        success: true,
        filePath,
        encoding,
        content,
        size: content.length,
        lines: content.split('\n').length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read file',
      };
    }
  },
});

/**
 * Example 5: Calculation Tool with Validation
 *
 * A tool with complex validation and error handling.
 */
export const calculateBusinessMetrics = tool({
  description:
    'Calculate important business metrics like ROI, customer lifetime value, churn rate, and growth rate based on input data.',
  parameters: z.object({
    metricType: z
      .enum(['roi', 'ltv', 'churn', 'growth'])
      .describe('Type of metric to calculate'),
    data: z
      .object({
        revenue: z.number().positive().optional(),
        cost: z.number().positive().optional(),
        customers: z.number().int().positive().optional(),
        churned: z.number().int().nonnegative().optional(),
        previousPeriod: z.number().positive().optional(),
        currentPeriod: z.number().positive().optional(),
        avgPurchaseValue: z.number().positive().optional(),
        purchaseFrequency: z.number().positive().optional(),
        customerLifespan: z.number().positive().optional(),
      })
      .describe('Input data for the calculation'),
  }),
  execute: async ({ metricType, data }) => {
    try {
      let result: number;
      let formula: string;
      let interpretation: string;

      switch (metricType) {
        case 'roi':
          if (!data.revenue || !data.cost) {
            return {
              success: false,
              error: 'ROI calculation requires revenue and cost',
            };
          }
          result = ((data.revenue - data.cost) / data.cost) * 100;
          formula = '((Revenue - Cost) / Cost) × 100';
          interpretation =
            result > 0
              ? `Positive ROI of ${result.toFixed(2)}% indicates profitable investment`
              : `Negative ROI of ${result.toFixed(2)}% indicates loss`;
          break;

        case 'ltv':
          if (
            !data.avgPurchaseValue ||
            !data.purchaseFrequency ||
            !data.customerLifespan
          ) {
            return {
              success: false,
              error:
                'LTV calculation requires avgPurchaseValue, purchaseFrequency, and customerLifespan',
            };
          }
          result =
            data.avgPurchaseValue * data.purchaseFrequency * data.customerLifespan;
          formula = 'Avg Purchase Value × Purchase Frequency × Customer Lifespan';
          interpretation = `Expected lifetime value of $${result.toFixed(2)} per customer`;
          break;

        case 'churn':
          if (!data.customers || data.churned === undefined) {
            return {
              success: false,
              error: 'Churn calculation requires customers and churned count',
            };
          }
          result = (data.churned / data.customers) * 100;
          formula = '(Churned Customers / Total Customers) × 100';
          interpretation =
            result < 5
              ? 'Excellent retention'
              : result < 10
                ? 'Good retention'
                : 'High churn - investigate causes';
          break;

        case 'growth':
          if (!data.previousPeriod || !data.currentPeriod) {
            return {
              success: false,
              error: 'Growth calculation requires previousPeriod and currentPeriod',
            };
          }
          result =
            ((data.currentPeriod - data.previousPeriod) / data.previousPeriod) *
            100;
          formula = '((Current - Previous) / Previous) × 100';
          interpretation =
            result > 0
              ? `Growing at ${result.toFixed(2)}% period-over-period`
              : `Declining at ${Math.abs(result).toFixed(2)}% period-over-period`;
          break;

        default:
          return {
            success: false,
            error: `Unknown metric type: ${metricType}`,
          };
      }

      return {
        success: true,
        metricType,
        result: Math.round(result * 100) / 100,
        formula,
        interpretation,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
      };
    }
  },
});

/**
 * Export all custom tools
 */
export const customTools = {
  queryUserDatabase,
  fetchGitHubRepository,
  analyzeTextMetrics,
  readProjectFile,
  calculateBusinessMetrics,
};

/**
 * Integration Example
 *
 * Shows how to use custom tools with an agent
 */
export const exampleAgentWithCustomTools = {
  id: 'data-analyst-agent',
  name: 'Data Analyst',
  description: 'Agent with custom tools for data analysis',
  systemPrompt: `You are a data analyst agent with access to custom tools:
- queryUserDatabase: Look up user information
- fetchGitHubRepository: Get repository data
- analyzeTextMetrics: Analyze text content
- readProjectFile: Read project files
- calculateBusinessMetrics: Calculate business KPIs

Use these tools to answer questions and provide insights.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.3,
  },
  tools: [
    'queryUserDatabase',
    'fetchGitHubRepository',
    'analyzeTextMetrics',
    'readProjectFile',
    'calculateBusinessMetrics',
  ],
};

/**
 * Example Usage
 */
async function runExample() {
  console.log('=== Custom Tool Examples ===\n');

  // Example 1: Query user database
  console.log('1. Querying user database...');
  const userResult = await queryUserDatabase.execute({
    searchType: 'email',
    searchValue: 'jane@example.com',
    includeMetadata: true,
  });
  console.log(JSON.stringify(userResult, null, 2));

  // Example 2: Fetch GitHub repo
  console.log('\n2. Fetching GitHub repository...');
  const repoResult = await fetchGitHubRepository.execute({
    owner: 'valdi',
    repo: 'ai-ui',
    includeContributors: true,
  });
  console.log(JSON.stringify(repoResult, null, 2));

  // Example 3: Analyze text
  console.log('\n3. Analyzing text metrics...');
  const textResult = await analyzeTextMetrics.execute({
    text: 'AI workflows are powerful tools for building complex applications. They enable developers to create sophisticated systems that coordinate multiple AI agents efficiently. This leads to better outcomes and improved productivity.',
    includeKeywords: true,
  });
  console.log(JSON.stringify(textResult, null, 2));

  // Example 4: Calculate business metrics
  console.log('\n4. Calculating business metrics...');
  const metricsResult = await calculateBusinessMetrics.execute({
    metricType: 'roi',
    data: {
      revenue: 150000,
      cost: 100000,
    },
  });
  console.log(JSON.stringify(metricsResult, null, 2));

  console.log('\n=== All Examples Complete ===');
}

// Run example if this file is executed directly
if (require.main === module) {
  runExample().catch(console.error);
}
