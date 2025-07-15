/**
 * @fileoverview Bitcoin news analysis workflow
 * @file src/workflows/bitcoinNews.ts
 * @description 3-step workflow: OpenAI web search -> Grok summarization -> OpenAI sentiment analysis
 */

import { Node } from '../agent/Node';
import { Graph } from '../agent/Graph';
import { Agent } from '../agent/Agent';
import { OpenAIStrategy } from '../llm/strategies/openai';
import { GrokStrategy } from '../llm/strategies/grok';
import { LLMConfig, LLMProvider } from '../llm/types';

/**
 * Result structure for Bitcoin news analysis
 */
export interface BitcoinNewsResult {
  headline: string;
  summary: string;
  sentiment: {
    analysis: 'bullish' | 'bearish' | 'neutral';
    reasoning: string;
  };
}

/**
 * Workflow execution metadata and status tracking
 */
export interface WorkflowMeta {
  executedSteps: string[];
  failedSteps: string[];
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  errors: Array<{ step: string; error: string; timestamp: Date }>;
  warnings: Array<{ step: string; warning: string; timestamp: Date }>;
}

/**
 * Chalkboard/scratchpad state for workflow execution
 * Tracks data, metadata, errors, and reliability of each step
 */
export interface WorkflowState {
  // Core data
  data: Partial<BitcoinNewsResult>;
  
  // Execution metadata
  meta: WorkflowMeta;
  
  // Error tracking
  errors: Array<{ step: string; error: string; timestamp: Date }>;
  
  // Reliability flags for each data field
  reliability: {
    headline: 'reliable' | 'unreliable' | 'missing';
    summary: 'reliable' | 'unreliable' | 'missing';
    sentiment: 'reliable' | 'unreliable' | 'missing';
  };
  
  // Step execution status
  stepStatus: {
    web_search: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    summarize: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    sentiment: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  };
}

/**
 * Analyzes Bitcoin news through a 3-step workflow:
 * 1. OpenAI web search for latest Bitcoin news headline
 * 2. Grok summarization of the headline
 * 3. OpenAI sentiment analysis of the summary
 * 
 * @param openaiOpt - Optional OpenAIStrategy instance (for testing)
 * @param grokOpt - Optional GrokStrategy instance (for testing)
 * @returns Promise<BitcoinNewsResult> - Complete analysis with headline, summary, and sentiment
 * @throws Error - If any step fails or returns invalid data
 */
