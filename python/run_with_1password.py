#!/usr/bin/env python3
"""
Run Bitcoin news workflow with API keys from 1Password
"""

import asyncio
import os
import subprocess
from dotenv import load_dotenv
from workflows.bitcoin_news import BitcoinNewsWorkflow


def extract_1password_secret(reference):
    """Extract secret from 1Password using CLI"""
    try:
        result = subprocess.run(
            ['op', 'read', reference],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error extracting from 1Password: {e}")
        return None


async def main():
    """Run the Bitcoin news workflow with 1Password keys"""
    print("🔐 Extracting API keys from 1Password...")

    # Load .env file to get 1Password references
    load_dotenv()

    # Extract OpenAI API key
    openai_ref = os.getenv("OPENAI_API_KEY")
    if not openai_ref:
        print("Error: OPENAI_API_KEY not found in .env")
        return

    # Use the correct item ID for OpenAI
    openai_key = extract_1password_secret(
        "op://S devops/gwa4opwgz4hsels43cb6mtjpcq/openai-dev-api-key"
    )
    if not openai_key:
        print("Error: Could not extract OpenAI API key from 1Password")
        return

    # Extract Grok API key
    grok_ref = os.getenv("GROK_API_KEY")
    if not grok_ref:
        print("Error: GROK_API_KEY not found in .env")
        return

    # Use the correct item ID for Grok
    grok_key = extract_1password_secret(
        ("op://S devops/Stackr-Dev/Section_d4p7gl7tqctpf7t44tezv3a4ym/"
         "grok-dev-api-key")
    )
    if not grok_key:
        print("Error: Could not extract Grok API key from 1Password")
        return

    # Set environment variables for the workflow
    os.environ["OPENAI_API_KEY"] = openai_key
    os.environ["GROK_API_KEY"] = grok_key

    print("✅ API keys extracted successfully!")
    print("🚀 Starting Bitcoin News Workflow...")

    try:
        # Create and run workflow
        workflow = BitcoinNewsWorkflow()
        result = await workflow.run()

        # Print results
        print("\n" + "="*50)
        print("📰 BITCOIN NEWS ANALYSIS RESULTS")
        print("="*50)
        print(f"🔍 Headline: {result['headline']}")
        print(f"📝 Summary: {result['summary']}")
        print(f"📈 Sentiment: {result['sentiment']['analysis'].upper()}")
        print(f"💭 Reasoning: {result['sentiment']['reasoning']}")
        duration = (result['end_time'] - result['start_time']).total_seconds()
        print(f"⏱️  Duration: {duration:.2f} seconds")
        print("="*50)

    except Exception as e:
        print(f"❌ Error running workflow: {e}")


if __name__ == "__main__":
    asyncio.run(main()) 