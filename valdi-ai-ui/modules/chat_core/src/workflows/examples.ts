/**
 * Agent Workflow Examples
 *
 * Comprehensive examples demonstrating all workflow patterns.
 */

import { ChatService } from '../ChatService';
import { MessageStore } from '../MessageStore';
import {
  SequentialWorkflow,
  SequentialWorkflowBuilder,
  ParallelWorkflow,
  ParallelWorkflowBuilder,
  RoutingWorkflow,
  RoutingWorkflowBuilder,
  EvaluatorOptimizerWorkflow,
  EvaluatorOptimizerWorkflowBuilder,
} from './index';

/**
 * Example 1: Sequential Workflow - Content Creation Pipeline
 *
 * Research → Draft → Edit → Fact-check pipeline
 */
export function createContentPipeline(
  chatService: ChatService,
  messageStore: MessageStore,
): SequentialWorkflow {
  return new SequentialWorkflowBuilder()
    .custom({
      id: 'researcher',
      name: 'Research Agent',
      role: 'research',
      systemPrompt: `You are a research assistant.
        Your job is to gather comprehensive, accurate information on the given topic.
        Cite sources when possible and focus on recent, credible information.`,
      modelConfig: {
        provider: 'openai',
        modelId: 'gpt-4-turbo',
        temperature: 0.3,
      },
    })
    .custom({
      id: 'writer',
      name: 'Content Writer',
      role: 'writing',
      systemPrompt: `You are a professional content writer.
        Create engaging, well-structured content based on the research provided.
        Use clear headings, compelling narratives, and maintain reader interest.`,
      modelConfig: {
        provider: 'anthropic',
        modelId: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
      },
    })
    .custom({
      id: 'editor',
      name: 'Editor',
      role: 'editing',
      systemPrompt: `You are a professional editor.
        Review the content for grammar, clarity, flow, and consistency.
        Improve sentence structure and ensure professional quality.`,
    })
    .custom({
      id: 'fact-checker',
      name: 'Fact Checker',
      role: 'verification',
      systemPrompt: `You are a fact checker.
        Verify claims, check for accuracy, and identify any potential misinformation.
        Provide corrections or suggestions where needed.`,
    })
    .withContext() // Each agent sees full context
    .debug()
    .buildExecutor(chatService, messageStore);
}

/**
 * Example 2: Parallel Workflow - Multi-Perspective Analysis
 *
 * Get different expert opinions and synthesize them
 */
export function createExpertPanel(
  chatService: ChatService,
  messageStore: MessageStore,
): ParallelWorkflow {
  return new ParallelWorkflowBuilder()
    .addAgent({
      id: 'tech-expert',
      name: 'Technical Expert',
      role: 'technical-analysis',
      systemPrompt: `You are a technical expert.
        Analyze from a technical feasibility, architecture, and implementation perspective.
        Focus on technical challenges, scalability, and best practices.`,
    })
    .addAgent({
      id: 'business-expert',
      name: 'Business Analyst',
      role: 'business-analysis',
      systemPrompt: `You are a business analyst.
        Analyze from a business value, ROI, and market perspective.
        Focus on costs, benefits, market opportunities, and risks.`,
    })
    .addAgent({
      id: 'ux-expert',
      name: 'UX Designer',
      role: 'ux-analysis',
      systemPrompt: `You are a UX designer.
        Analyze from a user experience and design perspective.
        Focus on usability, accessibility, and user satisfaction.`,
    })
    .addAgent({
      id: 'security-expert',
      name: 'Security Specialist',
      role: 'security-analysis',
      systemPrompt: `You are a security specialist.
        Analyze from a security and privacy perspective.
        Identify potential vulnerabilities and compliance requirements.`,
    })
    .aggregate('concatenate')
    .synthesize({
      id: 'synthesizer',
      name: 'Strategic Synthesizer',
      role: 'synthesis',
      systemPrompt: `You are a strategic advisor.
        Synthesize the technical, business, UX, and security perspectives.
        Create a balanced recommendation that considers all viewpoints.
        Identify conflicts and provide resolution strategies.`,
    })
    .requireMin(3) // At least 3 experts must complete
    .maxWait(45000) // 45 second timeout
    .debug()
    .buildExecutor(chatService, messageStore);
}

/**
 * Example 3: Routing Workflow - Customer Support System
 *
 * Route customer inquiries to specialized support agents
 */
