import React from "react";


export const STATUS_CONFIG = {
  REQUESTED:           { label: "Requested",          cls: "bg-slate-400/10 text-slate-400 border-slate-400/20" },
  UNDER_REVIEW:        { label: "Under Review",       cls: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  APPROVED:            { label: "Approved",           cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  REJECTED:            { label: "Rejected",           cls: "bg-red-400/10 text-red-400 border-red-400/20" },
  PICKUP_SCHEDULED:    { label: "Pickup Scheduled",   cls: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20" },
  IN_TRANSIT:          { label: "In Transit",         cls: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  RECEIVED:            { label: "Received",           cls: "bg-teal-400/10 text-teal-400 border-teal-400/20" },
  INSPECTION_PENDING:  { label: "Inspection Pending", cls: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  INSPECTION_PASSED:   { label: "Inspection Passed",  cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  INSPECTION_FAILED:   { label: "Inspection Failed",  cls: "bg-red-400/10 text-red-400 border-red-400/20" },
  EXCHANGE_DISPATCHED: { label: "Exchange Dispatched",cls: "bg-violet-400/10 text-violet-400 border-violet-400/20" },
  CLOSED:              { label: "Closed",             cls: "bg-slate-400/10 text-slate-500 border-slate-400/10" },
};

// Combined configuration mapping for both orders and return pipelines
const BADGE_CONFIG = {
  // --- ORDER STATUSES (Title Case Keys) ---
  "Pending Verification": { label: "Pending Verification", cls: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  "Packed":               { label: "Packed",               cls: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20" },
  "Shipped":              { label: "Shipped",              cls: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  "Delivered":            { label: "Delivered",            cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  "Failed Delivery":      { label: "Failed Delivery",      cls: "bg-red-400/10 text-red-400 border-red-400/20" },
  "Returned":             { label: "Returned",             cls: "bg-orange-400/10 text-orange-400 border-orange-400/20" },
  "Order Stuck":          { label: "Order Stuck",          cls: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse" },

  // --- RETURN REQUEST STATUSES (Uppercase Keys) ---
  REQUESTED:           { label: "Requested",           cls: "bg-slate-400/10 text-slate-400 border-slate-400/20" },
  UNDER_REVIEW:        { label: "Under Review",        cls: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  APPROVED:            { label: "Approved",            cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  REJECTED:            { label: "Rejected",            cls: "bg-red-400/10 text-red-400 border-red-400/20" },
  PICKUP_SCHEDULED:    { label: "Pickup Scheduled",    cls: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20" },
  IN_TRANSIT:          { label: "In Transit",          cls: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  RECEIVED:            { label: "Received",            cls: "bg-teal-400/10 text-teal-400 border-teal-400/20" },
  INSPECTION_PENDING:  { label: "Inspection Pending",  cls: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  INSPECTION_PASSED:   { label: "Inspection Passed",   cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  INSPECTION_FAILED:   { label: "Inspection Failed",   cls: "bg-red-400/10 text-red-400 border-red-400/20" },
  EXCHANGE_DISPATCHED: { label: "Exchange Dispatched", cls: "bg-violet-400/10 text-violet-400 border-violet-400/20" },
  CLOSED:              { label: "Closed",              cls: "bg-slate-400/10 text-slate-500 border-slate-400/10" },
};

// Default fallback configuration for unknown or custom pipeline codes
const DEFAULT_FALLBACK = {
  cls: "bg-slate-400/10 text-slate-400 border-slate-400/20"
};

export default function StatusBadge({ status }) {
  // Defensive guard against null/undefined prop strings
  if (!status) return null;

  // Attempt config lookup; fall back to the raw status text if key isn't explicitly registered
  const cfg = BADGE_CONFIG[status] || { label: status, ...DEFAULT_FALLBACK };

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap transition-colors duration-150 ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}