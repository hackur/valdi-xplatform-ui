/**
 * AgentRegistry
 *
 * Registry for managing agent definitions.
 * Provides registration, lookup, and validation of agents.
 */

import { AgentDefinition } from './types';

/**
 * Agent Registry Class
 *
 * Centralized registry for AI agents.
 * Manages agent lifecycle and provides access to agent configurations.
 */
export class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();
  private agentsByCapability: Map<string, Set<string>> = new Map();

  /**
   * Register an agent
   * @param agent Agent definition
   * @throws Error if agent ID already exists
   */
  register(agent: AgentDefinition): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID "${agent.id}" already registered`);
    }

    // Validate agent definition
    this.validateAgent(agent);

    // Register agent
    this.agents.set(agent.id, agent);

    // Index by capabilities
    if (agent.capabilities) {
      agent.capabilities.forEach((capability) => {
        if (!this.agentsByCapability.has(capability)) {
          this.agentsByCapability.set(capability, new Set());
        }
        this.agentsByCapability.get(capability)!.add(agent.id);
      });
    }

    console.log(`[AgentRegistry] Registered agent: ${agent.name} (${agent.id})`);
  }

  /**
   * Unregister an agent
   * @param agentId Agent ID to unregister
   */
  unregister(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    // Remove from capability index
    if (agent.capabilities) {
      agent.capabilities.forEach((capability) => {
        this.agentsByCapability.get(capability)?.delete(agentId);
      });
    }

    // Remove agent
    this.agents.delete(agentId);
    console.log(`[AgentRegistry] Unregistered agent: ${agentId}`);
    return true;
  }

  /**
   * Get agent by ID
   * @param agentId Agent ID
   * @returns Agent definition or undefined
   */
  get(agentId: string): AgentDefinition | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   * @returns Array of all agent definitions
   */
  getAll(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Find agents by capability
   * @param capability Capability to search for
   * @returns Array of agent definitions with the capability
   */
  findByCapability(capability: string): AgentDefinition[] {
    const agentIds = this.agentsByCapability.get(capability);
    if (!agentIds) {
      return [];
    }

    return Array.from(agentIds)
      .map((id) => this.agents.get(id))
      .filter((agent): agent is AgentDefinition => agent !== undefined);
  }

  /**
   * Check if agent exists
   * @param agentId Agent ID
   * @returns True if agent exists
   */
  has(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  /**
   * Get agent count
   * @returns Number of registered agents
   */
  count(): number {
    return this.agents.size;
  }

  /**
   * Clear all agents
   */
  clear(): void {
    this.agents.clear();
    this.agentsByCapability.clear();
    console.log('[AgentRegistry] Cleared all agents');
  }

  /**
   * Validate agent definition
   * @throws Error if agent is invalid
   */
  private validateAgent(agent: AgentDefinition): void {
    if (!agent.id || agent.id.trim() === '') {
      throw new Error('Agent ID is required');
    }

    if (!agent.name || agent.name.trim() === '') {
      throw new Error('Agent name is required');
    }

    if (!agent.systemPrompt || agent.systemPrompt.trim() === '') {
      throw new Error('Agent system prompt is required');
    }

    // Validate model config if provided
    if (agent.model) {
      if (!agent.model.provider) {
        throw new Error('Model provider is required');
      }

      if (!agent.model.modelId) {
        throw new Error('Model ID is required');
      }

      if (agent.model.temperature !== undefined) {
        if (agent.model.temperature < 0 || agent.model.temperature > 2) {
          throw new Error('Temperature must be between 0 and 2');
        }
      }

      if (agent.model.maxTokens !== undefined) {
        if (agent.model.maxTokens < 1) {
          throw new Error('Max tokens must be positive');
        }
      }
    }
  }

  /**
   * Export all agents to JSON
   * @returns JSON string of all agents
   */
  export(): string {
    const agents = this.getAll();
    return JSON.stringify(agents, null, 2);
  }

  /**
   * Import agents from JSON
   * @param json JSON string of agents
   * @param replace If true, clears existing agents first
   */
  import(json: string, replace: boolean = false): void {
    const agents: AgentDefinition[] = JSON.parse(json);

    if (!Array.isArray(agents)) {
      throw new Error('Invalid agent data: expected array');
    }

    if (replace) {
      this.clear();
    }

    agents.forEach((agent) => {
      try {
        this.register(agent);
      } catch (error) {
        console.error(`Failed to import agent ${agent.id}:`, error);
      }
    });

    console.log(`[AgentRegistry] Imported ${agents.length} agents`);
  }
}

/**
 * Default agent registry instance
 */
export const defaultAgentRegistry = new AgentRegistry();

/**
 * Register default agents
 */
export function registerDefaultAgents(registry: AgentRegistry = defaultAgentRegistry): void {
  // Research Agent
  registry.register({
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Specializes in gathering information and conducting research',
    systemPrompt:
      'You are a research specialist. Your role is to gather comprehensive information, analyze sources, and provide well-researched answers. Focus on accuracy, completeness, and citing sources.',
    capabilities: ['research', 'analysis', 'fact-checking'],
    model: {
      provider: 'anthropic',
      modelId: 'claude-3-sonnet-20240229',
      temperature: 0.3,
      maxTokens: 4096,
    },
    tools: ['searchWeb', 'fetchUrl'],
  });

  // Code Agent
  registry.register({
    id: 'code-agent',
    name: 'Code Agent',
    description: 'Specializes in writing and analyzing code',
    systemPrompt:
      'You are a senior software engineer. Your role is to write clean, efficient, well-documented code. Follow best practices, consider edge cases, and explain your reasoning.',
    capabilities: ['coding', 'debugging', 'code-review'],
    model: {
      provider: 'anthropic',
      modelId: 'claude-3-opus-20240229',
      temperature: 0.1,
      maxTokens: 8192,
    },
    tools: ['executeCode', 'searchCode'],
  });

  // Creative Agent
  registry.register({
    id: 'creative-agent',
    name: 'Creative Agent',
    description: 'Specializes in creative writing and brainstorming',
    systemPrompt:
      'You are a creative writer and ideation specialist. Your role is to generate original ideas, craft engaging narratives, and think outside the box. Be imaginative and innovative.',
    capabilities: ['creative-writing', 'brainstorming', 'storytelling'],
    model: {
      provider: 'openai',
      modelId: 'gpt-4-turbo',
      temperature: 0.9,
      maxTokens: 4096,
    },
  });

  // Analyst Agent
  registry.register({
    id: 'analyst-agent',
    name: 'Analyst Agent',
    description: 'Specializes in data analysis and critical thinking',
    systemPrompt:
      'You are a data analyst and critical thinker. Your role is to analyze information objectively, identify patterns, and provide data-driven insights. Be thorough and unbiased.',
    capabilities: ['analysis', 'data-processing', 'critical-thinking'],
    model: {
      provider: 'anthropic',
      modelId: 'claude-3-sonnet-20240229',
      temperature: 0.2,
      maxTokens: 4096,
    },
    tools: ['calculateExpression', 'analyzeData'],
  });

  console.log('[AgentRegistry] Registered 4 default agents');
}
