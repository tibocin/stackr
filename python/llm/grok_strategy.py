"""
Grok LLM Strategy Implementation
File: python/llm/grok_strategy.py
Purpose: Implements Grok-specific LLM strategy
Related components: base.py, strategies.py
Tags: llm, strategy, grok
"""

import os
from typing import Dict, Any, Optional
from groq import Groq
from .base import LLMStrategy, LLMConfig


class GrokStrategy(LLMStrategy):
    """Grok LLM strategy implementation"""

    def __init__(self):
        config = LLMConfig(
            provider="grok",
            api_key=os.getenv("GROK_API_KEY", ""),
            model="grok-3-mini"
        )
        super().__init__(config)
        self.client = Groq(api_key=self.config.api_key)

    async def query(self, prompt: str, 
                   options: Optional[Dict[str, Any]] = None) -> str:
        """Query Grok LLM with configurable options"""
        try:
            # Default parameters
            default_params = {
                "model": self.config.model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000,
                "temperature": 0.7,
                "stream": False
            }
            
            # Merge with provided options (options take precedence)
            if options:
                default_params.update(options)
            
            response = self.client.chat.completions.create(**default_params)
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Grok API error: {str(e)}")

    async def query_with_web_search(self, prompt: str, 
                                  options: Optional[Dict[str, Any]] = None) -> str:
        """Query Grok with web search capability (not yet implemented)"""
        # Grok doesn't have web search capability yet, fall back to regular query
        return await self.query(prompt, options) 