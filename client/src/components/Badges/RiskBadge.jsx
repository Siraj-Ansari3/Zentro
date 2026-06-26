import { AlertTriangle, BadgeAlert, TrendingDown } from "lucide-react";

export function RiskBadge({ level }) {
  const m = { low: { cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: <TrendingDown size={10} />, label: "Low" }, medium: { cls: "bg-amber-400/10 text-amber-400 border-amber-400/20", icon: <BadgeAlert size={10} />, label: "Med" }, high: { cls: "bg-red-400/10 text-red-400 border-red-400/20", icon: <AlertTriangle size={10} />, label: "High" } };
  const r = m[level] || m.low;
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${r.cls}`}>{r.icon}{r.label}</span>;
}