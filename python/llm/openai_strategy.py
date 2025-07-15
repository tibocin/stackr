"""
OpenAI LLM Strategy Implementation
File: python/llm/openai_strategy.py
Purpose: Implements OpenAI-specific LLM strategy with web search capabilities
Related components: base.py, strategies.py
Tags: llm, strategy, openai, web-search
"""

import os
from typing import Dict, Any, Optional
from openai import OpenAI
from .base import LLMStrategy, LLMConfig


class OpenAIStrategy(LLMStrategy):
    """OpenAI LLM strategy with web search capability"""

    def __init__(self, config: LLMConfig = None):
        if config is None:
            config = LLMConfig(
                provider="openai",
                api_key=os.getenv("OPENAI_API_KEY", ""),
                model="gpt-4o"
            )
        super().__init__(config)
        self.client = OpenAI(api_key=self.config.api_key)

    async def query(self, prompt: str, 
                   options: Optional[Dict[str, Any]] = None) -> str:
        """Query OpenAI without web search"""
        try:
            # Default parameters
            default_params = {
                "model": self.config.model,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            # Merge with provided options (options take precedence)
            if options:
                default_params.update(options)
            
            response = self.client.chat.completions.create(**default_params)
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {e}")

    async def query_with_web_search(self, prompt: str, 
                                  options: Optional[Dict[str, Any]] = None) -> str:
        """Query OpenAI with web search capability"""
        try:
            # Default parameters for web search
            default_params = {
                "model": "gpt-4o",
                "tools": [{"type": "web_search_preview"}],
                "input": prompt
            }
            
            # Merge with provided options (options take precedence)
            if options:
                default_params.update(options)
            
            response = self.client.responses.create(**default_params)
            return response.output_text
        except Exception as e:
            raise Exception(f"OpenAI API error: {e}") 