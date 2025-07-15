/**
 * src/llm/config.ts
 * 
 * LLM Configuration Module
 * 
 * This module handles LLM configuration loading from environment variables
 * and provides a factory for creating LLM configurations. Implements the
 * Strategy Pattern by detecting available providers and creating appropriate
 * configurations.
 * 
 * Related components:
 * - LLM strategies (OpenAI, Grok, Venice)
 * - Environment variable management
 * - Provider detection and configuration
 * 
 * Tags: llm, config, factory, environment, provider-detection
 */

import { LLMConfig, LLMProvider } from './types';

/**
 * Configuration for LLM integration
 * Loads settings from environment variables with proper validation
 * Implements the Factory Pattern for creating LLM configurations
 */
export class LLMConfiguration implements LLMConfig {
  public provider: LLMProvider;
  public apiKey: string;
  public model: string;
  public readonly maxRetries: number;
  public readonly timeoutMs: number;

  constructor() {
    // Determine provider based on available API keys
    if (process.env['OPENAI_API_KEY']) {
      this.provider = LLMProvider.OPENAI;
      this.apiKey = process.env['OPENAI_API_KEY'];
      this.model = process.env['OPENAI_MODEL'] || 'gpt-4.1-mini';
    } else if (process.env['VENICE_API_KEY']) {
      this.provider = LLMProvider.VENICE;
      this.apiKey = process.env['VENICE_API_KEY'];
      // Default to reasoning model for analytics tasks
      this.model = process.env['VENICE_MODEL'] || 'qwen3-4b';
    } else if (process.env['GROK_API_KEY']) {
      this.provider = LLMProvider.GROK;
      this.apiKey = process.env['GROK_API_KEY'];
      this.model = process.env['GROK_MODEL'] || 'grok-4-0709';
    } else {
      throw new Error('No LLM API key configured. Set OPENAI_API_KEY, VENICE_API_KEY, or ANTHROPIC_API_KEY');
    }

    // Load additional configuration
    this.maxRetries = parseInt(process.env['LLM_MAX_RETRIES'] || '3');
    this.timeoutMs = parseInt(process.env['LLM_TIMEOUT_MS'] || '30000');
  }

  /**
   * Factory method to create configuration for a specific provider
   * 
   * @param provider - The provider to create configuration for
   * @returns LLMConfiguration - Configuration for the specified provider
   * 
   * @throws Error - If the provider is not available or not configured
   */
  static createForProvider(provider: LLMProvider): LLMConfiguration {
    const envKey = this.getEnvKeyForProvider(provider);
    const modelKey = this.getModelEnvKeyForProvider(provider);
    
    if (!process.env[envKey]) {
      throw new Error(`Provider ${provider} is not configured. Set ${envKey} environment variable.`);
    }

    const config = new LLMConfiguration();
    
    // Override the provider and model
    config.provider = provider;
    config.apiKey = process.env[envKey]!;
    config.model = process.env[modelKey] || this.getDefaultModelForProvider(provider);
    
    return config;
  }

  /**
   * Get the environment variable key for a provider's API key
   * 
   * @param provider - The provider to get the env key for
   * @returns string - The environment variable key
   */
  private static getEnvKeyForProvider(provider: LLMProvider): string {
    switch (provider) {
      case LLMProvider.OPENAI:
        return 'OPENAI_API_KEY';
      case LLMProvider.GROK:
        return 'GROK_API_KEY';
      case LLMProvider.VENICE:
        return 'VENICE_API_KEY';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Get the environment variable key for a provider's model
   * 
   * @param provider - The provider to get the model env key for
   * @returns string - The environment variable key
   */
  private static getModelEnvKeyForProvider(provider: LLMProvider): string {
    switch (provider) {
      case LLMProvider.OPENAI:
        return 'OPENAI_MODEL';
      case LLMProvider.GROK:
        return 'GROK_MODEL';
      case LLMProvider.VENICE:
        return 'VENICE_MODEL';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Get the default model for a provider
   * 
   * @param provider - The provider to get the default model for
   * @returns string - The default model name
   */
  private static getDefaultModelForProvider(provider: LLMProvider): string {
    switch (provider) {
      case LLMProvider.OPENAI:
        return 'gpt-4.1-mini';
      case LLMProvider.GROK:
        return 'grok-4-0709';
      case LLMProvider.VENICE:
        return 'qwen3-4b';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Check if a provider is available (has API key configured)
   * 
   * @param provider - The provider to check
   * @returns boolean - True if the provider is available
   */
  static isProviderAvailable(provider: LLMProvider): boolean {
    const envKey = this.getEnvKeyForProvider(provider);
    return !!process.env[envKey];
  }

  /**
   * Get all available providers
   * 
   * @returns LLMProvider[] - Array of available providers
   */
  static getAvailableProviders(): LLMProvider[] {
    const providers: LLMProvider[] = [];
    
    if (this.isProviderAvailable(LLMProvider.OPENAI)) {
      providers.push(LLMProvider.OPENAI);
    }
    if (this.isProviderAvailable(LLMProvider.GROK)) {
      providers.push(LLMProvider.GROK);
    }
    if (this.isProviderAvailable(LLMProvider.VENICE)) {
      providers.push(LLMProvider.VENICE);
    }
    
    return providers;
  }
} 