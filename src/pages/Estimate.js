import { useState } from "react";
import EnergyStep from "../components/EnergyStep";
import TransportStep from "../components/TransportStep";
import LifestyleStep from "../components/LifestyleStep.js";
import StepNavigation from "../components/StepNavigation";
import { useNavigate } from "react-router-dom";
import ConsumptionStep from "../components/ConsumptionStep.js";
import TechStep from "../components/TechStep";
const steps = ["Energy", "Transport", "Consumption", "Lifestyle", "Tech"];

export default function Estimate() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
  electricity_kwh_per_month: "",
  natural_gas_therms_per_month: "",
  vehicle_miles_per_month: "",
  house_area_sqft: "",
  water_usage_liters_per_day: "",
  public_transport_usage_per_week: "",
  household_size: "",
  home_insulation_quality: "",
  meat_consumption_kg_per_week: "",
  laundry_loads_per_week: "",
  recycles_regularly: false,
  composts_organic_waste: false,
  uses_solar_panels: false,
  energy_efficient_appliances: false,
  heating_type: "",
  diet_type: "",
  owns_pet: false,
  smart_thermostat_installed: false,
  no_of_devices: ""
});

  const navigate = useNavigate();

  const next = () => step < steps.length - 1 && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

const submit = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required");
      return;
    }

    // Convert numeric fields properly
    const formattedData = {
      ...formData,
      electricity_kwh_per_month: Number(formData.electricity_kwh_per_month) || 0,
      natural_gas_therms_per_month: Number(formData.natural_gas_therms_per_month) || 0,
      vehicle_miles_per_month: Number(formData.vehicle_miles_per_month) || 0,
      house_area_sqft: Number(formData.house_area_sqft) || 0,
      water_usage_liters_per_day: Number(formData.water_usage_liters_per_day) || 0,
      public_transport_usage_per_week: Number(formData.public_transport_usage_per_week) || 0,
      household_size: Number(formData.household_size) || 0,
      home_insulation_quality: Number(formData.home_insulation_quality) || 0,
      meat_consumption_kg_per_week: Number(formData.meat_consumption_kg_per_week) || 0,
      laundry_loads_per_week: Number(formData.laundry_loads_per_week) || 0,
      no_of_devices: Number(formData.no_of_devices) || 0,
    };

    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formattedData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(result);
      alert(result.error || "Prediction failed");
      return;
    }

    navigate("/result", { state: result });

  } catch (error) {
    console.error("Error:", error);
  }
};


  return (

    <div className="min-h-screen bg-emerald-50">
  <div className="max-w-5xl mx-auto px-6 py-12">
      <StepNavigation step={step} steps={steps} />

      {step === 0 && <EnergyStep data={formData} setData={setFormData} />}
      {step === 1 && <TransportStep data={formData} setData={setFormData} />}
      {step === 2 && <ConsumptionStep data={formData} setData={setFormData} />}
       {step === 3 && <LifestyleStep data={formData} setData={setFormData} />}
       {step === 4 && <TechStep data={formData} setData={setFormData} />}

      <div className="flex justify-between mt-8">
        <button onClick={back} className="text-gray-600">Back</button>
        {step === steps.length - 1 ? (
          <button onClick={submit} className="bg-emerald-600 text-white px-6 py-2 rounded">
            Calculate Footprint
          </button>
        ) : (
          <button onClick={next} className="bg-emerald-600 text-white px-6 py-2 rounded">
            Next
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
