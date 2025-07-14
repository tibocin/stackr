#!/usr/bin/env python3
"""
Simple runner script for Bitcoin news workflow
"""

import asyncio
import os
from dotenv import load_dotenv
from workflows.bitcoin_news import BitcoinNewsWorkflow


async def main():
    """Run the Bitcoin news workflow"""
    # Load environment variables
    load_dotenv()

    # Check for required API keys
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable is required")
        return

    if not os.getenv("GROK_API_KEY"):
        print("Error: GROK_API_KEY environment variable is required")
        return

    try:
        # Create and run workflow
        workflow = BitcoinNewsWorkflow()
        result = await workflow.run()

        # Print results
        print("=== Bitcoin News Analysis Results ===")
        print(f"Headline: {result.headline}")
        print(f"Summary: {result.summary}")
        print(f"Sentiment: {result.sentiment['analysis']}")
        print(f"Reasoning: {result.sentiment['reasoning']}")
        duration = (result.end_time - result.start_time).total_seconds()
        print(f"Duration: {duration:.2f} seconds")

    except Exception as e:
        print(f"Error running workflow: {e}")


if __name__ == "__main__":
    asyncio.run(main())
