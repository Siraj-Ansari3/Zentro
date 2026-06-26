import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Download, Upload, Plus, ChevronDown, ChevronLeft, ChevronRight,
  X, MoreHorizontal, Eye, Edit3, UserCheck, Truck, Printer, GitBranch,
  Trash2, XCircle, RefreshCcw, AlertTriangle, ArrowUpDown, Inbox, Copy,
  Phone, Mail, MapPin, TrendingDown, MessageSquare, StickyNote, BadgeAlert,
  PackagePlus, Loader2, CheckCircle2,
} from "lucide-react";

// -------------Badges----------------
import StatusBadge from "../../components/Badges/StatusBadge";
import PayBadge  from "../../components/Badges/PayBadge";
import RiskBadge  from "../../components/Badges/RiskBadge";

// ----------------Modals----------------
import CreateOrderModal from "../../components/modals/CreateOrderModal";
import OrderDrawer from "../../components/modals/OrderDrawerModal";
import AssignCourierModal from "../../components/modals/AssignCourierModal";

import api from "../../api/axios"; 
import { useStore } from "../../context/StoreContext";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const COURIERS = ["Leopards", "TCS", "Trax", "M&P", "PostEx"];

const STATUS_TABS = [
  { key: "all", label: "All", color: "slate" },
  { key: "Pending Verification", label: "Pending Verification", color: "yellow" },
  { key: "Packed", label: "Packing", color: "indigo" },
  { key: "Shipped", label: "In Transit", color: "blue" },
  { key: "Delivered", label: "Delivered", color: "emerald" },
  { key: "Failed Delivery", label: "Failed Deliveries", color: "red" },
  { key: "Returned", label: "Returns", color: "orange" },
];


// ─────────────────────────────────────────────────────────────
// ACTION DROPDOWN
// ─────────────────────────────────────────────────────────────
function ActionDropdown({ order, onView, onAssignCourier }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const actions = [
    { label: "View Order", icon: Eye, onClick: () => { onView(order); setOpen(false) } },
    { label: "Edit Order", icon: Edit3, onClick: () => setOpen(false) },
    {
      label: "Assign Courier", icon: Truck, onClick: async () => {
        setOpen(false);
        await onAssignCourier(order);
      }
    },
    { label: "Print Label", icon: Printer, onClick: () => setOpen(false) },
    { divider: true },
    { label: "Cancel Order", icon: XCircle, danger: true, onClick: () => setOpen(false) },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o) }} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"><MoreHorizontal size={14} /></button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1d2e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 z-50 py-1 overflow-hidden">
          {actions.map((a, i) => a.divider ? <div key={i} className="my-1 border-t border-white/[0.06]" /> : (
            <button key={a.label} onClick={a.onClick} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${a.danger ? "text-red-400 hover:bg-red-400/10" : "text-slate-300 hover:bg-white/[0.06]"}`}>
              <a.icon size={12} className="flex-shrink-0" />{a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TABLE ROW
// ─────────────────────────────────────────────────────────────
function TableRow({ order, selected, onSelect, onView, onAssignCourier }) {
  return (
    <tr onClick={() => onView(order)} className={`border-t border-white/[0.04] cursor-pointer transition-colors group ${selected ? "bg-amber-400/[0.05]" : "hover:bg-white/[0.025]"} ${order.risk === "high" ? "border-l-2 border-l-red-400/40" : ""}`}>
      <td className="pl-4 pr-2 py-3" onClick={e => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={e => onSelect(order.orderNumber, e.target.checked)} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer" />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-semibold text-slate-200">{order.orderNumber}</span>
          <button onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(order.orderNumber) }} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition-all"><Copy size={11} /></button>
        </div>
        <span className="text-[10px] text-slate-600">{order.createdAt}</span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{order.customer.name[0]}</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">{order.customer.name}</p>
            <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{order.customer.phone}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3"><span className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} className="text-slate-600" />{order.city}</span></td>
      <td className="px-3 py-3 text-center"><span className="text-xs font-semibold text-slate-300">{order.items}</span></td>
      <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs font-bold text-white">Rs {order.amount.toLocaleString()}</span></td>
      <td className="px-3 py-3"><PayBadge type={order.payment} /></td>
      <td className="px-3 py-3"><RiskBadge level={order.risk} /></td>
      <td className="px-3 py-3">{order.courier ? <span className="text-xs text-slate-300 font-medium">{order.courier}</span> : <span className="text-xs text-slate-600 italic">Unassigned</span>}</td>
     <td className="px-3 py-3">
  <StatusBadge 
    status={
      order.orderStatus === "Shipped" &&  (Date.now() - new Date(order.shippedAt).getTime() > 432000000)
        ? "Order Stuck" 
        : order.orderStatus
    } 
  />
</td>
      <td className="px-3 py-3" onClick={e => e.stopPropagation()}><ActionDropdown
        order={order}
        onView={onView}
        onAssignCourier={onAssignCourier}
      /></td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────
function Pagination({ page, total, perPage, onPage, onPerPage }) {
  const totalPages = Math.ceil(total / perPage);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>Rows per page:</span>
        <div className="relative">
          <select value={perPage} onChange={e => { onPerPage(Number(e.target.value)); onPage(1) }} className="appearance-none pl-2 pr-5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs focus:outline-none cursor-pointer">
            {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <span className="text-slate-600">{from}–{to} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /></button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = page <= 3 ? i + 1 : page - 2 + i;
          if (p < 1 || p > totalPages) return null;
          return <button key={p} onClick={() => onPage(p)} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-amber-400 text-black" : "text-slate-400 hover:text-white hover:bg-white/[0.06]"}`}>{p}</button>;
        })}
        <button onClick={() => onPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "id", label: "Order ID", sortable: true },
  { key: "customer", label: "Customer", sortable: false },
  { key: "city", label: "City", sortable: true },
  { key: "items", label: "Items", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "payment", label: "Payment", sortable: false },
  { key: "risk", label: "Risk", sortable: true },
  { key: "courier", label: "Courier", sortable: false },
  { key: "orderStatus", label: "Status", sortable: false },
  { key: "actions", label: "", sortable: false },
];