export function createSupportRouter(
  chatService: ChatService,
  messageStore: MessageStore,
): RoutingWorkflow {
  return new RoutingWorkflowBuilder()
    .router(
      {
        id: 'router',
        name: 'Support Router',
        role: 'classification',
        systemPrompt: `You are a customer support routing agent.`,
      },
      `Classify the customer inquiry into one of these categories:

      - billing: Payment issues, invoices, refunds, subscription questions
      - technical: Bugs, errors, technical problems, API issues
      - account: Login issues, password resets, account settings
      - sales: Pricing, features, upgrades, demos
      - general: General questions, feedback, other inquiries

      Respond with ONLY the category name in lowercase.`,
    )
    .route({
      id: 'billing',
      name: 'Billing Specialist',
      description: 'Handles billing and payment inquiries',
      triggers: ['billing', 'payment', 'invoice', 'refund', 'subscription'],
      priority: 10,
      agent: {
        id: 'billing-agent',
        name: 'Billing Support',
        role: 'billing-support',
        systemPrompt: `You are a billing support specialist.
          Help customers with:
          - Payment and billing questions
          - Invoice requests
          - Refund processing
          - Subscription management

          Be professional, empathetic, and provide clear solutions.`,
      },
    })
    .route({
      id: 'technical',
      name: 'Technical Support',
      description: 'Handles technical issues',
      triggers: ['technical', 'bug', 'error', 'not working', 'api'],
      priority: 10,
      agent: {
        id: 'tech-agent',
        name: 'Technical Support',
        role: 'technical-support',
        systemPrompt: `You are a technical support engineer.
          Help customers troubleshoot and resolve technical issues.
          Ask clarifying questions, provide step-by-step solutions,
          and escalate if needed.`,
      },
    })
    .route({
      id: 'account',
      name: 'Account Support',
      description: 'Handles account-related issues',
      triggers: ['account', 'login', 'password', 'access'],
      priority: 8,
      agent: {
        id: 'account-agent',
        name: 'Account Support',
        role: 'account-support',
        systemPrompt: `You are an account support specialist.
          Help customers with account access, settings, and security.
          Verify identity when needed and follow security protocols.`,
      },
    })
    .route({
      id: 'sales',
      name: 'Sales Team',
      description: 'Handles sales inquiries',
      triggers: ['sales', 'pricing', 'upgrade', 'demo', 'features'],
      priority: 7,
      agent: {
        id: 'sales-agent',
        name: 'Sales Representative',
        role: 'sales',
        systemPrompt: `You are a sales representative.
          Help customers understand features, pricing, and upgrade options.
          Be helpful and consultative, not pushy.`,
      },
    })
    .fallback({
      id: 'general',
      name: 'General Support',
      role: 'general-support',
      systemPrompt: `You are a general support agent.
        Help customers with general inquiries and feedback.
        Route to specialized teams if needed.`,
    })
    .withExplanation()
    .debug()
    .buildExecutor(chatService, messageStore);
}

/**
 * Example 4: Evaluator-Optimizer Workflow - Code Quality Loop
 *
 * Generate code → Review → Refine until quality standards met
 */
export function createCodeQualityLoop(
  chatService: ChatService,
  messageStore: MessageStore,
): EvaluatorOptimizerWorkflow {
  return new EvaluatorOptimizerWorkflowBuilder()
    .generator({
      id: 'code-generator',
      name: 'Code Generator',
      role: 'code-generation',
      systemPrompt: `You are an expert software engineer.
        Generate clean, well-documented, production-ready code.
        Follow best practices and SOLID principles.
        Include proper error handling and type safety.`,
      modelConfig: {
        provider: 'anthropic',
        modelId: 'claude-3-5-sonnet-20241022',
        temperature: 0.3,
      },
    })
    .evaluator(
      {
        id: 'code-reviewer',
        name: 'Code Reviewer',
        role: 'code-review',
        systemPrompt: `You are a senior code reviewer.
          Evaluate code on the following criteria (each worth 20 points):

          1. Code Quality (20 points)
             - Clean, readable code
             - Proper naming conventions
             - No code smells

          2. Best Practices (20 points)
             - Follows language idioms
             - Proper design patterns
             - SOLID principles

          3. Error Handling (20 points)
             - Comprehensive error handling
             - Proper validation
             - Edge cases covered

          4. Documentation (20 points)
             - Clear comments
             - Function documentation
             - Usage examples

          5. Testing (20 points)
             - Testable code
             - Good test coverage
             - Test cases included

          Provide detailed feedback in this format:
          SCORE: [total score 0-100]

          ISSUES:
          - [List specific issues]

          SUGGESTIONS:
          - [List improvements]

          FEEDBACK:
          [Detailed feedback]`,
      },
      'Code Quality, Best Practices, Error Handling, Documentation, Testing',
    )
    .optimizer({
      id: 'code-optimizer',
      name: 'Code Optimizer',
      role: 'code-optimization',
      systemPrompt: `You are a code optimization specialist.
        Refine code based on review feedback.
        Address all issues and implement suggested improvements.
        Maintain functionality while improving quality.`,
      modelConfig: {
        provider: 'openai',
        modelId: 'gpt-4-turbo',
      },
    })
    .threshold(90) // Aim for 90+ score
    .maxIterations(3)
    .minImprovement(5)
    .returnAllIterations()
    .debug()
    .buildExecutor(chatService, messageStore);
}

/**
 * Example 5: Nested Workflows - Complex Multi-Stage Process
 *
 * Use sequential workflow that includes parallel sub-workflows
 */
