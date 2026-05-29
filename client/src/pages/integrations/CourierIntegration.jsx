import { useState } from "react";
import api from "../../api/axios";
import { useStore } from "../../context/StoreContext";

const CourierIntegration = () => {
  const { activeStore } = useStore();

  const [form, setForm] = useState({
    courier: "postex",
    apiKey: "",
    apiSecret: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        storeId: activeStore?.storeId,
        courier: form.courier,
        credentials: {
          apiKey: form.apiKey,
          apiSecret: form.apiSecret,
          username: form.username,
          password: form.password,
        },
      };

      const res = await api.post("/courier/connect", payload);

      setMessage(res.data?.message || "Courier connected successfully");
      setForm({
        courier: "postex",
        apiKey: "",
        apiSecret: "",
        username: "",
        password: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to connect courier"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl font-bold mb-4">Courier Integration</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 bg-white/5 p-5 rounded-xl border border-white/10"
      >
        {/* Courier Dropdown (only PostEx for now) */}
        <div>
          <label className="text-xs text-slate-400">Courier</label>
          <select
            name="courier"
            value={form.courier}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-black/20 border border-white/10 text-white"
          >
            <option value="postex">PostEx</option>
          </select>
        </div>

        {/* Credentials */}
        <div>
          <label className="text-xs text-slate-400">API Key</label>
          <input
            name="apiKey"
            value={form.apiKey}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-black/20 border border-white/10 text-white"
            placeholder="Enter API Key"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">API Secret</label>
          <input
            name="apiSecret"
            value={form.apiSecret}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-black/20 border border-white/10 text-white"
            placeholder="Enter API Secret"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-black/20 border border-white/10 text-white"
            placeholder="Username"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-black/20 border border-white/10 text-white"
            placeholder="Password"
          />
        </div>

        {/* Messages */}
        {message && (
          <p className="text-green-400 text-xs">{message}</p>
        )}
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 text-black font-semibold py-2 rounded hover:bg-amber-300 transition"
        >
          {loading ? "Connecting..." : "Connect Courier"}
        </button>
      </form>
    </div>
  );
};

export default CourierIntegration;