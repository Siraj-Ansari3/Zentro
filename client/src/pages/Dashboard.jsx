import { useEffect, useState } from "react";

import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
  UserPlus,
  Upload,
  Download,
} from "lucide-react";

import api from "../api/axios";

import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

const colorMap = {
  amber: {
    bg: "bg-amber-400/10",
    icon: "text-amber-400",
    ring: "ring-amber-400/20",
  },

  violet: {
    bg: "bg-violet-400/10",
    icon: "text-violet-400",
    ring: "ring-violet-400/20",
  },

  sky: {
    bg: "bg-sky-400/10",
    icon: "text-sky-400",
    ring: "ring-sky-400/20",
  },

  emerald: {
    bg: "bg-emerald-400/10",
    icon: "text-emerald-400",
    ring: "ring-emerald-400/20",
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { activeStore, setActiveStore } = useStore();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // ─────────────────────────────────────
  // FETCH DASHBOARD
  // ─────────────────────────────────────

  useEffect(() => {
    if (!activeStore?.storeId) {
      setLoading(false);
      return;
    }
    fetchDashboard();
  }, [activeStore]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/stats`, {
        params: {
          storeId: activeStore?.storeId,
        },
      });

      setDashboardData(res.data);
      console.log("Dashboard data fetched:", res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `$${dashboardData?.stats?.totalRevenue || 0}`,
      change: "+0%",
      up: true,
      icon: DollarSign,
      color: "amber",
    },
    {
      label: "Active Shipments",
      value: dashboardData?.stats?.activeShipments || 0,
      change: "+0%",
      up: true,
      icon: Users,
      color: "violet",
    },
    {
      label: "Orders",
      value: dashboardData?.stats?.totalOrders || 0,
      change: "+0%",
      up: true,
      icon: ShoppingBag,
      color: "sky",
    },
    {
      label: "COD Success Rate",
      value: `${dashboardData?.stats?.codSuccessRate || 0}%`,
      change: "+0%",
      up: true,
      icon: Activity,
      color: "emerald",
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Welcome back 👋
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {activeStore?.storeName}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
            <Upload size={13} /> Import
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
            <Download size={13} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20">
            <UserPlus size={13} /> Add Customer
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, up, icon: Icon, color }) => {
          const c = colorMap[color];
          return (
            <div
              key={label}
              className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center`}>
                  <Icon size={16} className={c.icon} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          );
        })}
      </div>

      {/* ── STORE INFO ── */}
      <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Active Store</h3>
        <div className="space-y-2 text-sm">
          <p className="text-slate-400">
            Store:<span className="text-white ml-2">{activeStore?.storeName}</span>
          </p>
          <p className="text-slate-400">
            Role:<span className="text-white ml-2">{activeStore?.role}</span>
          </p>
          <p className="text-slate-400">
            User:<span className="text-white ml-2">{user?.email}</span>
          </p>
        </div>
      </div>

    </div>
  );
}