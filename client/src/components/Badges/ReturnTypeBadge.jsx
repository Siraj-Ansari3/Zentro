import React from "react";
import { RefreshCw, ArrowLeftRight } from "lucide-react";

// 1. Export the configuration raw data object so pages can import it to map over filters/options
export const TYPE_CONFIG = {
  RETURN: {
    label: "Return",
    cls: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    icon: RefreshCw,
  },
  EXCHANGE: {
    label: "Exchange",
    cls: "bg-violet-400/10 text-violet-400 border-violet-400/20",
    icon: ArrowLeftRight,
  },
};

// 2. Default design configuration fallback 
const DEFAULT_FALLBACK = {
  label: "Unknown",
  cls: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  icon: RefreshCw
};

// 3. Export the functional component as the main default piece
export default function ReturnTypeBadge({ type }) {
  // Safe normalization guard against missing properties or mixed casings
  const lookupKey = type ? type.toUpperCase() : "";
  
  const cfg = TYPE_CONFIG[lookupKey] || { label: type || DEFAULT_FALLBACK.label, ...DEFAULT_FALLBACK };
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap transition-all ${cfg.cls}`}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}