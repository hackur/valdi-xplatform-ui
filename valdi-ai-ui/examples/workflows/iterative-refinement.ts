/**
 * Iterative Refinement Workflow Example
 *
 * This example demonstrates an evaluator-optimizer pattern that iteratively
 * refines output through multiple cycles of generation, evaluation, and improvement.
 *
 * Pattern: Generate → Evaluate → Refine → Loop until quality threshold met
 *
 * Use Case: Creating high-quality content (blog posts, documentation, code)
 * through iterative feedback and refinement.
 */

import {
  AgentDefinition,
  AgentContext,
  AgentExecutionResult,
  WorkflowConfig,
  WorkflowExecutionState,
  LoopControlConfig,
  LoopExecutionState,
} from '../../modules/agent_manager/src/types';
import { Message } from '../../modules/common/src/types';

/**
 * Quality Metrics
 */
interface QualityScore {
  overall: number; // 0-100
  clarity: number;
  accuracy: number;
  completeness: number;
  style: number;
  issues: string[];
  suggestions: string[];
}

/**
 * Generator Agent
 *
 * Creates initial content or improves existing content based on feedback.
 */
const generatorAgent: AgentDefinition = {
  id: 'generator-agent',
  name: 'Content Generator',
  description: 'Generates and refines content based on requirements and feedback',
  systemPrompt: `You are an expert content creator. Your task is to:
1. Create high-quality content that meets the requirements
2. Incorporate feedback from evaluations to improve
3. Maintain consistent style and tone
4. Ensure accuracy and completeness

When refining:
- Address all identified issues
- Implement suggested improvements
- Preserve what's working well
- Enhance clarity and structure`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.7, // Higher for creativity
    maxTokens: 2500,
  },
  capabilities: ['content-generation', 'writing', 'creativity'],
};

/**
 * Evaluator Agent
 *
 * Critically evaluates content quality and provides detailed feedback.
 */
const evaluatorAgent: AgentDefinition = {
  id: 'evaluator-agent',
  name: 'Quality Evaluator',
  description: 'Evaluates content quality and provides improvement feedback',
  systemPrompt: `You are a rigorous content evaluator. Assess content on:

1. CLARITY (0-100): Is the content clear and easy to understand?
2. ACCURACY (0-100): Is the information correct and precise?
3. COMPLETENESS (0-100): Does it cover all necessary points?
4. STYLE (0-100): Is the writing style appropriate and consistent?

Provide scores in this format:
CLARITY: [score]
ACCURACY: [score]
COMPLETENESS: [score]
STYLE: [score]
OVERALL: [average score]

ISSUES:
- [List specific problems]

SUGGESTIONS:
- [Concrete improvement recommendations]

Be thorough but constructive. Scores above 85 indicate excellent quality.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.2, // Low for consistent evaluation
    maxTokens: 1500,
  },
  capabilities: ['evaluation', 'critique', 'quality-assurance'],
};

/**
 * Optimizer Agent
 *
 * Takes evaluation feedback and creates an improved version.
 */
const optimizerAgent: AgentDefinition = {
  id: 'optimizer-agent',
  name: 'Content Optimizer',
  description: 'Optimizes content based on evaluation feedback',
  systemPrompt: `You are an optimization specialist. Your task is to:
1. Analyze the evaluation feedback carefully
2. Address each identified issue
3. Implement suggested improvements
4. Enhance overall quality

Focus on:
- Fixing specific problems mentioned
- Improving weak areas (low scores)
- Maintaining strong areas (high scores)
- Making measurable improvements

Produce a refined version that addresses all feedback.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.5,
    maxTokens: 2500,
  },
  capabilities: ['optimization', 'editing', 'refinement'],
};

/**
 * Iterative Refinement Workflow Configuration
 */
export const iterativeRefinementWorkflow: WorkflowConfig = {
  name: 'Iterative Content Refinement',
  type: 'evaluator-optimizer',
  agents: ['generator-agent', 'evaluator-agent', 'optimizer-agent'],
  maxSteps: 15,
  timeout: 120000, // 2 minutes
  stopWhen: (results: AgentExecutionResult[]) => {
    // Stop when quality score >= 85 or max iterations reached
    const lastEvaluation = results
      .filter((r) => r.agentId === 'evaluator-agent')
      .pop();

    if (!lastEvaluation?.output) return false;

    const score = parseQualityScore(lastEvaluation.output);
    return score.overall >= 85;
  },
  config: {
    qualityThreshold: 85,
    maxIterations: 5,
    minIterations: 1,
  },
};

