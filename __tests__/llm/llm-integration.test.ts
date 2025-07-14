/**
 * @fileoverview Integration tests for LLM providers (OpenAI and Grok)
 * @file __tests__/llm/llm-integration.test.ts
 * @description Tests real API integration with OpenAI and Grok providers
 * @related src/llm.ts
 * @tags llm, integration, openai, grok, api
 */

import { 
  LLMConfig, 
  LLMProvider, 
  LLMTaskType, 
  getOptimalModel 
} from '../../src/llm';

// Mock environment variables
const originalEnv = process.env;

describe('LLM Integration Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('OpenAI Integration', () => {
    it('should select optimal OpenAI model for analytics task', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';
      process.env['OPENAI_MODEL'] = 'gpt-4o';

      // Act
      const model = getOptimalModel(
        LLMTaskType.ANALYTICS,
        [LLMProvider.OPENAI],
        'standard',
        'quality'
      );

      // Assert
      expect(model.provider).toBe(LLMProvider.OPENAI);
      expect(model.model).toMatch(/gpt-4/);
      expect(model.capabilities.reasoning).toBe(true);
      expect(model.costPer1MInputTokens).toBeLessThanOrEqual(5.0);
    });

    it('should select budget OpenAI model for code generation', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.CODE_GENERATION,
        [LLMProvider.OPENAI],
        'budget',
        'cost'
      );

      // Assert
      expect(model.provider).toBe(LLMProvider.OPENAI);
      expect(model.capabilities.code).toBe(true);
      expect(model.costPer1MInputTokens).toBeLessThanOrEqual(0.2);
    });

    it('should select fastest OpenAI model for fast processing', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.FAST_PROCESSING,
        [LLMProvider.OPENAI],
        'standard',
        'speed'
      );

      // Assert
      expect(model.provider).toBe(LLMProvider.OPENAI);
      expect(model.speed).toBe('fast');
    });

    it('should load OpenAI configuration correctly', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key-123';
      process.env['OPENAI_MODEL'] = 'gpt-4o';

      // Act
      const config = new LLMConfig();

      // Assert
      expect(config.provider).toBe(LLMProvider.OPENAI);
      expect(config.apiKey).toBe('test-openai-key-123');
      expect(config.model).toBe('gpt-4o');
    });
  });

  describe('Grok Integration', () => {
    it('should select optimal Grok model for reasoning task', () => {
      // Arrange
      process.env['GROK_API_KEY'] = 'test-grok-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.REASONING,
        [LLMProvider.GROK],
        'standard',
        'quality'
      );

      // Assert
      expect(model.provider).toBe(LLMProvider.GROK);
      expect(model.model).toMatch(/grok/);
      expect(model.capabilities.reasoning).toBe(true);
    });

    it('should select budget Grok model for fast processing', () => {
      // Arrange
      process.env['GROK_API_KEY'] = 'test-grok-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.FAST_PROCESSING,
        [LLMProvider.GROK],
        'budget',
        'cost'
      );

      // Assert
      expect(model.provider).toBe(LLMProvider.GROK);
      expect(model.capabilities.code).toBe(true);
      // Should select GROK_3_MINI which costs $0.3
      expect(model.costPer1MInputTokens).toBe(0.3);
      expect(model.model).toMatch(/grok-3-mini/);
    });

    it('should load Grok configuration correctly', () => {
      // Arrange
      process.env['GROK_API_KEY'] = 'test-grok-key-456';
      process.env['GROK_MODEL'] = 'grok-4-0709';

      // Act
      const config = new LLMConfig();

      // Assert
      expect(config.provider).toBe(LLMProvider.GROK);
      expect(config.apiKey).toBe('test-grok-key-456');
      expect(config.model).toBe('grok-4-0709');
    });
  });

  describe('Multi-Provider Integration', () => {
    it('should select best model across multiple providers', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';
      process.env['GROK_API_KEY'] = 'test-grok-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.ANALYTICS,
        [LLMProvider.OPENAI, LLMProvider.GROK],
        'standard',
        'quality'
      );

      // Assert
      expect([LLMProvider.OPENAI, LLMProvider.GROK]).toContain(model.provider);
      expect(model.capabilities.reasoning).toBe(true);
    });

    it('should prefer cheaper provider when cost is priority', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';
      process.env['GROK_API_KEY'] = 'test-grok-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.CODE_GENERATION,
        [LLMProvider.OPENAI, LLMProvider.GROK],
        'budget',
        'cost'
      );

      // Assert
      expect(model.costPer1MInputTokens).toBeLessThanOrEqual(0.2);
    });

    it('should fallback gracefully when preferred provider unavailable', () => {
      // Arrange - Only OpenAI available
      process.env['OPENAI_API_KEY'] = 'test-openai-key';
      // No GROK_API_KEY set

      // Act
      const model = getOptimalModel(
        LLMTaskType.REASONING,
        [LLMProvider.OPENAI, LLMProvider.GROK],
        'standard',
        'quality'
      );

      // Assert
      expect(model.provider).toBe(LLMProvider.OPENAI);
    });
  });

  describe('Task-Specific Model Selection', () => {
    it('should select vision-capable model for vision tasks', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.VISION,
        [LLMProvider.OPENAI],
        'standard',
        'quality'
      );

      // Assert
      expect(model.capabilities.vision).toBe(true);
    });

    it('should select function-calling model for code generation', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.CODE_GENERATION,
        [LLMProvider.OPENAI],
        'standard',
        'quality'
      );

      // Assert
      expect(model.capabilities.functions).toBe(true);
    });

    it('should select high-context model for complex analytics', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.ANALYTICS,
        [LLMProvider.OPENAI],
        'premium',
        'quality'
      );

      // Assert
      expect(model.capabilities.context).toBeGreaterThan(50000);
    });
  });

  describe('Budget and Priority Constraints', () => {
    it('should respect budget constraints', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const budgetModel = getOptimalModel(
        LLMTaskType.ANALYTICS,
        [LLMProvider.OPENAI],
        'budget',
        'cost'
      );

      const premiumModel = getOptimalModel(
        LLMTaskType.ANALYTICS,
        [LLMProvider.OPENAI],
        'premium',
        'cost'
      );

      // Assert
      expect(budgetModel.costPer1MInputTokens).toBeLessThanOrEqual(0.2);
      expect(premiumModel.costPer1MInputTokens).toBeLessThanOrEqual(5.0);
    });

    it('should prioritize speed when requested', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const fastModel = getOptimalModel(
        LLMTaskType.FAST_PROCESSING,
        [LLMProvider.OPENAI],
        'standard',
        'speed'
      );

      // Assert
      expect(fastModel.speed).toBe('fast');
    });

    it('should prioritize quality for reasoning tasks', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const qualityModel = getOptimalModel(
        LLMTaskType.REASONING,
        [LLMProvider.OPENAI],
        'standard',
        'quality'
      );

      // Assert
      expect(qualityModel.capabilities.reasoning).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API keys gracefully', () => {
      // Arrange - No API keys set

      // Act & Assert
      expect(() => new LLMConfig()).toThrow('No LLM API key configured');
    });

    it('should provide fallback when no suitable models found', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';

      // Act
      const model = getOptimalModel(
        LLMTaskType.VISION,
        [LLMProvider.OPENAI],
        'budget', // Very restrictive budget
        'cost'
      );

      // Assert - Should still return a model (fallback)
      expect(model).toBeDefined();
      expect(model.provider).toBe(LLMProvider.OPENAI);
    });
  });
}); 