export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [sort, setSort] = useState({ key: "id", dir: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [drawerOrder, setDrawerOrder] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [assignCourierOrder, setAssignCourierOrder] = useState(null);

  const { activeStore } = useStore();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/order/get_all_orders", {
        params: {
          storeId: activeStore?.storeId,
        }
      });

      const fetchedOrders = response?.data?.orders || [];
      
      // transform backend data into frontend table shape
      const formattedOrders = fetchedOrders.map((order) => ({
        orderNumber: order.orderNumber,

        customer: {
          name: order?.shippingAddress?.fullName || "Unknown Customer",
          phone: order?.shippingAddress?.phone || "N/A",
          email: order?.shippingAddress?.email || "",
        },

        city: order.shippingAddress?.city || "Unknown",

        items: order.items?.length || 0,

        amount: order.totalAmount || 0,

        payment:
          order.paymentMethod?.toUpperCase() === "COD"
            ? "COD"
            : "PREPAID",

        risk: order.customerId?.riskLevel || "unknown",

        courier: order?.courierId?.name || null,

        shippedAt: order.shippedAt || null,

        orderStatus: (() => {
          switch (order.status) {
            case "new":
              return "New";

            case "verified":
              return "Verified";

            case "packed":
              return "Packed";

            case "assigned":
              return "Assigned to Courier";

            case "shipped":
              return "Shipped";

            case "in_transit":
              return "Shipped";

            case "delivered":
              return "Delivered";

            case "failed_delivery":
              return "Failed Delivery";

            case "returned":
              return "Returned";

            case "cancelled":
              return "Cancelled";

            default:
              return "New";
          }
        })(),

        createdAt: new Date(order.createdAt).toLocaleDateString(),

        trackingId: order.trackingNumber || null,

        raw: order,
      }));

      setOrders(formattedOrders);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message || "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };



  // Place this inside your AllOrders component, right below fetchOrders
  const handleUpdateOrderStatus = async (orderNumber, newStatus, statusChangeReason = "") => {
    try {
      await api.put(`/order/update_status`, {
        storeId: activeStore?.storeId, // storeId passed cleanly in the body
        orderNumber,
        status: newStatus,
        statusChangeReason, // optional reason for status change, useful for audit logs and debugging
      });

      // Refresh data so the status change populates across tabs
      await fetchOrders();

      // Smooth UI synchronization: if the active record is open in the drawer, keep it in sync
      setDrawerOrder(prev => prev && prev.orderNumber === orderNumber ? {
        ...prev,
        orderStatus: newStatus === "packed" ? "Packed" : newStatus === "new" ? "New" : newStatus === "verified" ? "Verified" : newStatus === "assigned" ? "Assigned" : newStatus === "cancelled" ? "Cancelled" : newStatus === "shipped" ? "Shipped" : newStatus === "in_transit" ? "In Transit" : newStatus === "delivered" ? "Delivered" : "New" // Map backend status to frontend status
      } : prev);

    } catch (err) {
      console.error("Failed to alter order pipeline state:", err);
      alert(err?.response?.data?.message || "Failed to update order status");
    }
  };

  const assignCourier = (order) => {
    setAssignCourierOrder(order);
  };


  useEffect(() => {
    if (activeStore?.storeId) {
      fetchOrders();
    }
  }, [activeStore]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (activeTab !== "all" && o.orderStatus !== activeTab) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.orderNumber.toLowerCase().includes(q) &&
          !o.customer.name.toLowerCase().includes(q) &&
          !o.customer.phone.includes(q)) return false;
      }
      return true;
    });
  }, [orders, activeTab, search]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let av = a[sort.key], bv = b[sort.key];
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    return sort.dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  }), [filtered, sort]);

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const counts = useMemo(() => {
    const c = { all: orders.length };
    STATUS_TABS.forEach(({ key }) => { if (key !== "all") c[key] = orders.filter(o => o.orderStatus === key).length });
    return c;
  }, [orders]);

  const colorMap = { slate: "border-slate-400 text-slate-300 bg-slate-400/10", yellow: "border-yellow-400 text-yellow-400 bg-yellow-400/10", indigo: "border-indigo-400 text-indigo-400 bg-indigo-400/10", cyan: "border-cyan-400 text-cyan-400 bg-cyan-400/10", blue: "border-blue-400 text-blue-400 bg-blue-400/10", emerald: "border-emerald-400 text-emerald-400 bg-emerald-400/10", red: "border-red-400 text-red-400 bg-red-400/10", orange: "border-orange-400 text-orange-400 bg-orange-400/10" };

  return (
    <div className="min-h-full p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>All Orders</h1>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 text-xs font-semibold border border-white/[0.08]">{orders.length.toLocaleString()}</span>
          </div>
          <p className="text-sm text-slate-500">Manage, verify, and track all customer orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
          >
            <Plus size={13} /> Add Order
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Order ID, customer name or phone…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors max-w-md"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-4">
        {STATUS_TABS.map(({ key, label, color }) => {
          const isActive = activeTab === key;
          const count = counts[key] ?? 0;
          return (
            <button key={key} onClick={() => { setActiveTab(key); setPage(1); setSelected(new Set()) }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 border ${isActive ? colorMap[color] : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"}`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? "bg-white/20 text-current" : "bg-white/[0.05] text-slate-600"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-3 rounded-xl bg-amber-400/5 border border-amber-400/20 flex-wrap">
          <span className="text-xs font-semibold text-amber-400">{selected.size} selected</span>
          <div className="w-px h-4 bg-white/10" />
          {[{ label: "Export", icon: Download }, { label: "Delete", icon: Trash2, danger: true }].map(({ label, icon: Icon, danger }) => (
            <button key={label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${danger ? "text-red-400 border-red-400/20 bg-red-400/5 hover:bg-red-400/10" : "text-slate-300 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]"}`}>
              <Icon size={12} />{label}
            </button>
          ))}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pl-4 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every(o => selected.has(o.orderNumber))}
                    onChange={e =>
                      setSelected(
                        e.target.checked
                          ? new Set(paginated.map(o => o.orderNumber))
                          : new Set()
                      )
                    }
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
                  />
                </th>
                {COLUMNS.map(({ key, label, sortable }) => (
                  <th
                    key={key}
                    onClick={() =>
                      sortable &&
                      setSort(s => ({
                        key,
                        dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
                      }))
                    }
                    className={`px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${sortable ? "cursor-pointer hover:text-slate-300 select-none" : ""
                      }`}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {sortable && (
                        <ArrowUpDown
                          size={10}
                          className={sort.key === key ? "text-amber-400" : "text-slate-700"}
                        />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12}>
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 size={30} className="animate-spin text-amber-400 mb-3" />
                      <p className="text-sm text-slate-400">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12}>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <AlertTriangle size={30} className="text-red-400 mb-3" />
                      <h3 className="text-base font-bold text-white mb-1">
                        Failed to load orders
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">{error}</p>
                      <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"
                      >
                        <RefreshCcw size={14} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={12}>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                        <Inbox size={28} className="text-slate-600" />
                      </div>
                      <h3
                        className="text-base font-bold text-white mb-1"
                        style={{ fontFamily: "'Syne',sans-serif" }}
                      >
                        No orders found
                      </h3>
                      <p className="text-sm text-slate-600 mb-5">
                        Try adjusting your search or filters.
                      </p>
                      <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"
                      >
                        <Plus size={14} />
                        Add Order
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(order => (
                  <TableRow
                    key={order.orderNumber}
                    order={order}
                    selected={selected.has(order.orderNumber)}
                    onSelect={(orderNumber, checked) => {
                      const n = new Set(selected);
                      checked ? n.add(orderNumber) : n.delete(orderNumber);
                      setSelected(n);
                    }}
                    onView={setDrawerOrder}
                    onAssignCourier={assignCourier}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          total={filtered.length}
          perPage={perPage}
          onPage={setPage}
          onPerPage={setPerPage}
        />
      </div>


      {/* Modals */}
      <OrderDrawer
        order={drawerOrder}
        onClose={() => setDrawerOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onAssignCourier={assignCourier}
      />

      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            fetchOrders();
            setShowCreate(false);
          }}
        />
      )}

      {assignCourierOrder && (
        <AssignCourierModal
          order={assignCourierOrder}
          onClose={() => setAssignCourierOrder(null)}
          onAssigned={(msg) => { alert(msg); fetchOrders(); }}
        />
      )}
    </div>
  );
}