import pandas as pd
from pathlib import Path
import calendar

def get_project_root():
    return Path(__file__).resolve().parent.parent.parent

def shift_dataset():
    print("Loading original raw dataset...")
    data_path = get_project_root() / "data" / "raw" / "hotel_bookings.csv"
    df = pd.read_csv(data_path)
    
    # Create an actual datetime column from the split columns
    # First, convert month string to numeric
    month_map = {month: index for index, month in enumerate(calendar.month_name) if month}
    df['temp_month_num'] = df['arrival_date_month'].map(month_map)
    
    df['temp_date'] = pd.to_datetime(
        df['arrival_date_year'].astype(str) + '-' + 
        df['temp_month_num'].astype(str) + '-' + 
        df['arrival_date_day_of_month'].astype(str)
    )
    
    print(f"Original Data Span: {df['temp_date'].min().date()} to {df['temp_date'].max().date()}")
    
    # 468 weeks * 7 days = 3276 days (exact multiple of 52 weeks = 9 years shifted conceptually)
    shift_days = 3276
    df['new_date'] = df['temp_date'] + pd.Timedelta(days=shift_days)
    
    print(f"Modernized Data Span: {df['new_date'].min().date()} to {df['new_date'].max().date()}")
    
    # Break new_date back out into the original column names
    df['arrival_date_year'] = df['new_date'].dt.year
    # Convert numeric month back to string
    reverse_month_map = {index: month for month, index in month_map.items()}
    df['arrival_date_month'] = df['new_date'].dt.month.map(reverse_month_map)
    df['arrival_date_day_of_month'] = df['new_date'].dt.day
    
    # Drop temp columns
    df = df.drop(columns=['temp_month_num', 'temp_date', 'new_date'])
    
    # Save the modern dataset
    save_path = get_project_root() / "data" / "raw" / "hotel_bookings_modern.csv"
    print(f"Saving modernized dataset to {save_path}...")
    df.to_csv(save_path, index=False)
    print("Done!")

if __name__ == "__main__":
    shift_dataset()