export async function createNestedWorkflowExample(
  chatService: ChatService,
  messageStore: MessageStore,
  conversationId: string,
  input: string,
) {
  // Stage 1: Parallel research from multiple perspectives
  const researchWorkflow = new ParallelWorkflowBuilder()
    .addAgent({
      id: 'academic',
      name: 'Academic Researcher',
      role: 'academic-research',
      systemPrompt: 'Research from academic and scientific perspective.',
    })
    .addAgent({
      id: 'industry',
      name: 'Industry Analyst',
      role: 'industry-research',
      systemPrompt: 'Research from industry and practical perspective.',
    })
    .aggregate('concatenate')
    .buildExecutor(chatService, messageStore);

  const researchResult = await researchWorkflow.execute({
    conversationId,
    input,
  });

  // Stage 2: Sequential analysis and synthesis
  const analysisWorkflow = new SequentialWorkflowBuilder()
    .analyze('Analyze the research findings and identify key themes.')
    .summarize('Create a comprehensive summary with actionable insights.')
    .buildExecutor(chatService, messageStore);

  const analysisResult = await analysisWorkflow.execute({
    conversationId,
    input: researchResult.result,
  });

  // Stage 3: Quality refinement
  const refinementWorkflow = new EvaluatorOptimizerWorkflowBuilder()
    .generator({
      id: 'report-writer',
      name: 'Report Writer',
      role: 'report-writing',
      systemPrompt: 'Create a professional report from the analysis.',
    })
    .evaluator({
      id: 'report-reviewer',
      name: 'Report Reviewer',
      role: 'report-review',
      systemPrompt: 'Evaluate report quality and completeness.',
    })
    .optimizer({
      id: 'report-optimizer',
      name: 'Report Optimizer',
      role: 'report-optimization',
      systemPrompt: 'Refine the report based on feedback.',
    })
    .threshold(85)
    .maxIterations(2)
    .buildExecutor(chatService, messageStore);

  return await refinementWorkflow.execute({
    conversationId,
    input: analysisResult.result,
  });
}

/**
 * Example 6: Custom Workflow with Advanced Features
 */
export async function createCustomWorkflowExample(
  chatService: ChatService,
  messageStore: MessageStore,
) {
  const workflow = new SequentialWorkflow(
    {
      type: 'sequential',
      agents: [
        {
          id: 'planner',
          name: 'Task Planner',
          role: 'planning',
          systemPrompt: 'Break down complex tasks into actionable steps.',
          maxSteps: 3,
        },
        {
          id: 'executor',
          name: 'Task Executor',
          role: 'execution',
          systemPrompt: 'Execute the planned steps systematically.',
          maxSteps: 5,
        },
      ],
      includePreviousContext: true,
      transformOutput: (output, _index) => {
        // Clean markdown code blocks
        return output.replace(/```[\s\S]*?```/g, (match) => {
          return match.trim();
        });
      },
      shouldStop: (output, _index) => {
        // Early stop if output contains "COMPLETE" marker
        return output.includes('[COMPLETE]');
      },
      retry: {
        maxRetries: 2,
        retryDelay: 2000,
        retryableErrors: ['timeout', 'rate_limit'],
      },
      timeout: 120000, // 2 minutes
      debug: true,
    },
    chatService,
    messageStore,
  );

  return workflow;
}

/**
 * Example Usage Function
 */
export async function runWorkflowExamples() {
  // Initialize services (you would inject these)
  const chatService = {} as ChatService;
  const messageStore = new MessageStore();
  const conversationId = 'example_conv_123';

  // Example 1: Content Pipeline
  console.log('Running Content Pipeline...');
  const contentPipeline = createContentPipeline(chatService, messageStore);
  const contentResult = await contentPipeline.execute({
    conversationId,
    input: 'Write a comprehensive guide about TypeScript generics',
    onProgress: (event) => {
      if (event.type === 'step-complete') {
        console.log(`✓ ${event.step.agentName} completed`);
      }
    },
  });
  console.log('Content Result:', contentResult.result);

  // Example 2: Expert Panel
  console.log('\nRunning Expert Panel...');
  const expertPanel = createExpertPanel(chatService, messageStore);
  const panelResult = await expertPanel.execute({
    conversationId,
    input: 'Should we migrate our monolith to microservices?',
  });
  console.log('Panel Result:', panelResult.result);

  // Example 3: Support Router
  console.log('\nRunning Support Router...');
  const supportRouter = createSupportRouter(chatService, messageStore);
  const supportResult = await supportRouter.execute({
    conversationId,
    input: "I can't log in to my account",
  });
  console.log('Support Result:', supportResult.result);

  // Example 4: Code Quality Loop
  console.log('\nRunning Code Quality Loop...');
  const codeQualityLoop = createCodeQualityLoop(chatService, messageStore);
  const codeResult = await codeQualityLoop.execute({
    conversationId,
    input:
      'Create a TypeScript function to validate email addresses with RFC 5322 compliance',
  });
  console.log('Code Result:', codeResult.result);
  console.log('Iterations:', codeQualityLoop.getIterations().length);
  console.log('Score Progression:', codeQualityLoop.getScoreProgression());
}
