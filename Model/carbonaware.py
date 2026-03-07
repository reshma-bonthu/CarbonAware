import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import KFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score
import warnings
warnings.filterwarnings('ignore')

df = pd.read_csv(r'C:\Users\reshm\OneDrive\Desktop\CarbonAware\carbonaware\carbonAware_dataset.csv')

# Drop ID
df.drop(columns=['ID'], inplace=True)

# Fix invalid gas values
df['natural_gas_therms_per_month'] = df['natural_gas_therms_per_month'].clip(lower=0)

target = 'carbon_footprint'
X = df.drop(columns=[target])
y = df[target]

cat_features = ['heating_type', 'diet_type']
encoders = {}

for col in cat_features:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str).str.lower())
    encoders[col] = le
    
for col in X.columns:
    if col not in cat_features:
        X[col] = pd.to_numeric(X[col], errors='coerce')

X.fillna(0, inplace=True)

lgb_params = {
    'objective': 'regression',
    'metric': 'rmse',
    'learning_rate': 0.01,
    'num_leaves': 31,
    'feature_fraction': 0.9,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'random_state': 42,
    'verbose': -1
}

kf = KFold(n_splits=5, shuffle=True, random_state=42)
r2_scores = []

for fold, (train_idx, val_idx) in enumerate(kf.split(X, y), 1):
    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

    model = lgb.LGBMRegressor(**lgb_params, n_estimators=10000)

    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        callbacks=[lgb.early_stopping(100)]
    )

    y_pred = model.predict(X_val)
    r2 = r2_score(y_val, y_pred)

    print(f"Fold {fold} R²: {r2:.4f}")
    r2_scores.append(r2)

print("Mean R²:", np.mean(r2_scores))

test_df = pd.read_csv(r'C:\Users\reshm\OneDrive\Desktop\CarbonAware\carbonaware\carbonAware_dataset.csv')
X_test = test_df.drop(columns=['ID','carbon_footprint'])

# Apply SAME encoders
for col, le in encoders.items():
    X_test[col] = le.transform(X_test[col].astype(str).str.lower())

# Numeric handling
for col in X_test.columns:
    if col not in cat_features:
        X_test[col] = pd.to_numeric(X_test[col], errors='coerce')

X_test.fillna(0, inplace=True)

test_predictions = model.predict(X_test)

def predict_single(sample_dict, model, encoders, feature_columns):
    df = pd.DataFrame([sample_dict])

    for col, le in encoders.items():
        df[col] = le.transform(df[col].astype(str).str.lower())

    for col in df.columns:
        if col not in encoders:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    df.fillna(0, inplace=True)
    df = df[feature_columns]

    return model.predict(df)[0]

sample_input = {
    "electricity_kwh_per_month": 500,
    "natural_gas_therms_per_month": 30,
    "vehicle_miles_per_month": 800,
    "house_area_sqft": 1200,
    "water_usage_liters_per_day": 400,
    "public_transport_usage_per_week": 1,
    "household_size": 4,
    "home_insulation_quality": 3,
    "meat_consumption_kg_per_week": 2.5,
    "laundry_loads_per_week": 5,
    "recycles_regularly": 1,
    "composts_organic_waste": 0,
    "uses_solar_panels": 0,
    "energy_efficient_appliances": 1,
    "heating_type": "electric",
    "diet_type": "vegetarian",
    "owns_pet": 1,
    "smart_thermostat_installed": 0,
    "no_of_devices": 13
}

prediction = predict_single(sample_input, model, encoders, X.columns)
print("Predicted Carbon Footprint:", prediction)
import joblib

# Save final trained model
joblib.dump(model, "model.pkl")

# Save encoders
joblib.dump(encoders, "encoders.pkl")

# Save feature column order
joblib.dump(list(X.columns), "features.pkl")

print("Model and encoders saved successfully.")
