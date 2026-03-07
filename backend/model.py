from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    predictions = db.relationship("Prediction", backref="user", cascade="all, delete")


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    electricity_kwh_per_month = db.Column(db.Float)
    natural_gas_therms_per_month = db.Column(db.Float)
    vehicle_miles_per_month = db.Column(db.Float)
    house_area_sqft = db.Column(db.Float)
    water_usage_liters_per_day = db.Column(db.Float)
    public_transport_usage_per_week = db.Column(db.Float)
    household_size = db.Column(db.Integer)
    home_insulation_quality = db.Column(db.String(20))
    meat_consumption_kg_per_week = db.Column(db.Float)
    laundry_loads_per_week = db.Column(db.Float)
    recycles_regularly = db.Column(db.Boolean)
    composts_organic_waste = db.Column(db.Boolean)
    uses_solar_panels = db.Column(db.Boolean)
    energy_efficient_appliances = db.Column(db.Boolean)
    heating_type = db.Column(db.String(20))
    diet_type = db.Column(db.String(20))
    owns_pet = db.Column(db.Boolean)
    smart_thermostat_installed = db.Column(db.Boolean)
    no_of_devices = db.Column(db.Integer)

    total_footprint = db.Column(db.Float)

    # ✅ NEW FIELDS
    monthly_cost = db.Column(db.Float)
    monthly_savings = db.Column(db.Float)
    recommendations = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)