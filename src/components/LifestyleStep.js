export default function LifestyleStep({ data, setData }) {
  const update = (k, v) =>
    setData(prev => ({ ...prev, [k]: v }));

  const inputClass =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400";

  return (
    <div className="space-y-6">

      {/* Diet Type */}
      <select
        className={inputClass}
        value={data.diet_type || ""}
        onChange={e => update("diet_type", e.target.value.toLowerCase())}
      >
        <option value="" disabled>Diet type</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="omnivore">Mixed</option>
        <option value="vegan">Vegan</option>
      </select>

      {/* Heating Type */}
      <select
        className={inputClass}
        value={data.heating_type || ""}
        onChange={e => update("heating_type", e.target.value.toLowerCase())}
      >
        <option value="" disabled>Heating type</option>
        <option value="electric">Electric</option>
        <option value="gas">Gas</option>
        
        <option value="none">None</option>
      </select>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.recycles_regularly || false}
            onChange={e => update("recycles_regularly", e.target.checked)}
          />
          Recycles
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.composts_organic_waste || false}
            onChange={e => update("composts_organic_waste", e.target.checked)}
          />
          Composting
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.owns_pet || false}
            onChange={e => update("owns_pet", e.target.checked)}
          />
          Owns pet
        </label>
      </div>
    </div>
  );
}
