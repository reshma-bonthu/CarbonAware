export default function TransportStep({ data, setData }) {
  const update = (k, v) => {
    setData(prev => ({ ...prev, [k]: v }));
  };

  const inputClass =
    "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <input
          type="number"
          className={inputClass}
          placeholder="Vehicle miles per month"
          value={data.vehicle_miles_per_month || ""}
          onChange={e =>
            update("vehicle_miles_per_month", Number(e.target.value))
          }
        />

        <input
          type="number"
          className={inputClass}
          placeholder="Public transport trips / week"
          value={data.public_transport_usage_per_week || ""}
          onChange={e =>
            update("public_transport_usage_per_week", Number(e.target.value))
          }
        />
      </div>
    </div>
  );
}
