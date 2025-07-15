import json
import pytest
from unittest.mock import patch, AsyncMock
from python.workflows.bitcoin_news import BitcoinNewsWorkflow


@pytest.mark.asyncio
async def test_bitcoin_news_workflow_success():
    """Test successful Bitcoin news workflow execution"""

    # Mock responses
    mock_headline = "Bitcoin reaches new all-time high of $75,000"
    mock_summary = ("Bitcoin has achieved a new record price of $75,000, "
                    "driven by increased institutional adoption and ETF inflows.")
    mock_sentiment = {
        "analysis": "bullish",
        "reasoning": ("The price reaching new highs indicates strong market "
                     "confidence and institutional interest.")
    }

    # Create workflow with mocked strategies
    workflow = BitcoinNewsWorkflow()

    # Mock the LLM strategies
    with (patch.object(workflow.openai, 'query_with_web_search', 
                      new_callable=AsyncMock) as mock_openai_web,
          patch.object(workflow.openai, 'query', 
                      new_callable=AsyncMock) as mock_openai,
          patch.object(workflow.grok, 'query', 
                      new_callable=AsyncMock) as mock_grok):

        # Setup mock responses
        mock_openai_web.return_value = mock_headline
        mock_openai.return_value = json.dumps(mock_sentiment)
        mock_grok.return_value = mock_summary

        # Run workflow
        result = await workflow.run()

        # Verify results
        assert result["headline"] == mock_headline
        assert result["summary"] == mock_summary
        assert result["sentiment"] == mock_sentiment
        assert result["start_time"] is not None
        assert result["end_time"] is not None

        # Verify LLM calls
        assert mock_openai_web.call_count == 1
        assert mock_openai.call_count == 1
        assert mock_grok.call_count == 1


@pytest.mark.asyncio
async def test_bitcoin_news_workflow_missing_headline():
    """Test workflow fails when headline is missing"""

    workflow = BitcoinNewsWorkflow()

    with (patch.object(workflow.openai, 'query_with_web_search', 
                      new_callable=AsyncMock) as mock_openai_web):
        mock_openai_web.return_value = None

        with pytest.raises(ValueError, 
                          match="Cannot summarize: headline is missing"):
            await workflow.run()


@pytest.mark.asyncio
async def test_bitcoin_news_workflow_invalid_sentiment():
    """Test workflow fails with invalid sentiment format"""

    workflow = BitcoinNewsWorkflow()

    with (patch.object(workflow.openai, 'query_with_web_search', 
                      new_callable=AsyncMock) as mock_openai_web,
          patch.object(workflow.openai, 'query', 
                      new_callable=AsyncMock) as mock_openai,
          patch.object(workflow.grok, 'query', 
                      new_callable=AsyncMock) as mock_grok):

        mock_openai_web.return_value = "Bitcoin price drops"
        mock_openai.return_value = "Invalid JSON response"
        mock_grok.return_value = "Bitcoin experienced a decline"

        with pytest.raises(ValueError, 
                          match="Invalid sentiment analysis format"):
            await workflow.run()
