import React, { useState } from "react";
import { Lock, Mail, ChevronRight, UserPlus, Loader2, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import { useAuth } from "../../context/ContextProvider";
import logoUrl from "/Images/Logo.png";

const Signin = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setUser, setRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const isUserVerified = (userData) => {
    if (!userData) return false;
    if (typeof userData.isVerified === "boolean") return userData.isVerified;
    const emailVerified = typeof userData.isEmailVerified === "boolean" ? userData.isEmailVerified : true;
    const phoneRequired = Boolean(userData.phoneNo);
    const phoneVerified = phoneRequired
      ? (typeof userData.isPhoneVerified === "boolean" ? userData.isPhoneVerified : true)
      : true;
    return emailVerified && phoneVerified;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authService.login(formData);
      if (response.data.status === "success" || response.data.user) {
        const userData = response.data.data?.user || response.data.data || response.data.user;
        if (isUserVerified(userData)) {
          setUser(userData);
          setRole(userData?.role || "user");
          setAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(userData));
          navigate("/profile");
        } else {
          setAuthenticated(false);
          setUser(null);
          setRole(null);
          localStorage.setItem(
            "pending_verification",
            JSON.stringify({
              email: userData?.email || formData.email || "",
              phoneNo: userData?.phoneNo || "",
              userId: userData?._id || null,
            })
          );
          setError("Account not verified. Please verify OTP.");
          navigate("/verify-otp");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In triggered");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left Brand Panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 bg-black relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-700/20 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">Switch2iTech</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/15 border border-primary/25 rounded-full">
            <Zap size={12} className="text-primary" />
            <span className="text-xs font-bold text-primary tracking-wider uppercase">ERP Platform</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Manage your<br />
            <span className="text-primary">team &amp; projects</span><br />
            effortlessly.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            A single workspace for projects, clients, analytics, and team collaboration — built for modern IT teams.
          </p>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[["200+", "Projects"], ["98%", "Uptime"], ["50+", "Clients"]].map(([val, lbl]) => (
            <div key={lbl} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-xl font-black text-white">{val}</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-border flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <span className="font-black text-lg tracking-tight">Switch2iTech</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  className="auth-input pl-10"
                  placeholder="you@switch2itech.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  className="auth-input pl-10"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>Log in <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-secondary/50 transition-all duration-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New here?</span>
            </div>
          </div>

          <Link
            to="/signup"
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-border text-foreground font-semibold text-sm hover:bg-secondary/50 transition-all duration-200"
          >
            <UserPlus size={16} />
            Create an account
          </Link>

          <p className="text-center text-[10px] text-muted-foreground tracking-widest uppercase font-bold">
            © {new Date().getFullYear()} Switch2iTech
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
