import React, { useState } from "react";
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Loader2, 
  UserCheck, 
  Truck, 
  Printer, 
  CheckCircle2 
} from "lucide-react";

import StatusBadge from "../Badges/StatusBadge";
import RiskBadge from "../Badges/RiskBadge";
import ShipBadge from "../Badges/ShipBadge"; 

const TIMELINE = [
  { event: "Order Placed", time: "Jan 22, 10:14 AM", done: true },
  { event: "Payment Confirmed", time: "Jan 22, 10:15 AM", done: true },
  { event: "Picked Up by Courier", time: "Jan 22, 02:30 PM", done: true },
  { event: "In Transit", time: "Jan 23, 09:00 AM", done: true },
  { event: "Out for Delivery", time: "Jan 24, 08:45 AM", done: true },
  { event: "Delivered", time: "Pending", done: false },
];

export default function OrderDrawer({ order, onClose, onUpdateStatus, onAssignCourier }) {
  const [loading, setLoading] = useState(false);

  // Fallback safety guard
  if (!order) return null;

  // ─────────────────────────────────────────────────────────────
  // DYNAMIC ACTION RENDERER
  // ─────────────────────────────────────────────────────────────
  const renderActions = () => {
    switch (order.orderStatus) {
      case "New":
        return (
          <>
            <button
              onClick={async () => {
                setLoading(true);
                await onUpdateStatus(order.orderNumber, "verified");
                setLoading(false);
              }}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-400 text-black text-xs font-bold hover:bg-emerald-300 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-400/20"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
              mark as verified
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to cancel this order?")) {
                  setLoading(true);
                  await onUpdateStatus(order.orderNumber, "failed_delivery", "Manually Canceled");
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-red-400 text-xs font-semibold hover:bg-red-400/10 hover:border-red-500/20 transition-colors"
            >
              Cancel Order
            </button>
          </>
        );

      case "Verified":
        return (
          <>
            <button
              onClick={() => {
                onClose(); // Close drawer to focus on the courier modal
                onAssignCourier(order);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
            >
              <Truck size={13} />
              assign courier
            </button>
          </>
        );

      case "Assigned to Courier":
        return (
          <>
            {order.raw?.trackingUrl && (
              <a
                href={order.raw.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                <Printer size={13} />
                Track Portal
              </a>
            )}
            <button
              onClick={async () => {
                setLoading(true);
                await onUpdateStatus(order.orderNumber, "delivered", "Force Marked Delivered");
                setLoading(false);
              }}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-emerald-400 text-xs font-semibold hover:bg-emerald-400/10 transition-colors"
            >
              Force Mark Delivered
            </button>
          </>
        );

      case "Shipped":
        return (
          <>
            <div className="flex-1 flex items-center justify-center text-center p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium gap-2">
              <Loader2 size={14} className="animate-spin" /> This order is currently in transit.
            </div>
          </>
        );

      case "Delivered":
        return (
          <div className="w-full text-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-2">
            <CheckCircle2 size={14} /> This order has been successfully delivered.
          </div>
        );

      default:
        return (
          <div className="w-full text-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-500 text-xs italic">
            No pipeline actions available for status: {order.orderStatus}
          </div>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f1120] border-l border-l-white/[0.07] z-50 flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-white font-mono">{order.orderNumber}</span>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="text-[11px] text-slate-500">
              {order.createdAt} · {order.items} item{order.items > 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Main Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          
          {/* Customer Details */}
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Customer Details</h3>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                  {order.customer?.name?.[0] || "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{order.customer?.name || "Unknown"}</p>
                  <RiskBadge level={order.risk} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Phone size={12} className="text-slate-600" />{order.customer?.phone || "—"}
                </div>
                {order.customer?.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail size={12} className="text-slate-600" />{order.customer.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin size={12} className="text-slate-600" />{order.city || "Unknown City"}, Pakistan
                </div>
              </div>
            </div>
          </section>

          {/* Courier Details */}
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
                {order.shipStatus ? <ShipBadge status={order.shipStatus} /> : <span className="text-slate-500">—</span>}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Assigned Staff</span>
                <span className="text-slate-300">{order.staff || "—"}</span>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Order Timeline</h3>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.07]" />
              {TIMELINE.map(({ event, time, done }, i) => (
                <div key={i} className="relative flex items-start gap-3 mb-4">
                  <div className={`absolute -left-5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 ${done ? "bg-amber-400 border-amber-400" : "bg-[#0f1120] border-white/20"}`} />
                  <div>
                    <p className={`text-xs font-semibold ${done ? "text-slate-200" : "text-slate-600"}`}>{event}</p>
                    <p className="text-[10px] text-slate-600">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Dynamic Action Sticky Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center gap-2 flex-shrink-0 bg-[#0d0f1a]">
          {renderActions()}
        </div>
      </div>
    </>
  );
}