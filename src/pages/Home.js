import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Heart, DollarSign } from "lucide-react";
function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 text-gray-800">
    
      {/* Navbar */}
      <nav className="w-full bg-emerald-75">
  <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-16 py-4">
    
    {/* Logo + Brand */}
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="CarbonAware Logo"
        className="w-14 h-14 object-contain"
      />
      <h1 className="text-2xl font-bold">
        <span className="text-emerald-700">Carbon</span>
        <span className="text-gray-800">Aware</span>
      </h1>
    </div>

    {/* Nav Links */}
    <div className="flex items-center gap-8 text-gray-700 font-medium">
      <span className="cursor-pointer hover:text-emerald-600 transition">
        
      </span>
      {/*<span className="cursor-pointer hover:text-emerald-600 transition">
        Home
      </span>
      
      <span className="cursor-pointer hover:text-emerald-600 transition">
        Contact
      </span>*/}

      <button
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    window.location.href = "/";
  }}
  className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition"
>
  Sign out
</button>

    </div>

  </div>
</nav>


      {/* Hero */}
      <section className="grid grid-cols-2 gap-12 px-16 py-20 items-center">
        <div>
          <h2 className="text-5xl font-extrabold mb-6">
            Understand & Reduce <br />
            <span className="text-emerald-700">Your Carbon Footprint</span>
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-xl">
            ML-powered insights that quantify household emissions and
            recommend cost-effective sustainable practices.
          </p>

          <div className="flex flex-wrap items-center gap-4">
  <Link
    to="/estimate"
    className="
      bg-emerald-600 text-white
      px-8 py-4
      rounded-xl
      text-lg font-semibold
      shadow-md
      hover:bg-emerald-700
      hover:shadow-lg
      transition
    "
  >
    Estimate My Footprint
  </Link>

  <Link
    to="/history"
    className="
      border-2 border-emerald-600
      text-emerald-700
      px-8 py-4
      rounded-xl
      text-lg font-semibold
      hover:bg-emerald-50
      transition
    "
  >
    View History
  </Link>
</div>

        </div>      
          <div className="flex justify-center lg:justify-end">
  <img
    src="/eco home.png"
    alt="Eco Home"
    className="
      w-full
      max-w-none
      scale-110
      lg:scale-125
      xl:scale-150
      object-contain
    "
  />
</div>

      </section>

      {/* Features */}
      <section className="px-6 md:px-16 py-12">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    
   <Feature
  icon={<BarChart3 size={22} className="text-white" />}
  title="Accurate Estimates"
  desc="Powered by advanced ML models like Random Forest & XGBoost."
/>

<Feature
  icon={<Heart size={22} className="text-white" />}
  title="Personalized Tips"
  desc="Custom recommendations to reduce your emissions & costs."
/>

<Feature
  icon={<DollarSign size={22} className="text-white" />}
  title="Cost Savings"
  desc="See how eco-friendly choices can save you money."
/>
  </div>
</section>


      {/* Footer */}
      <footer className="text-center py-6 text-gray-500">
        
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex gap-4 items-start">
      
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-600 text-white text-xl flex-shrink-0">
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h4 className="font-semibold text-lg mb-2">{title}</h4>
        <div className="h-px bg-gray-200 mb-3"></div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {desc}
        </p>
      </div>

    </div>
  );
}


export default Home;
