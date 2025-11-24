/**
 * AgentRegistry Tests
 *
 * Comprehensive test suite for AgentRegistry functionality.
 */

import { describe, it, expect, beforeEach } from 'valdi_test';
import { AgentRegistry, DEFAULT_AGENTS, registerDefaultAgents } from '../AgentRegistry';
import { AgentDefinition } from '../types';
import { MemoryStorage } from '@common/services/StorageProvider';

describe('AgentRegistry', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = new AgentRegistry({ debug: false });
  });

  describe('register', () => {
    it('should register a valid agent', async () => {
      const agent: AgentDefinition = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'A test agent',
        systemPrompt: 'You are a test agent',
      };

      await registry.register(agent);

      expect(registry.has('test-agent')).toBe(true);
      expect(registry.count()).toBe(1);
    });

    it('should throw error for duplicate agent ID', async () => {
      const agent: AgentDefinition = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'A test agent',
        systemPrompt: 'You are a test agent',
      };

      await registry.register(agent);

      await expect(async () => {
        await registry.register(agent);
      }).rejects.toThrow('already registered');
    });

    it('should validate agent definition', async () => {
      const invalidAgent = {
        id: '',
        name: 'Test',
        description: 'Test',
        systemPrompt: 'Test',
      } as AgentDefinition;

      await expect(async () => {
        await registry.register(invalidAgent);
      }).rejects.toThrow('Agent ID is required');
    });

    it('should index agents by capabilities', async () => {
      const agent: AgentDefinition = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'A test agent',
        systemPrompt: 'You are a test agent',
        capabilities: ['coding', 'testing'],
      };

      await registry.register(agent);

      const codingAgents = registry.findByCapability('coding');
      expect(codingAgents).toHaveLength(1);
      expect(codingAgents[0].id).toBe('test-agent');
    });
  });

  describe('update', () => {
    it('should update an existing agent', async () => {
      const agent: AgentDefinition = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'A test agent',
        systemPrompt: 'You are a test agent',
      };

      await registry.register(agent);
      await registry.update('test-agent', { name: 'Updated Agent' });

      const updated = registry.get('test-agent');
      expect(updated?.name).toBe('Updated Agent');
    });

    it('should throw error for non-existent agent', async () => {
      await expect(async () => {
        await registry.update('non-existent', { name: 'Test' });
      }).rejects.toThrow('Agent not found');
    });
  });

  describe('unregister', () => {
    it('should unregister an existing agent', async () => {
      const agent: AgentDefinition = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'A test agent',
        systemPrompt: 'You are a test agent',
      };

      await registry.register(agent);
      const result = await registry.unregister('test-agent');

      expect(result).toBe(true);
      expect(registry.has('test-agent')).toBe(false);
    });

    it('should return false for non-existent agent', async () => {
      const result = await registry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('registerBulk', () => {
    it('should register multiple agents', async () => {
      const agents: AgentDefinition[] = [
        {
          id: 'agent-1',
          name: 'Agent 1',
          description: 'First agent',
          systemPrompt: 'You are agent 1',
        },
        {
          id: 'agent-2',
          name: 'Agent 2',
          description: 'Second agent',
          systemPrompt: 'You are agent 2',
        },
      ];

      const result = await registry.registerBulk(agents);

      expect(result.success).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(registry.count()).toBe(2);
    });

    it('should handle partial failures', async () => {
      const agents: AgentDefinition[] = [
        {
          id: 'valid-agent',
          name: 'Valid Agent',
          description: 'Valid agent',
          systemPrompt: 'You are valid',
        },
        {
          id: '',
          name: 'Invalid Agent',
          description: 'Invalid agent',
          systemPrompt: 'You are invalid',
        },
      ];

      const result = await registry.registerBulk(agents);

      expect(result.success).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].id).toBe('');
    });
  });

  describe('search and filtering', () => {
    beforeEach(async () => {
      await registry.registerBulk([
        {
          id: 'code-agent',
          name: 'Code Agent',
          description: 'Writes code',
          systemPrompt: 'You write code',
          capabilities: ['coding'],
        },
        {
          id: 'test-agent',
          name: 'Test Agent',
          description: 'Tests code',
          systemPrompt: 'You test code',
          capabilities: ['testing'],
        },
        {
          id: 'full-stack-agent',
          name: 'Full Stack Agent',
          description: 'Codes and tests',
          systemPrompt: 'You do both',
          capabilities: ['coding', 'testing'],
        },
      ]);
    });

    it('should find agents by capability', () => {
      const codingAgents = registry.findByCapability('coding');
      expect(codingAgents).toHaveLength(2);
    });

    it('should find agents by multiple capabilities', () => {
      const agents = registry.findByCapabilities(['coding', 'testing']);
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe('full-stack-agent');
    });

    it('should search by name', () => {
      const agents = registry.search('Code');
      expect(agents).toHaveLength(2); // 'Code Agent' and 'Full Stack Agent' with 'Codes' in description
    });

    it('should search in description', () => {
      const agents = registry.search('Tests', { searchDescription: true });
      expect(agents).toHaveLength(2);
    });

    it('should filter agents', () => {
      const agents = registry.getAll((agent) => agent.id.includes('test'));
      expect(agents).toHaveLength(1);
    });
  });

  describe('storage persistence', () => {
    it('should save and load agents from storage', async () => {
      const storage = new MemoryStorage();
      const persistentRegistry = new AgentRegistry({ storage, autoSave: true });

      await persistentRegistry.initialize();

      const agent: AgentDefinition = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'A test agent',
        systemPrompt: 'You are a test agent',
      };

      await persistentRegistry.register(agent);

      // Create new registry with same storage
      const newRegistry = new AgentRegistry({ storage });
      await newRegistry.initialize();

      expect(newRegistry.has('test-agent')).toBe(true);
      expect(newRegistry.get('test-agent')?.name).toBe('Test Agent');
    });
  });

  describe('import/export', () => {
    it('should export agents to JSON', async () => {
      await registry.registerBulk(DEFAULT_AGENTS);

      const json = registry.export({ pretty: true });
      const agents = JSON.parse(json);

      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBe(DEFAULT_AGENTS.length);
    });

    it('should import agents from JSON', async () => {
      const json = JSON.stringify(DEFAULT_AGENTS);
      const result = await registry.import(json);

      expect(result.success).toHaveLength(DEFAULT_AGENTS.length);
      expect(registry.count()).toBe(DEFAULT_AGENTS.length);
    });

    it('should replace agents on import with replace option', async () => {
      const agent: AgentDefinition = {
        id: 'existing-agent',
        name: 'Existing Agent',
        description: 'An existing agent',
        systemPrompt: 'You are existing',
      };

      await registry.register(agent);

      const json = JSON.stringify(DEFAULT_AGENTS);
      await registry.import(json, { replace: true });

      expect(registry.count()).toBe(DEFAULT_AGENTS.length);
      expect(registry.has('existing-agent')).toBe(false);
    });
  });

  describe('clone', () => {
    it('should clone an agent', async () => {
      const agent: AgentDefinition = {
        id: 'original',
        name: 'Original Agent',
        description: 'Original description',
        systemPrompt: 'Original prompt',
        capabilities: ['coding'],
      };

      await registry.register(agent);

      const cloned = await registry.clone('original', 'cloned');

      expect(cloned.id).toBe('cloned');
      expect(cloned.name).toBe('Original Agent (Copy)');
      expect(cloned.systemPrompt).toBe('Original prompt');
      expect(cloned.capabilities).toEqual(['coding']);
    });

    it('should apply updates when cloning', async () => {
      const agent: AgentDefinition = {
        id: 'original',
        name: 'Original Agent',
        description: 'Original description',
        systemPrompt: 'Original prompt',
      };

      await registry.register(agent);

      const cloned = await registry.clone('original', 'cloned', {
        name: 'Custom Name',
        description: 'Custom description',
      });

      expect(cloned.name).toBe('Custom Name');
      expect(cloned.description).toBe('Custom description');
    });
  });

  describe('default agents', () => {
    it('should register default agents', async () => {
      const count = await registerDefaultAgents(registry);

      expect(count).toBe(4);
      expect(registry.has('research-agent')).toBe(true);
      expect(registry.has('code-agent')).toBe(true);
      expect(registry.has('creative-agent')).toBe(true);
      expect(registry.has('analyst-agent')).toBe(true);
    });
  });
});
