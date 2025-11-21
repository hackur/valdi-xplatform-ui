# Agent Workflows

Comprehensive multi-agent workflow infrastructure for orchestrating AI agents using AI SDK v5.

## Overview

The workflow system provides four core patterns for multi-agent collaboration:

1. **Sequential Workflow** - Execute agents one after another, passing output to next agent
2. **Parallel Workflow** - Execute multiple agents simultaneously, combine results
3. **Routing Workflow** - Use classifier agent to route to specialized agents
4. **Evaluator-Optimizer Workflow** - Generate → Evaluate → Refine loop

All workflows integrate seamlessly with `ChatService`, support AI SDK v5 multi-step execution (`maxSteps`), handle errors and retries, and provide progress callbacks.

## Installation

Workflows are part of the `@chat_core` module:

```typescript
import {
  SequentialWorkflow,
  ParallelWorkflow,
  RoutingWorkflow,
  EvaluatorOptimizerWorkflow,
} from '@chat_core/workflows';
```

## Sequential Workflow

Execute agents in sequence, where each agent processes the output of the previous agent.

### Use Cases
- Multi-step reasoning tasks
- Research → Analysis → Summary pipelines
- Code generation → Review → Optimization
- Translation → Refinement → Quality check

### Example

```typescript
import { SequentialWorkflowBuilder } from '@chat_core/workflows';

const workflow = new SequentialWorkflowBuilder()
  .research('You are a research assistant. Gather comprehensive information on the topic.')
  .analyze('You are a data analyst. Analyze the research findings and identify key insights.')
  .summarize('You are a summarization expert. Create a concise executive summary.')
  .withContext() // Include previous context in each step
  .debug()
  .buildExecutor(chatService, messageStore);

const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Research the impact of AI on healthcare',
  onProgress: (event) => {
    if (event.type === 'step-complete') {
      console.log(`Completed: ${event.step.agentName}`);
    }
  },
});

console.log(result.result); // Final summary
```

### Custom Sequential Workflow

```typescript
const workflow = new SequentialWorkflow({
  type: 'sequential',
  agents: [
    {
      id: 'coder',
      name: 'Code Generator',
      role: 'coding',
      systemPrompt: 'Generate clean, well-documented code.',
      modelConfig: { provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
    },
    {
      id: 'reviewer',
      name: 'Code Reviewer',
      role: 'review',
      systemPrompt: 'Review code for bugs, security issues, and best practices.',
      modelConfig: { provider: 'openai', modelId: 'gpt-4-turbo' },
    },
    {
      id: 'optimizer',
      name: 'Code Optimizer',
      role: 'optimization',
      systemPrompt: 'Optimize code for performance and maintainability.',
    },
  ],
  includePreviousContext: false, // Each agent only sees previous output
  transformOutput: (output, index) => {
    // Clean or format output between steps
    return output.trim();
  },
}, chatService, messageStore);
```

## Parallel Workflow

Execute multiple agents simultaneously and aggregate their results.

### Use Cases
- Multi-perspective analysis
- Ensemble predictions
- Comparative evaluations
- Parallel research from different viewpoints
- Consensus building

### Example

```typescript
import { ParallelWorkflowBuilder } from '@chat_core/workflows';

const workflow = new ParallelWorkflowBuilder()
  .addAgent({
    id: 'optimist',
    name: 'Optimistic Analyst',
    role: 'optimistic-analysis',
    systemPrompt: 'Focus on positive aspects, opportunities, and benefits.',
  })
  .addAgent({
    id: 'pessimist',
    name: 'Critical Analyst',
    role: 'critical-analysis',
    systemPrompt: 'Focus on risks, challenges, and potential problems.',
  })
  .addAgent({
    id: 'realist',
    name: 'Balanced Analyst',
    role: 'balanced-analysis',
    systemPrompt: 'Provide objective, balanced analysis.',
  })
  .aggregate('concatenate') // Combine all outputs
  .synthesize({
    id: 'synthesizer',
    name: 'Synthesizer',
    role: 'synthesis',
    systemPrompt: 'Synthesize multiple perspectives into coherent analysis.',
  })
  .requireMin(2) // At least 2 agents must succeed
  .maxWait(30000) // 30 second timeout
  .debug()
  .buildExecutor(chatService, messageStore);

const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Analyze the business opportunity for AI-powered code review tools',
});
```

