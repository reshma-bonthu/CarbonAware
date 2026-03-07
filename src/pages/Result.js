import { useLocation, useNavigate, Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/");
  };

  const handleDownload = async () => {
    const input = document.getElementById("report-content");
    const buttons = document.getElementById("action-buttons");
    buttons.style.display = "none";

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("CarbonAware_Report.pdf");

    buttons.style.display = "flex";
  };

  if (!state || !state.predicted_footprint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <p>No prediction data available.</p>
      </div>
    );
  }

  const {
    predicted_footprint,
    breakdown = {},
    monthly_cost = 0,
    monthly_savings = 0,
    recommendations = []
  } = state;

  return (
    <div
      id="report-content"
      className="min-h-screen bg-emerald-50 px-6 md:px-20 py-12 relative"
    >
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition shadow"
        >
          Sign out
        </button>
      </div>

      <h1 className="text-4xl font-bold text-emerald-700 mb-10">
        Carbon Footprint Assessment
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow p-6">
          <p>Total Emissions</p>
          <h2 className="text-3xl font-bold">
            {predicted_footprint.toFixed(2)} Tons CO2/ month
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p>Estimated Monthly Household Cost</p>
          <h2 className="text-3xl font-bold">
            ₹{monthly_cost}
          </h2>
          <p className="mt-4 text-emerald-600 font-semibold">
            Potential Monthly Savings: ₹{monthly_savings}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-8 mb-12">
        <h3 className="text-xl font-semibold mb-6">
          Emission Breakdown (%)
        </h3>

        <div className="grid md:grid-cols-4 gap-6 text-center">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key}>
              <p className="capitalize">{key}</p>
              <p className="text-2xl font-bold">{value}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-8 mb-12">
        <h3 className="text-xl font-semibold mb-6">
          Financial Optimization Recommendations
        </h3>

        <div className="space-y-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="border-l-4 border-emerald-600 pl-4">
              <h4 className="font-bold text-lg">{rec.title}</h4>
              <p className="text-gray-700 mt-2">{rec.action}</p>
              <p className="text-emerald-600 font-semibold mt-2">
                Monthly Savings: ₹{rec.monthly_savings}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div id="action-buttons" className="flex gap-4">
        <Link
          to="/estimate"
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl"
        >
          Recalculate
        </Link>

        <Link
          to="/history"
          className="border-2 border-emerald-600 text-emerald-700 px-6 py-3 rounded-xl"
        >
          View History
        </Link>

        <button
          onClick={handleDownload}
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Download Report
        </button>
      </div>
    </div>
  );
}