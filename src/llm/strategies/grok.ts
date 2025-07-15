/**
 * src/llm/strategies/grok.ts
 * 
 * Grok (xAI) LLM Strategy Implementation
 * 
 * This module implements the LLMStrategy interface for xAI's Grok API.
 * Handles Grok-specific API calls, retry logic, and error handling.
 * Implements the Strategy Pattern as a concrete strategy for Grok.
 * 
 * Related components:
 * - LLMStrategy interface
 * - Grok API integration
 * - Retry logic and error handling
 * 
 * Tags: llm, strategy, grok, xai, api, retry, error-handling
 */

import { LLMStrategy, LLMConfig } from '../types';

/**
 * Advanced Grok payload options (optional fields)
 */
export interface GrokPayloadOptions {
  deferred?: any;
  frequency_penalty?: number | null;
  logit_bias?: any;
  logprobs?: any;
  max_completion_tokens?: number | null;
  max_tokens?: number | null;
  n?: number | null;
  parallel_tool_calls?: any;
  presence_penalty?: number | null;
  reasoning_effort?: any;
  response_format?: any;
  search_parameters?: any;
  seed?: number | null;
  stop?: string[] | null;
  stream?: boolean | null;
  stream_options?: any;
  temperature?: number | null;
  tool_choice?: any;
  tools?: any;
  top_logprobs?: any;
  top_p?: number | null;
  user?: string | null;
  web_search_options?: any;
}

/**
 * Grok API response types
 */
interface GrokChoice {
  message: {
    content: string;
  };
}

interface GrokResponse {
  choices: GrokChoice[];
}

/**
 * Grok LLM Strategy Implementation
 * Implements the Strategy Pattern for xAI's Grok API
 */
export class GrokStrategy implements LLMStrategy {
  
  /**
   * Query the Grok LLM with the given prompt and advanced options
   * 
   * @param prompt - The text prompt to send to the LLM
   * @param config - Configuration for the Grok provider
   * @param options - Advanced Grok payload options (optional)
   * @returns Promise<string> - The LLM's response text
   * 
   * @throws Error - Throws error for API failures, rate limits, or network issues
   */
  async query(prompt: string, config: LLMConfig, options?: GrokPayloadOptions): Promise<string> {
    // Prepare request payload for Grok API
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
      stream: false,
      ...options // Merge in advanced options
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
    return 'grok';
  }

  /**
   * Check if this strategy is available (has required API keys)
   * 
   * @returns boolean - True if Grok API key is configured
   */
  isAvailable(): boolean {
    return !!process.env['GROK_API_KEY'];
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
        // Grok uses the same API structure as OpenAI but different endpoint
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(config.timeoutMs)
        });

        if (!response.ok) {
          const errorMessage = `Grok API request failed: ${response.status} ${response.statusText}`;
          // Don't retry on client errors (4xx) except rate limits
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            lastError = new Error(errorMessage);
            break; // Exit retry loop immediately
          }
          // For rate limits and server errors, throw error for retry logic
          throw new Error(errorMessage);
        }

        const data = await response.json() as GrokResponse;
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from Grok API');
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

    throw lastError || new Error('Unknown error occurred with Grok API');
  }
} 