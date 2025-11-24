/**
 * AgentRegistry
 *
 * Registry for managing agent definitions.
 * Provides registration, lookup, and validation of agents with storage persistence.
 */

import { AgentDefinition } from './types';
import { StorageProvider } from '../common/src';

const STORAGE_KEY = 'agent_registry_agents';

/**
 * Agent Registry Configuration
 */
export interface AgentRegistryConfig {
  /** Storage provider for persistence */
  storage?: StorageProvider;

  /** Auto-save on changes */
  autoSave?: boolean;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Agent Registry Class
 *
 * Centralized registry for AI agents.
 * Manages agent lifecycle and provides access to agent configurations.
 * Supports persistence through storage providers.
 */
export class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();
  private agentsByCapability: Map<string, Set<string>> = new Map();
  private storage?: StorageProvider;
  private autoSave: boolean;
  private debug: boolean;
  private initialized = false;

  constructor(config?: AgentRegistryConfig) {
    this.storage = config?.storage;
    this.autoSave = config?.autoSave ?? true;
    this.debug = config?.debug ?? false;
  }

  /**
   * Initialize the registry (load from storage)
   * @throws Error if initialization fails
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.storage) {
      try {
        const data = await this.storage.getItem(STORAGE_KEY);
        if (data) {
          const agents: AgentDefinition[] = JSON.parse(data);
          this.log(`Loading ${agents.length} agents from storage`);

          // Register all agents without auto-save during initialization
          const originalAutoSave = this.autoSave;
          this.autoSave = false;

          for (const agent of agents) {
            try {
              this.register(agent);
            } catch (error) {
              console.error(`Failed to load agent ${agent.id}:`, error);
            }
          }

          this.autoSave = originalAutoSave;
        }
      } catch (error) {
        console.error('[AgentRegistry] Failed to load from storage:', error);
      }
    }

    this.initialized = true;
    this.log('Initialized successfully');
  }

  /**
   * Save agents to storage
   * @throws Error if save fails
   */
  async save(): Promise<void> {
    if (!this.storage) {
      return;
    }

    try {
      const agents = this.getAll();
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(agents));
      this.log(`Saved ${agents.length} agents to storage`);
    } catch (error) {
      console.error('[AgentRegistry] Failed to save to storage:', error);
      throw new Error('Failed to save agents to storage');
    }
  }

  /**
   * Register an agent
   * @param agent Agent definition
   * @param options Registration options
   * @throws Error if agent ID already exists or validation fails
   */
  async register(
    agent: AgentDefinition,
    options?: { skipSave?: boolean; skipValidation?: boolean },
  ): Promise<void> {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID "${agent.id}" already registered`);
    }

    // Validate agent definition
    if (!options?.skipValidation) {
      this.validateAgent(agent);
    }

    // Register agent
    this.agents.set(agent.id, { ...agent });

    // Index by capabilities
    if (agent.capabilities) {
      agent.capabilities.forEach((capability) => {
        if (!this.agentsByCapability.has(capability)) {
          this.agentsByCapability.set(capability, new Set());
        }
        this.agentsByCapability.get(capability)!.add(agent.id);
      });
    }

    this.log(`Registered agent: ${agent.name} (${agent.id})`);

    // Auto-save if enabled
    if (this.autoSave && !options?.skipSave && this.storage) {
      await this.save();
    }
  }

  /**
   * Update an existing agent
   * @param agentId Agent ID to update
   * @param updates Partial agent updates
   * @throws Error if agent not found
   */
  async update(
    agentId: string,
    updates: Partial<Omit<AgentDefinition, 'id'>>,
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const updatedAgent = { ...agent, ...updates, id: agentId };

    // Validate updated agent
    this.validateAgent(updatedAgent);

    // Update capability index if capabilities changed
    if (updates.capabilities) {
      // Remove old capabilities
      if (agent.capabilities) {
        agent.capabilities.forEach((capability) => {
          this.agentsByCapability.get(capability)?.delete(agentId);
        });
      }

      // Add new capabilities
      updates.capabilities.forEach((capability) => {
        if (!this.agentsByCapability.has(capability)) {
          this.agentsByCapability.set(capability, new Set());
        }
        this.agentsByCapability.get(capability)!.add(agentId);
      });
    }

    // Update agent
    this.agents.set(agentId, updatedAgent);
    this.log(`Updated agent: ${agentId}`);

    // Auto-save if enabled
    if (this.autoSave && this.storage) {
      await this.save();
    }
  }

  /**
   * Unregister an agent
   * @param agentId Agent ID to unregister
   * @returns True if agent was unregistered, false if not found
   */
  async unregister(agentId: string): Promise<boolean> {
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
    this.log(`Unregistered agent: ${agentId}`);

    // Auto-save if enabled
    if (this.autoSave && this.storage) {
      await this.save();
    }

    return true;
  }

  /**
   * Register multiple agents in bulk
   * @param agents Array of agent definitions
   * @returns Results of registration attempts
   */
  async registerBulk(
    agents: AgentDefinition[],
  ): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    // Disable auto-save during bulk operation
    const originalAutoSave = this.autoSave;
    this.autoSave = false;

    for (const agent of agents) {
      try {
        await this.register(agent);
        success.push(agent.id);
      } catch (error) {
        failed.push({
          id: agent.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Restore auto-save and save once
    this.autoSave = originalAutoSave;
    if (this.autoSave && this.storage && success.length > 0) {
      await this.save();
    }

    this.log(
      `Bulk register: ${success.length} succeeded, ${failed.length} failed`,
    );

    return { success, failed };
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
   * @param filter Optional filter function
   * @returns Array of all agent definitions
   */
  getAll(filter?: (agent: AgentDefinition) => boolean): AgentDefinition[] {
    const agents = Array.from(this.agents.values());
    return filter ? agents.filter(filter) : agents;
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
   * Find agents by multiple capabilities (AND logic)
   * @param capabilities Capabilities to search for
   * @returns Array of agent definitions with all capabilities
   */
  findByCapabilities(capabilities: string[]): AgentDefinition[] {
    if (capabilities.length === 0) {
      return [];
    }

    // Start with agents that have the first capability
    const firstCapability = capabilities[0];
    if (!firstCapability) {
      return [];
    }
    let results = this.findByCapability(firstCapability);

    // Filter to only include agents that have all other capabilities
    for (let i = 1; i < capabilities.length; i++) {
      const capability = capabilities[i];
      if (!capability) {
        continue;
      }
      results = results.filter((agent) =>
        agent.capabilities?.includes(capability),
      );
    }

    return results;
  }

  /**
   * Find agents by provider
   * @param provider AI provider
   * @returns Array of agent definitions using the provider
   */
  findByProvider(
    provider: 'openai' | 'anthropic' | 'google',
  ): AgentDefinition[] {
    return this.getAll((agent) => agent.model?.provider === provider);
  }

  /**
   * Search agents by name or description
   * @param query Search query
   * @param options Search options
   * @returns Array of matching agent definitions
   */
  search(
    query: string,
    options?: { caseSensitive?: boolean; searchDescription?: boolean },
  ): AgentDefinition[] {
    const lowerQuery = options?.caseSensitive ? query : query.toLowerCase();

    return this.getAll((agent) => {
      const name = options?.caseSensitive
        ? agent.name
        : agent.name.toLowerCase();
      const nameMatch = name.includes(lowerQuery);

      if (!options?.searchDescription) {
        return nameMatch;
      }

      const description = options?.caseSensitive
        ? agent.description
        : agent.description.toLowerCase();
      return nameMatch || description.includes(lowerQuery);
    });
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
   * @param filter Optional filter function
   * @returns Number of registered agents
   */
  count(filter?: (agent: AgentDefinition) => boolean): number {
    if (filter) {
      return this.getAll(filter).length;
    }
    return this.agents.size;
  }

  /**
   * Get all capabilities
   * @returns Array of all unique capabilities
   */
  getAllCapabilities(): string[] {
    return Array.from(this.agentsByCapability.keys());
  }

  /**
   * Clear all agents
   */
  async clear(): Promise<void> {
    this.agents.clear();
    this.agentsByCapability.clear();
    this.log('Cleared all agents');

    // Auto-save if enabled
    if (this.autoSave && this.storage) {
      await this.save();
    }
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
   * @param options Export options
   * @returns JSON string of all agents
   */
  export(options?: {
    pretty?: boolean;
    filter?: (agent: AgentDefinition) => boolean;
  }): string {
    const agents = this.getAll(options?.filter);
    return JSON.stringify(agents, null, options?.pretty ? 2 : 0);
  }

  /**
   * Import agents from JSON
   * @param json JSON string of agents
   * @param options Import options
   * @returns Import results
   */
  async import(
    json: string,
    options?: { replace?: boolean; skipInvalid?: boolean },
  ): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    let agents: AgentDefinition[];

    try {
      agents = JSON.parse(json);
    } catch (error) {
      throw new Error(
        'Invalid JSON: ' +
          (error instanceof Error ? error.message : String(error)),
      );
    }

    if (!Array.isArray(agents)) {
      throw new Error('Invalid agent data: expected array');
    }

    if (options?.replace) {
      await this.clear();
    }

    const result = await this.registerBulk(agents);

    this.log(
      `Imported ${result.success.length} agents, ${result.failed.length} failed`,
    );

    // Throw if any failed and not skipping invalid
    if (result.failed.length > 0 && !options?.skipInvalid) {
      const errorMessages = result.failed
        .map((f) => `${f.id}: ${f.error}`)
        .join('; ');
      throw new Error(
        `Failed to import ${result.failed.length} agents: ${errorMessages}`,
      );
    }

    return result;
  }

  /**
   * Clone an agent with a new ID
   * @param agentId Agent ID to clone
   * @param newId New agent ID
   * @param updates Optional updates to apply
   * @throws Error if source agent not found or new ID exists
   */
  async clone(
    agentId: string,
    newId: string,
    updates?: Partial<Omit<AgentDefinition, 'id'>>,
  ): Promise<AgentDefinition> {
    const agent = this.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (this.has(newId)) {
      throw new Error(`Agent with ID "${newId}" already exists`);
    }

    const clonedAgent: AgentDefinition = {
      ...agent,
      ...updates,
      id: newId,
      name: updates?.name || `${agent.name} (Copy)`,
    };

    await this.register(clonedAgent);
    this.log(`Cloned agent ${agentId} to ${newId}`);

    return clonedAgent;
  }

  /**
   * Log message if debug is enabled
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[AgentRegistry] ${message}`);
    }
  }
}

/**
 * Default agent registry instance
 */
export const defaultAgentRegistry = new AgentRegistry({ debug: true });

/**
 * Default agent definitions
 */
export const DEFAULT_AGENTS: AgentDefinition[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

/**
 * Register default agents
 * @param registry Agent registry to register to
 * @returns Number of agents registered
 */
export async function registerDefaultAgents(
  registry: AgentRegistry = defaultAgentRegistry,
): Promise<number> {
  const result = await registry.registerBulk(DEFAULT_AGENTS);

  console.log(
    `[AgentRegistry] Registered ${result.success.length} default agents, ${result.failed.length} failed`,
  );

  return result.success.length;
}
