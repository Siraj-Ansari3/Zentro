export default function PayBadge({ type }) {
  return type === "COD"
    ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-amber-400/10 text-amber-400 border-amber-400/20">COD</span>
    : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">PREPAID</span>;
}