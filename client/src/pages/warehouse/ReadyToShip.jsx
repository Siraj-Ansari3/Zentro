import { useEffect, useState, useMemo, useRef } from "react";
import {
  Search, Truck, ChevronLeft, ChevronRight, Loader2, 
  MapPin, Printer, ShieldAlert, Barcode, Check, X,
  Download, FileText, CheckCircle2, Copy
} from "lucide-react";

import api from "../../api/axios";
import { useStore } from "../../context/StoreContext";

export default function ReadyToShip() {
  const { activeStore } = useStore();

  // Component UI State
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState(new Set());
  
  // Filtering & Input parameters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [courierFilter, setCourierFilter] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [scanStatus, setScanStatus] = useState({ message: "", type: "" });
  
  const [page, setPage] = useState(1);
  const limit = 15;
  const scanInputRef = useRef(null);

  // Debounce regular text inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Manifest Dataset
  const fetchReadyQueue = async () => {
    if (!activeStore?.storeId) return;
    try {
      setLoading(true);
      const res = await api.get("/order/ready-to-ship", {
        params: {
          storeId: activeStore.storeId,
          search: debouncedSearch,
          courier: courierFilter,
          page,
          limit,
        }
      });
      setOrders(res.data.data.orders || []);
      setTotalCount(res.data.data.pagination.total || 0);
    } catch (err) {
      console.error("Fulfillment pickup queue error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyQueue();
    setSelected(new Set());
  }, [activeStore, debouncedSearch, courierFilter, page]);

  // Dynamic distribution analytics counter computed over available rows
  const courierMetrics = useMemo(() => {
    const counts = { PostEx: 0, Trax: 0, TCS: 0, Leopards: 0, Unassigned: 0 };
    orders.forEach(o => {
      const provider = o.courier || "Unassigned";
      if (counts[provider] !== undefined) counts[provider]++;
      else counts.Unassigned++;
    });
    return counts;
  }, [orders]);

  // ─────────────────────────────────────────────────────────────
  // SCAN-TO-SHIP HANDOVER HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleBarcodeScanSubmit = async (e) => {
    e.preventDefault();
    const targetedIdentifier = scanInput.trim();
    if (!targetedIdentifier) return;

    setScanStatus({ message: "Processing dispatch scan...", type: "info" });

    try {
      // Find order natively matching scanned sequence string parameters
      const matchedOrder = orders.find(
        o => o.orderNumber === targetedIdentifier || o.trackingNumber === targetedIdentifier
      );

      const orderRef = matchedOrder ? matchedOrder.orderNumber : targetedIdentifier;

      // Mutation using body parser matching specific rule structures
      await api.put("/order/update_status", {
        storeId: activeStore.storeId, // Explicit storeId in request body
        orderNumber: orderRef,
        status: "shipped", // Shifts to courier transit pipeline arrays
      });

      setScanStatus({ 
        message: `Order #${orderRef} successfully scanned and handed over to courier transit.`, 
        type: "success" 
      });
      
      setScanInput("");
      fetchReadyQueue(); // Hot reload table context values
      
      // Auto-clear notification toast window metrics after delay
      setTimeout(() => setScanStatus({ message: "", type: "" }), 4000);
    } catch (err) {
      setScanStatus({ 
        message: err?.response?.data?.message || "Identifier mismatch: Box profile context error.", 
        type: "error" 
      });
    }
  };

  // Bulk pipeline action executions
  const handleBulkHandover = async () => {
    if (selected.size === 0) return;
    try {
      setLoading(true);
      await Promise.all(
        Array.from(selected).map(orderNum => 
          api.put("/order/update_status", {
            storeId: activeStore?.storeId, // storeId parameter mapped to target bodies
            orderNumber: orderNum,
            status: "shipped"
          })
        )
      );
      setSelected(new Set());
      fetchReadyQueue();
    } catch (err) {
      console.error("Bulk parcel transaction failure:", err);
      alert("An error occurred executing bulk courier handover parameters.");
    }
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="p-4 lg:p-6 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>Ready to Ship</h2>
          <p className="text-slate-500 text-sm mt-1">
            Perform physical label checks and execute handover confirmations for courier riders.
          </p>
        </div>
      </div>

      {/* ── COURIER METRIC DENSITY SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
        {["PostEx", "Trax", "TCS", "Leopards"].map((carrier) => (
          <div 
            key={carrier}
            onClick={() => setCourierFilter(prev => prev === carrier ? "" : carrier)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              courierFilter === carrier 
                ? "bg-amber-400/10 border-amber-400 text-amber-400 shadow-lg shadow-amber-400/5" 
                : "bg-[#13151f] border-white/[0.06] hover:border-white/[0.12] text-slate-400"
            }`}
          >
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{carrier}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-white">{courierMetrics[carrier]}</span>
              <span className="text-xs text-slate-500">parcels</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── HIGH-VOLUME SCAN-TO-SHIP BARCODE GATE ── */}
      <form onSubmit={handleBarcodeScanSubmit} className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold whitespace-nowrap">
          <Barcode size={20} className="text-amber-400 animate-pulse" />
          <span>Scan-to-Ship Terminal:</span>
        </div>
        
        <div className="relative flex-1 w-full">
          <input
            ref={scanInputRef}
            type="text"
            placeholder="Scan product barcode airway bill sequence data... (Order number or Tracking ID)"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            className="w-full pl-4 pr-12 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-md transition-colors">
            Process
          </button>
        </div>

        {/* Scan Status Response Toast Segment */}
        {scanStatus.message && (
          <div className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-2 max-w-sm ${
            scanStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
            scanStatus.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
            "bg-white/[0.04] border-white/[0.08] text-slate-300"
          }`}>
            <span>{scanStatus.message}</span>
          </div>
        )}
      </form>

      {/* ── SEARCH & TABLE FILTER CONTROL ACTION BAR ── */}
      <div className="relative flex-shrink-0 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Filter data parameters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-[#13151f] border border-white/[0.08] text-white focus:outline-none focus:border-amber-400/50 transition-colors"
        />
      </div>

      {/* ── BULK ACTION CONTROL STICK PANEL ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-400/5 border border-amber-400/20 flex-shrink-0 animate-in fade-in zoom-in-95 duration-150">
          <span className="text-xs font-semibold text-amber-400">{selected.size} Handover Items Marked</span>
          <div className="w-px h-4 bg-white/10" />
          <button onClick={handleBulkHandover} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-lg transition-colors shadow-md">
            <Check size={12} /> Complete Bulk Rider Handover
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-medium rounded-lg hover:bg-white/[0.08] transition-colors">
            <Printer size={12} /> Compile Airway Labels
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"><X size={14} /></button>
        </div>
      )}

      {/* ── MAIN LEDGER REGISTRY TABLE ── */}
      <div className="flex-1 bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead className="sticky top-0 bg-[#13151f] z-10 border-b border-white/[0.06]">
              <tr>
                <th className="pl-5 pr-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && orders.every(o => selected.has(o.orderNumber))}
                    onChange={e => setSelected(e.target.checked ? new Set(orders.map(o => o.orderNumber)) : new Set())}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Logistics Routing</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Carrier Service</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Recipient Meta</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Collect Balance</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Label Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500 text-sm">
                    <Loader2 className="animate-spin mx-auto text-amber-400 mb-2" size={24} />
                    Validating operational parcel structures...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    <CheckCircle2 size={34} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-semibold text-white">Fulfillment bay empty</p>
                    <p className="text-xs mt-1">No pending uncollected courier bookings detected matching filters.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isChecked = selected.has(order.orderNumber);
                  return (
                    <tr key={order._id} className={`hover:bg-white/[0.015] transition-colors ${isChecked ? "bg-amber-400/[0.03]" : ""}`}>
                      <td className="pl-5 pr-2 py-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => setSelected(s => { const n = new Set(s); e.target.checked ? n.add(order.orderNumber) : n.delete(order.orderNumber); return n; })}
                          className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-bold text-slate-300">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-200">
                        <div className="flex items-center gap-1.5 group">
                          <span>{order.trackingNumber || "No tracking"}</span>
                          {order.trackingNumber && (
                            <button onClick={() => navigator.clipboard.writeText(order.trackingNumber)} className="text-slate-600 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
                              <Copy size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                          {order.courier || "Manual Processing"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-slate-300">{order.shippingAddress?.fullName}</p>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={10} />{order.shippingAddress?.city}</span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-white whitespace-nowrap">
                        Rs {order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.07] text-slate-400 hover:text-amber-400 hover:bg-white/[0.07] transition-all">
                          <Printer size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS PANEL ── */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0 bg-[#0d0f1a]">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} ready items
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-slate-300">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-1.5 rounded-md bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}