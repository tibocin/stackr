/**
 * src/llm/types.ts
 * 
 * LLM Strategy Interface and Shared Types
 * 
 * This module defines the strategy interface for LLM providers and shared types
 * used across the LLM module. Implements the Strategy Pattern for interchangeable
 * LLM provider implementations.
 * 
 * Related components:
 * - LLM strategies (OpenAI, Grok, Venice)
 * - LLM configuration and model selection
 * - Main LLM context and query interface
 * 
 * Tags: llm, strategy, interface, types, design-pattern
 */

/**
 * Strategy interface for LLM providers
 * Each provider must implement this interface to be used by the LLM context
 */
export interface LLMStrategy {
  /**
   * Query the LLM with the given prompt
   * 
   * @param prompt - The text prompt to send to the LLM
   * @param config - Configuration for the LLM provider
   * @returns Promise<string> - The LLM's response text
   * 
   * @throws Error - Throws error for API failures, rate limits, or network issues
   */
  query(prompt: string, config: LLMConfig): Promise<string>;
  
  /**
   * Get the provider name for this strategy
   * 
   * @returns string - The provider name (e.g., 'openai', 'grok', 'venice')
   */
  getProviderName(): string;
  
  /**
   * Check if this strategy is available (has required API keys)
   * 
   * @returns boolean - True if the strategy can be used
   */
  isAvailable(): boolean;
}

/**
 * LLM Configuration interface
 * Contains all necessary configuration for LLM operations
 */
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  maxRetries: number;
  timeoutMs: number;
}

/**
 * Supported LLM providers
 */
export enum LLMProvider {
  OPENAI = 'openai',
  GROK = 'grok',
  VENICE = 'venice'
}

/**
 * Task types for model selection
 */
export enum LLMTaskType {
  ANALYTICS = 'analytics',
  CODE_GENERATION = 'code_generation',
  REASONING = 'reasoning',
  FAST_PROCESSING = 'fast_processing',
  VISION = 'vision',
}

/**
 * OpenAI API response types
 */
export interface OpenAIChoice {
  message: {
    content: string;
  };
}

export interface OpenAIResponse {
  choices: OpenAIChoice[];
}

/**
 * Model selection criteria for different providers
 */
export interface ModelCriteria {
  provider: LLMProvider;
  model: string;
  costPer1MInputTokens: number;
  costPer1MOutputTokens: number;
  speed: 'fast' | 'medium' | 'slow';
  capabilities: {
    reasoning: boolean;
    code: boolean;
    vision: boolean;
    context: number;
    functions: boolean;
    structured_output: boolean;
    streaming: boolean;
  },
  tools: {
    web_search: boolean;
    file_search: boolean;
    image_generation: boolean;
    code_interpreter: boolean;
    mcp: boolean;
  }
} 