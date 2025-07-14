/**
 * @fileoverview Tests for Bitcoin news analysis workflow
 * @file __tests__/workflows/bitcoinNews.test.ts
 * @description Tests the 3-step workflow: web search -> summarization -> sentiment analysis
 */

import { analyzeBitcoinNews } from '../../src/workflows/bitcoinNews';

// Mock the LLM strategies
jest.mock('../../src/llm/strategies/openai', () => ({
  OpenAIStrategy: jest.fn().mockImplementation(() => ({
    query: jest.fn()
  }))
}));

jest.mock('../../src/llm/strategies/grok', () => ({
  GrokStrategy: jest.fn().mockImplementation(() => ({
    query: jest.fn()
  }))
}));

describe('Bitcoin News Workflow', () => {
  let mockOpenAIStrategy: any;
  let mockGrokStrategy: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get mock instances
    const { OpenAIStrategy } = require('../../src/llm/strategies/openai');
    const { GrokStrategy } = require('../../src/llm/strategies/grok');
    
    mockOpenAIStrategy = new OpenAIStrategy();
    mockGrokStrategy = new GrokStrategy();
  });

  describe('analyzeBitcoinNews', () => {
    it('should complete the 3-step workflow successfully', async () => {
      // Mock responses for each step
      const mockHeadline = 'Bitcoin reaches new all-time high of $120,000';
      const mockSummary = 'Bitcoin has achieved a new record price of $120,000, driven by increased institutional adoption and ETF inflows.';
      const mockSentiment = {
        analysis: 'bullish' as const,
        reasoning: 'The price reaching new highs indicates strong market confidence and institutional interest.'
      };

      // Setup mocks for each step
      mockOpenAIStrategy.query
        .mockResolvedValueOnce(mockHeadline)  // Step 1: Web search
        .mockResolvedValueOnce(JSON.stringify(mockSentiment)); // Step 3: Sentiment analysis
      
      mockGrokStrategy.query.mockResolvedValueOnce(mockSummary); // Step 2: Summarization

      // Execute the workflow
      const result = await analyzeBitcoinNews();

      // Verify the result structure
      expect(result).toEqual({
        headline: mockHeadline,
        summary: mockSummary,
        sentiment: mockSentiment
      });

      // Verify each step was called with appropriate prompts
      expect(mockOpenAIStrategy.query).toHaveBeenCalledTimes(2);
      expect(mockOpenAIStrategy.query).toHaveBeenNthCalledWith(
        1,
        'Find the latest Bitcoin news headline. Return only the headline text.'
      );
      expect(mockOpenAIStrategy.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('Analyze the sentiment of this Bitcoin news summary')
      );

      expect(mockGrokStrategy.query).toHaveBeenCalledTimes(1);
      expect(mockGrokStrategy.query).toHaveBeenCalledWith(
        expect.stringContaining('Summarize this Bitcoin news headline')
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock a failure in the web search step
      mockOpenAIStrategy.query.mockRejectedValueOnce(new Error('API rate limit exceeded'));

      // Should throw an error
      await expect(analyzeBitcoinNews()).rejects.toThrow('API rate limit exceeded');
    });

    it('should validate sentiment analysis format', async () => {
      const mockHeadline = 'Bitcoin price drops 10%';
      const mockSummary = 'Bitcoin experienced a significant decline in value.';
      const invalidSentiment = 'This is not valid JSON';

      mockOpenAIStrategy.query
        .mockResolvedValueOnce(mockHeadline)
        .mockResolvedValueOnce(invalidSentiment);
      
      mockGrokStrategy.query.mockResolvedValueOnce(mockSummary);

      // Should handle invalid JSON gracefully
      await expect(analyzeBitcoinNews()).rejects.toThrow('Invalid sentiment analysis format');
    });
  });
}); 