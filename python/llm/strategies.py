import os
from typing import Dict, Any, Optional
from pydantic import BaseModel
from openai import OpenAI
from groq import Groq


class LLMConfig(BaseModel):
    """Configuration for LLM providers"""

    def __init__(self, provider: str, api_key: str, model: str = None):
        self.provider = provider
        self.api_key = api_key
        self.model = model


class LLMStrategy:
    """Base class for LLM strategies"""

    def __init__(self, config: LLMConfig):
        self.config = config

    async def query(self, prompt: str, 
                   options: Optional[Dict[str, Any]] = None) -> str:
        """Query the LLM - to be implemented by subclasses"""
        raise NotImplementedError

    async def query_with_web_search(self, prompt: str, 
                                  **kwargs) -> str:
        """Query the LLM with web search capability - to be implemented by subclasses"""
        raise NotImplementedError


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

    async def query(self, prompt: str, **kwargs) -> str:
        """Query OpenAI without web search"""
        try:
            response = self.client.chat.completions.create(
                model=self.config.model,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {e}")

    async def query_with_web_search(self, prompt: str, **kwargs) -> str:
        """Query OpenAI with web search capability"""
        try:
            response = self.client.responses.create(
                model="gpt-4o",
                tools=[{"type": "web_search_preview"}],
                input=prompt,
                **kwargs
            )
            return response.output_text
        except Exception as e:
            raise Exception(f"OpenAI API error: {e}")


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
        """Query Grok LLM"""
        try:
            response = self.client.chat.completions.create(
                model=self.config.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Grok API error: {str(e)}")
