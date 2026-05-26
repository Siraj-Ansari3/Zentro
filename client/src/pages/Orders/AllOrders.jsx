import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, SlidersHorizontal, Calendar, Download, Upload, Plus,
  ChevronDown, ChevronLeft, ChevronRight, X, MoreHorizontal,
  Eye, Edit3, UserCheck, Truck, Printer, GitBranch, Trash2,
  Package, CheckCircle2, XCircle, Clock, RefreshCcw, AlertTriangle,
  ArrowUpDown, Filter, Inbox, Copy, Phone, Mail, MapPin,
  TrendingUp, TrendingDown, MessageSquare, StickyNote, Shield,
  ChevronUp, Zap, RotateCcw, SendHorizonal, BadgeAlert, Layers,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const COURIERS = ["Leopards", "TCS", "Trax", "M&P", "PostEx"];
const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Quetta", "Multan"];

const MOCK_ORDERS = [
  { id: "ORD-7821", customer: { name: "Aisha Malik",    phone: "0300-1234567", email: "aisha@gmail.com"   }, city: "Karachi",     items: 2, amount: 3400,  payment: "COD",     risk: "high",   courier: "Leopards", shipStatus: "In Transit",      orderStatus: "Shipped",              createdAt: "2024-01-22", staff: "Raza K.",   trackingId: "LP-88291" },
  { id: "ORD-7820", customer: { name: "Bilal Raza",     phone: "0321-9876543", email: "bilal@yahoo.com"   }, city: "Lahore",      items: 1, amount: 1200,  payment: "COD",     risk: "medium", courier: "TCS",      shipStatus: "Pending",         orderStatus: "Pending Verification", createdAt: "2024-01-22", staff: "Sara M.",   trackingId: null       },
  { id: "ORD-7819", customer: { name: "Fatima Noor",    phone: "0333-5551234", email: "fatima@mail.com"   }, city: "Islamabad",   items: 4, amount: 8750,  payment: "Prepaid", risk: "low",    courier: "Trax",     shipStatus: "Out for Delivery",orderStatus: "Shipped",              createdAt: "2024-01-21", staff: "Omar T.",   trackingId: "TX-44120" },
  { id: "ORD-7818", customer: { name: "Hassan Sheikh",  phone: "0311-7778899", email: "hassan@live.com"   }, city: "Rawalpindi",  items: 3, amount: 5100,  payment: "COD",     risk: "high",   courier: "M&P",      shipStatus: "Failed",          orderStatus: "Failed Delivery",      createdAt: "2024-01-21", staff: "Raza K.",   trackingId: "MP-33901" },
  { id: "ORD-7817", customer: { name: "Sana Tariq",     phone: "0345-2223344", email: "sana@gmail.com"    }, city: "Faisalabad",  items: 1, amount: 950,   payment: "COD",     risk: "low",    courier: "Leopards", shipStatus: "Delivered",        orderStatus: "Delivered",            createdAt: "2024-01-20", staff: "Nadia F.",  trackingId: "LP-77003" },
  { id: "ORD-7816", customer: { name: "Umar Farooq",    phone: "0312-4445566", email: "umar@hotmail.com"  }, city: "Karachi",     items: 6, amount: 12400, payment: "Prepaid", risk: "low",    courier: "TCS",      shipStatus: "Picked Up",       orderStatus: "Packed",               createdAt: "2024-01-20", staff: "Omar T.",   trackingId: "TC-22841" },
  { id: "ORD-7815", customer: { name: "Zara Hussain",   phone: "0322-6667788", email: "zara@gmail.com"    }, city: "Peshawar",    items: 2, amount: 2300,  payment: "COD",     risk: "medium", courier: "PostEx",   shipStatus: "In Transit",      orderStatus: "Shipped",              createdAt: "2024-01-19", staff: "Sara M.",   trackingId: "PX-19203" },
  { id: "ORD-7814", customer: { name: "Kamran Ali",     phone: "0301-8889900", email: "kamran@mail.com"   }, city: "Multan",      items: 3, amount: 4700,  payment: "COD",     risk: "high",   courier: null,       shipStatus: "Pending",         orderStatus: "Pending Verification", createdAt: "2024-01-19", staff: null,        trackingId: null       },
  { id: "ORD-7813", customer: { name: "Mehwish Qureshi",phone: "0331-1112233", email: "mehwish@gmail.com" }, city: "Lahore",      items: 1, amount: 1800,  payment: "Prepaid", risk: "low",    courier: "Trax",     shipStatus: "Delivered",        orderStatus: "Delivered",            createdAt: "2024-01-18", staff: "Nadia F.",  trackingId: "TX-55602" },
  { id: "ORD-7812", customer: { name: "Adnan Baig",     phone: "0343-3334455", email: "adnan@yahoo.com"   }, city: "Quetta",      items: 5, amount: 7200,  payment: "COD",     risk: "medium", courier: "M&P",      shipStatus: "Returned",        orderStatus: "Returned",             createdAt: "2024-01-18", staff: "Raza K.",   trackingId: "MP-10988" },
  { id: "ORD-7811", customer: { name: "Nadia Iqbal",    phone: "0315-5556677", email: "nadia@mail.com"    }, city: "Karachi",     items: 2, amount: 3100,  payment: "COD",     risk: "low",    courier: "Leopards", shipStatus: "In Transit",      orderStatus: "Shipped",              createdAt: "2024-01-17", staff: "Omar T.",   trackingId: "LP-66712" },
  { id: "ORD-7810", customer: { name: "Tariq Mehmood",  phone: "0303-7778899", email: "tariq@live.com"    }, city: "Islamabad",   items: 1, amount: 2200,  payment: "Prepaid", risk: "low",    courier: "TCS",      shipStatus: "Pending",         orderStatus: "Packed",               createdAt: "2024-01-17", staff: "Sara M.",   trackingId: null       },
  { id: "ORD-7809", customer: { name: "Rabia Zahoor",   phone: "0324-9990011", email: "rabia@gmail.com"   }, city: "Lahore",      items: 3, amount: 5900,  payment: "COD",     risk: "high",   courier: "PostEx",   shipStatus: "Failed",          orderStatus: "Failed Delivery",      createdAt: "2024-01-16", staff: "Raza K.",   trackingId: "PX-38872" },
  { id: "ORD-7808", customer: { name: "Imran Khan",     phone: "0336-2223344", email: "imran@mail.com"    }, city: "Rawalpindi",  items: 2, amount: 4100,  payment: "COD",     risk: "medium", courier: "Trax",     shipStatus: "Out for Delivery",orderStatus: "Shipped",              createdAt: "2024-01-16", staff: "Nadia F.",  trackingId: "TX-91003" },
  { id: "ORD-7807", customer: { name: "Sobia Anwar",    phone: "0317-4445566", email: "sobia@hotmail.com" }, city: "Faisalabad",  items: 4, amount: 6800,  payment: "COD",     risk: "low",    courier: "Leopards", shipStatus: "Delivered",        orderStatus: "Delivered",            createdAt: "2024-01-15", staff: "Omar T.",   trackingId: "LP-22044" },
];

