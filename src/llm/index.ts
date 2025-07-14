/**
 * src/llm/index.ts
 * 
 * LLM Module Main Entry Point
 * 
 * This module provides the public interface for LLM operations and implements
 * the Strategy Pattern context. It selects and uses the appropriate LLM strategy
 * based on configuration and availability.
 * 
 * Related components:
 * - LLM strategies (OpenAI, Grok, Venice)
 * - Configuration management
 * - Model selection logic
 * 
 * Tags: llm, strategy, context, public-interface, provider-dispatch
 */

import { LLMStrategy, LLMConfig, LLMProvider, LLMTaskType } from './types';
import { LLMConfiguration } from './config';
import { getOptimalModel } from './model-selection';
import { OpenAIStrategy } from './strategies/openai';
import { GrokStrategy } from './strategies/grok';

/**
 * LLM Context Class
 * Implements the Strategy Pattern context for LLM operations
 */
class LLMContext {
  private strategy: LLMStrategy | null = null;
  private config: LLMConfig | null = null;

  /**
   * Set the strategy to use for LLM operations
   * 
   * @param strategy - The LLM strategy to use
   */
  setStrategy(strategy: LLMStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Set the configuration for LLM operations
   * 
   * @param config - The LLM configuration to use
   */
  setConfig(config: LLMConfig): void {
    this.config = config;
  }

  /**
   * Execute a query using the current strategy
   * 
   * @param prompt - The text prompt to send to the LLM
   * @returns Promise<string> - The LLM's response text
   * 
   * @throws Error - If no strategy or config is set
   */
  async executeQuery(prompt: string): Promise<string> {
    if (!this.strategy) {
      throw new Error('No LLM strategy set');
    }
    if (!this.config) {
      throw new Error('No LLM configuration set');
    }

    return await this.strategy.query(prompt, this.config);
  }

  /**
   * Get the current strategy
   * 
   * @returns LLMStrategy | null - The current strategy
   */
  getStrategy(): LLMStrategy | null {
    return this.strategy;
  }

  /**
   * Get the current configuration
   * 
   * @returns LLMConfig | null - The current configuration
   */
  getConfig(): LLMConfig | null {
    return this.config;
  }
}

// Global LLM context instance
const llmContext = new LLMContext();

/**
 * Strategy factory for creating LLM strategies
 * 
 * @param provider - The provider to create a strategy for
 * @returns LLMStrategy - The strategy for the specified provider
 * 
 * @throws Error - If the provider is not supported
 */
function createStrategy(provider: LLMProvider): LLMStrategy {
  switch (provider) {
    case LLMProvider.OPENAI:
      return new OpenAIStrategy();
    case LLMProvider.GROK:
      return new GrokStrategy();
    case LLMProvider.VENICE:
      throw new Error('Venice strategy not yet implemented');
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Queries a Large Language Model with the given prompt
 * 
 * @param prompt - The text prompt to send to the LLM
 * @param taskType - Optional task type for model optimization
 * @returns Promise<string> - The LLM's response text
 * 
 * @throws Error - Throws error for API failures, rate limits, or network issues
 * 
 * Features:
 * - Automatic model selection based on task type and budget
 * - Strategy Pattern implementation for provider selection
 * - Retry logic with exponential backoff for network failures
 * - Proper error handling for API rate limits and failures
 * - Support for multiple LLM providers (OpenAI, Grok, Venice)
 * - Configurable timeout and retry settings
 */
export async function queryLLM(prompt: string, taskType?: LLMTaskType): Promise<string> {
  // Load configuration
  const config = new LLMConfiguration();
  
  // Get optimal model for the task if specified
  const modelInfo = taskType ? getOptimalModel(taskType) : {
    provider: config.provider,
    model: config.model,
    costPer1MInputTokens: 0.4,
    costPer1MOutputTokens: 1.6,
    speed: 'fast' as const,
    capabilities: { 
      reasoning: false, 
      code: true, 
      vision: false, 
      context: 16385,
      functions: true,
      structured_output: true,
      streaming: true
    },
    tools: {
      web_search: true,
      file_search: true,
      image_generation: false,
      code_interpreter: true,
      mcp: true,
    }
  };

  // Create strategy for the selected provider
  const strategy = createStrategy(modelInfo.provider);
  
  // Update configuration with the selected model
  config.model = modelInfo.model;
  
  // Set strategy and config in context
  llmContext.setStrategy(strategy);
  llmContext.setConfig(config);
  
  // Execute the query using the strategy pattern
  return await llmContext.executeQuery(prompt);
}

// Export types and classes for external use
export { LLMProvider, LLMTaskType } from './types';
export { LLMConfiguration } from './config';
export { getOptimalModel } from './model-selection';
export { OpenAIStrategy } from './strategies/openai';
export { GrokStrategy } from './strategies/grok'; 