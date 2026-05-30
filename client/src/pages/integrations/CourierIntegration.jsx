import { useState } from "react";
import api from "../../api/axios";
import { useStore } from "../../context/StoreContext";
import { useEffect } from "react";

const CourierIntegration = () => {
  const { activeStore } = useStore();

  const [connectedCourier, setConnectedCourier] = useState(null);
  const [loadingIntegration, setLoadingIntegration] = useState(true);
  const [form, setForm] = useState({
    courier: "PostEx",
    apiKey: "",
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
        },
      };

      const res = await api.post("/courier/connect", payload);

      console.log("Connect response:", res.data);
      setMessage(res.data?.message || "Courier connected successfully");

      // Reset form on success
      setForm({
        courier: "PostEx",
        apiKey: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to connect courier"
      );
      console.error("Connect error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrations = async () => {
    try {
      setLoadingIntegration(true);

      const res = await api.get("/courier/integrations", {
        params: {
          storeId: activeStore.storeId,
        }
      });

      const integrations = res.data.integrations || [];

      const postex = integrations.find(
        (i) =>
          i.courierId?.name === "PostEx"
      );

      if (postex) {
        setConnectedCourier(postex);

        setForm({
          courier: "PostEx",
          apiKey: postex.credentials.apiKey,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIntegration(false);
    }
  };

  useEffect(() => {
    if (!activeStore?.storeId) return;

    fetchIntegrations();
  }, [activeStore]);


  //diconnect courier 
  const disconnectCourier = async (courier) => {
    try {
      await api.post("/courier/disconnect", {
        storeId: activeStore.storeId,
        courier: "PostEx",
      });

      setConnectedCourier(null);

      setForm({
        courier: "PostEx",
        apiKey: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl font-bold mb-4">Courier Integration</h1>



      {connectedCourier && (
        <div className="mb-6">
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400 font-medium">
                PostEx Connected
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Connected on{" "}
              {new Date(
                connectedCourier.connectedAt
              ).toLocaleDateString()}
            </p>
          </div>

          <button
            type="button"
            onClick={() => disconnectCourier()}
            className="w-full mt-2 bg-red-500/10 border border-red-500/20 text-red-400 py-2 rounded"
          >
            Disconnect Courier
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 bg-white/5 p-5 rounded-xl border border-white/10"
      >
        {/* Courier Dropdown */}
        <div>
          <label className="text-xs text-slate-400">Courier</label>
          <select
            name="courier"
            value={form.courier}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded bg-black/20 border border-white/10 text-white"
          >
            <option value="PostEx">PostEx</option>
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
          {loading ? "Connecting..." :
            connectedCourier
              ? "Update Credentials"
              : "Connect Courier"
          }
        </button>
      </form>
    </div>
  );
};

export default CourierIntegration;