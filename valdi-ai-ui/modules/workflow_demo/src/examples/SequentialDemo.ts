/**
 * SequentialDemo
 *
 * Example of a sequential workflow that executes three steps in order:
 * 1. Research - Gather information about a topic
 * 2. Analysis - Analyze the gathered information
 * 3. Summary - Create a concise summary
 */

import { WorkflowExecutionState, WorkflowStep } from '../WorkflowCard';

/**
 * State update callback
 */
type StateUpdateCallback = (state: Partial<WorkflowExecutionState>) => void;

/**
 * Simulate sequential workflow execution
 */
export async function runSequentialDemo(
  onStateUpdate: StateUpdateCallback,
): Promise<string> {
  const steps: WorkflowStep[] = [
    {
      name: 'Research Agent',
      description: 'Gathering information about AI workflow patterns',
      status: 'pending',
    },
    {
      name: 'Analysis Agent',
      description: 'Analyzing the research findings',
      status: 'pending',
    },
    {
      name: 'Summary Agent',
      description: 'Creating a concise summary',
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
  let previousOutput = 'Topic: AI workflow patterns for complex applications';

  // Execute each step sequentially
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step) continue;
    step.status = 'running';
    step.startTime = Date.now();

    // Update state to show current step
    onStateUpdate({
      steps: [...steps],
      currentStep: i,
    });

    // Simulate agent execution
    await sleep(1500 + Math.random() * 1000);

    // Generate step output based on previous step
    let output = '';
    switch (i) {
      case 0: // Research
        output =
          'Found 4 main workflow patterns: Sequential (linear processing), Parallel (concurrent execution), Routing (conditional branching), and Evaluator-Optimizer (iterative refinement). Each has distinct use cases and benefits.';
        break;
      case 1: // Analysis
        output = `Based on research: ${previousOutput.substring(0, 50)}... Analysis shows that Sequential workflows are best for linear tasks, Parallel for independent operations, Routing for conditional logic, and Evaluator-Optimizer for quality refinement.`;
        break;
      case 2: // Summary
        output = `Final Summary: AI workflow patterns provide structured approaches to complex tasks. Sequential workflows process steps linearly, Parallel workflows execute concurrently, Routing workflows branch conditionally, and Evaluator-Optimizer workflows refine iteratively. Choose based on task requirements.`;
        break;
    }

    step.status = 'completed';
    step.output = output;
    step.endTime = Date.now();
    previousOutput = output;

    // Update state
    onStateUpdate({
      steps: [...steps],
    });

    // Small delay before next step
    await sleep(500);
  }

  const totalTime = Date.now() - startTime;
  const finalResult = steps[steps.length - 1]?.output || '';

  // Mark as completed
  onStateUpdate({
    status: 'completed',
    result: finalResult,
    totalTime,
  });

  return finalResult;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
