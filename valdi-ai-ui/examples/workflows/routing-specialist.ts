/**
 * Routing Specialist Workflow Example
 *
 * This example demonstrates a routing workflow that classifies incoming queries
 * and routes them to specialized agents based on the query type.
 *
 * Pattern: Classify → Route to Specialist → Format Response
 *
 * Use Case: Customer support system that routes queries to appropriate specialist
 * agents (Technical, Business, General) based on query analysis.
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
 * Query Type Classification
 */
type QueryType = 'technical' | 'business' | 'general' | 'urgent';

interface ClassificationResult {
  type: QueryType;
  confidence: number;
  reasoning: string;
}

/**
 * Router Agent
 *
 * Classifies incoming queries and determines which specialist to route to.
 */
const routerAgent: AgentDefinition = {
  id: 'router-agent',
  name: 'Query Router',
  description: 'Classifies queries and routes to appropriate specialists',
  systemPrompt: `You are an intelligent query classifier. Analyze incoming queries and classify them:

TECHNICAL: Questions about code, APIs, debugging, technical implementation, errors
BUSINESS: Questions about pricing, contracts, ROI, sales, partnerships
GENERAL: General questions, documentation, how-to guides, getting started
URGENT: Issues requiring immediate attention (outages, security, critical bugs)

Respond in this format:
TYPE: [one of: technical, business, general, urgent]
CONFIDENCE: [percentage]
REASONING: [brief explanation]

Be decisive and consider context clues in the query.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.2, // Low temperature for consistent classification
    maxTokens: 300,
  },
  capabilities: ['classification', 'routing', 'analysis'],
};

/**
 * Technical Specialist Agent
 */
const technicalAgent: AgentDefinition = {
  id: 'technical-specialist',
  name: 'Technical Specialist',
  description: 'Handles technical queries with deep technical expertise',
  systemPrompt: `You are a senior technical support engineer. Handle technical queries with:
1. Clear, accurate technical information
2. Code examples when relevant
3. Step-by-step troubleshooting guidance
4. Links to documentation
5. Best practices and common pitfalls

Be precise, thorough, and developer-friendly.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.3,
    maxTokens: 2000,
  },
  tools: ['searchWeb', 'calculateExpression'],
  capabilities: ['technical-support', 'debugging', 'code-review'],
};

/**
 * Business Specialist Agent
 */
const businessAgent: AgentDefinition = {
  id: 'business-specialist',
  name: 'Business Specialist',
  description: 'Handles business and commercial queries',
  systemPrompt: `You are a business consultant and account manager. Handle business queries with:
1. Clear pricing and packaging information
2. ROI and value proposition explanations
3. Contract and legal considerations
4. Partnership opportunities
5. Success stories and case studies

Be professional, persuasive, and customer-focused.`,
  model: {
    provider: 'openai',
    modelId: 'gpt-4-turbo-preview',
    temperature: 0.4,
    maxTokens: 1500,
  },
  capabilities: ['sales', 'consulting', 'account-management'],
};

/**
 * General Support Agent
 */
const generalAgent: AgentDefinition = {
  id: 'general-specialist',
  name: 'General Support Specialist',
  description: 'Handles general questions and getting started queries',
  systemPrompt: `You are a friendly support specialist. Handle general queries with:
1. Clear, beginner-friendly explanations
2. Getting started guides
3. FAQ answers
4. Navigation help
5. Encouragement and positive tone

Be warm, helpful, and accessible to all skill levels.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.5,
    maxTokens: 1200,
  },
  capabilities: ['general-support', 'onboarding', 'documentation'],
};

/**
 * Urgent Response Agent
 */
const urgentAgent: AgentDefinition = {
  id: 'urgent-specialist',
  name: 'Urgent Response Specialist',
  description: 'Handles critical and urgent issues',
  systemPrompt: `You are an incident response specialist. Handle urgent issues with:
1. Immediate triage and severity assessment
2. Quick workarounds or temporary fixes
3. Escalation procedures
4. Status updates and ETA
5. Follow-up action items

Be fast, decisive, and action-oriented.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.1, // Very low for consistency in emergencies
    maxTokens: 1000,
  },
  capabilities: ['incident-response', 'triage', 'escalation'],
};

/**
 * Response Formatter Agent
 */
