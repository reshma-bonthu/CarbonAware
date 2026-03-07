import { useState } from "react";
import { Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  const email = e.target[isLogin ? 0 : 1].value;
  const password = e.target[isLogin ? 1 : 2].value;
  const name = !isLogin ? e.target[0].value : null;

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/${isLogin ? "login" : "register"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isLogin
            ? { email, password }
            : { name, email, password }
        ),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    localStorage.setItem("token", data.token);

    navigate("/Home");
  } catch (error) {
    console.error("Authentication error:", error);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="grid md:grid-cols-2 bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden">
        
        {/* Left Section */}
        <div className="hidden md:flex flex-col justify-center bg-emerald-600 text-white p-10">
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="w-8 h-8" />
            <h1 className="text-2xl font-bold">CarbonAware</h1>
          </div>
          <h2 className="text-3xl font-semibold mb-4">
            Track. Understand. Reduce.
          </h2>
          <p className="text-emerald-100">
            Estimate your household carbon footprint and receive
            personalized recommendations for a greener future.
          </p>
        </div>

        {/* Right Section */}
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h2>

          <p className="text-gray-500 mb-6">
            {isLogin
              ? "Sign in to continue"
              : "Start tracking your footprint"}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            {isLogin
              ? "New to CarbonAware?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 font-medium hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
