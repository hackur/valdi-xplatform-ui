/**
 * Parallel Analysis Workflow Example
 *
 * This example demonstrates a parallel workflow that executes multiple agents
 * simultaneously with the same input, then aggregates their results.
 *
 * Pattern: Analyze with 3 different models → Compare → Aggregate
 *
 * Use Case: Getting diverse perspectives on a problem by using different AI models,
 * then synthesizing the best insights from all responses.
 */

import {
  AgentDefinition,
  AgentContext,
  AgentExecutionResult,
  WorkflowConfig,
  WorkflowExecutionState,
} from '../../modules/agent_manager/src/types';
import { Message } from '../../modules/common/src/types';

/**
 * Define Analysis Agents with Different Models
 *
 * Each agent uses a different AI model to provide diverse perspectives.
 */

const claudeAnalyst: AgentDefinition = {
  id: 'claude-analyst',
  name: 'Claude Analyst',
  description: 'Analysis using Claude (Anthropic)',
  systemPrompt: `You are an analytical AI assistant. Analyze the given prompt and provide:
1. Key insights and observations
2. Potential challenges or concerns
3. Recommended actions
4. Confidence level in your analysis

Be thorough, analytical, and cite reasoning for your conclusions.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.4,
    maxTokens: 1500,
  },
  capabilities: ['analysis', 'reasoning', 'problem-solving'],
};

const gptAnalyst: AgentDefinition = {
  id: 'gpt-analyst',
  name: 'GPT Analyst',
  description: 'Analysis using GPT (OpenAI)',
  systemPrompt: `You are an analytical AI assistant. Analyze the given prompt and provide:
1. Key insights and observations
2. Potential challenges or concerns
3. Recommended actions
4. Confidence level in your analysis

Focus on practical, actionable insights and creative solutions.`,
  model: {
    provider: 'openai',
    modelId: 'gpt-4-turbo-preview',
    temperature: 0.4,
    maxTokens: 1500,
  },
  capabilities: ['analysis', 'creativity', 'problem-solving'],
};

const geminiAnalyst: AgentDefinition = {
  id: 'gemini-analyst',
  name: 'Gemini Analyst',
  description: 'Analysis using Gemini (Google)',
  systemPrompt: `You are an analytical AI assistant. Analyze the given prompt and provide:
1. Key insights and observations
2. Potential challenges or concerns
3. Recommended actions
4. Confidence level in your analysis

Emphasize comprehensive research and data-driven insights.`,
  model: {
    provider: 'google',
    modelId: 'gemini-pro',
    temperature: 0.4,
    maxTokens: 1500,
  },
  capabilities: ['analysis', 'research', 'data-analysis'],
};

/**
 * Define the Aggregator Agent
 *
 * This agent compares and synthesizes insights from all analysts.
 */
const aggregatorAgent: AgentDefinition = {
  id: 'aggregator-agent',
  name: 'Aggregator Agent',
  description: 'Synthesizes insights from multiple analyses',
  systemPrompt: `You are a synthesis expert. Your task is to:
1. Compare analyses from multiple AI models (Claude, GPT, Gemini)
2. Identify common insights (consensus)
3. Highlight unique perspectives from each model
4. Create a comprehensive synthesis that combines the best insights
5. Provide a final recommendation with confidence score

Be objective and give credit to each model's unique contributions.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.3,
    maxTokens: 2000,
  },
  capabilities: ['synthesis', 'comparison', 'decision-making'],
};

/**
 * Parallel Analysis Workflow Configuration
 */
export const parallelAnalysisWorkflow: WorkflowConfig = {
  name: 'Parallel Multi-Model Analysis',
  type: 'parallel',
  agents: ['claude-analyst', 'gpt-analyst', 'gemini-analyst', 'aggregator-agent'],
  maxSteps: 8,
  timeout: 90000, // 90 seconds
  config: {
    // First 3 agents run in parallel, aggregator runs after
    parallelGroups: [
      ['claude-analyst', 'gpt-analyst', 'gemini-analyst'],
      ['aggregator-agent'],
    ],
  },
};

/**
 * Execute Parallel Analysis Workflow
 *
 * @param prompt - The analysis prompt
 * @returns Workflow execution result
 */
