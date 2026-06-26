import React, { useState, useEffect } from "react";
import { 
  PackagePlus, 
  X, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  ChevronDown
} from "lucide-react";

// NOTE: Adjust these import paths to match your project's structure
import api from "../../api/axios"; // adjust path as needed
import { useStore } from "../../context/StoreContext";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];

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


export default function CreateOrderModal({ onClose, onCreated }) {
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
                    placeholder="e.g. Siraj Ansari"
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