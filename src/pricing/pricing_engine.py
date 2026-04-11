"""
Pricing Engine

- Supports rule-based pricing (baseline)
- Supports occupancy-based smart pricing (Step 7)
- Keeps backward compatibility with calculate_price
"""

# -----------------------------
# 1. Rule-based pricing (OLD, kept for safety & comparison)
# -----------------------------
def rule_based_price(
    predicted_demand,
    base_price,
    low_threshold=80,
    high_threshold=150
):
    """
    Baseline pricing using fixed demand thresholds.
    """

    if predicted_demand < low_threshold:
        price = base_price * 0.85
        reason = "Low demand detected"

    elif predicted_demand > high_threshold:
        price = base_price * 1.30
        reason = "High demand detected"

    else:
        price = base_price
        reason = "Normal demand"

    return round(price, 2), reason


# -----------------------------
# 2. Occupancy-based smart pricing (NEW – Step 7)
# -----------------------------
def occupancy_based_price(
    predicted_demand,
    base_price,
    capacity,
    is_holiday_flag=False,
    context=None
):
    # Apply baseline demand multiplier if it's a holiday
    if is_holiday_flag:
        predicted_demand = int(predicted_demand * 1.10)

    occupancy_ratio = predicted_demand / capacity
    explanation = []

    explanation.append(f"Predicted demand: {predicted_demand}")
    explanation.append(f"Available capacity: {capacity}")

    if occupancy_ratio < 0.5:
        price = base_price * 0.85
        explanation.append("Critical Low occupancy (<50%)")
        explanation.append("15% deep discount applied to fill rooms")

    elif occupancy_ratio < 0.75:
        price = base_price * 0.95
        explanation.append("Low occupancy (50-70%)")
        explanation.append("5% small incentive discount applied")

    elif occupancy_ratio < 0.8:
        price = base_price
        explanation.append("Healthy occupancy (70-80%)")
        explanation.append("Standard base price maintained")

    elif occupancy_ratio < 0.9:
        price = base_price * 1.15
        explanation.append("High demand detected (80-90%)")
        explanation.append("15% surge pricing applied")

    else:
        price = base_price * 1.30
        explanation.append("Near full capacity (>90%)")
        explanation.append("30% peak scarcity pricing applied")

    if is_holiday_flag:
        price = price * 1.15
        explanation.append("Context Override: +15% price surge applied for Local Festival/Holiday")

    # Connect Context Business Rules!
    if context:
        event = context.get("event", "").lower()
        weather = context.get("weather", "").lower()
        
        if event in ["concert", "festival", "holiday"]:
            price = price * 1.15
            explanation.append(f"Context Override: +15% surge applied for local event '{event}'")
            
        if weather in ["storm", "hurricane", "blizzard"]:
            price = price * 0.90
            explanation.append(f"Context Override: -10% discount applied due to severe weather '{weather}'")

    # Confidence (simple, explainable)
    if occupancy_ratio > 0.8 or occupancy_ratio < 0.5:
        confidence = "high"
    else:
        confidence = "medium"

    return (
        round(price, 2),
        round(occupancy_ratio, 2),
        confidence,
        explanation
    )



# -----------------------------
# 3. Demand elasticity helper (for future optimizer use)
# -----------------------------
def adjust_demand_for_price(
    base_demand,
    base_price,
    new_price,
    elasticity=0.8
):
    """
    Adjust demand based on price elasticity.
    """
    price_ratio = new_price / base_price
    return max(0, base_demand * (price_ratio ** (-elasticity)))


# -----------------------------
# 4. Backward compatibility alias
# -----------------------------
# IMPORTANT:
# This ensures old imports still work:
# from pricing_engine import calculate_price
calculate_price = rule_based_price