export async function executeParallelAnalysis(
  prompt: string,
): Promise<WorkflowExecutionState> {
  const workflowState: WorkflowExecutionState = {
    id: `workflow_${Date.now()}`,
    config: parallelAnalysisWorkflow,
    status: 'running',
    startTime: new Date(),
    currentStep: 0,
    results: [],
  };

  try {
    // Phase 1: Execute all analysts in parallel
    console.log('Phase 1: Running parallel analyses...');

    const analysts = [claudeAnalyst, gptAnalyst, geminiAnalyst];
    const analysisPromises = analysts.map((analyst) => {
      const context: AgentContext = {
        conversationId: workflowState.id,
        messages: [
          {
            id: `msg_${Date.now()}_${analyst.id}`,
            conversationId: workflowState.id,
            role: 'user',
            content: prompt,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed',
          },
        ],
        sharedData: { originalPrompt: prompt },
        maxSteps: 3,
      };

      return simulateAgentExecution(analyst, context);
    });

    // Wait for all analyses to complete in parallel
    const analysisResults = await Promise.all(analysisPromises);
    workflowState.results.push(...analysisResults);
    workflowState.currentStep = 1;

    console.log(
      `Completed ${analysisResults.length} parallel analyses in ${Math.max(...analysisResults.map((r) => r.metadata?.executionTime || 0))}ms`,
    );

    // Phase 2: Aggregate results
    console.log('Phase 2: Aggregating results...');

    const aggregationContext: AgentContext = {
      conversationId: workflowState.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: workflowState.id,
          role: 'user',
          content: `Compare and synthesize these three analyses:

=== Claude Analysis ===
${analysisResults[0].output}

=== GPT Analysis ===
${analysisResults[1].output}

=== Gemini Analysis ===
${analysisResults[2].output}

Provide a comprehensive synthesis.`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ],
      sharedData: {
        originalPrompt: prompt,
        analysisResults: analysisResults.map((r) => ({
          agentId: r.agentId,
          output: r.output,
        })),
      },
      maxSteps: 2,
    };

    const aggregationResult = await simulateAgentExecution(
      aggregatorAgent,
      aggregationContext,
    );
    workflowState.results.push(aggregationResult);
    workflowState.currentStep = 2;

    // Mark workflow as completed
    workflowState.status = 'completed';
    workflowState.endTime = new Date();

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
 * Simulate Agent Execution
 *
 * In a real implementation, this would call the actual chat API.
 */
async function simulateAgentExecution(
  agent: AgentDefinition,
  context: AgentContext,
): Promise<AgentExecutionResult> {
  const startTime = Date.now();

  // Simulate API call delay (parallel calls take similar time)
  const delay = 1500 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Generate mock output based on agent type
  let output = '';

  if (agent.id === 'claude-analyst') {
    output = `Claude Analysis:

Key Insights:
• Approach requires careful architectural planning
• Strong potential for efficiency improvements
• Risk management is critical for success

Challenges:
• Implementation complexity higher than anticipated
• Resource allocation needs careful consideration
• Timeline may need adjustment for thorough testing

Recommendations:
1. Start with proof-of-concept phase
2. Invest in robust error handling
3. Plan for iterative refinement

Confidence: 85%`;
  } else if (agent.id === 'gpt-analyst') {
    output = `GPT Analysis:

Key Insights:
• Creative solutions possible through modular approach
• Scalability should be built-in from the start
• User experience is the critical success factor

Challenges:
• Balancing innovation with practicality
• Integration with existing systems
• Managing stakeholder expectations

Recommendations:
1. Design with extensibility in mind
2. Create comprehensive documentation
3. Establish clear success metrics

Confidence: 82%`;
  } else if (agent.id === 'gemini-analyst') {
    output = `Gemini Analysis:

Key Insights:
• Data-driven approach will maximize results
• Research shows 40-60% efficiency gains possible
• Best practices from similar projects are applicable

Challenges:
• Data quality and availability
• Change management across teams
• Measuring and tracking ROI

Recommendations:
1. Establish baseline metrics immediately
2. Create feedback loops for continuous improvement
3. Build in analytics from day one

Confidence: 88%`;
  } else if (agent.id === 'aggregator-agent') {
    output = `Comprehensive Synthesis:

=== Consensus Insights ===
All three models agree on:
• High potential for significant efficiency improvements (40-60% range)
• Implementation complexity requires careful planning
• Iterative, phased approach is optimal

=== Unique Perspectives ===
• Claude emphasizes risk management and thorough testing
• GPT focuses on creative solutions and user experience
• Gemini highlights data-driven decisions and metrics

=== Synthesized Recommendations ===
1. START: Proof-of-concept with baseline metrics
   - Combines Claude's caution with Gemini's data focus

2. BUILD: Modular architecture with robust error handling
   - Integrates GPT's extensibility with Claude's reliability

3. MEASURE: Establish feedback loops and analytics
   - Implements Gemini's continuous improvement approach

4. SCALE: Plan for iterative refinement and documentation
   - Balances all perspectives for sustainable growth

=== Final Recommendation ===
Proceed with a phased implementation approach:
- Phase 1: POC with metrics (2-4 weeks)
- Phase 2: Core functionality with error handling (4-8 weeks)
- Phase 3: Refinement and scaling (ongoing)

Overall Confidence: 87% (weighted average of all analyses)

This synthesis combines the analytical rigor of Claude, creative problem-solving of GPT, and data-driven approach of Gemini for a comprehensive strategy.`;
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
        prompt: 200,
        completion: 300,
        total: 500,
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
  console.log('=== Parallel Multi-Model Analysis Example ===\n');

  const prompt = `Should we implement a microservices architecture for our new product platform?
Consider: scalability, team structure, timeline, costs, and risks.`;

  console.log(`Analysis Prompt:\n${prompt}\n`);

  const result = await executeParallelAnalysis(prompt);

  console.log('\n=== Workflow Complete ===');
  console.log(`Status: ${result.status}`);
  console.log(
    `Total Time: ${result.endTime ? result.endTime.getTime() - result.startTime.getTime() : 0}ms`,
  );
  console.log(`Analyses Executed: ${result.results.length}`);

  console.log('\n=== Individual Analyses ===');
  result.results.slice(0, 3).forEach((agentResult, index) => {
    console.log(`\nAnalyst ${index + 1}: ${agentResult.agentId}`);
    console.log(`Execution Time: ${agentResult.metadata?.executionTime}ms`);
    console.log(`\n${agentResult.output}`);
  });

  console.log('\n=== Aggregated Synthesis ===');
  console.log(result.results[3].output);
}

// Run example if this file is executed directly
if (require.main === module) {
  runExample().catch(console.error);
}
