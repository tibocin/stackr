import json
from datetime import datetime
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from .state import BitcoinNewsState
from ..llm import OpenAIStrategy, GrokStrategy
from uuid import uuid4


class BitcoinNewsWorkflow:
    """Bitcoin news analysis workflow using LangGraph"""

    def __init__(self):
        self.openai = OpenAIStrategy()
        self.grok = GrokStrategy()
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(BitcoinNewsState)

        # Add nodes
        workflow.add_node("web_search", self._web_search_node)
        workflow.add_node("summarize", self._summarize_node)
        workflow.add_node("sentiment", self._sentiment_node)

        # Add edges
        workflow.add_edge("web_search", "summarize")
        workflow.add_edge("summarize", "sentiment")
        workflow.add_edge("sentiment", END)

        # Set entry point
        workflow.set_entry_point("web_search")

        return workflow.compile(checkpointer=MemorySaver())

    async def _web_search_node(self, 
                              state: BitcoinNewsState) -> BitcoinNewsState:
        """Web search node with real-time web search"""
        prompt = ("Find the latest Bitcoin news headline from today. "
                  "Return only the headline text.")
        state.headline = await self.openai.query_with_web_search(prompt)
        return state

    async def _summarize_node(self, 
                             state: BitcoinNewsState) -> BitcoinNewsState:
        """Summarize node"""
        if not state.headline:
            raise ValueError("Cannot summarize: headline is missing")

        prompt = f'Summarize this Bitcoin news headline: "{state.headline}"'
        state.summary = await self.grok.query(prompt)
        return state

    async def _sentiment_node(self, 
                             state: BitcoinNewsState) -> BitcoinNewsState:
        """Sentiment analysis node"""
        if not state.summary:
            raise ValueError("Cannot analyze sentiment: summary is missing")

        prompt = (f'Analyze the sentiment of this Bitcoin news summary: '
                  f'"{state.summary}". Respond in JSON: '
                  f'{{ "analysis": "bullish" | "bearish" | "neutral", '
                  f'"reasoning": "string" }}')
        response = await self.openai.query(prompt)

        # Parse JSON response - handle markdown code blocks
        try:
            # Strip markdown code blocks if present
            if response.startswith('```json'):
                response = (response.replace('```json', '')
                          .replace('```', '').strip())
            elif response.startswith('```'):
                response = response.replace('```', '').strip()

            sentiment = json.loads(response)
        except json.JSONDecodeError:
            raise ValueError("Invalid sentiment analysis format")

        if (not sentiment or "analysis" not in sentiment or
                "reasoning" not in sentiment):
            raise ValueError("Invalid sentiment analysis format")

        state.sentiment = sentiment
        state.end_time = datetime.now()
        return state

    async def run(self) -> BitcoinNewsState:
        """Run the workflow with a unique thread_id for checkpointing"""
        initial_state = BitcoinNewsState()
        thread_id = str(uuid4())  # Generate a unique thread/session ID
        # Pass thread_id in the config dict as required by LangGraph checkpointer
        result = await self.graph.ainvoke(
            initial_state, config={"configurable": {"thread_id": thread_id}}
        )
        return result
