"""
Tests for LLM Strategy Factory and Implementations
File: python/tests/test_strategies.py
Purpose: Tests the factory pattern and individual strategy implementations
Related components: llm.base, llm.strategies, llm.openai_strategy, llm.grok_strategy
Tags: test, llm, strategy, factory
"""

import pytest
from unittest.mock import patch, AsyncMock
from llm import (
    LLMStrategyFactory,
    LLMStrategy,
    LLMConfig,
    OpenAIStrategy,
    GrokStrategy
)


class TestLLMStrategyFactory:
    """Test the LLM Strategy Factory"""

    def test_create_openai_strategy(self):
        """Test creating OpenAI strategy via factory"""
        strategy = LLMStrategyFactory.create("openai")
        assert isinstance(strategy, OpenAIStrategy)
        assert strategy.config.provider == "openai"

    def test_create_grok_strategy(self):
        """Test creating Grok strategy via factory"""
        strategy = LLMStrategyFactory.create("grok")
        assert isinstance(strategy, GrokStrategy)
        assert strategy.config.provider == "grok"

    def test_create_unknown_provider(self):
        """Test factory raises error for unknown provider"""
        with pytest.raises(ValueError, match="Unknown provider"):
            LLMStrategyFactory.create("unknown")

    def test_list_providers(self):
        """Test listing available providers"""
        providers = LLMStrategyFactory.list_providers()
        assert "openai" in providers
        assert "grok" in providers
        assert len(providers) == 2


class TestOpenAIStrategy:
    """Test OpenAI Strategy Implementation"""

    @pytest.mark.asyncio
    async def test_query_success(self):
        """Test successful OpenAI query"""
        strategy = OpenAIStrategy()
        
        with patch.object(strategy.client.chat.completions, 'create') as mock_create:
            mock_response = AsyncMock()
            mock_response.choices = [AsyncMock()]
            mock_response.choices[0].message.content = "Test response"
            mock_create.return_value = mock_response
            
            result = await strategy.query("Test prompt")
            assert result == "Test response"

    @pytest.mark.asyncio
    async def test_query_with_web_search_success(self):
        """Test successful OpenAI query with web search"""
        strategy = OpenAIStrategy()
        
        with patch.object(strategy.client.responses, 'create') as mock_create:
            mock_response = AsyncMock()
            mock_response.output_text = "Web search response"
            mock_create.return_value = mock_response
            
            result = await strategy.query_with_web_search("Test prompt")
            assert result == "Web search response"


class TestGrokStrategy:
    """Test Grok Strategy Implementation"""

    @pytest.mark.asyncio
    async def test_query_success(self):
        """Test successful Grok query"""
        strategy = GrokStrategy()
        
        with patch.object(strategy.client.chat.completions, 'create') as mock_create:
            mock_response = AsyncMock()
            mock_response.choices = [AsyncMock()]
            mock_response.choices[0].message.content = "Grok response"
            mock_create.return_value = mock_response
            
            result = await strategy.query("Test prompt")
            assert result == "Grok response"

    @pytest.mark.asyncio
    async def test_query_with_options(self):
        """Test Grok query with custom options"""
        strategy = GrokStrategy()
        
        with patch.object(strategy.client.chat.completions, 'create') as mock_create:
            mock_response = AsyncMock()
            mock_response.choices = [AsyncMock()]
            mock_response.choices[0].message.content = "Grok response with options"
            mock_create.return_value = mock_response
            
            options = {"temperature": 0.9, "max_tokens": 500}
            result = await strategy.query("Test prompt", options)
            assert result == "Grok response with options"
            
            # Verify options were passed to the API call
            mock_create.assert_called_once()
            call_args = mock_create.call_args[1]  # Get kwargs
            assert call_args["temperature"] == 0.9
            assert call_args["max_tokens"] == 500

    @pytest.mark.asyncio
    async def test_query_with_web_search_fallback(self):
        """Test Grok web search falls back to regular query"""
        strategy = GrokStrategy()
        
        with patch.object(strategy, 'query', new_callable=AsyncMock) as mock_query:
            mock_query.return_value = "Fallback response"
            
            result = await strategy.query_with_web_search("Test prompt")
            assert result == "Fallback response"
            mock_query.assert_called_once_with("Test prompt", None)


class TestLLMConfig:
    """Test LLM Configuration"""

    def test_config_creation(self):
        """Test creating LLM config"""
        config = LLMConfig("test", "test-key", "test-model")
        assert config.provider == "test"
        assert config.api_key == "test-key"
        assert config.model == "test-model"

    def test_config_default_model(self):
        """Test config with default model"""
        config = LLMConfig("test", "test-key")
        assert config.provider == "test"
        assert config.api_key == "test-key"
        assert config.model is None 