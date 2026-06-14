import { useEffect, useState } from "react";
import {
  Search, Truck, ChevronLeft, ChevronRight, Loader2, 
  MapPin, Phone, AlertTriangle, Inbox, Check, X,
  Clock, DollarSign, ShieldAlert
} from "lucide-react";

import api from "../../api/axios";
import { useStore } from "../../context/StoreContext";

// ─────────────────────────────────────────────────────────────
// COMPONENT HELPERS & BADGES
// ─────────────────────────────────────────────────────────────
function PayBadge({ type }) {
  return type?.toUpperCase() === "COD" ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-amber-400/10 text-amber-400 border-amber-400/20">COD</span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">PREPAID</span>
  );
}

function RiskBadge({ level }) {
  const maps = {
    low: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    high: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border capitalize ${maps[level] || maps.low}`}>
      {level || "low"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// LOCAL ASSIGN COURIER MODAL
// ─────────────────────────────────────────────────────────────
function AssignCourierModal({ order, onClose, onAssigned }) {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState("");
  const { activeStore } = useStore();

  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const res = await api.get("/courier/get_couriers", {
          params: { storeId: activeStore?.storeId }
        });
        setCouriers(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load integrated courier profiles");
      } {
        setLoading(false);
      }
    };
    fetchCouriers();
  }, [activeStore]);

  const handleSelectCourier = async (courier) => {
    const courierName = courier.courierId?.name || courier.name || "Unknown";
    setAssigningId(courier._id);
    setError("");
    try {
      await api.post("/order/assign_order", {
        courier: courierName,
        orderNumber: order.orderNumber,
      }, {
        params: { storeId: activeStore?.storeId }
      });
      
      onAssigned();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Courier API rejected booking submission parameters.");
      setAssigningId(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0f1120] border border-white/[0.08] rounded-2xl w-full max-w-sm flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>Assign Courier</h2>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Order: #{order.orderNumber}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 flex-1 max-h-[350px] overflow-y-auto space-y-2">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 mb-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500 text-xs">
                <Loader2 size={20} className="animate-spin text-amber-400" />
                Loading courier gateways...
              </div>
            ) : couriers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No active integrations configured.</div>
            ) : (
              couriers.map((c, idx) => {
                const name = c.courierId?.name || c.name || "Courier Gateway";
                const isAssigning = assigningId === c._id;
                return (
                  <button
                    key={c._id || idx}
                    onClick={() => handleSelectCourier(c)}
                    disabled={!!assigningId}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-amber-400/30 disabled:opacity-50 transition-all group"
                  >
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{name}</p>
                      <p className="text-[10px] text-slate-600 font-medium mt-0.5">Automated Generation API</p>
                    </div>
                    {isAssigning ? (
                      <Loader2 size={13} className="animate-spin text-amber-400" />
                    ) : (
                      <Truck size={13} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function DispatchQueue() {
  const { activeStore } = useStore();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [activeModalOrder, setActiveModalOrder] = useState(null);

  // Debounce inputs for physical barcode optimization
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUnassignedQueue = async () => {
    if (!activeStore?.storeId) return;
    try {
      setLoading(true);
      const res = await api.get("/order/unassigned", {
        params: {
          storeId: activeStore.storeId,
          search: debouncedSearch,
          page,
          limit,
        }
      });
      setOrders(res.data.data.orders || []);
      setTotalCount(res.data.data.pagination.total || 0);
    } catch (err) {
      console.error("Failed to load unassigned dispatch records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassignedQueue();
  }, [activeStore, debouncedSearch, page]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="p-4 lg:p-6 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>Dispatch Queue</h2>
            <span className="px-2 py-0.5 rounded-md bg-sky-400/10 text-sky-400 text-xs font-bold border border-sky-400/20">
              {totalCount} Packed Items
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Assign ready-to-ship packages to courier accounts to automatically generate tracking slips.
          </p>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative flex-shrink-0 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Scan invoice slip or search order number/phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-[#13151f] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
        />
      </div>

      {/* ── QUEUE TABLE CARD ── */}
      <div className="flex-1 bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-[#13151f] z-10 border-b border-white/[0.06]">
              <tr>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Order Number</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Customer Info</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Destination</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Value</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">Security Risk</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Fulfillment Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-500 text-sm">
                    <Loader2 className="animate-spin mx-auto text-amber-400 mb-2" size={24} />
                    Syncing unassigned courier manifest ledgers...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-500">
                    <Inbox size={34} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-semibold text-white">All shipments booked!</p>
                    <p className="text-xs mt-1">There are no unassigned packed packages ready for courier route assignment.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.015] transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs font-bold text-slate-300 group-hover:text-amber-400 transition-colors">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-slate-200">{order.shippingAddress?.fullName}</p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10} />{order.shippingAddress?.phone}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-300 flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-600" />
                        {order.shippingAddress?.city || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Rs {order.totalAmount?.toLocaleString()}</span>
                        <PayBadge type={order.paymentMethod} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <RiskBadge level={order.riskLevel || order.customerId?.riskLevel} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setActiveModalOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/10 transition-colors"
                      >
                        <Truck size={12} /> Assign Courier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION BAR ── */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0 bg-[#0d0f1a]">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} open balances
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-slate-300">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded-md bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── ASSIGNMENT SELECTION MODAL LAYER ── */}
      {activeModalOrder && (
        <AssignCourierModal
          order={activeModalOrder}
          onClose={() => setActiveModalOrder(null)}
          onAssigned={() => {
            // Re-fetch list to pop the newly booked order out of the queue instantly
            fetchUnassignedQueue();
          }}
        />
      )}
    </div>
  );
}