from src.pricing import get_price
from src.core.contracts import DemandForecast

forecast = DemandForecast(mean=160, lower=140, upper=190)

print("Rule-based:",
      get_price(
          strategy="rule_based",
          predicted_demand=160,
          base_price=3000,
          low_threshold=80,
          high_threshold=150
      ))

print("Optimized:",
      get_price(
          strategy="optimized",
          base_price=3000,
          forecast=forecast,
          capacity=150
      ))



