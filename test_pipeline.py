from datetime import datetime

from src.pipeline.predict_pipeline import predict_price


# Test input
input_date = datetime(2017, 3, 31)
base_price = 3000
capacity = 150  # total hotel capacity (rooms)

result = predict_price(
    input_date=input_date,
    base_price=base_price,
    capacity=capacity,
)

print(result)
