import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Shield, 
  Save, 
  Lock, 
  Camera,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Send
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user, setUser, resetPassword } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    displayName: user?.dbUser?.displayName || "",
    email: user?.email || "",
  });

  // Keep form in sync if user context updates
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user?.dbUser?.displayName || "",
        email: user?.email || "",
      });
    }
  }, [user]);

  // ─────────────────────────────────────
  // UPDATE PROFILE HANDLER
  // ─────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // Send update to your Node.js backend
      // Assuming you have a route like PUT /api/users/profile
      const res = await api.put("/users/profile", {
        displayName: formData.displayName
      });

      // Update the local context so the UI reflects the change globally
      setUser({ ...user, dbUser: { ...user?.dbUser, displayName: formData.displayName } });
      
      setSuccessMsg("Profile updated successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Profile update failed:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────
  // PASSWORD RESET HANDLER
  // ─────────────────────────────────────
  const handlePasswordReset = async () => {
    setErrorMsg("");
    try {
      await resetPassword(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      console.error("Password reset failed:", err);
      setErrorMsg("Failed to send password reset email.");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      
      {/* ── HEADER ── */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>
          Profile Settings
        </h2>
        <p className="text-slate-500 text-sm">
          Manage your account details and security preferences.
        </p>
      </div>

      {/* ── NOTIFICATIONS ── */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ── LEFT COLUMN: AVATAR & QUICK INFO ── */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center text-center">
            
            {/* Avatar */}
            <div className="relative group cursor-pointer mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-2 border-amber-400/30 flex items-center justify-center text-3xl font-bold text-amber-400 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.email?.charAt(0).toUpperCase() || <User size={40} />
                )}
              </div>
              
              {/* Hover Overlay for Picture Change (Visual only for now) */}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-white">{user?.dbUser?.displayName || "Store User"}</h3>
            <p className="text-sm text-slate-400 mb-4">{user?.email}</p>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-semibold border border-amber-400/20">
              <Shield size={12} />
              {user?.dbUser?.role === "admin" ? "System Admin" : "Standard User"}
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: SETTINGS FORMS ── */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Form: General Info */}
          <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
              <User size={16} className="text-slate-500" />
              General Information
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.02] border border-white/[0.04] text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Email addresses are linked to your authentication provider and cannot be changed here.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-70 transition-all shadow-lg shadow-amber-400/20"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Form: Security */}
          <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Lock size={16} className="text-slate-500" />
              Security
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="text-sm font-semibold text-white">Password Reset</p>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                  We will send a secure link to <strong>{user?.email}</strong> allowing you to update your password.
                </p>
              </div>

              <button
                onClick={handlePasswordReset}
                disabled={resetSent}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] hover:text-white disabled:opacity-50 transition-colors"
              >
                {resetSent ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Link Sent
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Reset Link
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}