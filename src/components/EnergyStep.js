export default function EnergyStep({ data, setData }) {
  const update = (k, v) => {
    setData(prev => ({ ...prev, [k]: v }));
  };

  const inputClass =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Home Energy</h2>

      <div className="flex flex-col gap-4">
        <input
          type="number"
          className={inputClass}
          placeholder="Electricity (kWh / month)"
          value={data.electricity_kwh_per_month || ""}
          onChange={e => update("electricity_kwh_per_month", Number(e.target.value))}
        />

        <select
  className={inputClass}
  value={data.heating_type || ""}
  onChange={e => update("heating_type", e.target.value.toLowerCase())}
>
  <option value="" disabled>Heating type</option>
  <option value="electric">Electric</option>
  <option value="gas">Gas</option>
</select>

{data.heating_type === "gas" && (
  <input
    type="number"
    className={inputClass}
    placeholder="Natural Gas (No of cylinders / month)"
    value={data.natural_gas_therms_per_month || ""}
    onChange={e =>
      update("natural_gas_therms_per_month", Number(e.target.value))
    }
  />
)}

        <input
          type="number"
          className={inputClass}
          placeholder="House area (sqft)"
          value={data.house_area_sqft || ""}
          onChange={e => update("house_area_sqft", Number(e.target.value))}
        />
         <select
  className={inputClass}
  value={data.home_insulation_quality || ""}
  onChange={e =>
    update("home_insulation_quality", Number(e.target.value))
  }
>
  <option value="" disabled>
    Insulation quality
  </option>
  <option value={1}>Low</option>
  <option value={2}>Medium</option>
  <option value={3}>High</option>
</select>

        <input
          type="number"
          className={inputClass}
          placeholder="Household size"
          value={data.household_size || ""}
          onChange={e => update("household_size", Number(e.target.value))}
          
        />
      </div>
    </div>
  );
}
