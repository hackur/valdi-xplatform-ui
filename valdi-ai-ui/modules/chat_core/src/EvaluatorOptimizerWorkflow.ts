/**
 * EvaluatorOptimizerWorkflow
 *
 * Implements a Generate → Evaluate → Refine loop where:
 * 1. Generator creates initial output
 * 2. Evaluator critiques and scores the output
 * 3. Optimizer refines based on evaluation
 * 4. Loop continues until quality threshold met or max iterations reached
 *
 * Use cases:
 * - Iterative content improvement
 * - Code generation with automated review
 * - Self-improving responses
 * - Quality-driven generation
 * - Automated refinement loops
 */

import {
  WorkflowExecutor,
  WorkflowConfig,
  WorkflowExecutionOptions,
  WorkflowExecutionResult,
  AgentDefinition,
  WorkflowStep,
} from './AgentWorkflow';
import { ChatService } from './ChatService';
import { MessageStore } from './MessageStore';

/**
 * Evaluation Result
 */
export interface EvaluationResult {
  /** Quality score (0-100) */
  score: number;

  /** Evaluation feedback/critique */
  feedback: string;

  /** Whether output meets quality threshold */
  acceptable: boolean;

  /** Specific issues identified */
  issues?: string[];

  /** Suggestions for improvement */
  suggestions?: string[];

  /** Raw evaluation output */
  raw: string;
}

/**
 * Iteration Result
 */
export interface IterationResult {
  /** Iteration number */
  iteration: number;

  /** Generated output */
  output: string;

  /** Evaluation result */
  evaluation: EvaluationResult;

  /** Whether iteration was successful */
  success: boolean;

  /** Timestamp */
  timestamp: Date;
}

/**
 * Evaluator-Optimizer Workflow Configuration
 */
export interface EvaluatorOptimizerWorkflowConfig extends WorkflowConfig {
  type: 'evaluator-optimizer';

  /**
   * Generator agent
   * Creates the initial output
   */
  generatorAgent: AgentDefinition;

  /**
   * Evaluator agent
   * Critiques and scores the output
   */
  evaluatorAgent: AgentDefinition & {
    /** Evaluation criteria prompt */
    evaluationCriteria?: string;
  };

  /**
   * Optimizer agent
   * Refines output based on evaluation
   */
  optimizerAgent: AgentDefinition;

  /**
   * Quality threshold (0-100)
   * Stop when score meets or exceeds this
   */
  qualityThreshold?: number;

  /**
   * Maximum number of refinement iterations
   */
  maxIterations?: number;

  /**
   * Minimum improvement between iterations
   * Stop if score doesn't improve by at least this amount
   */
  minImprovement?: number;

  /**
   * Whether to return all iterations or just final result
   */
  returnAllIterations?: boolean;

  /**
   * Custom evaluation parser
   * Parse evaluation output into structured result
   */
  parseEvaluation?: (output: string) => EvaluationResult;

  /**
   * Custom stopping condition
   */
  shouldStop?: (
    iteration: number,
    evaluation: EvaluationResult,
    previousEvaluation?: EvaluationResult
  ) => boolean;
}

/**
 * Evaluator-Optimizer Workflow Executor
 *
 * Implements iterative improvement loop with evaluation.
 *
 * Example:
 * ```typescript
 * const workflow = new EvaluatorOptimizerWorkflow({
 *   type: 'evaluator-optimizer',
 *   generatorAgent: {
 *     id: 'generator',
 *     name: 'Content Generator',
 *     role: 'generation',
 *     systemPrompt: 'Generate high-quality content based on the request...',
 *   },
 *   evaluatorAgent: {
 *     id: 'evaluator',
 *     name: 'Quality Evaluator',
 *     role: 'evaluation',
 *     systemPrompt: `Evaluate the content on these criteria:
 *       - Clarity (0-25 points)
 *       - Accuracy (0-25 points)
 *       - Completeness (0-25 points)
 *       - Style (0-25 points)
 *
 *       Provide a total score (0-100) and specific feedback.
 *       Format: SCORE: [number] FEEDBACK: [text]`,
 *     evaluationCriteria: 'Clarity, Accuracy, Completeness, Style',
 *   },
 *   optimizerAgent: {
 *     id: 'optimizer',
 *     name: 'Content Optimizer',
 *     role: 'optimization',
 *     systemPrompt: 'Refine the content based on the evaluation feedback...',
 *   },
 *   qualityThreshold: 85,
 *   maxIterations: 3,
 * }, chatService, messageStore);
 * ```
 */
