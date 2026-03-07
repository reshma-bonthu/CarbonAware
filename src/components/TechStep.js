export default function TechStep({ data, setData }) {
  const update = (k, v) =>
    setData(prev => ({ ...prev, [k]: v }));

  const inputClass =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <input
          type="number"
          className={inputClass}
          placeholder="Number of electronic devices"
          value={data.no_of_devices || ""}
          onChange={e => update("no_of_devices", Number(e.target.value))}
        />
        <label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={data.uses_solar_panels || false}
    onChange={e =>
      update("uses_solar_panels", e.target.checked)
    }
  />
  Uses solar panels
</label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.smart_thermostat_installed || false}
            onChange={e =>
              update("smart_thermostat_installed", e.target.checked)
            }
          />
          Smart thermostat installed
        </label>
        <label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={data.energy_efficient_appliances || false}
    onChange={e =>
      update("energy_efficient_appliances", e.target.checked)
    }
  />
  Energy efficient appliances
</label>

      </div>
    </div>
  );
}
