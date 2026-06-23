import { useEffect, useState, useMemo } from "react";
import {
  Search, Users, ShieldAlert, Ban, UserCheck, 
  ChevronLeft, ChevronRight, AlertTriangle, 
  TrendingUp, Sparkles, Filter, Shield, 
  MapPin, Phone, Mail, Package, X, CheckCircle2
} from "lucide-react";

import api from "../../api/axios";
import { useStore } from "../../context/StoreContext";

// ─────────────────────────────────────────────────────────────
// BADGES & HELPERS
// ─────────────────────────────────────────────────────────────
const riskConfig = {
  low: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Low" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "Medium" },
  high: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "High" },
};

// Helper function to resolve the tier based on your thresholds
const getRiskLevel = (score) => {
  if (score > 70) return "high";
  if (score > 30) return "medium";
  return "low"; // Catches <= 30 as well as fallbacks
};

function RiskBadge({ riskScore = 0 }) {
  // 1. Determine the level string ("low", "medium", "high") based on the numerical score
  const level = getRiskLevel(riskScore);
  
  // 2. Look up the configuration style classes
  const config = riskConfig[level];

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}
      title={`Risk Score: ${riskScore}`} // Optional: shows the exact score on hover
    >
      <Shield size={10} /> {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// INSIGHTS ENGINE
// ─────────────────────────────────────────────────────────────
function generateInsights(metrics) {
  const insights = [];
  
  if (!metrics) return insights;

  // Positive Insights
  if (metrics.totalSpent > 50000) {
    insights.push({ type: "positive", text: "High-value customer. Lifetime spend exceeds Rs 50k." });
  }
  if (metrics.totalOrders > 5 && metrics.codSuccessRate > 90) {
    insights.push({ type: "positive", text: "Highly reliable. Excellent COD delivery history." });
  }

  // Warning Insights
  if (metrics.totalOrders > 2 && metrics.codSuccessRate < 50) {
    insights.push({ type: "critical", text: "High COD failure rate. Require prepaid for future orders." });
  }
  if (metrics.returnedOrders >= 2) {
    insights.push({ type: "warning", text: `Frequent returner (${metrics.returnedOrders} items returned).` });
  }
  if (metrics.cancelledOrders > 3) {
    insights.push({ type: "warning", text: "High cancellation rate. Verify orders via phone immediately." });
  }

  // Neutral Fallback
  if (insights.length === 0 && metrics.totalOrders === 0) {
    insights.push({ type: "neutral", text: "New customer. No historical data available yet." });
  }

  return insights;
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function CustomerProfiles() {
  const { activeStore } = useStore();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Customers
  const fetchCustomers = async () => {
    if (!activeStore?.storeId) return;

    try {
      setLoading(true);
      // We pass storeId in params for GET requests, as Axios often drops bodies on GET
      const res = await api.get("/customers", {
        params: {
          storeId: activeStore?.storeId,
          search: debouncedSearch,
          riskLevel: riskFilter,
          page,
          limit,
        }
      });

      setCustomers(res.data.data.customers);
      setTotalCount(res.data.data.pagination.total);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeStore, debouncedSearch, riskFilter, page]);

  // ─────────────────────────────────────────────────────────────
  // ACTIONS (Uses Request Body for storeId as requested)
  // ─────────────────────────────────────────────────────────────
  const updateCustomerStatus = async (customerId, updates) => {
    try {
      setActionLoading(true);
      
      // Expected backend route: PUT /api/customers/:id
      await api.put(`/customers/${customerId}`, {
        storeId: activeStore.storeId, // Passing storeId in the body
        ...updates
      });

      // Update local state to reflect changes instantly without full reload
      setCustomers(prev => prev.map(c => c._id === customerId ? { ...c, ...updates } : c));
      setSelectedCustomer(prev => prev ? { ...prev, ...updates } : null);
      
    } catch (err) {
      console.error("Failed to update customer:", err);
      alert("Failed to update customer status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlacklistToggle = () => {
    if (!selectedCustomer) return;
    const isCurrentlyBlacklisted = selectedCustomer.isBlacklisted;
    
    // In a real app, you might want a prompt for the reason
    const reason = isCurrentlyBlacklisted ? "" : prompt("Reason for blacklisting (optional):") || "Admin action";
    
    updateCustomerStatus(selectedCustomer._id, { 
      isBlacklisted: !isCurrentlyBlacklisted,
      blacklistReason: reason,
      // Automatically elevate risk if blacklisting
      riskLevel: !isCurrentlyBlacklisted ? "high" : selectedCustomer.riskLevel
    });
  };

  const handleRiskChange = (e) => {
    if (!selectedCustomer) return;
    updateCustomerStatus(selectedCustomer._id, { riskLevel: e.target.value });
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="p-4 lg:p-6 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>Customer Intelligence</h2>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 text-xs font-semibold border border-white/[0.08]">
              {totalCount} Total
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Analyze risk, view insights, and manage customer access.
          </p>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-[#13151f] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl text-xs bg-[#13151f] border border-white/[0.08] text-slate-300 focus:outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="flex-1 bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[#13151f] z-10 border-b border-white/[0.06]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">Orders</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">COD Success</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status & Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500 text-sm">
                    Loading customer data...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500">
                    <UserCheck size={32} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-semibold text-white">No customers found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr 
                    key={c._id} 
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${c.isBlacklisted ? 'bg-red-500/20 text-red-500' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                          {c.isBlacklisted ? <Ban size={14} /> : c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${c.isBlacklisted ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-amber-400 transition-colors'}`}>
                            {c.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-600" />
                        {c.city || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-semibold text-white">{c.metrics?.totalOrders || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono text-slate-300">
                        {c.metrics?.codSuccessRate || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <RiskBadge riskScore={c.riskScore} />
                        {c.isBlacklisted && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                            BLACKLISTED
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-slate-300">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded-md bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CUSTOMER DETAILS DRAWER
      ───────────────────────────────────────────────────────────── */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f1120] border-l border-white/[0.07] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedCustomer.fullName}
                  {selectedCustomer.isBlacklisted && <Ban size={16} className="text-red-500" />}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Intelligent Insights Section */}
              <section>
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> AI Risk Insights
                </h4>
                <div className="space-y-2">
                  {generateInsights(selectedCustomer.metrics).map((insight, idx) => (
                    <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                      insight.type === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                      insight.type === 'warning' ? 'bg-amber-400/10 border-amber-400/20 text-amber-300' :
                      insight.type === 'positive' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300' :
                      'bg-white/[0.04] border-white/[0.08] text-slate-300'
                    }`}>
                      {insight.type === 'critical' ? <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-red-500" /> :
                       insight.type === 'warning' ? <ShieldAlert size={14} className="mt-0.5 flex-shrink-0 text-amber-400" /> :
                       insight.type === 'positive' ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-400" /> :
                       <TrendingUp size={14} className="mt-0.5 flex-shrink-0 text-slate-500" />}
                      <p className="leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Action Controls */}
              <section className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-4">
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Access & Risk Control</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Calculated Risk Level</span>
                  <select 
                    value={selectedCustomer.riskLevel}
                    onChange={handleRiskChange}
                    disabled={actionLoading}
                    className="bg-[#0f1120] border border-white/[0.1] rounded-lg text-xs font-semibold px-2 py-1 outline-none focus:border-amber-400/50 cursor-pointer disabled:opacity-50"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>

                <div className="h-px w-full bg-white/[0.05]" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs text-slate-300">Blacklist Status</span>
                    {selectedCustomer.blacklistReason && (
                      <span className="block text-[10px] text-red-400/80 mt-0.5">Reason: {selectedCustomer.blacklistReason}</span>
                    )}
                  </div>
                  <button 
                    onClick={handleBlacklistToggle}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                      selectedCustomer.isBlacklisted 
                        ? "bg-slate-700 text-white hover:bg-slate-600" 
                        : "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    {selectedCustomer.isBlacklisted ? "Remove Blacklist" : "Blacklist User"}
                  </button>
                </div>
              </section>

              {/* Metrics Grid */}
              <section>
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Lifetime Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 mb-1">Total Spent</p>
                    <p className="text-lg font-bold text-white">Rs {selectedCustomer.metrics?.totalSpent?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 mb-1">Orders</p>
                    <p className="text-lg font-bold text-white">{selectedCustomer.metrics?.totalOrders || 0}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 mb-1">COD Success</p>
                    <p className="text-lg font-bold text-white">{selectedCustomer.metrics?.codSuccessRate || 0}%</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 mb-1">Returns</p>
                    <p className="text-lg font-bold text-red-400">{selectedCustomer.metrics?.returnedOrders || 0}</p>
                  </div>
                </div>
              </section>

              {/* Contact Info */}
              <section>
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact Details</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Mail size={14} className="text-slate-500" />
                    {selectedCustomer.email || <span className="text-slate-600 italic">No email provided</span>}
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <MapPin size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">{selectedCustomer.address || "No address on file"}, {selectedCustomer.area}, {selectedCustomer.city}</span>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </>
      )}
    </div>
  );
}