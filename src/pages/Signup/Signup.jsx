import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  MapPin,
  Camera,
  ArrowRight,
  Briefcase,
  Loader2,
} from "lucide-react";
import authService from "../../api/authService";
import { useAuth } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setUser, setRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    company: "",
    address: "",
    role: "user", // Default role
    profile: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.register(formData);

      if (response.data.status === "success" || response.data.user) {
        const userData = response.data.data?.user || response.data.data || response.data.user;

        setUser(userData);
        setRole(userData?.role || 'user');
        setAuthenticated(true);

        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-black transition-colors duration-300">
      <div className="w-full max-w-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create an account
          </h2>
          <p className="text-slate-500 dark:text-zinc-500 mt-2">
            Set up your profile to get started
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Upload Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-800 flex items-center justify-center bg-slate-50 dark:bg-zinc-950 overflow-hidden transition-all group-hover:border-indigo-500">
                  {formData.profile ? (
                    <img
                      src={formData.profile}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera
                      className="text-slate-400 group-hover:text-indigo-500 transition-colors"
                      size={32}
                    />
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>
              <span className="mt-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Profile Picture
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <User size={14} className="text-indigo-500" /> Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Mail size={14} className="text-indigo-500" /> Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="name@example.com"
                />
              </div>

              {/* Role Selection (New) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Briefcase size={14} className="text-indigo-500" /> Select
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="signup-input appearance-none"
                >
                  <option value="user">User</option>
                  <option value="client">Client</option>
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Lock size={14} className="text-indigo-500" /> Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="••••••••"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Phone size={14} className="text-indigo-500" /> Phone Number
                </label>
                <input
                  name="phoneNo"
                  type="tel"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Building size={14} className="text-indigo-500" /> Company
                </label>
                <input
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="Acme Inc."
                />
              </div>

              {/* Address (Full Width) */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <MapPin size={14} className="text-indigo-500" /> Address
                </label>
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="signup-input"
                  placeholder="123 Street, City"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign Up <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