/**
 * Execute Iterative Refinement Workflow
 *
 * @param requirements - Content requirements and specifications
 * @returns Workflow execution result
 */
export async function executeIterativeRefinement(
  requirements: string,
): Promise<WorkflowExecutionState> {
  const workflowState: WorkflowExecutionState = {
    id: `workflow_${Date.now()}`,
    config: iterativeRefinementWorkflow,
    status: 'running',
    startTime: new Date(),
    currentStep: 0,
    results: [],
  };

  const maxIterations = (workflowState.config.config?.maxIterations as number) || 5;
  const qualityThreshold =
    (workflowState.config.config?.qualityThreshold as number) || 85;

  try {
    // Step 1: Initial Generation
    console.log('Iteration 0: Generating initial content...');

    const initialContext: AgentContext = {
      conversationId: workflowState.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: workflowState.id,
          role: 'user',
          content: `Create content based on these requirements:\n\n${requirements}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ],
      sharedData: { requirements },
      maxSteps: 2,
    };

    let currentContent = await simulateAgentExecution(
      generatorAgent,
      initialContext,
    );
    workflowState.results.push(currentContent);
    workflowState.currentStep++;

    console.log(`Initial content generated (${currentContent.metadata?.executionTime}ms)`);

    // Iterative Refinement Loop
    let currentScore: QualityScore | null = null;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      console.log(`\nIteration ${iteration}:`);

      // Evaluate current content
      console.log('  Evaluating quality...');
      const evaluationContext: AgentContext = {
        conversationId: workflowState.id,
        messages: [
          {
            id: `msg_${Date.now()}`,
            conversationId: workflowState.id,
            role: 'user',
            content: `Evaluate this content:\n\n${currentContent.output}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed',
          },
        ],
        sharedData: {
          requirements,
          iteration,
          previousContent: currentContent.output,
        },
        maxSteps: 1,
      };

      const evaluation = await simulateAgentExecution(
        evaluatorAgent,
        evaluationContext,
      );
      workflowState.results.push(evaluation);
      workflowState.currentStep++;

      currentScore = parseQualityScore(evaluation.output || '');
      console.log(`  Quality Score: ${currentScore.overall}/100`);
      console.log(`    Clarity: ${currentScore.clarity}`);
      console.log(`    Accuracy: ${currentScore.accuracy}`);
      console.log(`    Completeness: ${currentScore.completeness}`);
      console.log(`    Style: ${currentScore.style}`);

      // Check if quality threshold met
      if (currentScore.overall >= qualityThreshold) {
        console.log(
          `  ✓ Quality threshold met (${currentScore.overall} >= ${qualityThreshold})`,
        );
        break;
      }

      // Check if max iterations reached
      if (iteration >= maxIterations) {
        console.log(`  ⚠ Max iterations reached (${maxIterations})`);
        break;
      }

      // Optimize based on feedback
      console.log('  Optimizing content...');
      const optimizationContext: AgentContext = {
        conversationId: workflowState.id,
        messages: [
          {
            id: `msg_${Date.now()}`,
            conversationId: workflowState.id,
            role: 'user',
            content: `Improve this content based on the evaluation:

CURRENT CONTENT:
${currentContent.output}

EVALUATION:
${evaluation.output}

Create an improved version that addresses all issues and suggestions.`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed',
          },
        ],
        sharedData: {
          requirements,
          iteration,
          currentContent: currentContent.output,
          evaluation: evaluation.output,
          qualityScore: currentScore,
        },
        maxSteps: 2,
      };

      currentContent = await simulateAgentExecution(
        optimizerAgent,
        optimizationContext,
      );
      workflowState.results.push(currentContent);
      workflowState.currentStep++;

      console.log(`  Content optimized (${currentContent.metadata?.executionTime}ms)`);
    }

    // Final evaluation if we optimized
    if (iteration > 0 && workflowState.results[workflowState.results.length - 1].agentId !== 'evaluator-agent') {
      console.log('\nFinal evaluation...');
      const finalEvaluationContext: AgentContext = {
        conversationId: workflowState.id,
        messages: [
          {
            id: `msg_${Date.now()}`,
            conversationId: workflowState.id,
            role: 'user',
            content: `Final evaluation of refined content:\n\n${currentContent.output}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed',
          },
        ],
        sharedData: {
          requirements,
          finalContent: currentContent.output,
          iterations: iteration,
        },
        maxSteps: 1,
      };

      const finalEvaluation = await simulateAgentExecution(
        evaluatorAgent,
        finalEvaluationContext,
      );
      workflowState.results.push(finalEvaluation);
      currentScore = parseQualityScore(finalEvaluation.output || '');
    }

    // Mark workflow as completed
    workflowState.status = 'completed';
    workflowState.endTime = new Date();

    console.log(`\n✓ Refinement complete after ${iteration} iteration(s)`);
    console.log(`Final Quality Score: ${currentScore?.overall}/100`);

    return workflowState;
  } catch (error) {
    workflowState.status = 'failed';
    workflowState.error =
      error instanceof Error ? error.message : 'Unknown error';
    workflowState.endTime = new Date();
    return workflowState;
  }
}

/**
 * Parse Quality Score from Evaluation Output
 */
function parseQualityScore(output: string): QualityScore {
  const clarityMatch = output.match(/CLARITY:\s*(\d+)/i);
  const accuracyMatch = output.match(/ACCURACY:\s*(\d+)/i);
  const completenessMatch = output.match(/COMPLETENESS:\s*(\d+)/i);
  const styleMatch = output.match(/STYLE:\s*(\d+)/i);
  const overallMatch = output.match(/OVERALL:\s*(\d+)/i);

  const clarity = parseInt(clarityMatch?.[1] || '70');
  const accuracy = parseInt(accuracyMatch?.[1] || '70');
  const completeness = parseInt(completenessMatch?.[1] || '70');
  const style = parseInt(styleMatch?.[1] || '70');
  const overall =
    parseInt(overallMatch?.[1] || '0') ||
    Math.round((clarity + accuracy + completeness + style) / 4);

  const issuesSection = output.match(/ISSUES:(.*?)(?=SUGGESTIONS:|$)/is);
  const suggestionsSection = output.match(/SUGGESTIONS:(.*?)$/is);

  const issues =
    issuesSection?.[1]
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.startsWith('-'))
      .map((s) => s.substring(1).trim()) || [];

  const suggestions =
    suggestionsSection?.[1]
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.startsWith('-'))
      .map((s) => s.substring(1).trim()) || [];

  return {
    overall,
    clarity,
    accuracy,
    completeness,
    style,
    issues,
    suggestions,
  };
}

/**
 * Simulate Agent Execution
 */
async function simulateAgentExecution(
  agent: AgentDefinition,
  context: AgentContext,
): Promise<AgentExecutionResult> {
  const startTime = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  let output = '';
  const iteration = (context.sharedData?.iteration as number) || 0;

  if (agent.id === 'generator-agent') {
    if (iteration === 0) {
      output = `# AI Workflow Patterns Guide

AI workflows are orchestration patterns that coordinate multiple AI agents to solve complex tasks. This guide covers the four main patterns.

## Sequential Workflows
Execute agents in order, passing results from one to the next. Good for linear processes.

## Parallel Workflows
Run multiple agents simultaneously. Useful when tasks are independent.

## Routing Workflows
Classify input and route to specialists. Great for handling diverse requests.

## Evaluator-Optimizer
Iteratively refine through feedback loops. Perfect for quality-critical work.`;
    } else {
      output = `# Complete Guide to AI Workflow Patterns

AI workflows are sophisticated orchestration patterns that coordinate multiple AI agents to solve complex, multi-step tasks efficiently. This comprehensive guide explores the four fundamental patterns and their applications.

## 1. Sequential Workflows

Sequential workflows execute agents in a defined order, with each agent's output feeding into the next step.

**Best for:**
- Linear, step-by-step processes
- Research → Analysis → Summary pipelines
- Scenarios where order matters

**Example:** Research agent gathers data → Analyst processes it → Writer creates summary

## 2. Parallel Workflows

Parallel workflows execute multiple agents simultaneously, leveraging concurrency for faster results.

**Best for:**
- Independent tasks that can run concurrently
- Comparing multiple AI models on the same input
- Aggregating diverse perspectives

**Example:** Query 3 different AI models simultaneously, then synthesize their insights

## 3. Routing Workflows

Routing workflows classify inputs and direct them to specialized agents based on type or category.

**Best for:**
- Customer support systems
- Multi-domain applications
- Handling diverse request types

**Example:** Classify query → Route to Technical/Business/General specialist

## 4. Evaluator-Optimizer Workflows

Iterative refinement through generate → evaluate → improve cycles.

**Best for:**
- Quality-critical content generation
- Code review and improvement
- Scenarios requiring refinement

**Example:** Generate draft → Evaluate quality → Refine → Repeat until threshold met

## Implementation Guidelines

1. **Start Simple:** Begin with sequential workflows
2. **Add Parallelism:** Introduce concurrent execution where beneficial
3. **Implement Routing:** Add classification for specialized handling
4. **Refine Iteratively:** Use evaluator-optimizer for quality

## Performance Metrics

- Sequential: Predictable, linear execution time
- Parallel: Faster throughput (max of individual agents)
- Routing: Efficient resource utilization
- Evaluator-Optimizer: Higher quality, variable time

Choose the pattern that best fits your use case and requirements.`;
    }
  } else if (agent.id === 'evaluator-agent') {
    if (iteration === 1) {
      output = `CLARITY: 72
ACCURACY: 78
COMPLETENESS: 65
STYLE: 70
OVERALL: 71

ISSUES:
- Lacks concrete examples for each pattern
- Sequential and Parallel sections too brief
- No performance or timing guidance
- Missing implementation details
- Could benefit from visual structure

SUGGESTIONS:
- Add specific use case examples for each pattern
- Expand each pattern section with more detail
- Include performance metrics and considerations
- Add implementation guidelines
- Improve section organization and hierarchy`;
    } else {
      output = `CLARITY: 88
ACCURACY: 92
COMPLETENESS: 90
STYLE: 85
OVERALL: 89

ISSUES:
- Could add more specific code examples
- Performance section could be more detailed

SUGGESTIONS:
- Include TypeScript code snippets
- Add real-world performance benchmarks
- Consider adding troubleshooting section

Overall: Excellent improvement! Content is comprehensive, well-structured, and highly useful.`;
    }
  } else if (agent.id === 'optimizer-agent') {
    // Optimizer creates improved version (shown in generator iteration 2+)
    output = context.sharedData?.currentContent as string;
  }

  const endTime = Date.now();

  return {
    agentId: agent.id,
    messages: [
      {
        id: `msg_${Date.now()}`,
        conversationId: context.conversationId,
        role: 'assistant',
        content: output,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
        metadata: {
          model: agent.model?.modelId,
        },
      },
    ],
    output,
    metadata: {
      steps: 1,
      tokens: {
        prompt: 300,
        completion: 400,
        total: 700,
      },
      executionTime: endTime - startTime,
      finishReason: 'completed',
    },
  };
}

/**
 * Example Usage
 */
async function runExample() {
  console.log('=== Iterative Refinement Workflow Example ===\n');

  const requirements = `Create a comprehensive guide about AI workflow patterns.
Include: Sequential, Parallel, Routing, and Evaluator-Optimizer patterns.
Target audience: Developers implementing AI systems.
Tone: Professional but accessible.
Length: Comprehensive but concise.`;

  console.log('Requirements:');
  console.log(requirements);
  console.log('\n' + '='.repeat(60) + '\n');

  const result = await executeIterativeRefinement(requirements);

  console.log('\n' + '='.repeat(60));
  console.log('=== Workflow Summary ===');
  console.log(`Status: ${result.status}`);
  console.log(
    `Total Time: ${result.endTime ? result.endTime.getTime() - result.startTime.getTime() : 0}ms`,
  );
  console.log(`Total Steps: ${result.results.length}`);

  // Show final content
  const finalContent = result.results
    .filter((r) => r.agentId === 'generator-agent' || r.agentId === 'optimizer-agent')
    .pop();

  console.log('\n=== Final Refined Content ===\n');
  console.log(finalContent?.output);
}

// Run example if this file is executed directly
if (require.main === module) {
  runExample().catch(console.error);
}
