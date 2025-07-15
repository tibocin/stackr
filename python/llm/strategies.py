"""
LLM Strategy Factory and Registry
File: python/llm/strategies.py
Purpose: Provides a factory pattern for creating and managing LLM strategies
Related components: base.py, openai_strategy.py, grok_strategy.py
Tags: llm, strategy, factory, registry
"""

from typing import Dict, Type
from .base import LLMStrategy, LLMConfig
from .openai_strategy import OpenAIStrategy
from .grok_strategy import GrokStrategy


class LLMStrategyFactory:
    """Factory for creating LLM strategies"""
    
    _strategies: Dict[str, Type[LLMStrategy]] = {
        "openai": OpenAIStrategy,
        "grok": GrokStrategy,
    }
    
    @classmethod
    def create(cls, provider: str, **kwargs) -> LLMStrategy:
        """Create a strategy instance for the specified provider"""
        if provider not in cls._strategies:
            available = ", ".join(cls._strategies.keys())
            raise ValueError(f"Unknown provider '{provider}'. Available: {available}")
        
        strategy_class = cls._strategies[provider]
        return strategy_class(**kwargs)
    
    @classmethod
    def register(cls, provider: str, strategy_class: Type[LLMStrategy]):
        """Register a new strategy provider"""
        cls._strategies[provider] = strategy_class
    
    @classmethod
    def list_providers(cls) -> list:
        """List all available providers"""
        return list(cls._strategies.keys())


# Convenience functions for backward compatibility
def create_openai_strategy(config: LLMConfig = None) -> OpenAIStrategy:
    """Create an OpenAI strategy instance"""
    return OpenAIStrategy(config)


def create_grok_strategy() -> GrokStrategy:
    """Create a Grok strategy instance"""
    return GrokStrategy()


# Export all strategy classes for direct import
__all__ = [
    "LLMStrategyFactory",
    "LLMStrategy", 
    "LLMConfig",
    "OpenAIStrategy",
    "GrokStrategy",
    "create_openai_strategy",
    "create_grok_strategy"
]
