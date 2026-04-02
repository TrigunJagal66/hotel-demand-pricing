import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from datetime import datetime

def get_project_root():
    return Path(__file__).resolve().parent.parent.parent

def load_data():
    """Load the raw bookings data."""
    data_path = get_project_root() / "data" / "raw" / "hotel_bookings_modern.csv"
    df = pd.read_csv(data_path)
    return df

def preprocess_data(df):
    """Aggregate data into daily bookings and engineer features."""
    # Convert dates
    df['arrival_date'] = pd.to_datetime(
        df['arrival_date_year'].astype(str) + '-' +
        df['arrival_date_month'] + '-' +
        df['arrival_date_day_of_month'].astype(str)
    )
    
    # Sort and aggregate to daily level
    daily_demand = df.groupby('arrival_date').size().reset_index(name='bookings')
    daily_demand = daily_demand.sort_values('arrival_date')
    
    # Feature engineering
    daily_demand['day_of_week'] = daily_demand['arrival_date'].dt.weekday
    daily_demand['is_weekend'] = (daily_demand['day_of_week'] >= 5).astype(int)
    daily_demand['month'] = daily_demand['arrival_date'].dt.month
    
    # Lags and windows
    daily_demand['lag_1'] = daily_demand['bookings'].shift(1)
    daily_demand['lag_7'] = daily_demand['bookings'].shift(7)
    daily_demand['rolling_7'] = daily_demand['bookings'].rolling(window=7).mean()
    daily_demand['rolling_14'] = daily_demand['bookings'].rolling(window=14).mean()
    
    # Drop NaNs from shifts
    daily_demand = daily_demand.dropna()
    
    # Save processed data for the pipeline to use
    processed_dir = get_project_root() / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)
    daily_demand.to_csv(processed_dir / "daily_demand.csv", index=False)
    
    return daily_demand

def train_and_save_model(df):
    """Train the RF model and pickle it."""
    features = ['day_of_week', 'is_weekend', 'month', 'lag_1', 'lag_7', 'rolling_7', 'rolling_14']
    X = df[features]
    y = df['bookings']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model R^2 Score on Test Set: {score:.3f}")
    
    models_dir = get_project_root() / "models_saved"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    model_path = models_dir / "demand_model.pkl"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    print("Loading data...")
    df_raw = load_data()
    print("Preprocessing and engineering features...")
    df_processed = preprocess_data(df_raw)
    print("Training model...")
    train_and_save_model(df_processed)
    print("Done!")