const STATUS_TABS = [
  { key: "all",                 label: "All",                 color: "slate"   },
  { key: "Pending Verification",label: "Pending Verification",color: "yellow"  },
  { key: "Packed",              label: "Packing",             color: "indigo"  },
  { key: "Ready To Ship",       label: "Ready To Ship",       color: "cyan"    },
  { key: "Shipped",             label: "In Transit",          color: "blue"    },
  { key: "Delivered",           label: "Delivered",           color: "emerald" },
  { key: "Failed Delivery",     label: "Failed Deliveries",   color: "red"     },
  { key: "Returned",            label: "Returns",             color: "orange"  },
];

// ─────────────────────────────────────────────────────────────
// UTILITY / BADGE COMPONENTS
// ─────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const map = {
    low:    { cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: <TrendingDown size={10} />, label: "Low"    },
    medium: { cls: "bg-amber-400/10  text-amber-400  border-amber-400/20",    icon: <BadgeAlert   size={10} />, label: "Med"    },
    high:   { cls: "bg-red-400/10   text-red-400   border-red-400/20",        icon: <AlertTriangle size={10}/>, label: "High"   },
  };
  const r = map[level] || map.low;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${r.cls}`}>
      {r.icon}{r.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    "Pending Verification": "bg-yellow-400/10  text-yellow-400  border-yellow-400/20",
    "Packed":               "bg-indigo-400/10  text-indigo-400  border-indigo-400/20",
    "Ready To Ship":        "bg-cyan-400/10    text-cyan-400    border-cyan-400/20",
    "Shipped":              "bg-blue-400/10    text-blue-400    border-blue-400/20",
    "Delivered":            "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    "Failed Delivery":      "bg-red-400/10     text-red-400     border-red-400/20",
    "Returned":             "bg-orange-400/10  text-orange-400  border-orange-400/20",
    "Cancelled":            "bg-slate-400/10   text-slate-400   border-slate-400/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${map[status] || "bg-slate-400/10 text-slate-400 border-slate-400/20"}`}>
      {status}
    </span>
  );
}