export class EvaluatorOptimizerWorkflow extends WorkflowExecutor {
  protected config: EvaluatorOptimizerWorkflowConfig;
  private iterations: IterationResult[] = [];

  constructor(
    config: EvaluatorOptimizerWorkflowConfig,
    chatService: ChatService,
    messageStore: MessageStore
  ) {
    super(config, chatService, messageStore);
    this.config = config;
  }

  /**
   * Execute the evaluator-optimizer workflow
   */
  async execute(options: WorkflowExecutionOptions): Promise<WorkflowExecutionResult> {
    const { conversationId, input, onProgress, abortSignal } = options;
    const startTime = Date.now();

    const maxIterations = this.config.maxIterations || 5;
    const qualityThreshold = this.config.qualityThreshold || 90;

    // Initialize state
    this.updateState({
      status: 'running',
      startedAt: new Date(),
      totalSteps: maxIterations * 3, // Each iteration has 3 steps (gen/eval/opt)
    });

    // Emit workflow start event
    if (onProgress) {
      onProgress({
        type: 'workflow-start',
        executionId: this.state.executionId,
      });
    }

    try {
      // Step 1: Generate initial output
      if (this.config.debug) {
        console.log('[EvaluatorOptimizerWorkflow] Generating initial output');
      }

      let currentOutput = await this.generateOutput(input, conversationId, onProgress);
      let previousEvaluation: EvaluationResult | undefined;

      // Iterative refinement loop
      for (let iteration = 1; iteration <= maxIterations; iteration++) {
        if (this.config.debug) {
          console.log(`[EvaluatorOptimizerWorkflow] Iteration ${iteration}/${maxIterations}`);
        }

        // Check for cancellation
        if (abortSignal?.aborted) {
          throw new Error('Workflow cancelled by user');
        }

        // Step 2: Evaluate current output
        const evaluation = await this.evaluateOutput(
          currentOutput,
          input,
          conversationId,
          onProgress
        );

        if (this.config.debug) {
          console.log(
            `[EvaluatorOptimizerWorkflow] Evaluation score: ${evaluation.score}/100`
          );
        }

        // Store iteration result
        const iterationResult: IterationResult = {
          iteration,
          output: currentOutput,
          evaluation,
          success: evaluation.acceptable,
          timestamp: new Date(),
        };

        this.iterations.push(iterationResult);

        // Check stopping conditions
        if (this.shouldStopIteration(iteration, evaluation, previousEvaluation)) {
          if (this.config.debug) {
            console.log('[EvaluatorOptimizerWorkflow] Stopping condition met');
          }
          break;
        }

        // Don't optimize on last iteration if we've already met threshold
        if (iteration === maxIterations || evaluation.score >= qualityThreshold) {
          break;
        }

        // Step 3: Optimize based on evaluation
        currentOutput = await this.optimizeOutput(
          currentOutput,
          evaluation,
          input,
          conversationId,
          onProgress
        );

        previousEvaluation = evaluation;
      }

      // Get final result
      const finalIteration = this.iterations[this.iterations.length - 1];
      const finalResult = this.config.returnAllIterations
        ? this.formatAllIterations()
        : finalIteration.output;

      // Mark workflow as completed
      const executionTime = Date.now() - startTime;

      this.updateState({
        status: 'completed',
        result: finalResult,
        completedAt: new Date(),
        metadata: {
          ...this.state.metadata,
          iterations: this.iterations.length,
          finalScore: finalIteration.evaluation.score,
          qualityThresholdMet: finalIteration.evaluation.acceptable,
        },
      });

      const totalTokens = this.calculateTotalTokens();

      // Emit workflow complete event
      if (onProgress) {
        onProgress({
          type: 'workflow-complete',
          result: finalResult,
          state: this.state,
        });
      }

      return {
        result: finalResult,
        state: this.state,
        messages: this.messageStore.getMessages(conversationId),
        totalTokens,
        executionTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.updateState({
        status: 'error',
        error: errorMessage,
        completedAt: new Date(),
      });

      // Emit workflow error event
      if (onProgress) {
        onProgress({
          type: 'workflow-error',
          error: errorMessage,
          state: this.state,
        });
      }

      throw error;
    }
  }

  /**
   * Generate output using generator agent
   */
  private async generateOutput(
    input: string,
    conversationId: string,
    onProgress?: any
  ): Promise<string> {
    const step = await this.executeAgentWithRetry(
      this.config.generatorAgent,
      input,
      conversationId,
      onProgress
    );

    this.addStep(step);
    return step.output;
  }

  /**
   * Evaluate output using evaluator agent
   */
  private async evaluateOutput(
    output: string,
    originalInput: string,
    conversationId: string,
    onProgress?: any
  ): Promise<EvaluationResult> {
    const evaluationPrompt = this.config.evaluatorAgent.evaluationCriteria
      ? `${this.config.evaluatorAgent.evaluationCriteria}\n\nOriginal Request: ${originalInput}\n\nOutput to Evaluate:\n${output}`
      : `Evaluate the following output based on the original request.\n\nOriginal Request: ${originalInput}\n\nOutput:\n${output}`;

    const step = await this.executeAgentWithRetry(
      this.config.evaluatorAgent,
      evaluationPrompt,
      conversationId,
      onProgress
    );

    this.addStep(step);

    // Parse evaluation
    return this.parseEvaluationResult(step.output);
  }

  /**
   * Optimize output using optimizer agent
   */
  private async optimizeOutput(
    output: string,
    evaluation: EvaluationResult,
    originalInput: string,
    conversationId: string,
    onProgress?: any
  ): Promise<string> {
    const optimizationPrompt = `Original Request: ${originalInput}\n\nCurrent Output:\n${output}\n\nEvaluation Feedback (Score: ${evaluation.score}/100):\n${evaluation.feedback}\n\nPlease refine the output to address the feedback and improve quality.`;

    const step = await this.executeAgentWithRetry(
      this.config.optimizerAgent,
      optimizationPrompt,
      conversationId,
      onProgress
    );

    this.addStep(step);
    return step.output;
  }

  /**
   * Parse evaluation result from evaluator output
   */
  private parseEvaluationResult(output: string): EvaluationResult {
    // Use custom parser if provided
    if (this.config.parseEvaluation) {
      return this.config.parseEvaluation(output);
    }

    // Default parsing logic
    const result: EvaluationResult = {
      score: 0,
      feedback: output,
      acceptable: false,
      raw: output,
    };

    // Try to extract score
    const scoreMatch = output.match(/(?:SCORE|Score|score):\s*(\d+)/i);
    if (scoreMatch) {
      result.score = parseInt(scoreMatch[1], 10);
    } else {
      // Look for score/rating pattern
      const ratingMatch = output.match(/(\d+)\s*\/\s*100/);
      if (ratingMatch) {
        result.score = parseInt(ratingMatch[1], 10);
      }
    }

    // Extract feedback
    const feedbackMatch = output.match(/(?:FEEDBACK|Feedback|feedback):\s*(.+)/is);
    if (feedbackMatch) {
      result.feedback = feedbackMatch[1].trim();
    }

    // Check if acceptable
    const threshold = this.config.qualityThreshold || 90;
    result.acceptable = result.score >= threshold;

    // Try to extract issues
    const issuesMatch = output.match(/(?:ISSUES|Issues|issues):\s*(.+?)(?=\n\n|$)/is);
    if (issuesMatch) {
      result.issues = issuesMatch[1]
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0);
    }

    // Try to extract suggestions
    const suggestionsMatch = output.match(/(?:SUGGESTIONS|Suggestions|suggestions):\s*(.+?)(?=\n\n|$)/is);
    if (suggestionsMatch) {
      result.suggestions = suggestionsMatch[1]
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    return result;
  }

  /**
   * Check if iteration should stop
   */
  private shouldStopIteration(
    iteration: number,
    evaluation: EvaluationResult,
    previousEvaluation?: EvaluationResult
  ): boolean {
    // Use custom stopping condition if provided
    if (this.config.shouldStop) {
      return this.config.shouldStop(iteration, evaluation, previousEvaluation);
    }

    // Check quality threshold
    const threshold = this.config.qualityThreshold || 90;
    if (evaluation.score >= threshold) {
      return true;
    }

    // Check minimum improvement
    if (previousEvaluation && this.config.minImprovement) {
      const improvement = evaluation.score - previousEvaluation.score;
      if (improvement < this.config.minImprovement && improvement >= 0) {
        if (this.config.debug) {
          console.log(
            `[EvaluatorOptimizerWorkflow] Insufficient improvement: ${improvement} < ${this.config.minImprovement}`
          );
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Format all iterations for output
   */
  private formatAllIterations(): string {
    const sections = this.iterations.map((iter, index) => {
      return `## Iteration ${iter.iteration}\n\n` +
        `**Score:** ${iter.evaluation.score}/100\n\n` +
        `**Feedback:** ${iter.evaluation.feedback}\n\n` +
        `**Output:**\n${iter.output}`;
    });

    const finalIter = this.iterations[this.iterations.length - 1];

    return sections.join('\n\n---\n\n') +
      `\n\n## Final Result (Score: ${finalIter.evaluation.score}/100)\n\n` +
      finalIter.output;
  }

  /**
   * Get all iteration results
   */
  getIterations(): IterationResult[] {
    return [...this.iterations];
  }

  /**
   * Get final iteration
   */
  getFinalIteration(): IterationResult | undefined {
    return this.iterations[this.iterations.length - 1];
  }

  /**
   * Get score progression
   */
  getScoreProgression(): number[] {
    return this.iterations.map(iter => iter.evaluation.score);
  }

  /**
   * Reset iterations (allows reuse of workflow)
   */
  reset(): void {
    super.reset();
    this.iterations = [];
  }
}

/**
 * Evaluator-Optimizer Workflow Builder
 */
export class EvaluatorOptimizerWorkflowBuilder {
  private config: Partial<EvaluatorOptimizerWorkflowConfig> = {
    type: 'evaluator-optimizer',
  };

  /**
   * Set generator agent
   */
  generator(agent: AgentDefinition): this {
    this.config.generatorAgent = agent;
    return this;
  }

  /**
   * Set evaluator agent
   */
  evaluator(agent: AgentDefinition, criteria?: string): this {
    this.config.evaluatorAgent = {
      ...agent,
      evaluationCriteria: criteria,
    };
    return this;
  }

  /**
   * Set optimizer agent
   */
  optimizer(agent: AgentDefinition): this {
    this.config.optimizerAgent = agent;
    return this;
  }

  /**
   * Set quality threshold
   */
  threshold(score: number): this {
    this.config.qualityThreshold = score;
    return this;
  }

  /**
   * Set max iterations
   */
  maxIterations(count: number): this {
    this.config.maxIterations = count;
    return this;
  }

  /**
   * Set minimum improvement
   */
  minImprovement(score: number): this {
    this.config.minImprovement = score;
    return this;
  }

  /**
   * Return all iterations in result
   */
  returnAllIterations(): this {
    this.config.returnAllIterations = true;
    return this;
  }

  /**
   * Set custom evaluation parser
   */
  parseWith(parser: (output: string) => EvaluationResult): this {
    this.config.parseEvaluation = parser;
    return this;
  }

  /**
   * Set custom stopping condition
   */
  stopWhen(
    condition: (
      iteration: number,
      evaluation: EvaluationResult,
      previousEvaluation?: EvaluationResult
    ) => boolean
  ): this {
    this.config.shouldStop = condition;
    return this;
  }

  /**
   * Enable debug logging
   */
  debug(): this {
    this.config.debug = true;
    return this;
  }

  /**
   * Build the workflow configuration
   */
  build(): EvaluatorOptimizerWorkflowConfig {
    if (!this.config.generatorAgent) {
      throw new Error('Generator agent is required');
    }
    if (!this.config.evaluatorAgent) {
      throw new Error('Evaluator agent is required');
    }
    if (!this.config.optimizerAgent) {
      throw new Error('Optimizer agent is required');
    }

    return this.config as EvaluatorOptimizerWorkflowConfig;
  }

  /**
   * Build and create executor
   */
  buildExecutor(
    chatService: ChatService,
    messageStore: MessageStore
  ): EvaluatorOptimizerWorkflow {
    return new EvaluatorOptimizerWorkflow(this.build(), chatService, messageStore);
  }
}

/**
 * Helper function to create an evaluator-optimizer workflow
 */
export function createEvaluatorOptimizerWorkflow(
  generatorAgent: AgentDefinition,
  evaluatorAgent: EvaluatorOptimizerWorkflowConfig['evaluatorAgent'],
  optimizerAgent: AgentDefinition,
  options?: Partial<EvaluatorOptimizerWorkflowConfig>
): EvaluatorOptimizerWorkflowConfig {
  return {
    type: 'evaluator-optimizer',
    generatorAgent,
    evaluatorAgent,
    optimizerAgent,
    qualityThreshold: 90,
    maxIterations: 5,
    ...options,
  };
}
