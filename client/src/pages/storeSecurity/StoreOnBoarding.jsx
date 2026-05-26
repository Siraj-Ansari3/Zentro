import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function StoreOnboarding() {
  const { user, setUser } = useAuth();
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
  // CREATE STORE
  // ─────────────────────────────────────────────
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
    const res = await api.get("/auth/bootstrap"); //triggers refresh of user and store data in contexts.

    // 3. update AuthContext manually (we fix context below)
    setUser(res.data.user); //responsible for updating the user state and triggering the StoreContext to refetch memberships and set the active store accordingly. This is crucial for ensuring that the user sees the newly created store in their dashboard without needing to refresh the page.

    // 4. navigate AFTER state update
    navigate("/", { replace: true }); //responsible for redirecting to dashboard after store creation

  } catch (err) {
    setError(err?.response?.data?.message || "Failed to create store");
  } finally {
    setCreating(false);
  }
};

  // ─────────────────────────────────────────────
  // JOIN STORE
  // ─────────────────────────────────────────────
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

      setSuccess("Join request sent successfully!");

      // do NOT auto redirect (waiting approval flow)
      setStoreKey("");

    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send request");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080a12] flex items-center justify-center p-6">
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
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
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
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none resize-none h-24"
              />

              <button
                onClick={handleCreateStore}
                disabled={creating}
                className="w-full py-2.5 rounded-lg bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 disabled:opacity-60"
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
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
              >
                <option value="editor">Editor</option>
                <option value="packer">Packer</option>
                <option value="viewer">Viewer</option>
              </select>

              <button
                onClick={handleJoinStore}
                disabled={joining}
                className="w-full py-2.5 rounded-lg bg-white/10 border border-white/10 text-white font-semibold text-sm hover:bg-white/15 disabled:opacity-60"
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