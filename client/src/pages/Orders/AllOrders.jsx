import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Download, Upload, Plus, ChevronDown, ChevronLeft, ChevronRight,
  X, MoreHorizontal, Eye, Edit3, UserCheck, Truck, Printer, GitBranch,
  Trash2, XCircle, RefreshCcw, AlertTriangle, ArrowUpDown, Inbox, Copy,
  Phone, Mail, MapPin, TrendingDown, MessageSquare, StickyNote, BadgeAlert,
  PackagePlus, Loader2, CheckCircle2,
} from "lucide-react";
import api from "../../api/axios"; // adjust path as needed
import { useStore } from "../../context/StoreContext";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const COURIERS = ["Leopards", "TCS", "Trax", "M&P", "PostEx"];
const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Quetta", "Multan"];



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
// SMALL BADGES
// ─────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const m = { low: { cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: <TrendingDown size={10} />, label: "Low" }, medium: { cls: "bg-amber-400/10 text-amber-400 border-amber-400/20", icon: <BadgeAlert size={10} />, label: "Med" }, high: { cls: "bg-red-400/10 text-red-400 border-red-400/20", icon: <AlertTriangle size={10} />, label: "High" } };
  const r = m[level] || m.low;
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${r.cls}`}>{r.icon}{r.label}</span>;
}

function StatusBadge({ status }) {
  const m = { "Pending Verification": "bg-yellow-400/10 text-yellow-400 border-yellow-400/20", "Packed": "bg-indigo-400/10 text-indigo-400 border-indigo-400/20", "Shipped": "bg-blue-400/10 text-blue-400 border-blue-400/20", "Delivered": "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", "Failed Delivery": "bg-red-400/10 text-red-400 border-red-400/20", "Returned": "bg-orange-400/10 text-orange-400 border-orange-400/20" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${m[status] || "bg-slate-400/10 text-slate-400 border-slate-400/20"}`}>{status}</span>;
}

function ShipBadge({ status }) {
  const m = { "Pending": "text-slate-400 bg-slate-400/10 border-slate-400/20", "Picked Up": "text-blue-400 bg-blue-400/10 border-blue-400/20", "In Transit": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", "Out for Delivery": "text-violet-400 bg-violet-400/10 border-violet-400/20", "Delivered": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", "Failed": "text-red-400 bg-red-400/10 border-red-400/20", "Returned": "text-orange-400 bg-orange-400/10 border-orange-400/20" };
  const dot = { "Pending": "bg-slate-400", "Picked Up": "bg-blue-400", "In Transit": "bg-cyan-400", "Out for Delivery": "bg-violet-400", "Delivered": "bg-emerald-400", "Failed": "bg-red-400", "Returned": "bg-orange-400" };
  return <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${m[status] || "text-slate-400 bg-slate-400/10 border-slate-400/20"}`}><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[status] || "bg-slate-400"} ${status === "In Transit" || status === "Out for Delivery" ? "animate-pulse" : ""}`} />{status}</span>;
}

function PayBadge({ type }) {
  return type === "COD"
    ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-amber-400/10 text-amber-400 border-amber-400/20">COD</span>
    : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">PREPAID</span>;
}

// ─────────────────────────────────────────────────────────────
// CREATE ORDER MODAL
// ─────────────────────────────────────────────────────────────
const EMPTY_ITEM = { name: "", sku: "", quantity: 1, price: 0, productId: "" };
const EMPTY_FORM = {
  customerId: "", customerName: "", customerPhone: "",
  address: "", city: "", area: "", postalCode: "",
  paymentMethod: "COD", deliveryCharges: 0, notes: "",
  items: [{ ...EMPTY_ITEM }],
};

function FormField({ label, required, children, error }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-amber-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition-colors ${className}`}
    />
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none pl-3 pr-7 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-200 focus:outline-none focus:border-amber-400/50 cursor-pointer transition-colors ${className}`}
      >
        {children}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}

function CreateOrderModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { activeStore } = useStore()

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const setItem = (i, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const subtotal = form.items.reduce((a, it) => a + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const total = subtotal + (Number(form.deliveryCharges) || 0);

  const validate = () => {
    const e = {};
    // if (!form.customerId.trim()) e.customerId = "Customer ID is required";
    if (!form.customerName.trim()) e.customerName = "Customer name is required";
    if (!form.customerPhone.trim()) e.customerPhone = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city) e.city = "City is required";
    form.items.forEach((it, i) => {
      if (!it.name.trim()) e[`item_${i}_name`] = "Name required";
      if (!it.quantity || it.quantity < 1) e[`item_${i}_qty`] = "Min 1";
      if (!it.price || it.price < 0) e[`item_${i}_price`] = "Invalid";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/order", {
        storeId: activeStore.storeId,
        customerId: form.customerId,
        customer: { name: form.customerName, phone: form.customerPhone },
        address: form.address,
        city: form.city,
        area: form.area,
        postalCode: form.postalCode,
        paymentMethod: form.paymentMethod,
        deliveryCharges: Number(form.deliveryCharges) || 0,
        notes: form.notes ? [form.notes] : [],
        items: form.items.map(it => ({
          productId: it.productId || null,
          name: it.name,
          sku: it.sku,
          quantity: Number(it.quantity),
          price: Number(it.price),
        })),
      });
      setSuccess(true);
      setTimeout(() => { onCreated?.(); onClose(); }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create order";
      setErrors(e => ({ ...e, _server: msg }));
    } finally {
      setLoading(false);
    }
  };

  // prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0f1120] border border-white/[0.08] rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl shadow-black/80">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <PackagePlus size={15} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>New Order</h2>
                <p className="text-[11px] text-slate-500">Fill in the details below to create an order</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {errors._server && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20 text-xs text-red-400">
                <AlertTriangle size={13} />{errors._server}
              </div>
            )}

            {/* Customer */}
            <section>
              <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-4 h-px bg-white/10" />Customer Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* CustomerId */}
                {/* <FormField label="Customer ID" required error={errors.customerId}>
                  <Input
                    placeholder="ObjectId from DB"
                    value={form.customerId}
                    onChange={e => set("customerId", e.target.value)}
                  />
                </FormField> */}
                <FormField label="Full Name" required error={errors.customerName}>
                  <Input
                    placeholder="e.g. Aisha Malik"
                    value={form.customerName}
                    onChange={e => set("customerName", e.target.value)}
                  />
                </FormField>
                <FormField label="Phone" required error={errors.customerPhone}>
                  <Input
                    placeholder="03XX-XXXXXXX"
                    value={form.customerPhone}
                    onChange={e => set("customerPhone", e.target.value)}
                  />
                </FormField>
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-4 h-px bg-white/10" />Shipping Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <FormField label="Street Address" required error={errors.address}>
                    <Input
                      placeholder="House #, Street, Block…"
                      value={form.address}
                      onChange={e => set("address", e.target.value)}
                    />
                  </FormField>
                </div>
                <FormField label="City" required error={errors.city}>
                  <Select value={form.city} onChange={e => set("city", e.target.value)}>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormField>
                <FormField label="Area / Sector">
                  <Input placeholder="e.g. DHA Phase 6" value={form.area} onChange={e => set("area", e.target.value)} />
                </FormField>
                <FormField label="Postal Code">
                  <Input placeholder="e.g. 75500" value={form.postalCode} onChange={e => set("postalCode", e.target.value)} />
                </FormField>
              </div>
            </section>

            {/* Items */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4 h-px bg-white/10" />Order Items
                </h3>
                <button onClick={addItem} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-amber-400 border border-amber-400/20 bg-amber-400/5 hover:bg-amber-400/10 transition-colors">
                  <Plus size={11} /> Add Item
                </button>
              </div>

              <div className="space-y-2">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_80px_80px_90px_32px] gap-2 px-1">
                  {["Product Name", "SKU", "Qty", "Price (Rs)", ""].map((h, i) => (
                    <span key={i} className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{h}</span>
                  ))}
                </div>

                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_80px_90px_32px] gap-2 items-start">
                    <div>
                      <Input
                        placeholder="Product name"
                        value={item.name}
                        onChange={e => setItem(i, "name", e.target.value)}
                        className={errors[`item_${i}_name`] ? "border-red-400/40" : ""}
                      />
                      {errors[`item_${i}_name`] && <p className="text-[10px] text-red-400 mt-0.5">{errors[`item_${i}_name`]}</p>}
                    </div>
                    <Input placeholder="SKU" value={item.sku} onChange={e => setItem(i, "sku", e.target.value)} />
                    <div>
                      <Input
                        type="number" min={1} placeholder="1"
                        value={item.quantity}
                        onChange={e => setItem(i, "quantity", e.target.value)}
                        className={errors[`item_${i}_qty`] ? "border-red-400/40" : ""}
                      />
                    </div>
                    <div>
                      <Input
                        type="number" min={0} placeholder="0"
                        value={item.price}
                        onChange={e => setItem(i, "price", e.target.value)}
                        className={errors[`item_${i}_price`] ? "border-red-400/40" : ""}
                      />
                    </div>
                    <button
                      onClick={() => removeItem(i)}
                      disabled={form.items.length === 1}
                      className="mt-0.5 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment & Totals */}
            <section>
              <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-4 h-px bg-white/10" />Payment & Charges
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Payment Method">
                  <Select value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)}>
                    <option value="cod">Cash on Delivery</option>
                    <option value="prepaid">Prepaid</option>
                  </Select>
                </FormField>
                <FormField label="Delivery Charges (Rs)">
                  <Input
                    type="number" min={0} placeholder="0"
                    value={form.deliveryCharges}
                    onChange={e => set("deliveryCharges", e.target.value)}
                  />
                </FormField>
              </div>

              {/* Summary strip */}
              <div className="mt-3 flex items-center justify-end gap-6 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-center">
                  <p className="text-[10px] text-slate-600 mb-0.5">Subtotal</p>
                  <p className="text-xs font-semibold text-slate-300">Rs {subtotal.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-600 mb-0.5">Delivery</p>
                  <p className="text-xs font-semibold text-slate-300">Rs {(Number(form.deliveryCharges) || 0).toLocaleString()}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-slate-600 mb-0.5">Total</p>
                  <p className="text-sm font-bold text-white">Rs {total.toLocaleString()}</p>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section>
              <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-4 h-px bg-white/10" />Internal Note <span className="text-slate-700 normal-case">(optional)</span>
              </h3>
              <textarea
                rows={2}
                placeholder="Any special instructions or notes…"
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
              />
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] text-slate-600">
              {form.items.length} item{form.items.length !== 1 ? "s" : ""} · Rs {total.toLocaleString()} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || success}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-400/20"
              >
                {success
                  ? <><CheckCircle2 size={13} /> Created!</>
                  : loading
                    ? <><Loader2 size={13} className="animate-spin" /> Creating…</>
                    : <><PackagePlus size={13} /> Create Order</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ORDER DRAWER (detail panel)
// ─────────────────────────────────────────────────────────────
const TIMELINE = [
  { event: "Order Placed", time: "Jan 22, 10:14 AM", done: true },
  { event: "Payment Confirmed", time: "Jan 22, 10:15 AM", done: true },
  { event: "Picked Up by Courier", time: "Jan 22, 02:30 PM", done: true },
  { event: "In Transit", time: "Jan 23, 09:00 AM", done: true },
  { event: "Out for Delivery", time: "Jan 24, 08:45 AM", done: true },
  { event: "Delivered", time: "Pending", done: false },
];

function OrderDrawer({ order, onClose }) {
  if (!order) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f1120] border-l border-white/[0.07] z-50 flex flex-col overflow-hidden shadow-2xl">
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Customer Details</h3>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">{order.customer.name[0]}</div>
                <div><p className="text-sm font-semibold text-white">{order.customer.name}</p><RiskBadge level={order.risk} /></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400"><Phone size={12} className="text-slate-600" />{order.customer.phone}</div>
                {order.customer.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Mail size={12} className="text-slate-600" />{order.customer.email}</div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400"><MapPin size={12} className="text-slate-600" />{order.city}, Pakistan</div>
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Courier Details</h3>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Courier</span><span className="text-slate-300 font-semibold">{order.courier || "—"}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Tracking ID</span><span className="text-slate-300 font-mono">{order.trackingId || "—"}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Shipment Status</span><ShipBadge status={order.shipStatus} /></div>
              <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Assigned Staff</span><span className="text-slate-300">{order.staff || "—"}</span></div>
            </div>
          </section>
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Order Timeline</h3>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.07]" />
              {TIMELINE.map(({ event, time, done }, i) => (
                <div key={i} className="relative flex items-start gap-3 mb-4">
                  <div className={`absolute -left-5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 ${done ? "bg-amber-400 border-amber-400" : "bg-[#0f1120] border-white/20"}`} />
                  <div><p className={`text-xs font-semibold ${done ? "text-slate-200" : "text-slate-600"}`}>{event}</p><p className="text-[10px] text-slate-600">{time}</p></div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center gap-2 flex-shrink-0">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors"><UserCheck size={13} /> Verify Customer</button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 text-xs font-semibold hover:bg-white/[0.08] transition-colors"><Truck size={13} /> Assign Courier</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ACTION DROPDOWN
// ─────────────────────────────────────────────────────────────
function ActionDropdown({ order, onView, onAssignCourier }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  console.log(order)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const actions = [
    { label: "View Order", icon: Eye, onClick: () => { onView(order); setOpen(false) } },
    { label: "Edit Order", icon: Edit3, onClick: () => setOpen(false) },
    { label: "Assign Courier", icon: Truck, onClick: async () => { setOpen(false);
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
        <input type="checkbox" checked={selected} onChange={e => onSelect(order.id, e.target.checked)} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer" />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-semibold text-slate-200">{order.id}</span>
          <button onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(order.id) }} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition-all"><Copy size={11} /></button>
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
      <td className="px-3 py-3"><ShipBadge status={order.shipStatus} /></td>
      <td className="px-3 py-3"><StatusBadge status={order.orderStatus} /></td>
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
  { key: "shipStatus", label: "Shipment", sortable: false },
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

      console.log("Fetched orders:", fetchedOrders);
      // transform backend data into frontend table shape
      const formattedOrders = fetchedOrders.map((order) => ({
        id: order.orderNumber,

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

        courier: order.courierId?.name || null,

        shipStatus: (() => {
          switch (order.status) {
            case "pending_verification":
              return "Pending";

            case "packed":
              return "Picked Up";

            case "shipped":
            case "in_transit":
              return "In Transit";

            case "delivered":
              return "Delivered";

            case "failed_delivery":
              return "Failed";

            case "returned":
              return "Returned";

            default:
              return "Pending";
          }
        })(),

        orderStatus: (() => {
          switch (order.status) {
            case "pending_verification":
              return "Pending Verification";

            case "packed":
              return "Packed";

            case "shipped":
            case "in_transit":
              return "Shipped";

            case "delivered":
              return "Delivered";

            case "failed_delivery":
              return "Failed Delivery";

            case "returned":
              return "Returned";

            default:
              return "Pending Verification";
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


  const assignCourier = async (order) => {
    try {
      const response = await api.post("/order/assign_order", {
        courier: "PostEx",
        orderNumber: order.id,
        storeId: activeStore?.storeId
      });

      alert(
        response.data.message ||
        "Order assigned successfully"
      );

      fetchOrders(); // refresh table
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
        "Failed to assign courier"
      );
    }
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
        if (!o.id.toLowerCase().includes(q) &&
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
      {/* <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pl-4 pr-2 py-3">
                  <input type="checkbox"
                    checked={paginated.length > 0 && paginated.every(o => selected.has(o.id))}
                    onChange={e => setSelected(e.target.checked ? new Set(paginated.map(o => o.id)) : new Set())}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
                  />
                </th>
                {COLUMNS.map(({ key, label, sortable }) => (
                  <th key={key} onClick={() => sortable && setSort(s => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))}
                    className={`px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${sortable ? "cursor-pointer hover:text-slate-300 select-none" : ""}`}
                  >
                    <span className="flex items-center gap-1">{label}{sortable && <ArrowUpDown size={10} className={sort.key === key ? "text-amber-400" : "text-slate-700"} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={12}>
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4"><Inbox size={28} className="text-slate-600" /></div>
                    <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>No orders found</h3>
                    <p className="text-sm text-slate-600 mb-5">Try adjusting your search or filters.</p>
                    <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"><Plus size={14} /> Add Order</button>
                  </div>
                </td></tr>
              ) : paginated.map(order => (
                <TableRow
                  key={order.id} order={order}
                  selected={selected.has(order.id)}
                  onSelect={(id, checked) => setSelected(s => { const n = new Set(s); checked ? n.add(id) : n.delete(id); return n })}
                  onView={setDrawerOrder}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={perPage} onPage={setPage} onPerPage={setPerPage} />
      </div> */}



      <tbody>
        {loading ? (
          <tr>
            <td colSpan={12}>
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2
                  size={30}
                  className="animate-spin text-amber-400 mb-3"
                />

                <p className="text-sm text-slate-400">
                  Loading orders...
                </p>
              </div>
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={12}>
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertTriangle
                  size={30}
                  className="text-red-400 mb-3"
                />

                <h3 className="text-base font-bold text-white mb-1">
                  Failed to load orders
                </h3>

                <p className="text-sm text-slate-500 mb-4">
                  {error}
                </p>

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
          paginated.map((order) => (
            <TableRow
              key={order.id}
              order={order}
              selected={selected.has(order.id)}
              onSelect={(id, checked) => {
                const n = new Set(selected);

                checked ? n.add(id) : n.delete(id);

                setSelected(n);
              }}
              onView={setDrawerOrder}
              onAssignCourier={assignCourier}
            />
          ))
        )}
      </tbody>





      {/* Modals */}
      <OrderDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} />
      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            fetchOrders();
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}