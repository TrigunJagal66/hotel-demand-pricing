from sqlalchemy import Column, Integer, Float, String, DateTime, Date
from datetime import datetime, timezone
import json

from src.core.database import Base

class PricingLog(Base):
    __tablename__ = "pricing_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Input Features
    target_date = Column(Date, index=True)
    base_price = Column(Float)
    capacity = Column(Integer)
    context_data = Column(String) # Store as JSON string
    
    # Model Output
    predicted_demand = Column(Integer)
    occupancy_ratio = Column(Float)
    recommended_price = Column(Float)
    confidence = Column(String)
    
    # Log the rules engine explanation as a JSON list string
    explanation = Column(String)
