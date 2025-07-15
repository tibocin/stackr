from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel


class BitcoinNewsState(BaseModel):
    """State for Bitcoin news workflow"""

    headline: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[Dict[str, Any]] = None
    start_time: datetime = datetime.now()
    end_time: Optional[datetime] = None
