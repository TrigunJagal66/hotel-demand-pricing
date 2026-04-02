import sys
import joblib
from pathlib import Path
import pandas as pd
from datetime import datetime

def get_project_root():
    return Path(__file__).resolve().parent.parent.parent

sys.path.append(str(get_project_root()))

from src.pipeline.predict_pipeline import predict_price

def run_standalone_prediction():
    """Run an example standalone prediction locally."""
    print("=== Standalone Inference Test ===")
    
    input_date = datetime(2017, 3, 31)
    base_price = 3000
    capacity = 150
    
    print(f"Input date: {input_date.date()}")
    print(f"Base price: ${base_price}")
    print(f"Capacity: {capacity} rooms\n")
    
    result = predict_price(
        input_date=input_date,
        base_price=base_price,
        capacity=capacity
    )
    
    print("Prediction Result:")
    for key, value in result.items():
        if isinstance(value, list):
            print(f"  {key}:")
            for item in value:
                print(f"    - {item}")
        else:
            print(f"  {key}: {value}")

if __name__ == "__main__":
    run_standalone_prediction()
