/**
 * WorkflowEngine
 *
 * Orchestrates multi-agent workflows with different execution patterns.
 * Manages workflow lifecycle and coordinates agent execution.
 */

import {
  AgentDefinition,
  AgentContext,
  AgentExecutionResult,
  WorkflowConfig,
  WorkflowExecutionState,
  WorkflowStatus,
} from './types';
import { AgentRegistry } from './AgentRegistry';
import { ChatService } from '@chat_core/ChatService';
import { MessageUtils } from '@common/types';

/**
 * Workflow Engine Class
 *
 * Manages workflow execution and agent coordination.
 */
export class WorkflowEngine {
  private registry: AgentRegistry;
  private chatService: ChatService;
  private activeWorkflows: Map<string, WorkflowExecutionState> = new Map();

  constructor(registry: AgentRegistry, chatService: ChatService) {
    this.registry = registry;
    this.chatService = chatService;
  }

  /**
   * Execute a workflow
   * @param config Workflow configuration
   * @param context Execution context
   * @returns Workflow execution state
   */
  async execute(
    config: WorkflowConfig,
    context: AgentContext,
  ): Promise<WorkflowExecutionState> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const state: WorkflowExecutionState = {
      id: workflowId,
      config,
      status: 'running',
      startTime: new Date(),
      currentStep: 0,
      results: [],
    };

    this.activeWorkflows.set(workflowId, state);

    try {
      console.log(
        `[WorkflowEngine] Starting workflow: ${config.name} (${config.type})`,
      );

      // Execute based on workflow type
      switch (config.type) {
        case 'sequential':
          await this.executeSequential(state, context);
          break;

        case 'parallel':
          await this.executeParallel(state, context);
          break;

        case 'routing':
          await this.executeRouting(state, context);
          break;

        case 'evaluator-optimizer':
          await this.executeEvaluatorOptimizer(state, context);
          break;

        default:
          throw new Error(`Unknown workflow type: ${config.type}`);
      }

      state.status = 'completed';
      state.endTime = new Date();

      console.log(
        `[WorkflowEngine] Completed workflow: ${config.name} in ${state.endTime.getTime() - state.startTime.getTime()}ms`,
      );
    } catch (error) {
      console.error(`[WorkflowEngine] Workflow failed:`, error);
      state.status = 'failed';
      state.error = error instanceof Error ? error.message : String(error);
      state.endTime = new Date();
    } finally {
      this.activeWorkflows.delete(workflowId);
    }

