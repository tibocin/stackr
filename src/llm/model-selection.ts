/**
 * src/llm/model-selection.ts
 * 
 * LLM Model Selection Module
 * 
 * This module handles model selection logic based on task type, budget, and
 * available providers. Implements the Strategy Pattern by selecting the optimal
 * model strategy for different use cases.
 * 
 * Related components:
 * - LLM strategies (OpenAI, Grok, Venice)
 * - Task type definitions
 * - Model capabilities and pricing
 * 
 * Tags: llm, model-selection, strategy, optimization, pricing
 */

import { LLMProvider, LLMTaskType, ModelCriteria } from './types';

/**
 * Supported LLM models with their official IDs
 * Optimized for analytics, code, and reasoning tasks
 */
export enum LLMModel {
  // OpenAI Models (Latest as of 2024)
  GPT_4_1 = 'gpt-4.1', // Flagship complex tasks
  GPT_4_1_MINI = 'gpt-4.1-mini', // Budget, fast for focused tasks
  GPT_4O_SEARCH_PREVIEW = 'gpt-4o-search-preview', // Web search model
  GPT_4O_MINI_SEARCH_PREVIEW = 'gpt-4o-mini-search-preview', // Budget Web search model
  GPT_4O = 'gpt-4o', // Fast, intelligent, flexible GPT model
  GPT_4O_MINI = 'gpt-4o-mini', // Budget, fast for focused tasks
  GPT_O3 = 'o3', // Prmium reasoning model
  GPT_O3_PRO = 'o3-pro', // Ultra-premium reasoning model more compute
  GPT_O4_MINI = 'o4-mini', // Affordable reasoning model
  GPT_4_1_NANO = 'gpt-4.1-nano', // Cheapest, fast for focused tasks
  GPT_O4_MINI_DEEP_RESEARCH = 'o4-mini-deep-research', // Budget, deep research
  GPT_03_DEEP_RESEARCH = 'gpt-03-deep-research', // Ultra-premium most powerful model deep research
  GPT_4o_Audio = 'gpt-4o-audio', // Real-time audio model

  // xAI (Grok) Models
  GROK_3_MINI = 'grok-3-mini', // Standard, fast for focused tasks
  GROK_4 = 'grok-4-0709', // Flagship complex tasks
  GROK_3_MINI_FAST = 'grok-3-mini-fast', // Fast, good for analytics
  
  // Venice AI Models - Analytics & Reasoning
  VENICE_REASONING = 'qwen-2.5-qwq-32b',           // Best for reasoning tasks
  VENICE_SMALL = 'qwen3-4b',                       // Fast, good for analytics
  VENICE_MEDIUM = 'mistral-31-24b',                // Vision + function calling
  VENICE_LARGE = 'qwen3-235b',                     // Most capable for complex analytics
  
  // Venice AI Models - Code Optimization
  VENICE_CODER = 'qwen-2.5-coder-32b',             // Optimized for code generation
  DEEPSEEK_CODER = 'deepseek-coder-v2-lite',       // Fast code generation
  
  // Venice AI Models - Advanced Reasoning
  DEEPSEEK_R1 = 'deepseek-r1-671b',                // Best reasoning capabilities
  LLAMA_405B = 'llama-3.1-405b',                   // Most intelligent (premium)
  
  // Venice AI Models - Fast Processing
  LLAMA_3_2_3B = 'llama-3.2-3b',                   // Fastest processing
  LLAMA_3_3_70B = 'llama-3.3-70b',                 // Balanced speed/capability
}

/**
 * Gets the optimal model for a specific task type across available providers
 * 
 * @param taskType - The type of task to optimize for
 * @param availableProviders - Array of available provider API keys (optional, will auto-detect)
 * @param budget - Optional budget constraint ('budget', 'standard', 'premium', 'ultra')
 * @param priority - Optional priority ('cost', 'speed', 'quality')
 * @returns ModelCriteria - The recommended model with provider info
 */
