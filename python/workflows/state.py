from typing import Optional, Dict
from pydantic import BaseModel
from datetime import datetime

class BitcoinNewsState(BaseModel):
    """Simplified state for Bitcoin news analysis workflow"""
    
    # Core data (what we actually care about)
    headline: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[Dict[str, str]] = None
    
    # Minimal metadata (for monitoring)
    start_time: datetime = datetime.now()
    end_time: Optional[datetime] = None
