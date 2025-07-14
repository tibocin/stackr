import os
import json
import asyncio
from typing import Dict, Any, Optional
from pydantic import BaseModel
import openai
import requests

class LLMConfig(BaseModel):
    provider: str
    api_key: str
    model: str
    max_retries: int = 3
    timeout_ms: int = 30000

class LLMStrategy:
    """Base LLM strategy class"""
    
    def __init__(self, config: LLMConfig):
        self.config = config
    
    async def query(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> str:
        """Query LLM - to be implemented by subclasses"""
        raise NotImplementedError

class OpenAIStrategy(LLMStrategy):
    """OpenAI LLM strategy implementation"""
    
    def __init__(self):
        config = LLMConfig(
            provider="openai",
            api_key=os.getenv("OPENAI_API_KEY", ""),
            model="gpt-4o-mini"
        )
        super().__init__(config)
        self.client = openai.AsyncOpenAI(api_key=self.config.api_key)
    
    async def query(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> str:
        """Query OpenAI LLM"""
        try:
            response = await self.client.chat.completions.create(
                model=self.config.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7,
                timeout=self.config.timeout_ms / 1000
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")

class GrokStrategy(LLMStrategy):
    """Grok (xAI) LLM strategy implementation"""
    
    def __init__(self):
        config = LLMConfig(
            provider="grok", 
            api_key=os.getenv("GROK_API_KEY", ""),
            model="grok-3-mini-fast"
        )
        super().__init__(config)
    
    async def query(self, prompt: str, options: Optional[Dict[str, Any]] = None) -> str:
        """Query Grok LLM via xAI API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.config.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.config.model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000,
                "temperature": 0.7,
                "stream": False
            }
            
            if options:
                payload.update(options)
            
            response = requests.post(
                "https://api.x.ai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=self.config.timeout_ms / 1000
            )
            response.raise_for_status()
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
            
        except Exception as e:
            raise Exception(f"Grok API error: {str(e)}")
