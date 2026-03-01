import React, { useState } from "react";
import {
  User, Mail, Lock, Phone, Building, MapPin,
  Camera, ArrowRight, Briefcase, Loader2, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import authService from "../../api/authService";
import { useAuth } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";
import logoUrl from "/Images/Logo.png";

const Signup = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setUser, setRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    company: "",
    address: "",
    role: "user",
    profile: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setProfilePreview(base64);
      setFormData((prev) => ({ ...prev, profile: base64 }));
    };
    reader.readAsDataURL(file);
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
        setRole(userData?.role || "user");
        setAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", type: "text", icon: User, placeholder: "John Doe", label: "Full Name", span: 1 },
    { name: "email", type: "email", icon: Mail, placeholder: "name@example.com", label: "Email Address", span: 1 },
    { name: "role", type: "select", icon: Briefcase, placeholder: null, label: "Select Role", span: 1 },
    { name: "password", type: "password", icon: Lock, placeholder: "••••••••", label: "Password", span: 1 },
    { name: "phoneNo", type: "tel", icon: Phone, placeholder: "+1 (555) 000-0000", label: "Phone Number", span: 1 },
    { name: "company", type: "text", icon: Building, placeholder: "Acme Inc.", label: "Company", span: 1 },
    { name: "address", type: "text", icon: MapPin, placeholder: "123 Street, City", label: "Address", span: 2 },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left Brand Panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[38%] flex-col justify-between p-12 bg-black relative overflow-hidden shrink-0">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-700/15 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">Switch2iTech</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/15 border border-primary/25 rounded-full">
            <Zap size={12} className="text-primary" />
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Join the platform</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
            Your account,<br />
            your <span className="text-primary">workspace</span>.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Set up your profile and instantly access projects, analytics, team tools, and client management.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {["Role-based project access", "Real-time team collaboration", "Client & testimonial management"].map((txt) => (
            <div key={txt} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <p className="text-white/60 text-sm font-medium">{txt}</p>
            </div>
          ))}
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mt-2">
            Already have an account? <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-8 py-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-border flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <span className="font-black text-lg tracking-tight">Switch2iTech</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Create an account</h2>
            <p className="text-sm text-muted-foreground">Set up your profile to get started</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group cursor-pointer">
                <div className="h-20 w-20 rounded-full border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="text-muted-foreground group-hover:text-primary transition-colors" size={28} />
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Profile Photo</span>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.map((field) => (
                <div key={field.name} className={`space-y-1.5 ${field.span === 2 ? "md:col-span-2" : ""}`}>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <field.icon size={12} className="text-primary" />
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="auth-input appearance-none"
                    >
                      <option value="user">User</option>
                      <option value="client">Client</option>
                      <option value="developer">Developer</option>
                      <option value="manager">Manager</option>
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      type={field.type}
                      required={["name", "email", "password"].includes(field.name)}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-muted-foreground tracking-widest uppercase font-bold">
            © {new Date().getFullYear()} Switch2iTech
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
