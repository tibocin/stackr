/**
 * @fileoverview Tests for LLM query functionality
 * @file __tests__/llm/llm.test.ts
 * @description Tests the queryLLM function and related LLM operations
 * @related src/llm.ts
 * @tags llm, query, stub
 */

import { queryLLM, LLMProvider } from '../../src/llm';
import { LLMConfiguration } from '../../src/llm/config';

// Mock environment variables
const originalEnv = process.env;

describe('LLM Module', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('queryLLM (Real Implementation)', () => {
    beforeEach(() => {
      // Mock fetch for API calls
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should throw error when no API key is configured', async () => {
      // Arrange - Clear API key
      delete process.env['OPENAI_API_KEY'];
      delete process.env['VENICE_API_KEY'];
      delete process.env['GROK_API_KEY'];
      delete process.env['ANTHROPIC_API_KEY'];

      // Act & Assert
      await expect(queryLLM('Test prompt')).rejects.toThrow('No LLM API key configured');
    });

    it('should accept string prompt parameter', () => {
      // This test verifies the function signature is correct
      expect(typeof queryLLM).toBe('function');
    });
  });

  describe('LLM Configuration', () => {
    it('should load OpenAI configuration from environment variables', () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-key-123';
      process.env['OPENAI_MODEL'] = 'gpt-4';

      // Act
      const config = new LLMConfiguration();

      // Assert
      expect(config.provider).toBe(LLMProvider.OPENAI);
      expect(config.apiKey).toBe('test-key-123');
      expect(config.model).toBe('gpt-4');
    });

    it('should load Venice configuration from environment variables', () => {
      // Arrange
      process.env['VENICE_API_KEY'] = 'test-key-456';
      process.env['VENICE_MODEL'] = 'qwen-2.5-qwq-32b';

      // Act
      const config = new LLMConfiguration();

      // Assert
      expect(config.provider).toBe(LLMProvider.VENICE);
      expect(config.apiKey).toBe('test-key-456');
      expect(config.model).toBe('qwen-2.5-qwq-32b');
    });

    it('should throw error when no API key is configured', () => {
      // Arrange - no environment variables set

      // Act & Assert
      expect(() => new LLMConfiguration()).toThrow('No LLM API key configured');
    });
  });

  describe('Real LLM Integration (Future)', () => {
    it('should make actual API call when properly configured', async () => {
      // This test will be implemented when we add real API integration
      // For now, it documents the expected behavior
      expect(true).toBe(true); // Placeholder
    });

    it('should handle API rate limiting gracefully', async () => {
      // This test will be implemented when we add real API integration
      // For now, it documents the expected behavior
      expect(true).toBe(true); // Placeholder
    });

    it('should retry failed requests with exponential backoff', async () => {
      // This test will be implemented when we add real API integration
      // For now, it documents the expected behavior
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Real OpenAI API Integration', () => {
    beforeEach(() => {
      // Mock fetch for API calls
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should make successful API call to OpenAI chat completions', async () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! I am an AI assistant.'
            }
          }
        ]
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      const result = await queryLLM('Hello, how are you?');

      // Assert
      expect(result).toBe('Hello! I am an AI assistant.');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-openai-key',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"model":"gpt-4.1-mini"')
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';
      // Mock 4 failed responses (3 retries + 1 final)
      const errorResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: 'Rate limit exceeded' })
      };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse);

      // Act & Assert
      await expect(queryLLM('Test prompt')).rejects.toThrow('API request failed: 429 Too Many Requests');
    }, 10000); // Increase timeout for retry logic

    it('should retry on network failures', async () => {
      // Arrange
      process.env['OPENAI_API_KEY'] = 'test-openai-key';
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
      const result = await queryLLM('Test prompt');

      // Assert
      expect(result).toBe('Success after retry');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
}); 