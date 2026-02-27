import React, { useState } from "react";
import { Lock, Mail, ChevronRight, UserPlus, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import { useAuth } from "../../context/ContextProvider";

const Signin = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setUser, setRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(formData);

      if (response.data.status === "success" || response.data.user) {
        // Find user data
        const userData = response.data.data?.user || response.data.data || response.data.user;

        // Update global context
        setUser(userData);
        setRole(userData?.role || 'user');
        setAuthenticated(true);

        // Save fallback to localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Implement Google Auth logic here later
    console.log("Google Sign-In triggered");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black flex items-center justify-center py-12 px-4 font-sans transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-black rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col">
        {/* Header Section */}
        <div className="bg-indigo-600 px-8 py-8 text-center rounded-t-2xl shrink-0">
          <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-4 shadow-inner overflow-hidden">
            <img
              src="/Images/Logo.png"
              alt="Logo"
              className="h-full w-full object-cover"
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/64?text=S2i")
              }
            />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-1 text-indigo-100 text-sm font-medium">
            Sign in to access your admin dashboard
          </p>
        </div>

        <div className="px-8 py-8">
          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-slate-50/50 dark:bg-zinc-900/50"
                    placeholder="admin@switch2itech.com"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-slate-50/50 dark:bg-zinc-900/50"
                    placeholder="••••••••"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Log in
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center py-3 px-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all duration-200 cursor-pointer"
              >
                {/* Google Icon SVG */}
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-black px-2 text-slate-400 dark:text-zinc-500 font-semibold tracking-wider">
                  New here?
                </span>
              </div>
            </div>

            <Link
              to="/signup"
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-slate-100 dark:border-zinc-800 text-sm font-bold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all duration-200"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create an account
            </Link>
          </div>

          <div className="mt-8 text-center border-t border-slate-50 dark:border-zinc-900 pt-6">
            <p className="text-[10px] text-slate-400 dark:text-zinc-600 tracking-[0.2em] uppercase font-bold">
              &copy; {new Date().getFullYear()} Switch2iTech
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
