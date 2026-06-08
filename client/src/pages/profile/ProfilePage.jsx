import { useState, useEffect } from "react";
import {
  User, Mail, Shield, Save, Lock,
  Camera, Loader2, CheckCircle2,
  AlertTriangle, Send, Building2, Calendar
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";

const HARDCODED_JOINED = "March 2024";

export default function ProfilePage() {
  const { user, setUser, resetPassword } = useAuth();
  const {activeStore} = useStore();

  const [loading, setLoading]       = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [resetSent, setResetSent]   = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.dbUser?.displayName || "",
    email: user?.email,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user?.dbUser?.displayName || "",
        email: user?.email ,
      });
    }
  }, [user]);

  const flash = (setter, msg, ms = 3500) => {
    setter(msg);
    setTimeout(() => setter(""), ms);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await api.put("/users/profile", { displayName: formData.displayName });
      setUser({ ...user, dbUser: { ...user?.dbUser, displayName: formData.displayName } });
      flash(setSuccessMsg, "Profile updated successfully.");
    } catch (err) {
      flash(setErrorMsg, err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg("");
    try {
      await resetPassword(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch {
      flash(setErrorMsg, "Failed to send password reset email.");
    }
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "A";
  const displayName = user?.dbUser?.displayName || "Ali Raza";
  const email = user?.email ;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h2
          className="text-xl font-semibold text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Profile settings
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your account details and security preferences.
        </p>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertTriangle size={14} className="flex-shrink-0" />
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 size={14} className="flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 items-start">

        {/* ── LEFT: Identity card ── */}
        <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">

          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center gap-3 px-6 pt-8 pb-6 border-b border-white/[0.06]">
            <div className="relative group cursor-pointer">
              <div className="w-[72px] h-[72px] rounded-full bg-indigo-500/15 border-2 border-indigo-400/20 flex items-center justify-center text-2xl font-semibold text-indigo-400 overflow-hidden">
                {user?.photoURL
                  ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  : initial
                }
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={16} className="text-white" />
              </div>
              {/* Camera badge */}
              <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-[#1e2135] border border-white/[0.1] flex items-center justify-center">
                <Camera size={10} className="text-slate-400" />
              </div>
            </div>

            <div>
              <p className="text-base font-semibold text-white leading-snug">{displayName}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{email}</p>
            </div>

            {/* Role badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Shield size={10} />
              {activeStore?.role}
            </span>
          </div>

          {/* Meta rows */}
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center gap-2.5 text-[12px] text-slate-500">
              <Calendar size={13} className="text-slate-600 flex-shrink-0" />
              Joined {activeStore?.joinedAt && new Date(activeStore.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
            </div>
            <div className="flex items-center gap-2.5 text-[12px] text-slate-500">
              <Building2 size={13} className="text-slate-600 flex-shrink-0" />
              {activeStore?.storeName}
            </div>
            <div className="flex items-center gap-2.5 text-[12px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-emerald-400">Active session</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Forms ── */}
        <div className="space-y-5">

          {/* General info */}
          <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <User size={13} className="text-slate-600" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                General information
              </span>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
              {/* Full name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.07] text-white placeholder-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.02] border border-white/[0.04] text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  Email is managed by your authentication provider and cannot be changed here.
                </p>
              </div>

              {/* Save */}
              <div className="flex justify-end pt-1 border-t border-white/[0.05]">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition-all shadow-lg shadow-amber-400/10"
                >
                  {loading
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Save size={13} />
                  }
                  Save changes
                </button>
              </div>
            </form>
          </div>

          {/* Security */}
          <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <Lock size={13} className="text-slate-600" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Security
              </span>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div>
                  <p className="text-sm font-semibold text-white">Password</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    A reset link will be sent to{" "}
                    <span className="text-slate-400">{email}</span>
                  </p>
                </div>
                <button
                  onClick={handlePasswordReset}
                  disabled={resetSent}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    resetSent
                      ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5 cursor-default"
                      : "text-slate-400 border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {resetSent
                    ? <><CheckCircle2 size={13} /> Link sent</>
                    : <><Send size={13} /> Send reset link</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}