from datetime import datetime

from src.pipeline.predict_pipeline import predict_price


pricing_config = {
    "low_threshold": 80,
    "high_threshold": 150
}

# Test input
input_date = datetime(2017, 3, 31)
base_price = 3000

result = predict_price(
    input_date=input_date,
    base_price=base_price,
    pricing_config=pricing_config
)

print(result)
