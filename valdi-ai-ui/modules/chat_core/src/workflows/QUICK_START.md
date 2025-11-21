# Agent Workflows - Quick Start Guide

## Installation

```typescript
import {
  SequentialWorkflow,
  ParallelWorkflow,
  RoutingWorkflow,
  EvaluatorOptimizerWorkflow,
} from '@chat_core/workflows';
```

## 1. Sequential Workflow (5 minutes)

**When to use:** Tasks that depend on previous results

```typescript
import { SequentialWorkflowBuilder } from '@chat_core/workflows';

// Create workflow
const workflow = new SequentialWorkflowBuilder()
  .research('You are a researcher. Gather information on: {topic}')
  .analyze('You are an analyst. Analyze the research findings.')
  .summarize('You are a writer. Create a concise summary.')
  .buildExecutor(chatService, messageStore);

// Execute
const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Analyze the impact of AI on healthcare',
});

console.log(result.result);
```

## 2. Parallel Workflow (5 minutes)

**When to use:** Need multiple perspectives simultaneously

```typescript
import { ParallelWorkflowBuilder } from '@chat_core/workflows';

// Create workflow
const workflow = new ParallelWorkflowBuilder()
  .addAgent({
    id: 'optimist',
    name: 'Optimistic View',
    role: 'analysis',
    systemPrompt: 'Focus on benefits and opportunities',
  })
  .addAgent({
    id: 'critic',
    name: 'Critical View',
    role: 'analysis',
    systemPrompt: 'Focus on risks and challenges',
  })
  .aggregate('concatenate')
  .buildExecutor(chatService, messageStore);

// Execute
const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Should we adopt microservices?',
});

console.log(result.result);
```

## 3. Routing Workflow (5 minutes)

**When to use:** Route to specialized agents based on input

```typescript
import { RoutingWorkflowBuilder } from '@chat_core/workflows';

// Create workflow
const workflow = new RoutingWorkflowBuilder()
  .router(
    {
      id: 'router',
      name: 'Router',
      role: 'classification',
      systemPrompt: 'You are a routing agent',
    },
    `Classify as: code, data, or writing. Respond with ONLY the category.`
  )
  .route({
    id: 'code',
    name: 'Code Expert',
    description: 'Handles code requests',
    agent: {
      id: 'coder',
      name: 'Coder',
      role: 'coding',
      systemPrompt: 'You are a coding expert',
    },
  })
  .route({
    id: 'data',
    name: 'Data Expert',
    description: 'Handles data requests',
    agent: {
      id: 'data-analyst',
      name: 'Data Analyst',
      role: 'data',
      systemPrompt: 'You are a data expert',
    },
  })
  .fallback({
    id: 'general',
    name: 'General',
    role: 'general',
    systemPrompt: 'You are a helpful assistant',
  })
  .buildExecutor(chatService, messageStore);

// Execute
const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Help me debug this Python function',
});

console.log(result.result);
```

## 4. Evaluator-Optimizer Workflow (5 minutes)

**When to use:** Need iterative improvement with quality checks

```typescript
import { EvaluatorOptimizerWorkflowBuilder } from '@chat_core/workflows';

// Create workflow
const workflow = new EvaluatorOptimizerWorkflowBuilder()
  .generator({
    id: 'generator',
    name: 'Content Generator',
    role: 'generation',
    systemPrompt: 'Generate high-quality content',
  })
  .evaluator(
    {
      id: 'evaluator',
      name: 'Evaluator',
      role: 'evaluation',
      systemPrompt: 'Score content 0-100. Format: SCORE: [number] FEEDBACK: [text]',
    }
  )
  .optimizer({
    id: 'optimizer',
    name: 'Optimizer',
    role: 'optimization',
    systemPrompt: 'Refine content based on feedback',
  })
  .threshold(85)
  .maxIterations(3)
  .buildExecutor(chatService, messageStore);

// Execute
const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Write a blog post about TypeScript',
});

console.log(result.result);
console.log('Iterations:', workflow.getIterations().length);
```

## Progress Callbacks

Track workflow progress in real-time:

```typescript
const result = await workflow.execute({
  conversationId: 'conv_123',
  input: 'Request',
  onProgress: (event) => {
    if (event.type === 'step-complete') {
      console.log(`✓ ${event.step.agentName} completed`);
    }
  },
});
```

## Error Handling

Add retry logic:

```typescript
const workflow = new SequentialWorkflow({
  type: 'sequential',
  agents: [...],
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
  timeout: 60000,
}, chatService, messageStore);
```

## Common Patterns

### Pattern 1: Research Pipeline

```typescript
new SequentialWorkflowBuilder()
  .research('Gather information')
  .analyze('Analyze findings')
  .summarize('Create summary')
  .buildExecutor(chatService, messageStore);
```

### Pattern 2: Expert Panel

```typescript
new ParallelWorkflowBuilder()
  .addAgent(technicalExpert)
  .addAgent(businessExpert)
  .addAgent(uxExpert)
  .synthesize(synthesizer)
  .buildExecutor(chatService, messageStore);
```

### Pattern 3: Support Routing

```typescript
new RoutingWorkflowBuilder()
  .router(routerAgent, classificationPrompt)
  .route(billingRoute)
  .route(technicalRoute)
  .route(accountRoute)
  .fallback(generalAgent)
  .buildExecutor(chatService, messageStore);
```

### Pattern 4: Quality Loop

```typescript
new EvaluatorOptimizerWorkflowBuilder()
  .generator(generatorAgent)
  .evaluator(evaluatorAgent)
  .optimizer(optimizerAgent)
  .threshold(90)
  .maxIterations(3)
  .buildExecutor(chatService, messageStore);
```

## Next Steps

1. Read full documentation: `/workflows/README.md`
2. See complete examples: `/workflows/examples.ts`
3. Set up testing: `/workflows/test-utils.ts`
4. Review implementation: `WORKFLOW_IMPLEMENTATION_SUMMARY.md`

## Cheat Sheet

| Workflow | Use Case | Execution | Best For |
|----------|----------|-----------|----------|
| Sequential | Step-by-step | One after another | Dependent tasks |
| Parallel | Multi-perspective | Simultaneous | Independent views |
| Routing | Specialization | Route to expert | Domain-specific |
| EvaluatorOptimizer | Quality-driven | Iterative loop | High-quality output |

## Common Options

```typescript
{
  conversationId: string,      // Required
  input: string,              // Required
  onProgress?: callback,      // Optional
  abortSignal?: AbortSignal, // Optional
  context?: object,          // Optional
}
```

## Getting Help

- Documentation: `/workflows/README.md`
- Examples: `/workflows/examples.ts`
- Tests: `/workflows/test-utils.ts`
- Summary: `WORKFLOW_IMPLEMENTATION_SUMMARY.md`
