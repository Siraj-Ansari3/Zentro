import { useEffect, useState } from "react";
import {
  Search, Package, Check, ChevronLeft, ChevronRight, 
  Loader2, Box, CornerDownRight, CheckCircle2, 
  MapPin, Phone, Calendar, AlertCircle, ShoppingBag, X
} from "lucide-react";

import api from "../../api/axios";
import { useStore } from "../../context/StoreContext";
import { useMemo } from "react";

export default function PackingQueue() {
  const { activeStore } = useStore();

  // State Management
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Drawer & Checklist Verification State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search input for high-volume scanners
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Pending Packing Orders
  const fetchPendingPacking = async () => {
    if (!activeStore?.storeId) return;

    try {
      setLoading(true);
      const res = await api.get("/order/pending-packing", {
        params: {
          storeId: activeStore.storeId,
          search: debouncedSearch,
          page,
          limit,
        },
      });

      setOrders(res.data.data.orders || []);
      setTotalCount(res.data.data.pagination.total || 0);
    } catch (err) {
      console.error("Fulfillment engine fetch exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPacking();
  }, [activeStore, debouncedSearch, page]);

  // Open drawer and reset physical packaging checks map
  const handleOpenPackingDrawer = (order) => {
    setSelectedOrder(order);
    setCheckedItems({}); // Clear checklists for the fresh document line
  };

  // Toggle internal checklist items
  const toggleItemCheck = (itemIdx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemIdx]: !prev[itemIdx],
    }));
  };

  // Verify all line quantities have been marked off
  const isChecklistComplete = useMemo(() => {
    if (!selectedOrder?.items) return false;
    return selectedOrder.items.every((_, idx) => checkedItems[idx]);
  }, [selectedOrder, checkedItems]);

  // Execute Status Transition to "Packed"
  const handleMarkAsPacked = async (orderNumber) => {
    try {
      setActionLoading(true);

      // Connects directly to PUT /api/order/update_packing_status
      await api.put("/order/update_packing_status", {
        storeId: activeStore?.storeId, // storeId explicitly in the body
        orderNumber,
        packingStatus: "packed", // Moves the pipeline state forwards
      });

      // Clear from active visual arrays smoothly
      setOrders((prev) => prev.filter((o) => o.orderNumber !== orderNumber));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setSelectedOrder(null);

    } catch (err) {
      console.error("Status adjustment network failure:", err);
      alert(err?.response?.data?.message || "Failed to update item status.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="p-4 lg:p-6 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              Packing Queue
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-xs font-bold border border-amber-400/20">
              {totalCount} Awaiting Verification
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Scan or select verified invoices to confirm line quantities and seal packages.
          </p>
        </div>
      </div>

      {/* ── SEARCH FILTERS ── */}
      <div className="relative flex-shrink-0 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Scan sheet barcode or search order number/phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-[#13151f] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
        />
      </div>

      {/* ── QUEUE DATA TABLE ── */}
      <div className="flex-1 bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="sticky top-0 bg-[#13151f] z-10 border-b border-white/[0.06]">
              <tr>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Recipient Info</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Line Allocations</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">Items Count</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500 text-sm">
                    <Loader2 className="animate-spin mx-auto text-amber-400 mb-2" size={24} />
                    Processing fulfillment registry logs...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500">
                    <Box size={36} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-semibold text-white">Packing pipeline clear</p>
                    <p className="text-xs mt-1">No unboxed manifests matching current registry parameters.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => handleOpenPackingDrawer(order)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs font-bold text-slate-300 group-hover:text-amber-400 transition-colors">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-slate-200">{order.shippingAddress?.fullName}</p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={10} />{order.shippingAddress?.city}</span>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-xs text-slate-400 truncate">
                        {order.items?.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-white">
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenPackingDrawer(order)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all shadow-md"
                      >
                        Start Packing
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Navigation */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} lines
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

      {/* ── PACKING DRAWER AND CHECKLIST SYSTEM ── */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSelectedOrder(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f1120] border-l border-white/[0.07] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Packing Box Profile
                </h3>
                <p className="text-xs text-amber-400 font-mono mt-0.5">Manifest: #{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Verification Line Listing Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Recipient Details Block */}
              <section className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3.5 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
                  <ShoppingBag size={14} className="text-slate-500" /> Ship Target Parameters
                </div>
                <div className="flex items-center gap-2"><Phone size={12} /> {selectedOrder.shippingAddress?.phone}</div>
                <div className="flex items-start gap-2">
                  <MapPin size={12} className="mt-0.5 flex-shrink-0" /> 
                  <span>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</span>
                </div>
              </section>

              {/* Physical Matching Item List Grid */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={12} /> Package Item Checklist Verification
                </h4>
                
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => {
                    const isChecked = !!checkedItems[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleItemCheck(idx)}
                        className={`p-3 rounded-xl border flex items-start gap-3 select-none cursor-pointer transition-all ${
                          isChecked 
                            ? "bg-amber-400/[0.03] border-amber-400/30" 
                            : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                      >
                        {/* Custom Checkbox Node */}
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                          isChecked 
                            ? "bg-amber-400 border-amber-400 text-black" 
                            : "border-white/20 bg-white/5"
                        }`}>
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>

                        {/* Product Detail Metrics */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-tight ${isChecked ? "text-slate-500 line-through" : "text-slate-200"}`}>
                            {item.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-mono">
                            {item.sku && <span>SKU: {item.sku}</span>}
                            <span className="flex items-center text-slate-400 font-sans font-bold">
                              <CornerDownRight size={10} className="mr-0.5" /> Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Pipeline Final Sticky Gate Action */}
            <div className="px-5 py-4 border-t border-white/[0.06] bg-[#0d0f1a] p-4 flex flex-col gap-2">
              {!isChecklistComplete && (
                <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-500 font-medium mb-1">
                  <AlertCircle size={12} /> Confirm product items match quantities to unlock box confirmation
                </div>
              )}
              <button
                disabled={!isChecklistComplete || actionLoading}
                onClick={() => handleMarkAsPacked(selectedOrder.orderNumber)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 disabled:bg-white/[0.04] disabled:text-slate-600 disabled:border-transparent disabled:opacity-100 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-400/10"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isChecklistComplete ? (
                  <>
                    <CheckCircle2 size={14} /> Confirm Manifest Packed
                  </>
                ) : (
                  "Verification Required"
                )}
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}