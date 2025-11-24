/**
 * ParallelDemo
 *
 * Example of a parallel workflow that executes multiple steps simultaneously:
 * 1. News Search - Search recent news articles
 * 2. Academic Search - Search academic papers
 * 3. Social Media - Analyze social media trends
 * 4. Aggregation - Combine all results
 */

import { WorkflowExecutionState, WorkflowStep } from '../WorkflowCard';

/**
 * State update callback
 */
type StateUpdateCallback = (state: Partial<WorkflowExecutionState>) => void;

/**
 * Simulate parallel workflow execution
 */
export async function runParallelDemo(
  onStateUpdate: StateUpdateCallback,
): Promise<string> {
  const steps: WorkflowStep[] = [
    {
      name: 'News Search',
      description: 'Searching recent news articles about AI workflows',
      status: 'pending',
    },
    {
      name: 'Academic Search',
      description: 'Searching academic papers and research',
      status: 'pending',
    },
    {
      name: 'Social Media Analysis',
      description: 'Analyzing social media discussions and trends',
      status: 'pending',
    },
    {
      name: 'Aggregation',
      description: 'Combining and synthesizing all research sources',
      status: 'pending',
    },
  ];

  // Initialize state
  onStateUpdate({
    status: 'running',
    steps: [...steps],
    currentStep: 0,
  });

  const startTime = Date.now();

  // Execute first 3 steps in parallel
  const parallelSteps = steps.slice(0, 3);
  const parallelPromises = parallelSteps.map((step, index) =>
    executeParallelStep(step, index, steps, onStateUpdate),
  );

  // Wait for all parallel steps to complete
  const parallelResults = await Promise.all(parallelPromises);

  // Small delay before aggregation
  await sleep(500);

  // Execute aggregation step
  const aggregationStep = steps[3];
  if (aggregationStep) {
    aggregationStep.status = 'running';
    aggregationStep.startTime = Date.now();

    onStateUpdate({
      steps: [...steps],
      currentStep: 3,
    });

    await sleep(1500);

    aggregationStep.status = 'completed';
    aggregationStep.output = `Aggregated Results: Combined insights from ${parallelResults.length} sources. News coverage shows growing adoption of AI workflows. Academic research highlights efficiency gains of 40-60%. Social media indicates strong developer interest. Consensus: AI workflows are becoming essential for complex applications.`;
    aggregationStep.endTime = Date.now();
  }

  onStateUpdate({
    steps: [...steps],
  });

  const totalTime = Date.now() - startTime;
  const finalResult = aggregationStep?.output || '';

  // Mark as completed
  onStateUpdate({
    status: 'completed',
    result: finalResult,
    totalTime,
  });

  return finalResult;
}

/**
 * Execute a single parallel step
 */
async function executeParallelStep(
  step: WorkflowStep,
  index: number,
  allSteps: WorkflowStep[],
  onStateUpdate: StateUpdateCallback,
): Promise<string> {
  step.status = 'running';
  step.startTime = Date.now();

  onStateUpdate({
    steps: [...allSteps],
    currentStep: index,
  });

  // Simulate varying execution times
  const executionTime = 1000 + Math.random() * 2000;
  await sleep(executionTime);

  // Generate output based on step type
  let output = '';
  switch (index) {
    case 0: // News
      output =
        'Found 12 recent articles. Key themes: AI workflow adoption in enterprises, efficiency improvements, integration challenges, and future trends.';
      break;
    case 1: // Academic
      output =
        'Found 8 relevant papers. Research shows 40-60% efficiency gains with workflow patterns. Sequential and Parallel patterns most studied.';
      break;
    case 2: // Social Media
      output =
        'Analyzed 500+ discussions. Strong developer interest in workflow patterns. Common topics: implementation examples, best practices, tooling.';
      break;
  }

  step.status = 'completed';
  step.output = output;
  step.endTime = Date.now();

  onStateUpdate({
    steps: [...allSteps],
  });

  return output;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