    return state;
  }

  /**
   * Execute agents sequentially
   */
  private async executeSequential(
    state: WorkflowExecutionState,
    context: AgentContext,
  ): Promise<void> {
    const { config } = state;
    let currentContext = { ...context };

    for (const agentId of config.agents) {
      // Check stop condition
      if (config.stopWhen && config.stopWhen(state.results)) {
        console.log(`[WorkflowEngine] Stop condition met at agent ${agentId}`);
        break;
      }

      // Check max steps
      if (config.maxSteps && state.currentStep >= config.maxSteps) {
        console.log(`[WorkflowEngine] Max steps reached: ${config.maxSteps}`);
        break;
      }

      const agent = this.registry.get(agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      console.log(
        `[WorkflowEngine] Executing agent: ${agent.name} (step ${state.currentStep + 1})`,
      );

      const result = await this.executeAgent(agent, currentContext);
      state.results.push(result);
      state.currentStep++;

      // Pass output to next agent
      if (result.output) {
        currentContext.sharedData = {
          ...currentContext.sharedData,
          previousOutput: result.output,
          previousAgent: agentId,
        };
      }

      // Add generated messages to context for next agent
      if (result.messages.length > 0) {
        currentContext.messages = [
          ...currentContext.messages,
          ...result.messages,
        ];
      }
    }
  }

  /**
   * Execute agents in parallel
   */
  private async executeParallel(
    state: WorkflowExecutionState,
    context: AgentContext,
  ): Promise<void> {
    const { config } = state;

    console.log(
      `[WorkflowEngine] Executing ${config.agents.length} agents in parallel`,
    );

    const agentPromises = config.agents.map((agentId) => {
      const agent = this.registry.get(agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      return this.executeAgent(agent, context);
    });

    const results = await Promise.all(agentPromises);
    state.results = results;
    state.currentStep = config.agents.length;
  }

  /**
   * Execute with routing logic
   */
  private async executeRouting(
    state: WorkflowExecutionState,
    context: AgentContext,
  ): Promise<void> {
    const { config } = state;

    // Use first agent as router
    const routerAgentId = config.agents[0];
    const routerAgent = this.registry.get(routerAgentId);

    if (!routerAgent) {
      throw new Error(`Router agent not found: ${routerAgentId}`);
    }

    console.log(`[WorkflowEngine] Using router: ${routerAgent.name}`);

    // Execute router to determine which agent to use
    const routerResult = await this.executeAgent(routerAgent, context);
    state.results.push(routerResult);
    state.currentStep++;

    // Extract routing decision from router output
    // (In a real implementation, this would parse the router's response)
    const targetAgentId = config.agents[1]; // Simplified: use second agent

    const targetAgent = this.registry.get(targetAgentId);
    if (!targetAgent) {
      throw new Error(`Target agent not found: ${targetAgentId}`);
    }

    console.log(`[WorkflowEngine] Routing to: ${targetAgent.name}`);

    const targetResult = await this.executeAgent(targetAgent, {
      ...context,
      messages: [...context.messages, ...routerResult.messages],
    });

    state.results.push(targetResult);
    state.currentStep++;
  }

  /**
   * Execute evaluator-optimizer loop
   */
  private async executeEvaluatorOptimizer(
    state: WorkflowExecutionState,
    context: AgentContext,
  ): Promise<void> {
    const { config } = state;

    if (config.agents.length < 2) {
      throw new Error(
        'Evaluator-optimizer workflow requires at least 2 agents',
      );
    }

    const generatorAgentId = config.agents[0];
    const evaluatorAgentId = config.agents[1];

    const maxIterations = config.maxSteps || 3;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      console.log(
        `[WorkflowEngine] Iteration ${iteration + 1}/${maxIterations}`,
      );

      // Generate
      const generatorAgent = this.registry.get(generatorAgentId);
      if (!generatorAgent) {
        throw new Error(`Generator agent not found: ${generatorAgentId}`);
      }

      const generateResult = await this.executeAgent(generatorAgent, context);
      state.results.push(generateResult);
      state.currentStep++;

      // Evaluate
      const evaluatorAgent = this.registry.get(evaluatorAgentId);
      if (!evaluatorAgent) {
        throw new Error(`Evaluator agent not found: ${evaluatorAgentId}`);
      }

      const evaluateContext: AgentContext = {
        ...context,
        messages: [...context.messages, ...generateResult.messages],
      };

      const evaluateResult = await this.executeAgent(
        evaluatorAgent,
        evaluateContext,
      );
      state.results.push(evaluateResult);
      state.currentStep++;

      // Check if evaluation is satisfactory (simplified)
      if (config.stopWhen && config.stopWhen(state.results)) {
        console.log(`[WorkflowEngine] Evaluation satisfactory, stopping`);
        break;
      }

      // Update context for next iteration
      context.messages = [...context.messages, ...evaluateResult.messages];
    }
  }

  /**
   * Execute a single agent
   */
  private async executeAgent(
    agent: AgentDefinition,
    context: AgentContext,
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      // Create user message from context
      const lastMessage = context.messages[context.messages.length - 1];

      // Use ChatService to generate response
      // Note: This is a simplified implementation
      // In a real scenario, you'd pass the agent's system prompt and configuration
      const result = await this.chatService.sendMessage(
        context.conversationId,
        typeof lastMessage.content === 'string' ? lastMessage.content : '',
        {
          provider: agent.model?.provider || 'anthropic',
          modelId: agent.model?.modelId || 'claude-3-sonnet-20240229',
          temperature: agent.model?.temperature,
          maxTokens: agent.model?.maxTokens,
        },
      );

      const executionTime = Date.now() - startTime;

      return {
        agentId: agent.id,
        messages: [result],
        metadata: {
          steps: 1,
          executionTime,
          finishReason: 'completed',
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        agentId: agent.id,
        messages: [],
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          steps: 0,
          executionTime,
          finishReason: 'error',
        },
      };
    }
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): WorkflowExecutionState[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Cancel a workflow
   */
  cancelWorkflow(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    workflow.status = 'stopped';
    workflow.endTime = new Date();
    this.activeWorkflows.delete(workflowId);

    console.log(`[WorkflowEngine] Cancelled workflow: ${workflowId}`);
    return true;
  }
}
