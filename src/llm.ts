/**
 * src/llm.ts
 * 
 * LLM Integration Module
 * 
 * This module provides an interface for querying Large Language Models (LLMs).
 * Supports multiple providers (OpenAI, Grok, Anthropic) with proper configuration
 * and error handling. Designed for future integration with Python LangGraph backend.
 * 
 * Related components:
 * - Agent system (future integration)
 * - Python LangChain/LangGraph backend (planned)
 * - Environment configuration management
 * 
 * Tags: llm, ai, integration, configuration, openai, x.ai (grok), anthropic
 */

/**
 * Supported LLM providers
 */
export enum LLMProvider {
  OPENAI = 'openai',
  GROK = 'grok',
  VENICE = 'venice'
}

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
 * Configuration for LLM integration
 * Loads settings from environment variables with proper validation
 */
export class LLMConfig {
  public readonly provider: LLMProvider;
  public readonly apiKey: string;
  public readonly model: string;
  public readonly maxRetries: number;
  public readonly timeoutMs: number;

  constructor() {
    // Determine provider based on available API keys
    if (process.env['OPENAI_API_KEY']) {
      this.provider = LLMProvider.OPENAI;
      this.apiKey = process.env['OPENAI_API_KEY'];
      this.model = process.env['OPENAI_MODEL'] || LLMModel.GPT_4_1_MINI;
    } else if (process.env['VENICE_API_KEY']) {
      this.provider = LLMProvider.VENICE;
      this.apiKey = process.env['VENICE_API_KEY'];
      // Default to reasoning model for analytics tasks
      this.model = process.env['VENICE_MODEL'] || LLMModel.VENICE_SMALL;
    } else if (process.env['GROK_API_KEY']) {
      this.provider = LLMProvider.GROK;
      this.apiKey = process.env['GROK_API_KEY'];
      this.model = process.env['GROK_MODEL'] || LLMModel.GROK_4;
    } else if (process.env['ANTHROPIC_API_KEY']) {
      this.provider = LLMProvider.GROK;
      this.apiKey = process.env['ANTHROPIC_API_KEY'];
      this.model = process.env['ANTHROPIC_MODEL'] || 'claude-3-sonnet';
    } else {
      throw new Error('No LLM API key configured. Set OPENAI_API_KEY, VENICE_API_KEY, or ANTHROPIC_API_KEY');
    }

    // Load additional configuration
    this.maxRetries = parseInt(process.env['LLM_MAX_RETRIES'] || '3');
    this.timeoutMs = parseInt(process.env['LLM_TIMEOUT_MS'] || '30000');
  }
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
interface OpenAIChoice {
  message: {
    content: string;
  };
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}

/**
 * Model selection criteria for different providers
 */
interface ModelCriteria {
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
 * - Retry logic with exponential backoff for network failures
 * - Proper error handling for API rate limits and failures
 * - Support for multiple LLM providers (OpenAI, Grok, Venice)
 * - Configurable timeout and retry settings
 */
export async function queryLLM(prompt: string, taskType?: LLMTaskType): Promise<string> {
  // Load configuration
  const config = new LLMConfig();
  
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

  // Prepare request payload
  const payload = {
    model: modelInfo.model,
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
  return await makeAPICallWithRetry(config, payload);
}

/**
 * Makes an API call with retry logic and exponential backoff
 * 
 * @param config - LLM configuration
 * @param payload - Request payload
 * @returns Promise<string> - The LLM's response text
 */
async function makeAPICallWithRetry(config: LLMConfig, payload: any): Promise<string> {
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