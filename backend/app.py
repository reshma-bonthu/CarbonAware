
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    create_access_token,
    get_jwt_identity
)
from datetime import timedelta
import joblib
import pandas as pd
import json

from model import db, User, Prediction

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:Bonthu%40123@localhost:5432/carbonaware"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "carbonaware_secure_key_2026"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

model = joblib.load("../model/model.pkl")
encoders = joblib.load("../model/encoders.pkl")
feature_columns = joblib.load("../model/features.pkl")

with app.app_context():
    db.create_all()


# ---------------- AUTH ----------------

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=hashed
    )

    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user_id": user.id}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user_id": user.id}), 200


# ---------------- PREDICT ----------------

@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    try:
        data = request.get_json()
        user_id = int(get_jwt_identity())

        for key in data:
            if data[key] == "":
                data[key] = 0

        df = pd.DataFrame([data])

        for column, encoder in encoders.items():
            df[column] = encoder.transform(df[column].astype(str).str.lower())

        df = df[feature_columns]
        predicted_value = float(model.predict(df)[0])

        # -------- INDIA COST ENGINE --------
        ELECTRICITY_COST = 8
        PETROL_COST = 100
        KM_PER_LITRE = 18

        electricity = float(data.get("electricity_kwh_per_month", 0))
        miles = float(data.get("vehicle_miles_per_month", 0))
        gas = float(data.get("natural_gas_therms_per_month", 0))

        electricity_cost = electricity * ELECTRICITY_COST
        km = miles * 1.6
        litres = km / KM_PER_LITRE if KM_PER_LITRE else 0
        transport_cost = litres * PETROL_COST
        gas_cost = gas * 90

        total_monthly_cost = electricity_cost + transport_cost + gas_cost

        # -------- BREAKDOWN --------
        energy_score = electricity + gas
        transport_score = miles
        lifestyle_score = float(data.get("meat_consumption_kg_per_week", 0))
        tech_score = float(data.get("no_of_devices", 0))

        total = energy_score + transport_score + lifestyle_score + tech_score

        breakdown = {
            "energy": round((energy_score / total) * 100, 1) if total else 0,
            "transport": round((transport_score / total) * 100, 1) if total else 0,
            "lifestyle": round((lifestyle_score / total) * 100, 1) if total else 0,
            "technology": round((tech_score / total) * 100, 1) if total else 0
        }

        # -------- ADVANCED SAVINGS ENGINE --------
        recommendations = []
        total_savings = 0

        if electricity > 250:
            saving = electricity_cost * 0.12
            total_savings += saving
            recommendations.append({
                "category": "Energy",
                "title": "Reduce High Electricity Consumption",
                "monthly_savings": round(saving, 2),
                "action": "Shift to 5-star appliances and reduce AC usage"
            })

        if not data.get("energy_efficient_appliances", False):
            saving = electricity_cost * 0.08
            total_savings += saving
            recommendations.append({
                "category": "Energy",
                "title": "Upgrade to Energy Efficient Appliances",
                "monthly_savings": round(saving, 2),
                "action": "Switch to BEE 5-star rated appliances"
            })

        if miles > 400:
            saving = transport_cost * 0.20
            total_savings += saving
            recommendations.append({
                "category": "Transport",
                "title": "Reduce Fuel Dependency",
                "monthly_savings": round(saving, 2),
                "action": "Carpool or use public transport"
            })

        if gas > 10:
            saving = gas_cost * 0.10
            total_savings += saving
            recommendations.append({
                "category": "Cooking",
                "title": "Improve Cooking Efficiency",
                "monthly_savings": round(saving, 2),
                "action": "Use efficient burners and pressure cooking"
            })

        if not recommendations:
            recommendations.append({
                "category": "Optimized",
                "title": "Your Household is Efficient",
                "monthly_savings": 0,
                "action": "Maintain current usage"
            })

        # -------- SAVE TO DB --------
        new_prediction = Prediction(
            user_id=user_id,
            electricity_kwh_per_month=electricity,
            natural_gas_therms_per_month=gas,
            vehicle_miles_per_month=miles,
            total_footprint=predicted_value,
            monthly_cost=round(total_monthly_cost, 2),
            monthly_savings=round(total_savings, 2),
            recommendations=json.dumps(recommendations)
        )

        db.session.add(new_prediction)
        db.session.commit()

        return jsonify({
            "predicted_footprint": predicted_value,
            "monthly_cost": round(total_monthly_cost, 2),
            "breakdown": breakdown,
            "monthly_savings": round(total_savings, 2),
            "recommendations": recommendations
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 422


# ---------------- HISTORY ----------------

@app.route("/api/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())

    predictions = Prediction.query \
        .filter_by(user_id=user_id) \
        .order_by(Prediction.created_at.desc()) \
        .all()

    history = []

    for p in predictions:
        history.append({
            "id": p.id,
            "total_footprint": p.total_footprint,
            "monthly_cost": p.monthly_cost,
            "monthly_savings": p.monthly_savings,
            "recommendations": json.loads(p.recommendations) if p.recommendations else [],
            "created_at": p.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return jsonify(history), 200


if __name__ == "__main__":
    app.run(debug=True)