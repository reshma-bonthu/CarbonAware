import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/");
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://127.0.0.1:5000/api/history", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
          setHistory(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50 p-10 relative">

      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="bg-emerald-600 text-white px-6 py-2 rounded-full"
        >
          Sign out
        </button>
      </div>

      <h1 className="text-3xl font-bold text-emerald-700 mb-10">
        Prediction History Analytics
      </h1>

      {history.length === 0 ? (
        <p>No prediction data available.</p>
      ) : (
        <>
          <div className="bg-white p-8 rounded-xl shadow mb-12">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="created_at" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_footprint" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6">
            {history.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow">
                <p>Date: {item.created_at}</p>
                <p>Footprint: {item.total_footprint.toFixed(2)} CO2 / month</p>
                <p>Monthly Cost: ₹{item.monthly_cost}</p>
                <p>Potential Monthly Savings: ₹{item.monthly_savings}</p>

                <div className="mt-3">
                  <p className="font-semibold">Recommendations:</p>
                  <ul className="list-disc ml-5">
                    {item.recommendations.map((r, i) => (
                      <li key={i}>
                        {r.title} — Save ₹{r.monthly_savings}/month
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}