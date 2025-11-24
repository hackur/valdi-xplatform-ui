/**
 * Sequential Research Workflow Example
 *
 * This example demonstrates a multi-step research workflow that executes
 * agents sequentially, passing output from one step to the next.
 *
 * Pattern: Research → Summarize → Validate
 *
 * Use Case: Researching a topic, summarizing findings, and validating accuracy
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
 * Define the Research Agent
 *
 * This agent is responsible for gathering information on a topic.
 * It uses web search capabilities to find relevant information.
 */
const researchAgent: AgentDefinition = {
  id: 'research-agent',
  name: 'Research Agent',
  description: 'Gathers comprehensive information on a given topic',
  systemPrompt: `You are a thorough research agent. Your task is to:
1. Analyze the given topic or question
2. Use the searchWeb tool to find relevant information
3. Synthesize multiple sources into a comprehensive research summary
4. Cite sources and provide concrete facts

Be objective, thorough, and focus on factual information.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.3,
    maxTokens: 2000,
  },
  tools: ['searchWeb', 'getWeather'], // Available tools from ToolDefinitions
  capabilities: ['research', 'web-search', 'fact-gathering'],
};

/**
 * Define the Summary Agent
 *
 * This agent takes research findings and creates a concise summary.
 */
const summaryAgent: AgentDefinition = {
  id: 'summary-agent',
  name: 'Summary Agent',
  description: 'Creates concise summaries from research findings',
  systemPrompt: `You are a skilled summarizer. Your task is to:
1. Read the research findings provided
2. Extract key points and main insights
3. Create a clear, concise summary (3-5 bullet points)
4. Maintain accuracy while being brief

Focus on actionable insights and key takeaways.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.5,
    maxTokens: 1000,
  },
  capabilities: ['summarization', 'synthesis'],
};

/**
 * Define the Validation Agent
 *
 * This agent validates the accuracy and completeness of the summary.
 */
