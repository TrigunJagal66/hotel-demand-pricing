from src.pricing.pricing_engine import calculate_price
from src.pricing.optimizer import PricingOptimizer

def get_price(
    strategy,
    **kwargs
):
    if strategy == "rule_based":
        return calculate_price(
            kwargs["predicted_demand"],
            kwargs["base_price"],
            kwargs["low_threshold"],
            kwargs["high_threshold"]
        )

    if strategy == "optimized":
        optimizer = PricingOptimizer()
        price, _ = optimizer.optimize(
            base_price=kwargs["base_price"],
            forecast=kwargs["forecast"],
            capacity=kwargs["capacity"],
            elasticity=kwargs.get("elasticity", 0.8)
        )
        return price
