"""
LLM Module - Strategy implementations for different providers
File: python/llm/__init__.py
Purpose: Provides convenient imports for all LLM strategy components
Related components: base.py, strategies.py, openai_strategy.py, grok_strategy.py
Tags: llm, strategy, imports
"""

# Import base classes and interfaces
from .base import LLMStrategy, LLMConfig

# Import specific strategy implementations
from .openai_strategy import OpenAIStrategy
from .grok_strategy import GrokStrategy

# Import factory and convenience functions
from .strategies import (
    LLMStrategyFactory,
    create_openai_strategy,
    create_grok_strategy
)

# Export all public components
__all__ = [
    # Base classes
    "LLMStrategy",
    "LLMConfig",
    
    # Strategy implementations
    "OpenAIStrategy", 
    "GrokStrategy",
    
    # Factory and utilities
    "LLMStrategyFactory",
    "create_openai_strategy",
    "create_grok_strategy"
]
