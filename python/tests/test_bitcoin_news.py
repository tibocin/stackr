import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from ..workflows.bitcoin_news import BitcoinNewsWorkflow
from ..workflows.state import BitcoinNewsState

@pytest.mark.asyncio
async def test_bitcoin_news_workflow_success():
    """Test successful Bitcoin news workflow execution"""
    
    # Mock responses
    mock_headline = "Bitcoin reaches new all-time high of $75,000"
    mock_summary = "Bitcoin has achieved a new record price of $75,000, driven by increased institutional adoption and ETF inflows."
    mock_sentiment = {
        "analysis": "bullish",
        "reasoning": "The price reaching new highs indicates strong market confidence and institutional interest."
    }
    
    # Create workflow with mocked strategies
    workflow = BitcoinNewsWorkflow()
    
    # Mock the LLM strategies
    with patch.object(workflow.openai, 'query', new_callable=AsyncMock) as mock_openai, \
         patch.object(workflow.grok, 'query', new_callable=AsyncMock) as mock_grok:
        
        # Setup mock responses
        mock_openai.side_effect = [mock_headline, mock_sentiment]
        mock_grok.return_value = mock_summary
        
        # Run workflow
        result = await workflow.run()
        
        # Verify results
        assert result.headline == mock_headline
        assert result.summary == mock_summary
        assert result.sentiment == mock_sentiment
        assert result.end_time is not None
        
        # Verify calls
        assert mock_openai.call_count == 2
        assert mock_grok.call_count == 1

@pytest.mark.asyncio
async def test_bitcoin_news_workflow_missing_headline():
    """Test workflow fails when headline is missing"""
    
    workflow = BitcoinNewsWorkflow()
    
    with patch.object(workflow.openai, 'query', new_callable=AsyncMock) as mock_openai:
        mock_openai.return_value = None
        
        with pytest.raises(ValueError, match="Cannot summarize: headline is missing"):
            await workflow.run()

@pytest.mark.asyncio
async def test_bitcoin_news_workflow_invalid_sentiment():
    """Test workflow fails with invalid sentiment format"""
    
    workflow = BitcoinNewsWorkflow()
    
    with patch.object(workflow.openai, 'query', new_callable=AsyncMock) as mock_openai, \
         patch.object(workflow.grok, 'query', new_callable=AsyncMock) as mock_grok:
        
        mock_openai.side_effect = ["Bitcoin price drops", "Invalid JSON response"]
        mock_grok.return_value = "Bitcoin experienced a decline"
        
        with pytest.raises(ValueError, match="Invalid sentiment analysis format"):
            await workflow.run()
