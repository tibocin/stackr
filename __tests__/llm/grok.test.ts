/**
 * @fileoverview Tests for Grok LLM strategy
 * @file __tests__/llm/grok.test.ts
 * @description Tests the GrokStrategy implementation and Grok API integration
 * @related src/llm/strategies/grok.ts
 * @tags llm, grok, strategy, xai, api
 */

import { GrokStrategy } from '../../src/llm/strategies/grok';
import { LLMProvider } from '../../src/llm/types';
import { LLMConfiguration } from '../../src/llm/config';

// Mock environment variables
const originalEnv = process.env;

describe('Grok Strategy', () => {
  let grokStrategy: GrokStrategy;
  let config: LLMConfiguration;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Set up Grok API key
    process.env['GROK_API_KEY'] = 'test-grok-key';
    process.env['GROK_MODEL'] = 'grok-4-0709';
    
    grokStrategy = new GrokStrategy();
    config = new LLMConfiguration();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Strategy Interface', () => {
    it('should implement LLMStrategy interface', () => {
      expect(grokStrategy).toBeDefined();
      expect(typeof grokStrategy.query).toBe('function');
      expect(typeof grokStrategy.getProviderName).toBe('function');
      expect(typeof grokStrategy.isAvailable).toBe('function');
    });

    it('should return correct provider name', () => {
      expect(grokStrategy.getProviderName()).toBe('grok');
    });

    it('should be available when GROK_API_KEY is set', () => {
      expect(grokStrategy.isAvailable()).toBe(true);
    });

    it('should not be available when GROK_API_KEY is not set', () => {
      delete process.env['GROK_API_KEY'];
      const strategy = new GrokStrategy();
      expect(strategy.isAvailable()).toBe(false);
    });
  });

  describe('Grok API Integration', () => {
    beforeEach(() => {
      // Mock fetch for API calls
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should make successful API call to Grok chat completions', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! I am Grok, an AI assistant.'
            }
          }
        ]
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      const result = await grokStrategy.query('Hello, how are you?', config);

      // Assert
      expect(result).toBe('Hello! I am Grok, an AI assistant.');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-grok-key',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"model":"grok-4-0709"')
        })
      );
    });

    it('should handle Grok API errors gracefully', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      // Act & Assert
      await expect(grokStrategy.query('Test prompt', config))
        .rejects.toThrow('Grok API request failed: 429 Too Many Requests');
    }, 10000); // Increase timeout for retry logic

    it('should retry on network failures', async () => {
      // Arrange
      const mockResponse = {
        choices: [{ message: { content: 'Success after retry' } }]
      };
      
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

      // Act
      const result = await grokStrategy.query('Test prompt', config);

      // Assert
      expect(result).toBe('Success after retry');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle invalid response format', async () => {
      // Arrange
      const invalidResponse = {
        choices: [] // Empty choices array
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse
      });

      // Act & Assert
      await expect(grokStrategy.query('Test prompt', config))
        .rejects.toThrow('Invalid response format from Grok API');
    }, 10000); // Increase timeout for retry logic

    it('should use correct Grok endpoint', async () => {
      // Arrange
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }]
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      await grokStrategy.query('Test prompt', config);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.any(Object)
      );
    });
  });

  describe('Configuration Integration', () => {
    it('should work with LLMConfiguration', () => {
      // Arrange
      process.env['GROK_API_KEY'] = 'test-key-123';
      process.env['GROK_MODEL'] = 'grok-3-mini';
      
      const config = new LLMConfiguration();

      // Assert
      expect(config.provider).toBe(LLMProvider.GROK);
      expect(config.apiKey).toBe('test-key-123');
      expect(config.model).toBe('grok-3-mini');
    });

    it('should throw error when no Grok API key is configured', () => {
      // Arrange - Clear API key
      delete process.env['GROK_API_KEY'];

      // Act & Assert
      expect(() => new LLMConfiguration()).toThrow('No LLM API key configured');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should not retry on client errors (4xx) except rate limits', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      // Act & Assert
      await expect(grokStrategy.query('Test prompt', config))
        .rejects.toThrow('Grok API request failed: 400 Bad Request');
      
      // Should not retry on 400 error
      expect(global.fetch).toHaveBeenCalledTimes(1);
    }, 10000); // Increase timeout for retry logic

    it('should retry on rate limit errors (429)', async () => {
      // Arrange
      const errorResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      };
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse);

      // Act & Assert
      await expect(grokStrategy.query('Test prompt', config))
        .rejects.toThrow('Grok API request failed: 429 Too Many Requests');
      
      // Should retry on 429 error
      expect(global.fetch).toHaveBeenCalledTimes(4);
    }, 10000); // Increase timeout for retry logic
  });
}); 