const formatterAgent: AgentDefinition = {
  id: 'formatter-agent',
  name: 'Response Formatter',
  description: 'Formats specialist responses for optimal delivery',
  systemPrompt: `You are a response formatter. Format specialist responses with:
1. Clear structure and sections
2. Actionable next steps
3. Related resources
4. Follow-up suggestions
5. Professional polish

Maintain the specialist's core message while improving presentation.`,
  model: {
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    temperature: 0.3,
    maxTokens: 1500,
  },
  capabilities: ['formatting', 'editing', 'presentation'],
};

/**
 * Routing Workflow Configuration
 */
export const routingWorkflow: WorkflowConfig = {
  name: 'Intelligent Query Routing',
  type: 'routing',
  agents: [
    'router-agent',
    'technical-specialist',
    'business-specialist',
    'general-specialist',
    'urgent-specialist',
    'formatter-agent',
  ],
  maxSteps: 6,
  timeout: 45000, // 45 seconds
  config: {
    // Routing logic handled in execution
    routingStrategy: 'classification-based',
  },
};

/**
 * Execute Routing Workflow
 *
 * @param query - The user query to route
 * @returns Workflow execution result
 */
export async function executeRoutingWorkflow(
  query: string,
): Promise<WorkflowExecutionState> {
  const workflowState: WorkflowExecutionState = {
    id: `workflow_${Date.now()}`,
    config: routingWorkflow,
    status: 'running',
    startTime: new Date(),
    currentStep: 0,
    results: [],
  };

  try {
    // Step 1: Classify the query
    console.log('Step 1: Classifying query...');
    const classificationContext: AgentContext = {
      conversationId: workflowState.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: workflowState.id,
          role: 'user',
          content: `Classify this query:\n\n${query}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ],
      maxSteps: 1,
    };

    const classificationResult = await simulateAgentExecution(
      routerAgent,
      classificationContext,
    );
    workflowState.results.push(classificationResult);
    workflowState.currentStep = 1;

    // Parse classification
    const classification = parseClassification(
      classificationResult.output || '',
    );
    console.log(
      `Classification: ${classification.type} (${classification.confidence}% confidence)`,
    );

    // Step 2: Route to appropriate specialist
    console.log(`Step 2: Routing to ${classification.type} specialist...`);
    const specialist = selectSpecialist(classification.type);

    const specialistContext: AgentContext = {
      conversationId: workflowState.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: workflowState.id,
          role: 'user',
          content: query,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ],
      sharedData: {
        originalQuery: query,
        classification,
      },
      maxSteps: 3,
    };

    const specialistResult = await simulateAgentExecution(
      specialist,
      specialistContext,
    );
    workflowState.results.push(specialistResult);
    workflowState.currentStep = 2;

    // Step 3: Format the response
    console.log('Step 3: Formatting response...');
    const formatterContext: AgentContext = {
      conversationId: workflowState.id,
      messages: [
        {
          id: `msg_${Date.now()}`,
          conversationId: workflowState.id,
          role: 'user',
          content: `Format this specialist response for delivery:

Query Type: ${classification.type}
Specialist: ${specialist.name}

Response:
${specialistResult.output}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ],
      sharedData: {
        originalQuery: query,
        classification,
        specialistResponse: specialistResult.output,
      },
      maxSteps: 1,
    };

    const formatterResult = await simulateAgentExecution(
      formatterAgent,
      formatterContext,
    );
    workflowState.results.push(formatterResult);
    workflowState.currentStep = 3;

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
 * Select specialist based on classification
 */
function selectSpecialist(queryType: QueryType): AgentDefinition {
  switch (queryType) {
    case 'technical':
      return technicalAgent;
    case 'business':
      return businessAgent;
    case 'urgent':
      return urgentAgent;
    case 'general':
    default:
      return generalAgent;
  }
}

/**
 * Parse classification result
 */
function parseClassification(output: string): ClassificationResult {
  // Simple parsing of the classification output
  const typeMatch = output.match(/TYPE:\s*(\w+)/i);
  const confidenceMatch = output.match(/CONFIDENCE:\s*(\d+)/i);
  const reasoningMatch = output.match(/REASONING:\s*(.+?)(?=\n|$)/i);

  return {
    type: (typeMatch?.[1]?.toLowerCase() as QueryType) || 'general',
    confidence: parseInt(confidenceMatch?.[1] || '80'),
    reasoning: reasoningMatch?.[1] || 'Classification based on query content',
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
  await new Promise((resolve) =>
    setTimeout(resolve, 800 + Math.random() * 800),
  );

  let output = '';

  if (agent.id === 'router-agent') {
    // Simulate classification
    const types: QueryType[] = ['technical', 'business', 'general', 'urgent'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    output = `TYPE: ${selectedType}
CONFIDENCE: ${85 + Math.floor(Math.random() * 10)}%
REASONING: Based on query content and context, this appears to be a ${selectedType} inquiry requiring specialist attention.`;
  } else if (agent.id === 'technical-specialist') {
    output = `Technical Support Response:

I've analyzed your technical question. Here's the solution:

## Root Cause
The issue stems from asynchronous state updates not being properly handled in your workflow execution.

## Solution
\`\`\`typescript
// Use Promise.all for parallel execution
const results = await Promise.all(
  agents.map(agent => executeAgent(agent, context))
);
\`\`\`

## Steps to Implement
1. Update your workflow executor to use Promise.all
2. Add proper error boundaries for each agent
3. Implement timeout handling per agent

## Additional Resources
- See our async patterns documentation
- Check the workflow examples in /examples

Let me know if you need clarification on any step!`;
  } else if (agent.id === 'business-specialist') {
    output = `Business Consultation:

Thank you for your interest! Let me address your business inquiry:

## Pricing & ROI
- Enterprise plan: Custom pricing based on usage
- Expected ROI: 40-60% efficiency improvement
- Typical payback period: 3-6 months

## Value Proposition
Our AI workflow platform delivers:
✓ Reduced operational costs
✓ Faster time-to-market
✓ Improved accuracy and consistency
✓ Scalable automation

## Next Steps
1. Schedule a demo with our solutions team
2. Receive custom proposal for your use case
3. Start with a pilot project

Would you like me to connect you with our sales team for a personalized consultation?`;
  } else if (agent.id === 'general-specialist') {
    output = `Welcome! I'm here to help you get started.

## Getting Started Guide

### Step 1: Setup
First, install the Valdi AI UI package and configure your API keys.

### Step 2: Create Your First Workflow
Start with a simple sequential workflow to understand the basics:
- Define your agents
- Set up the workflow configuration
- Execute and monitor results

### Step 3: Explore Examples
Check out our examples directory:
- Sequential workflows
- Parallel processing
- Routing patterns
- Custom tools

## Helpful Resources
- Quick Start Guide: /docs/quickstart
- API Reference: /docs/api
- Community Forum: community.valdi.ai

Is there a specific area you'd like to explore first?`;
  } else if (agent.id === 'urgent-specialist') {
    output = `🚨 URGENT ISSUE TRIAGE 🚨

## Severity Assessment
CRITICAL - Immediate action required

## Immediate Actions
1. ✓ Issue logged with incident ID: INC-${Date.now()}
2. ⏳ Senior engineer notified
3. ⏳ Temporary workaround being prepared

## Workaround
While we investigate, try this temporary fix:
- Switch to fallback configuration
- Reduce concurrent operations
- Monitor error logs

## Status & ETA
- Current status: INVESTIGATING
- ETA for fix: 2-4 hours
- Updates: Every 30 minutes

## Escalation
This has been escalated to our on-call team. You'll receive updates via email.

Is the workaround helping? Need additional support?`;
  } else if (agent.id === 'formatter-agent') {
    const previousOutput = context.sharedData?.specialistResponse || '';
    output = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${previousOutput}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Related Resources
• Documentation: docs.valdi.ai
• Examples: github.com/valdi/examples
• Community: community.valdi.ai

## Follow-Up
Have more questions? Reply to this thread or:
• Open a support ticket
• Schedule a consultation
• Join our community forum

---
Response generated by ${context.sharedData?.classification?.type || 'specialist'} team
`;
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
        prompt: 100,
        completion: 200,
        total: 300,
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
  console.log('=== Routing Specialist Workflow Example ===\n');

  const queries = [
    'How do I implement parallel execution in my workflow?',
    'What is your enterprise pricing for 100+ users?',
    'How do I get started with Valdi AI UI?',
    'Our production system is down! Getting errors everywhere!',
  ];

  for (const query of queries) {
    console.log(`\nQuery: "${query}"\n`);
    console.log('─'.repeat(60));

    const result = await executeRoutingWorkflow(query);

    console.log(`\nStatus: ${result.status}`);
    console.log(
      `Time: ${result.endTime ? result.endTime.getTime() - result.startTime.getTime() : 0}ms`,
    );

    console.log('\nFinal Response:');
    console.log(result.results[result.results.length - 1].output);
    console.log('\n' + '═'.repeat(60) + '\n');
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  runExample().catch(console.error);
}
