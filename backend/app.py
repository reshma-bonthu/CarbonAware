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
import os
from model import db, User, Prediction

app = Flask(__name__)

# ---------------- CONFIG ----------------

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
#app.config["JWT_SECRET_KEY"] = "carbonaware_secure_key_2026"
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
CORS(app, resources={r"/*": {"origins": "*"}})
# ---------------- LOAD MODEL ----------------

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

    return jsonify({
        "token": token,
        "user_id": user.id
    }), 201


@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user_id": user.id
    }), 200


# ---------------- PREDICT ----------------

@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():

    try:

        data = request.get_json()
        user_id = int(get_jwt_identity())

        # Replace empty inputs
        for key in data:
            if data[key] == "":
                data[key] = 0

        df = pd.DataFrame([data])

        # Encode categorical variables
        for column, encoder in encoders.items():
            df[column] = encoder.transform(df[column].astype(str).str.lower())

        df = df[feature_columns]

        predicted_value = float(model.predict(df)[0])

        # ---------------- COST ENGINE ----------------

        ELECTRICITY_COST = 8
        PETROL_COST = 100
        KM_PER_LITRE = 18

        electricity = float(data.get("electricity_kwh_per_month", 0))
        miles = float(data.get("vehicle_miles_per_month", 0))
        gas = float(data.get("natural_gas_therms_per_month", 0)) * 7.5
        uses_solar = str(data.get("uses_solar_energy", "no")).lower()
        electricity_cost = electricity * ELECTRICITY_COST

        km = miles * 1.6
        litres = km / KM_PER_LITRE if KM_PER_LITRE else 0
        transport_cost = litres * PETROL_COST

        gas_cost = gas * 90

        total_monthly_cost = electricity_cost + transport_cost + gas_cost

        # ---------------- BREAKDOWN ----------------

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

        # ---------------- SAVINGS ENGINE ----------------

        recommendations = []
        total_savings = 0

        # ENERGY
        if breakdown["energy"] >= 30:
            if electricity > 500 and uses_solar == "no":

                saving = electricity_cost * 0.30
                total_savings += saving

                recommendations.append({
            "category": "Energy",
            "title": "High Electricity Consumption Detected",
            "monthly_savings": round(saving,2),
            "action": "Install rooftop solar panels to generate renewable electricity and reduce grid dependency"
        })

            if electricity > 300:
                saving = electricity_cost * 0.12
                total_savings += saving

                recommendations.append({
                    "category": "Energy",
                    "title": "Electricity Consumption is a Major Emission Source",
                    "monthly_savings": round(saving, 2),
                    "action": "Reduce AC usage, switch to LED lighting, and unplug idle devices"
                })

            if gas > 10:
                saving = gas_cost * 0.10
                total_savings += saving

                recommendations.append({
                    "category": "Cooking",
                    "title": "Gas Usage Contributes to Energy Emissions",
                    "monthly_savings": round(saving, 2),
                    "action": "Use pressure cookers and energy-efficient burners"
                })

        # TRANSPORT
        if breakdown["transport"] >= 30:

            saving = transport_cost * 0.20
            total_savings += saving

            recommendations.append({
                "category": "Transport",
                "title": "Transportation Significantly Impacts Your Carbon Footprint",
                "monthly_savings": round(saving, 2),
                "action": "Use public transport, carpooling, cycling, or EV options"
            })

        # LIFESTYLE
        if breakdown["lifestyle"] >= 30:

            meat = float(data.get("meat_consumption_kg_per_week", 0))

            if meat > 2:
                recommendations.append({
                    "category": "Diet",
                    "title": "Dietary Habits Increase Lifestyle Emissions",
                    "monthly_savings": 0,
                    "action": "Reduce red meat consumption and increase plant-based meals"
                })

        # TECHNOLOGY
        if breakdown["technology"] >= 30:

            devices = float(data.get("no_of_devices", 0))

            if devices > 10:
                recommendations.append({
                    "category": "Technology",
                    "title": "High Device Usage Drives Electricity Demand",
                    "monthly_savings": 0,
                    "action": "Turn off unused devices and use energy-efficient appliances"
                })

        
        if not recommendations:

            recommendations.append({
                "category": "Optimized",
                "title": "Your Carbon Usage is Balanced",
                "monthly_savings": 0,
                "action": "Maintain your current sustainable practices"
            })

        # ---------------- SAVE TO DATABASE ----------------

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

    predictions = (
        Prediction.query
        .filter_by(user_id=user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    history = []

    for p in predictions:

        recs = []

        if p.recommendations:
            if isinstance(p.recommendations, str):
                recs = json.loads(p.recommendations)
            else:
                recs = p.recommendations

        history.append({
            "id": p.id,
            "total_footprint": p.total_footprint,
            "monthly_cost": p.monthly_cost,
            "monthly_savings": p.monthly_savings,
            "recommendations": recs,
            "created_at": p.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return jsonify(history), 200


# ---------------- RUN SERVER ----------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)