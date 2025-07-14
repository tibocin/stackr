/**
 * src/llm.ts
 * 
 * LLM Integration Module
 * 
 * This module provides an interface for querying Large Language Models (LLMs).
 * Currently implemented as a stub that will be replaced with real LLM integration
 * via Python backend or external API calls.
 * 
 * Related components:
 * - Agent system (future integration)
 * - Python LangChain/LangGraph backend (planned)
 * 
 * Tags: llm, ai, stub, integration
 */

/**
 * Queries a Large Language Model with the given prompt
 * 
 * @param prompt - The text prompt to send to the LLM
 * @returns Promise<string> - The LLM's response text
 * 
 * @throws Error - Currently throws "Not implemented" as this is a stub
 * 
 * TODO: Replace with real LLM API call (e.g., via Python backend or external API)
 * TODO: Add proper error handling for network failures, rate limits, etc.
 * TODO: Add support for different LLM providers (OpenAI, Anthropic, etc.)
 * TODO: Add support for structured outputs and function calling
 */
export async function queryLLM(prompt: string): Promise<string> {
  // TODO: Integrate real LLM call (e.g., via Python backend or external API)
  // For now, this is a stub that will be replaced with actual LLM integration
  console.log(`LLM query stub called with prompt: ${prompt}`);
  throw new Error("Not implemented");
} 