import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react"; // Import the icon
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function StoreOnboarding() {
  // Destructure logOut from context
  const { user, setUser, logOut } = useAuth();
  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // CREATE STORE STATE
  // ─────────────────────────────────────────────
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // ─────────────────────────────────────────────
  // JOIN STORE STATE
  // ─────────────────────────────────────────────
  const [storeKey, setStoreKey] = useState("");
  const [role, setRole] = useState("editor");
  const [joining, setJoining] = useState(false);

  // ─────────────────────────────────────────────
  // ERROR / SUCCESS
  // ─────────────────────────────────────────────
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Failed to log out. Please try again.");
    }
  };

  const handleCreateStore = async () => {
    setError("");
    setSuccess("");

    if (!storeName.trim()) {
      setError("Store name is required");
      return;
    }

    try {
      setCreating(true);

      // 1. create store
      await api.post("/stores", {
        name: storeName,
        description,
      });

      setSuccess("Store created successfully!");

      // 2. IMPORTANT: re-bootstrap user
      const res = await api.get("/auth/bootstrap"); 

      // 3. update AuthContext manually
      setUser(res.data.user); 

      // 4. navigate AFTER state update
      navigate("/", { replace: true }); 

    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create store");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinStore = async () => {
    setError("");
    setSuccess("");

    if (!storeKey.trim()) {
      setError("Store key is required");
      return;
    }

    try {
      setJoining(true);

      const res = await api.post("/stores/join", {
        storeKey,
        requestedRole: role,
      });

      setSuccess("Join request sent successfully! Waiting for admin approval.");
      setStoreKey("");

    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send request");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080a12] flex items-center justify-center p-6 relative">
      
      {/* ───────────────────────────────
          TOP RIGHT ACTIONS
      ─────────────────────────────── */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      <div className="w-full max-w-5xl">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white">
            Welcome, {user?.email}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create a new store or join an existing one to continue
          </p>
        </div>

        {/* ERROR / SUCCESS */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center">
            {success}
          </div>
        )}

        {/* CARDS */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* ───────────────────────────────
              CREATE STORE
          ─────────────────────────────── */}
          <div className="bg-[#121524] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">
              Create Store
            </h2>

            <div className="space-y-3">
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Store name"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-400/50 transition-colors"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none resize-none h-24 focus:border-amber-400/50 transition-colors"
              />

              <button
                onClick={handleCreateStore}
                disabled={creating}
                className="w-full py-2.5 rounded-lg bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 disabled:opacity-60 transition-colors shadow-lg shadow-amber-400/20"
              >
                {creating ? "Creating..." : "Create Store"}
              </button>
            </div>
          </div>

          {/* ───────────────────────────────
              JOIN STORE
          ─────────────────────────────── */}
          <div className="bg-[#121524] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">
              Join Store
            </h2>

            <div className="space-y-3">
              <input
                value={storeKey}
                onChange={(e) => setStoreKey(e.target.value)}
                placeholder="Enter store key"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-400/50 transition-colors"
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-amber-400/50 transition-colors [&>option]:bg-[#121524]"
              >
                <option value="editor">Editor</option>
                <option value="packer">Packer</option>
                <option value="viewer">Viewer</option>
              </select>

              <button
                onClick={handleJoinStore}
                disabled={joining}
                className="w-full py-2.5 rounded-lg bg-white/10 border border-white/10 text-white font-semibold text-sm hover:bg-white/15 disabled:opacity-60 transition-colors"
              >
                {joining ? "Sending Request..." : "Request Access"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}