/**
 * Agent Manager Module
 *
 * Provides agent registration, workflow orchestration, and loop control.
 * Production-ready implementation with comprehensive error handling,
 * cancellation support, and storage persistence.
 */

// Core types
export type * from './types';

// Agent Registry
export {
  AgentRegistry,
  type AgentRegistryConfig,
  defaultAgentRegistry,
  DEFAULT_AGENTS,
  registerDefaultAgents,
} from './AgentRegistry';

// Agent Executor
export { AgentExecutor, type AgentExecutorConfig } from './AgentExecutor';

// Workflow Engine
export {
  WorkflowEngine,
  type WorkflowEngineConfig,
  type WorkflowExecutionOptions,
  type WorkflowProgressCallback,
} from './WorkflowEngine';

// Loop Controller
export {
  LoopController,
  type LoopControllerConfig,
  createKeywordStopCondition,
  createIterationStopCondition,
  createSuccessStopCondition,
  createErrorThresholdStopCondition,
  createStabilityStopCondition,
} from './LoopController';
