from src.pricing.pricing_engine import adjust_demand_for_price

class PricingOptimizer:

    def optimize(
        self,
        base_price,
        forecast,
        capacity,
        elasticity=0.8
    ):
        price_steps = [0.7, 0.85, 1.0, 1.15, 1.3, 1.5]

        best_price = base_price
        best_revenue = 0

        for step in price_steps:
            price = base_price * step

            adjusted_demand = adjust_demand_for_price(
                forecast.mean,
                base_price,
                price,
                elasticity
            )

            realized_demand = min(adjusted_demand, capacity)
            revenue = price * realized_demand

            if revenue > best_revenue:
                best_revenue = revenue
                best_price = price

        return round(best_price, 2), round(best_revenue, 2)