const validationAgent: AgentDefinition = {
  id: 'validation-agent',
  name: 'Validation Agent',
  description: 'Validates research findings and summaries for accuracy',
  systemPrompt: `You are a critical validator. Your task is to:
1. Review the original research and summary
2. Check for factual accuracy and completeness
3. Identify any gaps, inconsistencies, or concerns
4. Provide a validation score (0-100) with justification
5. Suggest improvements if score is below 80

Be thorough but constructive in your feedback.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.2,
    maxTokens: 1000,
  },
  capabilities: ['validation', 'quality-assurance'],
};

/**
 * Sequential Research Workflow Configuration
 */
export const sequentialResearchWorkflow: WorkflowConfig = {
  name: 'Sequential Research Workflow',
  type: 'sequential',
  agents: ['research-agent', 'summary-agent', 'validation-agent'],
  maxSteps: 10,
  timeout: 60000, // 60 seconds
  config: {
    // Pass output from each step to the next
    chainOutputs: true,
  },
};

/**
 * Execute Sequential Research Workflow
 *
 * This function demonstrates how to execute the workflow programmatically.
 *
 * @param topic - The research topic
 * @returns Workflow execution result
 */
export async function executeSequentialResearch(
  topic: string,
): Promise<WorkflowExecutionState> {
  // Initialize workflow state
  const workflowState: WorkflowExecutionState = {
    id: `workflow_${Date.now()}`,
    config: sequentialResearchWorkflow,
    status: 'running',
    startTime: new Date(),
    currentStep: 0,
    results: [],
  };

  try {
    // Step 1: Research
    console.log('Step 1: Researching topic...');
    const researchContext: AgentContext = {
      conversationId: workflowState.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: workflowState.id,
          role: 'user',
          content: `Research the following topic thoroughly: ${topic}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ],
      sharedData: {},
      maxSteps: 5,
    };

    const researchResult = await simulateAgentExecution(
      researchAgent,
      researchContext,
    );
    workflowState.results.push(researchResult);
    workflowState.currentStep = 1;

    // Step 2: Summarize
    console.log('Step 2: Summarizing research findings...');
    const summaryContext: AgentContext = {
      conversationId: workflowState.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: workflowState.id,
          role: 'user',
          content: `Create a concise summary of this research:\n\n${researchResult.output}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ],
      sharedData: {
        originalTopic: topic,
        researchFindings: researchResult.output,
      },
      maxSteps: 3,
    };

    const summaryResult = await simulateAgentExecution(
      summaryAgent,
      summaryContext,
    );
    workflowState.results.push(summaryResult);
    workflowState.currentStep = 2;

    // Step 3: Validate
    console.log('Step 3: Validating summary...');
    const validationContext: AgentContext = {
      conversationId: workflowState.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: workflowState.id,
          role: 'user',
          content: `Validate this summary against the original research:

Original Research:
${researchResult.output}

Summary:
${summaryResult.output}

Provide a validation score and feedback.`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ],
      sharedData: {
        originalTopic: topic,
        researchFindings: researchResult.output,
        summary: summaryResult.output,
      },
      maxSteps: 2,
    };

    const validationResult = await simulateAgentExecution(
      validationAgent,
      validationContext,
    );
    workflowState.results.push(validationResult);
    workflowState.currentStep = 3;

    // Mark workflow as completed
    workflowState.status = 'completed';
    workflowState.endTime = new Date();

    return workflowState;
  } catch (error) {
    // Handle errors
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
 * In a real implementation, this would call the actual chat API with the agent's
 * configuration. For this example, we simulate the execution.
 *
 * @param agent - The agent to execute
 * @param context - The execution context
 * @returns Agent execution result
 */
async function simulateAgentExecution(
  agent: AgentDefinition,
  context: AgentContext,
): Promise<AgentExecutionResult> {
  const startTime = Date.now();

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Generate mock output based on agent type
  let output = '';
  if (agent.id === 'research-agent') {
    output = `Research Findings:
• Found comprehensive information on the topic
• Key sources include academic papers and industry reports
• Current trends show significant growth and innovation
• Main challenges identified: complexity and implementation costs
• Opportunities: efficiency gains of 40-60% in tested scenarios

Sources: [Mock sources would be listed here]`;
  } else if (agent.id === 'summary-agent') {
    output = `Summary:
• Topic shows strong growth and innovation potential
• Implementation requires careful planning
• Expected efficiency improvements: 40-60%
• Key challenge: managing complexity
• Recommended: start with pilot projects`;
  } else if (agent.id === 'validation-agent') {
    output = `Validation Report:
Score: 85/100

Strengths:
• Accurate representation of research findings
• Clear and concise presentation
• Key points well-identified

Areas for improvement:
• Could include more specific metrics
• Timeline information would be valuable

Overall: Summary is accurate and useful. Recommended for use.`;
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
      toolCalls: agent.id === 'research-agent' ? 3 : 0,
      tokens: {
        prompt: 150,
        completion: 250,
        total: 400,
      },
      executionTime: endTime - startTime,
      finishReason: 'completed',
    },
  };
}

/**
 * Example Usage
 *
 * Run this example with:
 * ts-node examples/workflows/sequential-research.ts
 */
async function runExample() {
  console.log('=== Sequential Research Workflow Example ===\n');

  const topic = 'AI workflow patterns for complex applications';
  console.log(`Research Topic: ${topic}\n`);

  const result = await executeSequentialResearch(topic);

  console.log('\n=== Workflow Complete ===');
  console.log(`Status: ${result.status}`);
  console.log(
    `Total Time: ${result.endTime ? result.endTime.getTime() - result.startTime.getTime() : 0}ms`,
  );
  console.log(`Steps Executed: ${result.results.length}`);

  console.log('\n=== Results ===');
  result.results.forEach((agentResult, index) => {
    console.log(`\nStep ${index + 1}: ${agentResult.agentId}`);
    console.log(`Execution Time: ${agentResult.metadata?.executionTime}ms`);
    console.log(`Output:\n${agentResult.output}`);
  });
}

// Run example if this file is executed directly
if (require.main === module) {
  runExample().catch(console.error);
}
