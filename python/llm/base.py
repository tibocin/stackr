"""
Base LLM strategy classes and interfaces
File: python/llm/base.py
Purpose: Provides base classes and interfaces for all LLM strategies
Related components: All LLM strategy implementations
Tags: llm, strategy, base, interface
"""

import os
from typing import Dict, Any, Optional
from pydantic import BaseModel


class LLMConfig(BaseModel):
    """Configuration for LLM providers"""
    provider: str
    api_key: str
    model: str = None


class LLMStrategy:
    """Base class for LLM strategies"""

    def __init__(self, config: LLMConfig):
        self.config = config

    async def query(self, prompt: str, 
                   options: Optional[Dict[str, Any]] = None) -> str:
        """Query the LLM - to be implemented by subclasses"""
        raise NotImplementedError

    async def query_with_web_search(self, prompt: str, 
                                  options: Optional[Dict[str, Any]] = None) -> str:
        """Query the LLM with web search capability - to be implemented by subclasses"""
        raise NotImplementedError 