/**
 * RoutingWorkflow
 *
 * Uses a classifier/router agent to analyze input and route to
 * specialized agents based on intent, topic, or complexity.
 *
 * Use cases:
 * - Customer service routing (billing, technical, sales)
 * - Topic-based expert routing
 * - Complexity-based routing (simple vs complex)
 * - Multi-domain applications
 * - Intent-based task delegation
 */

import {
  WorkflowExecutor,
  WorkflowConfig,
  WorkflowExecutionOptions,
  WorkflowExecutionResult,
  AgentDefinition,
} from './AgentWorkflow';
import { ChatService } from './ChatService';
import { MessageStore } from './MessageStore';

/**
 * Route Definition
 * Defines a routing rule for specialized agents
 */
export interface RouteDefinition {
  /** Route identifier */
  id: string;

  /** Route name */
  name: string;

  /** Description of when to use this route */
  description: string;

  /** Keywords or patterns that trigger this route */
  triggers?: string[];

  /** Specialized agent for this route */
  agent: AgentDefinition;

  /** Priority (higher number = higher priority) */
  priority?: number;

  /** Custom condition function */
  condition?: (input: string, classification: any) => boolean;
}

/**
 * Routing Workflow Configuration
 */
export interface RoutingWorkflowConfig extends WorkflowConfig {
  type: 'routing';

  /**
   * Router/classifier agent
   * Analyzes input and determines which route to use
   */
  routerAgent: AgentDefinition & {
    /** System prompt should guide classification */
    classificationPrompt?: string;
  };

  /**
   * Available routes
   */
  routes: RouteDefinition[];

  /**
   * Default/fallback agent if no route matches
   */
  fallbackAgent?: AgentDefinition;

  /**
   * Whether to include routing explanation in result
   */
  includeRoutingExplanation?: boolean;

  /**
   * Custom route selector function
   * Override default routing logic
   */
  selectRoute?: (
    input: string,
    classification: string,
    routes: RouteDefinition[]
  ) => RouteDefinition | undefined;

  /**
   * Whether to allow multiple routes (parallel execution)
   */
  allowMultipleRoutes?: boolean;

  /**
   * Maximum number of routes to execute if allowMultipleRoutes is true
   */
  maxRoutesToExecute?: number;
}

/**
 * Classification Result
 */
interface ClassificationResult {
  /** Selected route IDs */
  routeIds: string[];

  /** Classification reasoning */
  reasoning?: string;

  /** Confidence score (0-1) */
  confidence?: number;

  /** Raw classification output */
  raw: string;
}

/**
 * Routing Workflow Executor
 *
 * Routes requests to specialized agents based on classification.
 *
 * Example:
 * ```typescript
 * const workflow = new RoutingWorkflow({
 *   type: 'routing',
 *   routerAgent: {
 *     id: 'router',
 *     name: 'Router',
 *     role: 'classification',
 *     systemPrompt: `Classify the user's request into one of these categories:
 *       - code: Code generation, debugging, or programming questions
 *       - data: Data analysis, statistics, or visualization
 *       - writing: Content creation, editing, or creative writing
 *       - general: General questions or conversation
 *
 *       Respond with ONLY the category name.`,
 *   },
 *   routes: [
 *     {
 *       id: 'code',
 *       name: 'Code Specialist',
 *       description: 'Handles programming and code-related requests',
 *       agent: {
 *         id: 'code-agent',
 *         name: 'Code Expert',
 *         role: 'coding',
 *         systemPrompt: 'You are an expert programmer...',
 *       },
 *     },
 *     {
 *       id: 'data',
 *       name: 'Data Analyst',
 *       description: 'Handles data analysis requests',
 *       agent: {
 *         id: 'data-agent',
 *         name: 'Data Expert',
 *         role: 'data-analysis',
 *         systemPrompt: 'You are a data analysis expert...',
 *       },
 *     },
 *   ],
 *   fallbackAgent: {
 *     id: 'general',
 *     name: 'General Assistant',
 *     role: 'general',
 *     systemPrompt: 'You are a helpful general assistant...',
 *   },
 * }, chatService, messageStore);
 * ```
 */
export class RoutingWorkflow extends WorkflowExecutor {
  protected config: RoutingWorkflowConfig;

