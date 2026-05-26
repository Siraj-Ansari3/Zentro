import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Mail, Lock, Eye, EyeOff, ArrowRight, RotateCcw,
  CheckCircle2, AlertCircle, Truck, Shield, Activity,
  User, ChevronRight, Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ─────────────────────────────────────────────────────────────
// FIREBASE ERROR → HUMAN MESSAGE
// ─────────────────────────────────────────────────────────────
const FIREBASE_ERRORS = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/user-disabled": "This account has been disabled.",
};

function friendlyError(err) {
  return FIREBASE_ERRORS[err?.code] || "Something went wrong. Please try again.";
}

// ─────────────────────────────────────────────────────────────
// PASSWORD STRENGTH METER (sign-up only)
// ─────────────────────────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
  if (score <= 2) return { score, label: "Fair", color: "bg-amber-400" };
  if (score <= 3) return { score, label: "Good", color: "bg-blue-400" };
  return { score, label: "Strong", color: "bg-emerald-400" };
}

// ─────────────────────────────────────────────────────────────
// LEFT BRANDING PANEL
// ─────────────────────────────────────────────────────────────
const LIVE_STATS = [
  { label: "Active Shipments", value: "1,284", icon: Truck, color: "text-cyan-400" },
  { label: "COD Success Rate", value: "84.2%", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "High Risk Alerts", value: "37", icon: Shield, color: "text-amber-400" },
  { label: "Live Events/min", value: "142", icon: Activity, color: "text-violet-400" },
];

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full px-10 py-12 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-violet-400/5 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/40">
          <Zap size={18} className="text-black fill-black" />
        </div>
        <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Zentro
        </span>
      </div>

      {/* Headline */}
      <div className="relative z-10">
        <h2
          className="text-3xl font-black text-white leading-snug mb-4"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Operational intelligence for your supply chain.
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
          Real-time courier monitoring, COD risk engine, and fulfillment control — all in one platform.
        </p>

        {/* Divider */}
        <div className="w-12 h-px bg-amber-400/40 my-6" />

        {/* Live Stats */}
        <div className="space-y-3">
          {LIVE_STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Icon size={13} className={color} />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-sm font-black ${color}`} style={{ fontFamily: "'Syne', sans-serif" }}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-[11px] text-slate-600 relative z-10">
        © 2024 Zentro Operations Platform. All rights reserved.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INPUT FIELD
// ─────────────────────────────────────────────────────────────
function InputField({ id, label, type, value, onChange, placeholder, icon: Icon, error, rightSlot, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={15} className={error ? "text-red-400" : "text-slate-600"} />
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            w-full pl-10 pr-${rightSlot ? "12" : "4"} py-3 rounded-xl text-sm
            bg-white/[0.04] border transition-all duration-150
            text-slate-200 placeholder-slate-600
            focus:outline-none focus:bg-white/[0.06]
            ${error
              ? "border-red-400/40 focus:border-red-400/60"
              : "border-white/[0.08] focus:border-amber-400/50"
            }
          `}
        />
        {rightSlot && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-red-400 font-medium">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN LOGIN PAGE
// ─────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { user, signIn, signInWithGoogle, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const strength = passwordStrength(password);

  // ── Validation ──
  function validate() {
    const errs = {};
    if (!email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email.";
    if (mode !== "reset") {
      if (!password) errs.password = "Password is required.";
      if (mode === "signup") {
        if (strength.score < 2) errs.password = "Choose a stronger password.";
        if (!confirmPw) errs.confirm = "Please confirm your password.";
        else if (confirmPw !== password) errs.confirm = "Passwords do not match.";
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        navigate("/");
      } else if (mode === "signup") {
        await signUp(email, password);
        navigate("/");
      } else if (mode === "reset") {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setFieldErrors({});
    setResetSent(false);
    if (next !== "signup") { setConfirmPw(""); }
  }

  // ─────────────────────────────────────────────────────────
  // RESET PASSWORD VIEW
  // ─────────────────────────────────────────────────────────
  if (mode === "reset") {
    return (
      <div className="min-h-screen bg-[#080a12] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Zap size={16} className="text-black fill-black" />
            </div>
            <span className="text-white font-black text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Zentro</span>
          </div>

          <div className="bg-[#13151f] border border-white/[0.07] rounded-2xl p-7 shadow-2xl shadow-black/60">
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                </div>
                <h2 className="text-base font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Reset Email Sent</h2>
                <p className="text-sm text-slate-500 mb-6">Check <span className="text-slate-300 font-medium">{email}</span> for a password reset link.</p>
                <button onClick={() => switchMode("signin")} className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 mx-auto">
                  <ChevronRight size={12} className="rotate-180" /> Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => switchMode("signin")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-5">
                  <ChevronRight size={12} className="rotate-180" /> Back to Sign In
                </button>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Reset Password</h2>
                  <p className="text-xs text-slate-500">We'll send a reset link to your email.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField id="reset-email" label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" icon={Mail} error={fieldErrors.email} autoComplete="email" />
                  {error && <ErrorBanner message={error} />}
                  <SubmitButton loading={loading} label="Send Reset Link" />
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // MAIN AUTH VIEW — SPLIT LAYOUT
  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080a12] flex">
      {/* Left brand panel */}
      <div className="hidden lg:block w-[420px] flex-shrink-0 bg-[#0d0f1a] border-r border-white/[0.05]">
        <BrandPanel />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Zap size={16} className="text-black fill-black" />
            </div>
            <span className="text-white font-black text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Zentro</span>
          </div>

          {/* Card */}
          <div className="bg-[#13151f] border border-white/[0.07] rounded-2xl p-7 shadow-2xl shadow-black/60 relative overflow-hidden">
            {/* Ambient glow top-right */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />

            {/* Mode toggle tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6 relative z-10">
              {[
                { key: "signin", label: "Sign In" },
                { key: "signup", label: "Sign Up" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchMode(key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${mode === key
                    ? "bg-amber-400 text-black shadow-sm shadow-amber-400/30"
                    : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-6 relative z-10">
              <h1 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-xs text-slate-500">
                {mode === "signin"
                  ? "Sign in to access your operations dashboard."
                  : "Get started with the Zentro operations platform."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10" noValidate>
              {/* Email */}
              <InputField
                id="email" label="Email Address" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" icon={Mail}
                error={fieldErrors.email} autoComplete="email"
              />

              {/* Password */}
              <InputField
                id="password" label="Password" type={showPw ? "text" : "password"}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min. 6 characters" : "Enter your password"}
                icon={Lock} error={fieldErrors.password}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                rightSlot={
                  <button type="button" onClick={() => setShowPw(v => !v)} className="text-slate-600 hover:text-slate-400 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Password strength (signup) */}
              {mode === "signup" && password && (
                <div className="space-y-1.5 -mt-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.score ? strength.color : "bg-white/[0.06]"
                          }`}
                      />
                    ))}
                    <span className={`text-[10px] font-semibold ml-1 w-12 flex-shrink-0 ${strength.score <= 1 ? "text-red-400" : strength.score <= 2 ? "text-amber-400" : strength.score <= 3 ? "text-blue-400" : "text-emerald-400"
                      }`}>{strength.label}</span>
                  </div>
                </div>
              )}

              {/* Confirm password (signup) */}
              {mode === "signup" && (
                <InputField
                  id="confirm" label="Confirm Password" type={showConfirm ? "text" : "password"}
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Re-enter password" icon={Lock}
                  error={fieldErrors.confirm} autoComplete="new-password"
                  rightSlot={
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-slate-600 hover:text-slate-400 transition-colors">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              )}

              {/* Forgot password (sign-in) */}
              {mode === "signin" && (
                <div className="flex justify-end -mt-1">
                  <button type="button" onClick={() => switchMode("reset")} className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Global error */}
              {error && <ErrorBanner message={error} />}

              {/* Submit */}
              <SubmitButton
                loading={loading}
                label={mode === "signin" ? "Sign In" : "Create Account"}
              />
            </form>

            <button
              onClick={signInWithGoogle}
              className="
    w-full flex items-center justify-center gap-3 py-2.5 rounded-xl mt-3
    bg-white/[0.04] hover:bg-white/[0.07] active:bg-white/[0.03]
    border border-white/[0.08] hover:border-white/[0.14]
    text-slate-300 hover:text-white text-sm font-semibold
    transition-all duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
  "
            >
              {/* Official Google "G" logo */}
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Footer switch */}
            <p className="text-center text-xs text-slate-600 mt-5 relative z-10">
              {mode === "signin" ? (
                <>Don't have an account?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">Sign up free</button>
                </>
              ) : (
                <>Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("signin")} className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">Sign in</button>
                </>
              )}
            </p>
          </div>

          {/* Terms */}
          <p className="text-center text-[10px] text-slate-700 mt-4">
            By continuing, you agree to Zentro's{" "}
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
            {" & "}
            <span className="text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-red-400/5 border border-red-400/20 text-xs text-red-400 font-medium">
      <AlertCircle size={13} className="flex-shrink-0" />
      {message}
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        w-full flex items-center justify-center gap-2 py-3 rounded-xl
        bg-amber-400 hover:bg-amber-300 active:bg-amber-500
        text-black text-sm font-bold
        transition-all duration-150
        shadow-lg shadow-amber-400/20
        disabled:opacity-60 disabled:cursor-not-allowed
        mt-1
      "
    >
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight size={15} />
        </>
      )}
    </button>
  );
}
