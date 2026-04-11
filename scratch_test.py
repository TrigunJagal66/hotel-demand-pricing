import sys
from pathlib import Path
from datetime import datetime

def get_project_root():
    return Path(__file__).resolve().parent.parent.parent

sys.path.append(str(get_project_root()))

from src.pipeline.predict_pipeline import predict_price

print("=== Testing Holiday OFF ===")
res1 = predict_price(datetime(2026, 7, 4), 3000, 150, False)
print(res1)

print("\n=== Testing Holiday ON ===")
res2 = predict_price(datetime(2026, 7, 4), 3000, 150, True)
print(res2)

print("\n=== Testing Different Date ===")
res3 = predict_price(datetime(2026, 1, 1), 3000, 150, False)
print(res3)