  constructor(
    config: RoutingWorkflowConfig,
    chatService: ChatService,
    messageStore: MessageStore
  ) {
    super(config, chatService, messageStore);
    this.config = config;
  }

  /**
   * Execute the routing workflow
   */
  async execute(options: WorkflowExecutionOptions): Promise<WorkflowExecutionResult> {
    const { conversationId, input, onProgress, abortSignal } = options;
    const startTime = Date.now();

    // Initialize state (router + 1 or more routes)
    this.updateState({
      status: 'running',
      startedAt: new Date(),
      totalSteps: 2, // Router + at least one route
    });

    // Emit workflow start event
    if (onProgress) {
      onProgress({
        type: 'workflow-start',
        executionId: this.state.executionId,
      });
    }

    try {
      // Step 1: Classify input using router agent
      if (this.config.debug) {
        console.log('[RoutingWorkflow] Classifying input with router agent');
      }

      const classificationPrompt = this.config.routerAgent.classificationPrompt
        ? `${this.config.routerAgent.classificationPrompt}\n\nInput: ${input}`
        : input;

      const routerStep = await this.executeAgentWithRetry(
        this.config.routerAgent,
        classificationPrompt,
        conversationId,
        onProgress
      );

      this.addStep(routerStep);

      // Parse classification result
      const classification = this.parseClassification(routerStep.output);

      if (this.config.debug) {
        console.log('[RoutingWorkflow] Classification result:', classification);
      }

      // Step 2: Select route(s) based on classification
      const selectedRoutes = this.selectRoutes(input, classification);

      if (selectedRoutes.length === 0) {
        if (this.config.debug) {
          console.log('[RoutingWorkflow] No routes matched, using fallback agent');
        }

        if (!this.config.fallbackAgent) {
          throw new Error('No routes matched and no fallback agent configured');
        }

        selectedRoutes.push({
          id: 'fallback',
          name: 'Fallback',
          description: 'Default fallback agent',
          agent: this.config.fallbackAgent,
        });
      }

      // Limit number of routes if specified
      const routesToExecute = this.config.maxRoutesToExecute
        ? selectedRoutes.slice(0, this.config.maxRoutesToExecute)
        : selectedRoutes;

      if (this.config.debug) {
        console.log(
          `[RoutingWorkflow] Executing ${routesToExecute.length} route(s):`,
          routesToExecute.map(r => r.name)
        );
      }

      // Step 3: Execute selected route(s)
      let results: string[];

      if (this.config.allowMultipleRoutes && routesToExecute.length > 1) {
        // Execute multiple routes in parallel
        const routePromises = routesToExecute.map(route =>
          this.executeAgentWithRetry(route.agent, input, conversationId, onProgress)
        );

        const routeSteps = await Promise.all(routePromises);
        routeSteps.forEach(step => this.addStep(step));
        results = routeSteps.map(step => step.output);
      } else {
        // Execute single route
        const route = routesToExecute[0];
        const routeStep = await this.executeAgentWithRetry(
          route.agent,
          input,
          conversationId,
          onProgress
        );

        this.addStep(routeStep);
        results = [routeStep.output];
      }

      // Combine results if multiple routes were executed
      let finalResult = results.length === 1
        ? results[0]
        : this.combineRouteResults(results, routesToExecute);

      // Include routing explanation if requested
      if (this.config.includeRoutingExplanation) {
        const routeNames = routesToExecute.map(r => r.name).join(', ');
        const explanation = `[Routed to: ${routeNames}]\n\n${finalResult}`;
        finalResult = explanation;
      }

      // Mark workflow as completed
      const executionTime = Date.now() - startTime;

      this.updateState({
        status: 'completed',
        result: finalResult,
        completedAt: new Date(),
        metadata: {
          ...this.state.metadata,
          classification: classification,
          selectedRoutes: routesToExecute.map(r => r.id),
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
   * Parse classification from router output
   */
  private parseClassification(output: string): ClassificationResult {
    // Try to extract structured classification
    // Support JSON format or simple text classification

    const trimmed = output.trim();

    // Try parsing as JSON
    try {
      const parsed = JSON.parse(trimmed);
      return {
        routeIds: Array.isArray(parsed.routes) ? parsed.routes : [parsed.route || parsed.category],
        reasoning: parsed.reasoning,
        confidence: parsed.confidence,
        raw: output,
      };
    } catch {
      // Not JSON, treat as simple text classification
      // Extract route ID from text (look for route names)
      const routeIds: string[] = [];

      for (const route of this.config.routes) {
        const routeNameLower = route.id.toLowerCase();
        const outputLower = trimmed.toLowerCase();

        if (outputLower.includes(routeNameLower)) {
          routeIds.push(route.id);
        }

        // Also check triggers
        if (route.triggers) {
          for (const trigger of route.triggers) {
            if (outputLower.includes(trigger.toLowerCase())) {
              routeIds.push(route.id);
              break;
            }
          }
        }
      }

      return {
        routeIds: routeIds.length > 0 ? [...new Set(routeIds)] : [],
        raw: output,
      };
    }
  }

  /**
   * Select routes based on classification
   */
  private selectRoutes(input: string, classification: ClassificationResult): RouteDefinition[] {
    // Use custom selector if provided
    if (this.config.selectRoute) {
      const selected = this.config.selectRoute(input, classification.raw, this.config.routes);
      return selected ? [selected] : [];
    }

    // Default selection logic
    const selectedRoutes: RouteDefinition[] = [];

    // Find routes matching classification
    for (const routeId of classification.routeIds) {
      const route = this.config.routes.find(r => r.id === routeId);
      if (route) {
        // Check custom condition if provided
        if (route.condition && !route.condition(input, classification)) {
          continue;
        }
        selectedRoutes.push(route);
      }
    }

    // Sort by priority
    selectedRoutes.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return selectedRoutes;
  }

  /**
   * Combine results from multiple routes
   */
  private combineRouteResults(results: string[], routes: RouteDefinition[]): string {
    return results
      .map((result, index) => {
        const routeName = routes[index].name;
        return `## ${routeName}\n\n${result}`;
      })
      .join('\n\n---\n\n');
  }

  /**
   * Get classification result
   */
  getClassification(): ClassificationResult | undefined {
    return this.state.metadata?.classification as ClassificationResult | undefined;
  }

  /**
   * Get selected routes
   */
  getSelectedRoutes(): string[] {
    return (this.state.metadata?.selectedRoutes as string[]) || [];
  }
}

/**
 * Routing Workflow Builder
 */
export class RoutingWorkflowBuilder {
  private config: Partial<RoutingWorkflowConfig> = {
    type: 'routing',
    routes: [],
  };

  /**
   * Set router agent
   */
  router(agent: AgentDefinition, classificationPrompt?: string): this {
    this.config.routerAgent = {
      ...agent,
      classificationPrompt,
    };
    return this;
  }

  /**
   * Add a route
   */
  route(route: RouteDefinition): this {
    this.config.routes = [...(this.config.routes || []), route];
    return this;
  }

  /**
   * Set fallback agent
   */
  fallback(agent: AgentDefinition): this {
    this.config.fallbackAgent = agent;
    return this;
  }

  /**
   * Include routing explanation in results
   */
  withExplanation(): this {
    this.config.includeRoutingExplanation = true;
    return this;
  }

  /**
   * Allow multiple routes to be executed
   */
  allowMultiple(maxRoutes?: number): this {
    this.config.allowMultipleRoutes = true;
    this.config.maxRoutesToExecute = maxRoutes;
    return this;
  }

  /**
   * Set custom route selector
   */
  customSelector(
    fn: (input: string, classification: string, routes: RouteDefinition[]) => RouteDefinition | undefined
  ): this {
    this.config.selectRoute = fn;
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
  build(): RoutingWorkflowConfig {
    if (!this.config.routerAgent) {
      throw new Error('Router agent is required');
    }

    if (!this.config.routes || this.config.routes.length === 0) {
      throw new Error('At least one route is required');
    }

    return this.config as RoutingWorkflowConfig;
  }

  /**
   * Build and create executor
   */
  buildExecutor(chatService: ChatService, messageStore: MessageStore): RoutingWorkflow {
    return new RoutingWorkflow(this.build(), chatService, messageStore);
  }
}

/**
 * Helper function to create a routing workflow
 */
export function createRoutingWorkflow(
  routerAgent: RoutingWorkflowConfig['routerAgent'],
  routes: RouteDefinition[],
  options?: Partial<RoutingWorkflowConfig>
): RoutingWorkflowConfig {
  return {
    type: 'routing',
    routerAgent,
    routes,
    ...options,
  };
}