### Aggregation Strategies

```typescript
// Concatenate all outputs
.aggregate('concatenate')

// Vote on most common result
.aggregate('vote')

// Use first completed result (race mode)
.aggregate('first')

// Custom aggregation
.customAggregator((outputs, steps) => {
  // Custom logic to combine outputs
  return outputs.join('\n\n=====\n\n');
})
```

## Routing Workflow

Use a classifier agent to analyze input and route to specialized agents.

### Use Cases
- Customer service routing (billing, technical, sales)
- Topic-based expert routing
- Complexity-based routing (simple vs complex)
- Multi-domain applications
- Intent-based task delegation

### Example

```typescript
import { RoutingWorkflowBuilder } from '@chat_core/workflows';

const workflow = new RoutingWorkflowBuilder()
  .router(
    {
      id: 'router',
      name: 'Router',
      role: 'classification',
      systemPrompt: 'You are a routing agent.',
    },
    `Classify the request into one of these categories:
    - code: Programming, debugging, code review
    - data: Data analysis, statistics, visualization
    - writing: Content creation, editing
    - general: General questions

    Respond with ONLY the category name.`
  )
  .route({
    id: 'code',
    name: 'Code Specialist',
    description: 'Handles programming requests',
    triggers: ['code', 'programming', 'debug'],
    agent: {
      id: 'code-agent',
      name: 'Code Expert',
      role: 'coding',
      systemPrompt: 'You are an expert programmer...',
    },
  })
  .route({
    id: 'data',
    name: 'Data Analyst',
    description: 'Handles data analysis',
    triggers: ['data', 'analytics', 'statistics'],
    agent: {
      id: 'data-agent',
      name: 'Data Expert',
      role: 'data-analysis',
      systemPrompt: 'You are a data analysis expert...',
    },
  })
  .fallback({
    id: 'general',
    name: 'General Assistant',
    role: 'general',
    systemPrompt: 'You are a helpful assistant...',
  })
  .withExplanation() // Include routing decision in output
  .debug()
  .buildExecutor(chatService, messageStore);

const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Help me debug this Python function',
});

// Get routing information
const classification = workflow.getClassification();
const selectedRoutes = workflow.getSelectedRoutes();
```

## Evaluator-Optimizer Workflow

Iterative improvement loop: Generate → Evaluate → Refine.

### Use Cases
- Iterative content improvement
- Code generation with automated review
- Self-improving responses
- Quality-driven generation
- Automated refinement loops

### Example

```typescript
import { EvaluatorOptimizerWorkflowBuilder } from '@chat_core/workflows';

const workflow = new EvaluatorOptimizerWorkflowBuilder()
  .generator({
    id: 'generator',
    name: 'Content Generator',
    role: 'generation',
    systemPrompt: 'Generate high-quality content.',
  })
  .evaluator(
    {
      id: 'evaluator',
      name: 'Quality Evaluator',
      role: 'evaluation',
      systemPrompt: `Evaluate content on:
        - Clarity (0-25 points)
        - Accuracy (0-25 points)
        - Completeness (0-25 points)
        - Style (0-25 points)

        Format: SCORE: [number] FEEDBACK: [detailed feedback]`,
    },
    'Clarity, Accuracy, Completeness, Style'
  )
  .optimizer({
    id: 'optimizer',
    name: 'Content Optimizer',
    role: 'optimization',
    systemPrompt: 'Refine content based on evaluation feedback.',
  })
  .threshold(85) // Stop when score >= 85
  .maxIterations(3)
  .minImprovement(5) // Stop if improvement < 5 points
  .returnAllIterations() // Include all iterations in result
  .debug()
  .buildExecutor(chatService, messageStore);

const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Write a technical blog post about microservices architecture',
  onProgress: (event) => {
    if (event.type === 'step-complete') {
      console.log(`Step: ${event.step.agentName}`);
    }
  },
});

// Get iteration details
const iterations = workflow.getIterations();
const scoreProgression = workflow.getScoreProgression(); // [65, 78, 87]
const finalIteration = workflow.getFinalIteration();

console.log(`Final score: ${finalIteration.evaluation.score}`);
```

### Custom Evaluation Parser