export async function analyzeBitcoinNews(
  openaiOpt?: OpenAIStrategy,
  grokOpt?: GrokStrategy
): Promise<BitcoinNewsResult> {
  // Initialize chalkboard state
  const state: WorkflowState = {
    data: {},
    meta: {
      executedSteps: [],
      failedSteps: [],
      startTime: new Date(),
      errors: [],
      warnings: []
    },
    errors: [],
    reliability: {
      headline: 'missing',
      summary: 'missing',
      sentiment: 'missing'
    },
    stepStatus: {
      web_search: 'pending',
      summarize: 'pending',
      sentiment: 'pending'
    }
  };

  // Create LLM configurations
  const openaiConfig: LLMConfig = {
    provider: LLMProvider.OPENAI,
    apiKey: process.env['OPENAI_API_KEY'] || '',
    model: 'gpt-4o-mini',
    maxRetries: 3,
    timeoutMs: 30000
  };

  const grokConfig: LLMConfig = {
    provider: LLMProvider.GROK,
    apiKey: process.env['GROK_API_KEY'] || '',
    model: 'grok-3-mini',
    maxRetries: 3,
    timeoutMs: 30000
  };

  // Use injected or real strategies
  const openai = openaiOpt || new OpenAIStrategy();
  const grok = grokOpt || new GrokStrategy();

  // Define node IDs
  const WEB_SEARCH = 'web_search';
  const SUMMARIZE = 'summarize';
  const SENTIMENT = 'sentiment';

  // Create nodes
  const webSearchNode = new Node(WEB_SEARCH);
  const summarizeNode = new Node(SUMMARIZE);
  const sentimentNode = new Node(SENTIMENT);
  webSearchNode.addNextNode(summarizeNode);
  summarizeNode.addNextNode(sentimentNode);

  // Build graph and agent
  const graph = new Graph(webSearchNode, [summarizeNode, sentimentNode]);
  const agent = new Agent(graph);

  // Helper function to record step execution
  const recordStepExecution = (stepId: string, status: 'completed' | 'failed', error?: string) => {
    state.stepStatus[stepId as keyof typeof state.stepStatus] = status;
    state.meta.executedSteps.push(stepId);
    
    if (status === 'failed' && error) {
      const errorRecord = { step: stepId, error, timestamp: new Date() };
      state.errors.push(errorRecord);
      state.meta.errors.push(errorRecord);
      state.meta.failedSteps.push(stepId);
    }
  };

  // Helper function to update reliability
  const updateReliability = (field: keyof typeof state.reliability, status: 'reliable' | 'unreliable' | 'missing') => {
    state.reliability[field] = status;
  };

  // Map node IDs to handler functions
  const handlers: Record<string, (state: WorkflowState) => Promise<void>> = {
    [WEB_SEARCH]: async (state) => {
      try {
        state.stepStatus.web_search = 'running';
        const prompt = 'Find the latest Bitcoin news headline. Return only the headline text.';
        const headline = await openai.query(prompt, openaiConfig);
        state.data.headline = headline;
        updateReliability('headline', 'reliable');
        recordStepExecution(WEB_SEARCH, 'completed');
      } catch (err: any) {
        updateReliability('headline', 'unreliable');
        recordStepExecution(WEB_SEARCH, 'failed', err.message);
        throw err; // Re-throw to stop workflow
      }
    },
    [SUMMARIZE]: async (state) => {
      try {
        state.stepStatus.summarize = 'running';
        if (!state.data.headline) {
          const error = 'Cannot summarize: headline is missing';
          updateReliability('summary', 'unreliable');
          recordStepExecution(SUMMARIZE, 'failed', error);
          throw new Error(error);
        }
        
        const prompt = `Summarize this Bitcoin news headline: "${state.data.headline}"`;
        const summary = await grok.query(prompt, grokConfig);
        state.data.summary = summary;
        updateReliability('summary', 'reliable');
        recordStepExecution(SUMMARIZE, 'completed');
      } catch (err: any) {
        updateReliability('summary', 'unreliable');
        recordStepExecution(SUMMARIZE, 'failed', err.message);
        throw err; // Re-throw to stop workflow
      }
    },
    [SENTIMENT]: async (state) => {
      try {
        state.stepStatus.sentiment = 'running';
        if (!state.data.summary) {
          const error = 'Cannot analyze sentiment: summary is missing';
          updateReliability('sentiment', 'unreliable');
          recordStepExecution(SENTIMENT, 'failed', error);
          throw new Error(error);
        }
        
        const prompt = `Analyze the sentiment of this Bitcoin news summary: "${state.data.summary}". Respond in JSON: { analysis: 'bullish' | 'bearish' | 'neutral', reasoning: string }`;
        const response = await openai.query(prompt, openaiConfig);
        
        let sentiment;
        try {
          sentiment = JSON.parse(response);
        } catch {
          const error = 'Invalid sentiment analysis format';
          updateReliability('sentiment', 'unreliable');
          recordStepExecution(SENTIMENT, 'failed', error);
          throw new Error(error);
        }
        
        if (!sentiment || !sentiment.analysis || !sentiment.reasoning) {
          const error = 'Invalid sentiment analysis format';
          updateReliability('sentiment', 'unreliable');
          recordStepExecution(SENTIMENT, 'failed', error);
          throw new Error(error);
        }
        
        state.data.sentiment = sentiment;
        updateReliability('sentiment', 'reliable');
        recordStepExecution(SENTIMENT, 'completed');
      } catch (err: any) {
        updateReliability('sentiment', 'unreliable');
        recordStepExecution(SENTIMENT, 'failed', err.message);
        throw err; // Re-throw to stop workflow
      }
    }
  };

  // Execute workflow - execute current node, then step to next
  while (!agent.isCompleted()) {
    const nodeId = agent.getCurrentNodeId();
    if (nodeId && handlers[nodeId]) {
      await handlers[nodeId](state);
    }
    agent.step();
  }

  // Execute the final node if we haven't already
  const finalNodeId = agent.getCurrentNodeId();
  if (finalNodeId && handlers[finalNodeId] && !agent.hasVisited(finalNodeId)) {
    await handlers[finalNodeId](state);
  }

  // Finalize metadata
  state.meta.endTime = new Date();
  state.meta.totalDuration = state.meta.endTime.getTime() - state.meta.startTime.getTime();

  // Validate and return result
  if (!state.data.headline || !state.data.summary || !state.data.sentiment) {
    // If we have errors, throw the first one to preserve the original error
    if (state.errors.length > 0) {
      throw new Error(state.errors[0]?.error || 'Unknown error occurred');
    }
    
    // Otherwise, create detailed error message with state information
    const missingFields = [];
    if (!state.data.headline) missingFields.push('headline');
    if (!state.data.summary) missingFields.push('summary');
    if (!state.data.sentiment) missingFields.push('sentiment');
    
    const errorMessage = `Incomplete workflow result. Missing: ${missingFields.join(', ')}. Executed steps: ${state.meta.executedSteps.join(', ')}. Failed steps: ${state.meta.failedSteps.join(', ')}`;
    throw new Error(errorMessage);
  }
  
  return state.data as BitcoinNewsResult;
} 