export function getOptimalModel(
  taskType: LLMTaskType, 
  availableProviders?: LLMProvider[],
  budget: 'budget' | 'standard' | 'premium' | 'ultra' = 'standard',
  priority: 'cost' | 'speed' | 'quality' = 'quality'
): ModelCriteria {
  
  // Auto-detect available providers if not specified
  const detectedProviders: LLMProvider[] = [];
  if (process.env['OPENAI_API_KEY']) detectedProviders.push(LLMProvider.OPENAI);
  if (process.env['GROK_API_KEY']) detectedProviders.push(LLMProvider.GROK);
  if (process.env['VENICE_API_KEY']) detectedProviders.push(LLMProvider.VENICE);
  
  const providers = availableProviders || detectedProviders;
  
  // Define model capabilities for each provider
  const modelOptions: ModelCriteria[] = [
    // OpenAI Models
    {
      provider: LLMProvider.OPENAI,
      model: LLMModel.GPT_4_1,
      costPer1MInputTokens: 2.0,
      costPer1MOutputTokens: 8.0,
      speed: 'medium',
      capabilities: { reasoning: true, code: true, vision: true, context: 128000, functions: true, structured_output: true, streaming: false },
      tools: {
        web_search: true,
        file_search: true,
        image_generation: true,
        code_interpreter: true,
        mcp: true,
      },
    },
    {
      provider: LLMProvider.OPENAI,
      model: LLMModel.GPT_4O,
      costPer1MInputTokens: 2.5,
      costPer1MOutputTokens: 10.0,
      speed: 'medium',
      capabilities: { reasoning: true, code: true, vision: true, context: 128000, functions: true, structured_output: true, streaming: false },
      tools: {
        web_search: true,
        file_search: true,
        image_generation: true,
        code_interpreter: true,
        mcp: true,
      },
    },
    {
      provider: LLMProvider.OPENAI,
      model: LLMModel.GPT_4O_MINI,
      costPer1MInputTokens: 0.15,
      costPer1MOutputTokens: 0.60,
      speed: 'fast',
      capabilities: { 
        reasoning: false, 
        code: true, 
        vision: false, 
        context: 128000, 
        functions: true, 
        structured_output: true, 
        streaming: false
      },
      tools: {
        web_search: true,
        file_search: true,
        image_generation: true,
        code_interpreter: true,
        mcp: true,
      },
    },
    {
      provider: LLMProvider.OPENAI,
      model: LLMModel.GPT_4_1_MINI,
      costPer1MInputTokens: 0.4,
      costPer1MOutputTokens: 1.6,
      speed: 'fast',
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
      },
    },
    {
      provider: LLMProvider.OPENAI,
      model: LLMModel.GPT_4O_SEARCH_PREVIEW,
      costPer1MInputTokens: 2.50,
      costPer1MOutputTokens: 10.0,
      speed: 'fast',
      capabilities: { reasoning: true, 
        code: false, 
        vision: false, 
        context: 128000, 
        functions: false, 
        structured_output: true, 
        streaming: false 
      }, 
      tools: {
        web_search: true,
        file_search: false,
        image_generation: false,
        code_interpreter: false,
        mcp: false,
      },
    },
    {
      provider: LLMProvider.OPENAI,
      model: LLMModel.GPT_4O_MINI_SEARCH_PREVIEW,
      costPer1MInputTokens: 0.15,
      costPer1MOutputTokens: 0.60,
      speed: 'fast',
      capabilities: { 
        reasoning: true, 
        code: false, 
        vision: false, 
        context: 128000, 
        functions: false, 
        structured_output: true, 
        streaming: false 
      }, 
      tools: {
        web_search: true,
        file_search: false,
        image_generation: false,
        code_interpreter: false,
        mcp: false,
      },
    },
    // xAI (Grok) Models
    {
      provider: LLMProvider.GROK,
      model: LLMModel.GROK_4,
      costPer1MInputTokens: 3.0,
      costPer1MOutputTokens: 15.0,
      speed: 'fast',
      capabilities: { 
        reasoning: true,
        code: true,
        vision: true,
        context: 128000,
        functions: true,
        structured_output: true,
        streaming: false
      },
      tools: {
        web_search: true,
        file_search: true,
        image_generation: true,
        code_interpreter: true,
        mcp: true,
      },
    },
    {
      provider: LLMProvider.GROK,
      model: LLMModel.GROK_3_MINI,
      costPer1MInputTokens: 0.3,
      costPer1MOutputTokens: 0.5,
      speed: 'fast',
      capabilities: { 
        reasoning: true, 
        functions: true,
        structured_output: true,
        code: true, 
        vision: false, 
        context: 128000,
        streaming: true
      },
      tools: {
        web_search: true,
        file_search: true,
        image_generation: true,
        code_interpreter: true,
        mcp: true,
      },
    },
    {
      provider: LLMProvider.GROK,
      model: LLMModel.GROK_3_MINI_FAST,
      costPer1MInputTokens: 0.6,
      costPer1MOutputTokens: 4.0,
      speed: 'fast',
      capabilities: { 
        reasoning: true, 
        functions: true,
        structured_output: true,
        code: true, 
        vision: false, 
        context: 128000,
        streaming: true
      },
      tools: {
        web_search: true,
        file_search: true,
        image_generation: true,
        code_interpreter: true,
        mcp: true,
      },
    },
    
    // Venice Models
    {
      provider: LLMProvider.VENICE,
      model: LLMModel.VENICE_REASONING,
      costPer1MInputTokens: 1.5,
      costPer1MOutputTokens: 6.0,
      speed: 'medium',
      capabilities: { reasoning: true, code: false, vision: false, context: 32768, functions: true, structured_output: true, streaming: false },
      tools: {
        web_search: true,
        file_search: false,
        image_generation: true,
        code_interpreter: true,
        mcp: false,
      },
    },
    {
      provider: LLMProvider.VENICE,
      model: LLMModel.VENICE_CODER,
      costPer1MInputTokens: 0.5,
      costPer1MOutputTokens: 2.0,
      speed: 'medium',
      capabilities: { reasoning: false, code: true, vision: false, context: 32768, functions: true, structured_output: true, streaming: false },
      tools: {
        web_search: true,
        file_search: false,
        image_generation: true,
        code_interpreter: true,
        mcp: false,
      },
    },
    {
      provider: LLMProvider.VENICE,
      model: LLMModel.VENICE_SMALL,
      costPer1MInputTokens: 0.15,
      costPer1MOutputTokens: 0.6,
      speed: 'fast',
      capabilities: { reasoning: true, code: true, vision: false, context: 32768, functions: true, structured_output: true, streaming: false },
      tools: {
        web_search: true,
        file_search: false,
        image_generation: true,
        code_interpreter: true,
        mcp: false,
      },
    },
    {
      provider: LLMProvider.VENICE,
      model: LLMModel.DEEPSEEK_R1,
      costPer1MInputTokens: 3.5,
      costPer1MOutputTokens: 14.0,
      speed: 'slow',
      capabilities: { reasoning: true, code: false, vision: false, context: 131072, functions: true, structured_output: true, streaming: false },
      tools: {
        web_search: true,
        file_search: false,
        image_generation: true,
        code_interpreter: true,
        mcp: false,
      },
    }
  ];

  // Filter by available providers
  const availableModels = modelOptions.filter(option => 
    providers.includes(option.provider)
  );

  // Filter by task requirements
  const taskRequirements = {
    [LLMTaskType.ANALYTICS]: { reasoning: true, code: false, vision: false },
    [LLMTaskType.CODE_GENERATION]: { reasoning: false, code: true, vision: false },
    [LLMTaskType.REASONING]: { reasoning: true, code: false, vision: false },
    [LLMTaskType.FAST_PROCESSING]: { reasoning: false, code: false, vision: false },
    [LLMTaskType.VISION]: { reasoning: false, code: false, vision: true }
  };

  const suitableModels = availableModels.filter(option => {
    const requirements = taskRequirements[taskType];
    return (
      (!requirements.reasoning || option.capabilities.reasoning) &&
      (!requirements.code || option.capabilities.code) &&
      (!requirements.vision || option.capabilities.vision)
    );
  });

  // Filter by budget
  const budgetFiltered = suitableModels.filter(option => {
    switch (budget) {
      case 'budget': return option.costPer1MInputTokens <= 0.5;
      case 'standard': return option.costPer1MInputTokens <= 2.0;
      case 'premium': return option.costPer1MInputTokens <= 10.0;
      case 'ultra': return true;
      default: return true;
    }
  });

  if (budgetFiltered.length === 0) {
    // Fallback to any suitable model if budget is too restrictive
    return suitableModels[0] || availableModels[0] || modelOptions[0] || {
      provider: LLMProvider.OPENAI,
      model: LLMModel.GPT_4_1_MINI,
      costPer1MInputTokens: 0.4,
      costPer1MOutputTokens: 1.6,
      speed: 'fast',
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
      },
    }
  }

  // Sort by priority
  const sorted = budgetFiltered.sort((a, b) => {
    switch (priority) {
      case 'cost':
        return a.costPer1MInputTokens - b.costPer1MInputTokens;
      case 'speed':
        const speedOrder = { fast: 1, medium: 2, slow: 3 };
        return speedOrder[a.speed] - speedOrder[b.speed];
      case 'quality':
        // Quality is based on reasoning capability and context length
        const qualityA = (a.capabilities.reasoning ? 10 : 0) + (a.capabilities.context / 1000);
        const qualityB = (b.capabilities.reasoning ? 10 : 0) + (b.capabilities.context / 1000);
        return qualityB - qualityA;
      default:
        return 0;
    }
  });

  return sorted[0] || modelOptions[0] || {
      provider: LLMProvider.OPENAI,
      model: LLMModel.GPT_4_1_MINI,
      costPer1MInputTokens: 0.4,
      costPer1MOutputTokens: 1.6,
      speed: 'fast',
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
      },
    }
} 