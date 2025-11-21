/**
 * EvaluatorOptimizerDemo
 *
 * Example of an evaluator-optimizer workflow that iteratively refines output:
 * 1. Initial Generation - Create first draft
 * 2. Evaluation - Assess quality and identify issues
 * 3. Optimization - Improve based on feedback
 * 4. Repeat steps 2-3 until quality threshold is met
 * 5. Final Review - Verify the final output
 */

import { WorkflowExecutionState, WorkflowStep } from '../WorkflowCard';

/**
 * State update callback
 */
type StateUpdateCallback = (state: Partial<WorkflowExecutionState>) => void;

/**
 * Simulate evaluator-optimizer workflow execution
 */
export async function runEvaluatorOptimizerDemo(
  onStateUpdate: StateUpdateCallback
): Promise<string> {
  const maxIterations = 2; // Limit iterations for demo
  const steps: WorkflowStep[] = [
    {
      name: 'Initial Generator',
      description: 'Creating initial draft of the content',
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
  let currentQuality = 0;
  let currentOutput = '';

  // Step 1: Initial generation
  const generatorStep = steps[0];
  generatorStep.status = 'running';
  generatorStep.startTime = Date.now();

  onStateUpdate({
    steps: [...steps],
    currentStep: 0,
  });

  await sleep(1500);

  currentOutput =
    'AI workflows coordinate agents for complex tasks. They use patterns like sequential and parallel execution.';
  currentQuality = 60;

  generatorStep.status = 'completed';
  generatorStep.output = `Generated draft (Quality: ${currentQuality}%): ${currentOutput}`;
  generatorStep.endTime = Date.now();

  onStateUpdate({
    steps: [...steps],
  });

  await sleep(500);

  // Iterative refinement
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Evaluation step
    const evalStep: WorkflowStep = {
      name: `Evaluator (Iteration ${iteration + 1})`,
      description: 'Evaluating quality and identifying improvements',
      status: 'running',
      startTime: Date.now(),
    };
    steps.push(evalStep);

    onStateUpdate({
      steps: [...steps],
      currentStep: steps.length - 1,
    });

    await sleep(1200);

    const issues: string[] = [];
    if (currentQuality < 70) {
      issues.push('lacks detail on workflow benefits');
    }
    if (currentQuality < 80) {
      issues.push('missing concrete examples');
    }
    if (currentQuality < 90) {
      issues.push('could improve clarity');
    }

    evalStep.status = 'completed';
    evalStep.output = `Quality Score: ${currentQuality}%. Issues found: ${issues.join(', ')}. Recommendation: ${currentQuality >= 85 ? 'Accept' : 'Optimize'}`;
    evalStep.endTime = Date.now();

    onStateUpdate({
      steps: [...steps],
    });

    await sleep(500);

    // Check if quality threshold met
    if (currentQuality >= 85) {
      break;
    }

    // Optimization step
    const optimizerStep: WorkflowStep = {
      name: `Optimizer (Iteration ${iteration + 1})`,
      description: 'Improving content based on evaluation feedback',
      status: 'running',
      startTime: Date.now(),
    };
    steps.push(optimizerStep);

    onStateUpdate({
      steps: [...steps],
      currentStep: steps.length - 1,
    });

    await sleep(1800);

    // Improve output based on iteration
    if (iteration === 0) {
      currentOutput =
        'AI workflows coordinate multiple agents to solve complex tasks efficiently. They use patterns like sequential execution (linear processing), parallel execution (concurrent operations), routing (conditional branching), and evaluator-optimizer (iterative refinement). These patterns enable scalable automation of sophisticated processes.';
      currentQuality = 75;
    } else {
      currentOutput =
        'AI workflows are orchestration patterns that coordinate multiple AI agents to solve complex tasks efficiently. Key patterns include: Sequential (step-by-step processing for linear tasks), Parallel (concurrent execution for independent operations), Routing (intelligent branching based on classification), and Evaluator-Optimizer (iterative refinement with quality feedback). These patterns deliver 40-60% efficiency gains in real-world applications like research automation, content generation, and data analysis.';
      currentQuality = 88;
    }

    optimizerStep.status = 'completed';
    optimizerStep.output = `Optimized content (Quality: ${currentQuality}%): ${currentOutput}`;
    optimizerStep.endTime = Date.now();

    onStateUpdate({
      steps: [...steps],
    });

    await sleep(500);
  }

  // Final review
  const reviewStep: WorkflowStep = {
    name: 'Final Review',
    description: 'Conducting final quality verification',
    status: 'running',
    startTime: Date.now(),
  };
  steps.push(reviewStep);

  onStateUpdate({
    steps: [...steps],
    currentStep: steps.length - 1,
  });

  await sleep(1000);

  reviewStep.status = 'completed';
  reviewStep.output = `Final quality score: ${currentQuality}%. Content approved. Refinement complete after ${Math.floor(steps.length / 2)} iteration(s).`;
  reviewStep.endTime = Date.now();

  onStateUpdate({
    steps: [...steps],
  });

  const totalTime = Date.now() - startTime;
  const finalResult = `Final Refined Output (${currentQuality}% quality):\n\n${currentOutput}\n\n[Achieved through ${Math.floor(steps.length / 2)} iteration(s) of evaluation and optimization]`;

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
