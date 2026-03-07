export default function ConsumptionStep({ data, setData }) {
  const u = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  const inputClass =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <input
          type="number"
          className={inputClass}
          placeholder="Meat consumption (kg / week)"
          value={data.meat_consumption_kg_per_week || ""}
          onChange={e => u("meat_consumption_kg_per_week", Number(e.target.value))}
        />

        <input
          type="number"
          className={inputClass}
          placeholder="Laundry loads / week"
          value={data.laundry_loads_per_week || ""}
          onChange={e => u("laundry_loads_per_week", Number(e.target.value))}
        />

        <input
          type="number"
          className={inputClass}
          placeholder="Water usage (liters / day)"
          value={data.water_usage_liters_per_day || ""}
          onChange={e => u("water_usage_liters_per_day", Number(e.target.value))}
        />
      </div>
    </div>
  );
}