```typescript
.parseWith((output) => {
  // Custom parsing logic
  const score = extractScore(output);
  const feedback = extractFeedback(output);

  return {
    score,
    feedback,
    acceptable: score >= 85,
    raw: output,
  };
})
```

## Progress Callbacks

All workflows support progress callbacks for real-time updates:

```typescript
const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Your request',
  onProgress: (event) => {
    switch (event.type) {
      case 'workflow-start':
        console.log('Workflow started:', event.executionId);
        break;

      case 'step-start':
        console.log('Step started:', event.step.agentName);
        break;

      case 'step-progress':
        // Streaming content
        console.log('Delta:', event.delta);
        break;

      case 'step-complete':
        console.log('Step completed:', event.step.agentName);
        console.log('Output:', event.step.output);
        break;

      case 'step-error':
        console.error('Step error:', event.error);
        break;

      case 'workflow-complete':
        console.log('Workflow completed!');
        console.log('Result:', event.result);
        break;

      case 'workflow-error':
        console.error('Workflow error:', event.error);
        break;
    }
  },
});
```

## Error Handling and Retries

Configure retry behavior for resilient workflows:

```typescript
const config = {
  type: 'sequential',
  agents: [...],
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryableErrors: ['timeout', 'rate_limit'],
  },
  timeout: 60000, // 60 second overall timeout
};

const workflow = new SequentialWorkflow(config, chatService, messageStore);
```

## Workflow State Management

Access workflow state at any time:

```typescript
const state = workflow.getState();

console.log(state.status); // 'idle' | 'running' | 'completed' | 'error' | 'cancelled'
console.log(state.steps); // Array of completed steps
console.log(state.currentStepIndex);
console.log(state.metadata);

// Cancel workflow
workflow.cancel();

// Reset workflow for reuse
workflow.reset();
```

## AI SDK v5 Integration

All workflows use AI SDK v5's `maxSteps` for multi-agent execution:

```typescript
{
  id: 'agent',
  name: 'Agent',
  role: 'role',
  systemPrompt: 'You are an agent...',
  maxSteps: 5, // Enable multi-step agentic loops per agent
}
```

This allows each agent to perform tool calling and multi-step reasoning within their execution.

## Best Practices

### 1. Choose the Right Workflow

- **Sequential**: When tasks have dependencies (output of one feeds next)
- **Parallel**: When you need multiple independent perspectives
- **Routing**: When you have specialized agents for different domains
- **Evaluator-Optimizer**: When iterative improvement is needed

### 2. Model Selection

Use different models for different agents based on their strengths:

```typescript
{
  generatorAgent: {
    modelConfig: { provider: 'openai', modelId: 'gpt-4-turbo' }
  },
  evaluatorAgent: {
    modelConfig: { provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' }
  },
}
```

### 3. System Prompts

Write clear, specific system prompts that define the agent's role:

```typescript
systemPrompt: `You are a code reviewer specializing in security.

Your responsibilities:
- Identify security vulnerabilities
- Check for common attack vectors (SQL injection, XSS, etc.)
- Verify input validation
- Review authentication and authorization

Provide specific, actionable feedback.`
```

### 4. Debug Mode

Enable debug logging during development:

```typescript
.debug() // or debug: true in config
```

### 5. Resource Management

- Set appropriate timeouts
- Configure retry limits
- Use `minSuccessfulAgents` for parallel workflows
- Implement early stopping conditions

## TypeScript Support

All workflows are fully typed:

```typescript
import type {
  WorkflowExecutionResult,
  WorkflowState,
  WorkflowProgressEvent,
  AgentDefinition,
} from '@chat_core/workflows';

const handleProgress = (event: WorkflowProgressEvent) => {
  // Full type safety
};

const result: WorkflowExecutionResult = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Request',
  onProgress: handleProgress,
});
```

## Performance Considerations

1. **Parallel Workflows**: Use for independent tasks to reduce total execution time
2. **Streaming**: Enable streaming for better UX with long-running workflows
3. **Caching**: Consider implementing caching for repeated evaluations
4. **Token Usage**: Monitor token consumption across workflow steps
5. **Timeouts**: Set appropriate timeouts to prevent hanging workflows

## License

Part of the valdi-ai-ui project.