function ShipBadge({ status }) {
  const map = {
    "Pending":          "text-slate-400  bg-slate-400/10  border-slate-400/20",
    "Picked Up":        "text-blue-400   bg-blue-400/10   border-blue-400/20",
    "In Transit":       "text-cyan-400   bg-cyan-400/10   border-cyan-400/20",
    "Out for Delivery": "text-violet-400 bg-violet-400/10 border-violet-400/20",
    "Delivered":        "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    "Failed":           "text-red-400    bg-red-400/10    border-red-400/20",
    "Returned":         "text-orange-400 bg-orange-400/10 border-orange-400/20",
  };
  const dot = {
    "Pending": "bg-slate-400", "Picked Up": "bg-blue-400", "In Transit": "bg-cyan-400",
    "Out for Delivery": "bg-violet-400", "Delivered": "bg-emerald-400",
    "Failed": "bg-red-400", "Returned": "bg-orange-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${map[status] || "text-slate-400 bg-slate-400/10 border-slate-400/20"}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[status] || "bg-slate-400"} ${status === "In Transit" || status === "Out for Delivery" ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}

function PayBadge({ type }) {
  return type === "COD"
    ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-amber-400/10 text-amber-400 border-amber-400/20">COD</span>
    : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">PREPAID</span>;
}

// ─────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────
function PageHeader({ total }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            All Orders
          </h1>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 text-xs font-semibold border border-white/[0.08]">
            {total.toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-slate-500">Manage, verify, and track all customer orders from one place.</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
          <Upload size={13} /> Import CSV
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
          <Download size={13} /> Export
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20">
          <Plus size={13} /> Add Order
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FILTER BAR
// ─────────────────────────────────────────────────────────────
function FilterSelect({ label, options, value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-2 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.07] focus:outline-none focus:border-amber-400/40 cursor-pointer transition-colors"
      >
        <option value="">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}

function FilterBar({ filters, setFilters, onClear }) {
  const hasActive = Object.values(filters).some(Boolean);
  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Search row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, phone, tracking…"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors"
          />
        </div>
        {/* Date range stub */}
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors">
          <Calendar size={13} /> Date Range
        </button>
        {hasActive && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-400/5 border border-red-400/20 hover:bg-red-400/10 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={13} className="text-slate-600 flex-shrink-0" />
        <FilterSelect label="Status"      options={["Pending Verification","Packed","Shipped","Delivered","Returned","Cancelled"]} value={filters.status}  onChange={v => setFilters(f => ({ ...f, status: v }))} />
        <FilterSelect label="Courier"     options={COURIERS} value={filters.courier}   onChange={v => setFilters(f => ({ ...f, courier: v }))} />
        <FilterSelect label="Risk"        options={["low","medium","high"]}             value={filters.risk}    onChange={v => setFilters(f => ({ ...f, risk: v }))} />
        <FilterSelect label="Payment"     options={["COD","Prepaid"]}                  value={filters.payment} onChange={v => setFilters(f => ({ ...f, payment: v }))} />
        <FilterSelect label="City"        options={CITIES}                             value={filters.city}    onChange={v => setFilters(f => ({ ...f, city: v }))} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS TABS
// ─────────────────────────────────────────────────────────────
function StatusTabs({ activeTab, onChange, counts }) {
  const colorMap = {
    slate:   "border-slate-400   text-slate-300   bg-slate-400/10",
    yellow:  "border-yellow-400  text-yellow-400  bg-yellow-400/10",
    indigo:  "border-indigo-400  text-indigo-400  bg-indigo-400/10",
    cyan:    "border-cyan-400    text-cyan-400    bg-cyan-400/10",
    blue:    "border-blue-400    text-blue-400    bg-blue-400/10",
    emerald: "border-emerald-400 text-emerald-400 bg-emerald-400/10",
    red:     "border-red-400     text-red-400     bg-red-400/10",
    orange:  "border-orange-400  text-orange-400  bg-orange-400/10",
  };
  const inactiveCountMap = {
    slate:   "bg-slate-500/20   text-slate-500",
    yellow:  "bg-yellow-400/10  text-yellow-500",
    indigo:  "bg-indigo-400/10  text-indigo-500",
    cyan:    "bg-cyan-400/10    text-cyan-500",
    blue:    "bg-blue-400/10    text-blue-500",
    emerald: "bg-emerald-400/10 text-emerald-500",
    red:     "bg-red-400/10     text-red-500",
    orange:  "bg-orange-400/10  text-orange-500",
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
      {STATUS_TABS.map(({ key, label, color }) => {
        const isActive = activeTab === key;
        const count = counts[key] ?? 0;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 border
              ${isActive
                ? colorMap[color]
                : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
              }
            `}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? "bg-white/20 text-current" : inactiveCountMap[color]}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BULK ACTIONS BAR
// ─────────────────────────────────────────────────────────────
function BulkActionsBar({ count, onClear }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-3 rounded-xl bg-amber-400/5 border border-amber-400/20 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center">
          <span className="text-[10px] font-bold text-black">{count}</span>
        </div>
        <span className="text-xs font-semibold text-amber-400">orders selected</span>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { label: "Assign Courier", icon: Truck },
          { label: "Update Status",  icon: RefreshCcw },
          { label: "Export",         icon: Download },
          { label: "Verify",         icon: UserCheck },
          { label: "Print Labels",   icon: Printer },
          { label: "Delete",         icon: Trash2, danger: true },
        ].map(({ label, icon: Icon, danger }) => (
          <button
            key={label}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border
              ${danger
                ? "text-red-400 border-red-400/20 bg-red-400/5 hover:bg-red-400/10"
                : "text-slate-300 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]"
              }`}
          >
            <Icon size={12} />{label}
          </button>
        ))}
      </div>
      <button onClick={onClear} className="ml-auto text-slate-500 hover:text-slate-300 transition-colors p-1">
        <X size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ACTION DROPDOWN
// ─────────────────────────────────────────────────────────────
function ActionDropdown({ order, onView }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const actions = [
    { label: "View Order",      icon: Eye,       onClick: () => { onView(order); setOpen(false); } },
    { label: "Edit Order",      icon: Edit3,     onClick: () => setOpen(false) },
    { label: "Verify Customer", icon: UserCheck, onClick: () => setOpen(false) },
    { label: "Assign Courier",  icon: Truck,     onClick: () => setOpen(false) },
    { label: "Print Label",     icon: Printer,   onClick: () => setOpen(false) },
    { label: "View Timeline",   icon: GitBranch, onClick: () => setOpen(false) },
    { divider: true },
    { label: "Cancel Order",    icon: XCircle,   danger: true, onClick: () => setOpen(false) },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1d2e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 z-50 py-1 overflow-hidden">
          {actions.map((a, i) =>
            a.divider ? (
              <div key={i} className="my-1 border-t border-white/[0.06]" />
            ) : (
              <button
                key={a.label}
                onClick={a.onClick}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors
                  ${a.danger ? "text-red-400 hover:bg-red-400/10" : "text-slate-300 hover:bg-white/[0.06]"}`}
              >
                <a.icon size={12} className="flex-shrink-0" />
                {a.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-t border-white/[0.04]">
      {[12, 28, 20, 14, 10, 10, 14, 12, 16, 18, 16, 14, 14, 8].map((w, i) => (
        <td key={i} className="px-3 py-3.5">
          <div className={`h-3 rounded bg-white/[0.06] animate-pulse`} style={{ width: `${w * 4}px`, maxWidth: "100%" }} />
        </td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <tr>
      <td colSpan={14}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
            <Inbox size={28} className="text-slate-600" />
          </div>
          <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
            No orders found
          </h3>
          <p className="text-sm text-slate-600 mb-5">Try adjusting your search or filter criteria.</p>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors">
            <Plus size={14} /> Add Order
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// DESKTOP TABLE ROW
// ─────────────────────────────────────────────────────────────
function TableRow({ order, selected, onSelect, onView }) {
  const isHighRisk = order.risk === "high";
  return (
    <tr
      onClick={() => onView(order)}
      className={`border-t border-white/[0.04] cursor-pointer transition-colors group
        ${selected ? "bg-amber-400/[0.05]" : "hover:bg-white/[0.025]"}
        ${isHighRisk ? "border-l-2 border-l-red-400/40" : ""}
      `}
    >
      {/* Checkbox */}
      <td className="pl-4 pr-2 py-3" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox" checked={selected}
          onChange={e => onSelect(order.id, e.target.checked)}
          className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
        />
      </td>

      {/* Order ID */}
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-semibold text-slate-200">{order.id}</span>
          <button onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(order.id); }} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition-all">
            <Copy size={11} />
          </button>
        </div>
        <span className="text-[10px] text-slate-600">{order.createdAt}</span>
      </td>

      {/* Customer */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {order.customer.name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">{order.customer.name}</p>
            <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{order.customer.phone}</p>
          </div>
        </div>
      </td>

      {/* City */}
      <td className="px-3 py-3">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <MapPin size={10} className="text-slate-600" />{order.city}
        </span>
      </td>

      {/* Items */}
      <td className="px-3 py-3 text-center">
        <span className="text-xs font-semibold text-slate-300">{order.items}</span>
      </td>

      {/* Amount */}
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="text-xs font-bold text-white">Rs {order.amount.toLocaleString()}</span>
      </td>

      {/* Payment */}
      <td className="px-3 py-3"><PayBadge type={order.payment} /></td>

      {/* Risk */}
      <td className="px-3 py-3"><RiskBadge level={order.risk} /></td>

      {/* Courier */}
      <td className="px-3 py-3">
        {order.courier
          ? <span className="text-xs text-slate-300 font-medium">{order.courier}</span>
          : <span className="text-xs text-slate-600 italic">Unassigned</span>
        }
      </td>

      {/* Shipment Status */}
      <td className="px-3 py-3"><ShipBadge status={order.shipStatus} /></td>

      {/* Order Status */}
      <td className="px-3 py-3"><StatusBadge status={order.orderStatus} /></td>

      {/* Staff */}
      <td className="px-3 py-3">
        {order.staff
          ? <span className="text-xs text-slate-400">{order.staff}</span>
          : <span className="text-xs text-slate-600 italic">Unassigned</span>
        }
      </td>

      {/* Actions */}
      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
        <ActionDropdown order={order} onView={onView} />
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// MOBILE ORDER CARD
// ─────────────────────────────────────────────────────────────
function OrderCard({ order, onView }) {
  return (
    <div
      onClick={() => onView(order)}
      className={`bg-[#13151f] border rounded-xl p-4 cursor-pointer hover:border-white/10 transition-all
        ${order.risk === "high" ? "border-red-400/20" : "border-white/[0.06]"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {order.customer.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none mb-0.5">{order.customer.name}</p>
            <p className="text-[11px] text-slate-500">{order.customer.phone}</p>
          </div>
        </div>
        <ActionDropdown order={order} onView={onView} />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">{order.id}</span>
        <PayBadge type={order.payment} />
        <RiskBadge level={order.risk} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Amount</p>
          <p className="text-sm font-bold text-white">Rs {order.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Courier</p>
          <p className="text-xs text-slate-300 font-medium">{order.courier || <span className="text-slate-600 italic">Unassigned</span>}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">City</p>
          <p className="text-xs text-slate-400">{order.city}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Items</p>
          <p className="text-xs text-slate-400">{order.items} item{order.items > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-white/[0.05]">
        <ShipBadge status={order.shipStatus} />
        <StatusBadge status={order.orderStatus} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ORDER DRAWER
// ─────────────────────────────────────────────────────────────
const TIMELINE = [
  { event: "Order Placed",        time: "Jan 22, 10:14 AM", done: true  },
  { event: "Payment Confirmed",   time: "Jan 22, 10:15 AM", done: true  },
  { event: "Picked Up by Courier",time: "Jan 22, 02:30 PM", done: true  },
  { event: "In Transit",          time: "Jan 23, 09:00 AM", done: true  },
  { event: "Out for Delivery",    time: "Jan 24, 08:45 AM", done: false },
  { event: "Delivered",           time: "Pending",          done: false },
];

function OrderDrawer({ order, onClose }) {
  if (!order) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f1120] border-l border-white/[0.07] z-50 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-white font-mono">{order.id}</span>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="text-[11px] text-slate-500">{order.createdAt} · {order.items} item{order.items > 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Customer */}
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Customer Details</h3>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                  {order.customer.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{order.customer.name}</p>
                  <RiskBadge level={order.risk} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Phone size={12} className="text-slate-600" />{order.customer.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mail size={12} className="text-slate-600" />{order.customer.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin size={12} className="text-slate-600" />{order.city}, Pakistan
                </div>
              </div>
            </div>
          </section>

          {/* Order Summary */}
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Order Summary</h3>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
              {Array.from({ length: order.items }).map((_, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Product Item #{i + 1}</span>
                  <span className="text-slate-300 font-semibold">Rs {Math.floor(order.amount / order.items).toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Total</span>
                <span className="text-sm font-bold text-white">Rs {order.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Payment</span>
                <PayBadge type={order.payment} />
              </div>
            </div>
          </section>

          {/* Courier */}
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Courier Details</h3>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Courier</span>
                <span className="text-slate-300 font-semibold">{order.courier || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Tracking ID</span>
                <span className="text-slate-300 font-mono">{order.trackingId || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Shipment Status</span>
                <ShipBadge status={order.shipStatus} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Assigned Staff</span>
                <span className="text-slate-300">{order.staff || "—"}</span>
              </div>
            </div>
          </section>

          {/* Fraud Indicators */}
          {order.risk !== "low" && (
            <section>
              <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Fraud Indicators</h3>
              <div className={`border rounded-xl p-4 space-y-2 ${order.risk === "high" ? "bg-red-400/5 border-red-400/20" : "bg-amber-400/5 border-amber-400/20"}`}>
                {order.risk === "high" && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-red-400"><AlertTriangle size={11} /> Previous COD rejection detected</div>
                    <div className="flex items-center gap-2 text-xs text-red-400"><AlertTriangle size={11} /> Multiple failed deliveries on record</div>
                  </>
                )}
                {order.risk === "medium" && (
                  <div className="flex items-center gap-2 text-xs text-amber-400"><BadgeAlert size={11} /> Incomplete customer profile</div>
                )}
              </div>
            </section>
          )}

          {/* Timeline */}
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Order Timeline</h3>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.07]" />
              {TIMELINE.map(({ event, time, done }, i) => (
                <div key={i} className="relative flex items-start gap-3 mb-4">
                  <div className={`absolute -left-5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5
                    ${done ? "bg-amber-400 border-amber-400" : "bg-[#0f1120] border-white/20"}`}
                  />
                  <div>
                    <p className={`text-xs font-semibold ${done ? "text-slate-200" : "text-slate-600"}`}>{event}</p>
                    <p className="text-[10px] text-slate-600">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Notes */}
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Internal Notes</h3>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <textarea
                rows={3}
                placeholder="Add a note for this order…"
                className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] text-slate-600 flex items-center gap-1"><StickyNote size={10} /> Notes are private</span>
                <button className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">Save Note</button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center gap-2 flex-shrink-0">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors">
            <UserCheck size={13} /> Verify Customer
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 text-xs font-semibold hover:bg-white/[0.08] transition-colors">
            <Truck size={13} /> Assign Courier
          </button>
          <button className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors">
            <Printer size={14} />
          </button>
        </div>
      </div>
    </>
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.06] mt-1">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>Rows per page:</span>
        <div className="relative">
          <select
            value={perPage}
            onChange={e => { onPerPage(Number(e.target.value)); onPage(1); }}
            className="appearance-none pl-2 pr-5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs focus:outline-none cursor-pointer"
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <span className="text-slate-600">{from}–{to} of {total}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = page <= 3 ? i + 1 : page - 2 + i;
          if (p < 1 || p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                ${p === page ? "bg-amber-400 text-black" : "text-slate-400 hover:text-white hover:bg-white/[0.06]"}`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TABLE HEADER
// ─────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "id",          label: "Order ID",     sortable: true  },
  { key: "customer",    label: "Customer",     sortable: false },
  { key: "city",        label: "City",         sortable: true  },
  { key: "items",       label: "Items",        sortable: true  },
  { key: "amount",      label: "Amount",       sortable: true  },
  { key: "payment",     label: "Payment",      sortable: false },
  { key: "risk",        label: "Risk",         sortable: true  },
  { key: "courier",     label: "Courier",      sortable: false },
  { key: "shipStatus",  label: "Shipment",     sortable: false },
  { key: "orderStatus", label: "Order Status", sortable: false },
  { key: "staff",       label: "Staff",        sortable: false },
  { key: "actions",     label: "",             sortable: false },
];

function TableHead({ sort, onSort, allSelected, onSelectAll }) {
  return (
    <thead>
      <tr className="border-b border-white/[0.06]">
        <th className="pl-4 pr-2 py-3">
          <input
            type="checkbox" checked={allSelected}
            onChange={e => onSelectAll(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
          />
        </th>
        {COLUMNS.map(({ key, label, sortable }) => (
          <th
            key={key}
            onClick={() => sortable && onSort(key)}
            className={`px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
              ${sortable ? "cursor-pointer hover:text-slate-300 transition-colors select-none" : ""}`}
          >
            <span className="flex items-center gap-1">
              {label}
              {sortable && (
                <ArrowUpDown size={10} className={sort.key === key ? "text-amber-400" : "text-slate-700"} />
              )}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function AllOrders() {
  const [filters, setFilters] = useState({ search: "", status: "", courier: "", risk: "", payment: "", city: "" });
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [sort, setSort] = useState({ key: "id", dir: "desc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading] = useState(false);
  const [drawerOrder, setDrawerOrder] = useState(null);

  // Filter + tab logic
  const filtered = useMemo(() => {
    return MOCK_ORDERS.filter(o => {
      if (activeTab !== "all" && o.orderStatus !== activeTab) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!o.id.toLowerCase().includes(q) &&
            !o.customer.name.toLowerCase().includes(q) &&
            !o.customer.phone.includes(q) &&
            !o.customer.email.toLowerCase().includes(q) &&
            !(o.trackingId || "").toLowerCase().includes(q)) return false;
      }
      if (filters.status  && o.orderStatus !== filters.status) return false;
      if (filters.courier && o.courier !== filters.courier)    return false;
      if (filters.risk    && o.risk !== filters.risk)          return false;
      if (filters.payment && o.payment !== filters.payment)    return false;
      if (filters.city    && o.city !== filters.city)          return false;
      return true;
    });
  }, [filters, activeTab]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return sort.dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [filtered, sort]);

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  // Tab counts
  const counts = useMemo(() => {
    const c = { all: MOCK_ORDERS.length };
    STATUS_TABS.forEach(({ key }) => {
      if (key !== "all") c[key] = MOCK_ORDERS.filter(o => o.orderStatus === key).length;
    });
    return c;
  }, []);

  const handleSort = (key) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
  };

  const handleSelect = (id, checked) => {
    setSelected(s => { const n = new Set(s); checked ? n.add(id) : n.delete(id); return n; });
  };

  const handleSelectAll = (checked) => {
    setSelected(checked ? new Set(paginated.map(o => o.id)) : new Set());
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "", courier: "", risk: "", payment: "", city: "" });
    setActiveTab("all");
    setPage(1);
  };

  return (
    <div className="min-h-full p-4 lg:p-6">
      <PageHeader total={MOCK_ORDERS.length} />
      <FilterBar filters={filters} setFilters={(v) => { setFilters(v); setPage(1); }} onClear={clearFilters} />
      <StatusTabs activeTab={activeTab} onChange={(t) => { setActiveTab(t); setPage(1); setSelected(new Set()); }} counts={counts} />

      {selected.size > 0 && (
        <BulkActionsBar count={selected.size} onClear={() => setSelected(new Set())} />
      )}

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden lg:block bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <TableHead sort={sort} onSort={handleSort} allSelected={paginated.length > 0 && paginated.every(o => selected.has(o.id))} onSelectAll={handleSelectAll} />
            <tbody>
              {loading
                ? Array.from({ length: perPage }).map((_, i) => <SkeletonRow key={i} />)
                : paginated.length === 0
                  ? <EmptyState />
                  : paginated.map(order => (
                      <TableRow
                        key={order.id}
                        order={order}
                        selected={selected.has(order.id)}
                        onSelect={handleSelect}
                        onView={setDrawerOrder}
                      />
                    ))
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={perPage} onPage={setPage} onPerPage={setPerPage} />
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="lg:hidden space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#13151f] border border-white/[0.06] rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-white/[0.06] rounded w-32" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-24" />
                  </div>
                </div>
                <div className="h-2.5 bg-white/[0.04] rounded w-full mb-2" />
                <div className="h-2.5 bg-white/[0.04] rounded w-3/4" />
              </div>
            ))
          : paginated.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                    <Inbox size={28} className="text-slate-600" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>No orders found</h3>
                  <p className="text-sm text-slate-600 mb-5">Try adjusting your search or filters.</p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors">
                    <Plus size={14} /> Add Order
                  </button>
                </div>
              )
            : paginated.map(order => (
                <OrderCard key={order.id} order={order} onView={setDrawerOrder} />
              ))
        }
        {paginated.length > 0 && (
          <div className="bg-[#13151f] border border-white/[0.06] rounded-xl">
            <Pagination page={page} total={filtered.length} perPage={perPage} onPage={setPage} onPerPage={setPerPage} />
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      <OrderDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} />
    </div>
  );
}
