/**
 * src/llm/strategies/openai.ts
 * 
 * OpenAI LLM Strategy Implementation
 * 
 * This module implements the LLMStrategy interface for OpenAI's API.
 * Handles OpenAI-specific API calls, retry logic, and error handling.
 * Implements the Strategy Pattern as a concrete strategy for OpenAI.
 * 
 * Related components:
 * - LLMStrategy interface
 * - OpenAI API integration
 * - Retry logic and error handling
 * 
 * Tags: llm, strategy, openai, api, retry, error-handling
 */

import { LLMStrategy, LLMConfig, OpenAIResponse } from '../types';

/**
 * OpenAI LLM Strategy Implementation
 * Implements the Strategy Pattern for OpenAI's chat completions API
 */
export class OpenAIStrategy implements LLMStrategy {
  
  /**
   * Query the OpenAI LLM with the given prompt
   * 
   * @param prompt - The text prompt to send to the LLM
   * @param config - Configuration for the OpenAI provider
   * @returns Promise<string> - The LLM's response text
   * 
   * @throws Error - Throws error for API failures, rate limits, or network issues
   */
  async query(prompt: string, config: LLMConfig): Promise<string> {
    // Prepare request payload
    const payload = {
      model: config.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    };

    // Make API call with retry logic
    return await this.makeAPICallWithRetry(config, payload);
  }

  /**
   * Get the provider name for this strategy
   * 
   * @returns string - The provider name
   */
  getProviderName(): string {
    return 'openai';
  }

  /**
   * Check if this strategy is available (has required API keys)
   * 
   * @returns boolean - True if OpenAI API key is configured
   */
  isAvailable(): boolean {
    return !!process.env['OPENAI_API_KEY'];
  }

  /**
   * Makes an API call with retry logic and exponential backoff
   * 
   * @param config - LLM configuration
   * @param payload - Request payload
   * @returns Promise<string> - The LLM's response text
   */
  private async makeAPICallWithRetry(config: LLMConfig, payload: any): Promise<string> {
    const maxRetries = config.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(config.timeoutMs)
        });

        if (!response.ok) {
          const errorMessage = `API request failed: ${response.status} ${response.statusText}`;
          
          // Don't retry on client errors (4xx) except rate limits
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(errorMessage);
          }
          
          // For rate limits and server errors, throw error for retry logic
          throw new Error(errorMessage);
        }

        const data = await response.json() as OpenAIResponse;
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from API');
        }

        return data.choices[0].message.content;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait with exponential backoff (1s, 2s, 4s, etc.)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Unknown error occurred');
  }
} 