import React, { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../api/authService";
import { useAuth } from "../../context/ContextProvider";
import logoUrl from "/Images/Logo.png";

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthenticated, setUser, setRole } = useAuth();

  const persisted = useMemo(() => {
    try {
      const raw = localStorage.getItem("pending_verification");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const verification = location.state || persisted || {};
  const email = verification.email || "";
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

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
  const inputRefs = useRef([]);
  const otpCode = otpDigits.join("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("No email found for verification.");
      return;
    }

    if (otpCode.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmailCode(otpCode.trim());

      const meRes = await authService.getCurrentUser();
      const userData = meRes?.data?.data?.user || meRes?.data?.data || meRes?.data?.user || null;

      if (userData?._id && isUserVerified(userData)) {
        setUser(userData);
        setRole(userData?.role || "user");
        setAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.removeItem("pending_verification");
        setOtpDigits(["", "", "", "", "", ""]);
        toast.success("Email verified successfully.");
        navigate("/profile");
      } else {
        setAuthenticated(false);
        setUser(null);
        setRole(null);
        setError("OTP verified, but account still requires full verification.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    if (!email) {
      setError("No email found for OTP.");
      return;
    }

    setResending(true);
    try {
      await authService.requestOtp(email);
      toast.success("OTP resent to your email.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, "");
    if (!clean && value !== "") return;

    const next = [...otpDigits];
    next[index] = clean.slice(-1);
    setOtpDigits(next);

    if (clean && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtpDigits(next);
    inputRefs.current[Math.min(pasted.length, 6) - 1]?.focus();
  };

  return (
    <div className="min-h-screen flex bg-background">
      
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-12 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-700/20 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">Switch2iTech</span>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/15 border border-primary/25 rounded-full">
            <ShieldCheck size={12} className="text-primary" />
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Security check</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Verify your account</h1>
          <p className="text-white/60 text-sm max-w-xs">Enter OTP sent to your email or mobile number to complete signup.</p>
        </div>

        <div className="relative z-10 text-white/50 text-xs uppercase tracking-widest font-bold">Secure onboarding enabled</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="flex lg:hidden items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-border flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <span className="font-black text-lg tracking-tight">Switch2iTech</span>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">OTP Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter the OTP code sent during signup.</p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4 text-sm">
            <p className="text-muted-foreground flex items-center gap-1.5"><Mail size={14} /> OTP sent to</p>
            <p className="font-bold text-foreground mt-1 break-all">{email || "Not available"}</p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">OTP Verification Code</label>
              <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-12 rounded-xl border border-border bg-card text-center text-lg font-black outline-none focus:ring-2 focus:ring-primary/25"
                    required
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Verify OTP <ArrowRight size={15} /></>}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full h-11 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-secondary/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {resending ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={14} />}
              Resend OTP
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Back to <Link to="/login" className="font-bold text-primary">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
