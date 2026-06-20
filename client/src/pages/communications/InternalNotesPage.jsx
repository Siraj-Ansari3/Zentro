import { useState, useEffect, useMemo, useCallback } from "react";
import {
  StickyNote, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Loader2, Inbox, Truck, MessageSquare, CreditCard, FileText,
} from "lucide-react";
import api from "../../api/axios";
import { useStore } from "../../context/StoreContext";

const PRIORITIES = [
  { key: "all",      label: "All priorities" },
  { key: "low",       label: "Low" },
  { key: "medium",     label: "Medium" },
  { key: "high",       label: "High" },
  { key: "critical",   label: "Critical" },
];

const CATEGORIES = [
  { key: "all",                label: "All categories", icon: FileText },
  { key: "delivery_issue",     label: "Delivery issue",  icon: Truck },
  { key: "customer_complaint", label: "Customer complaint", icon: MessageSquare },
  { key: "payment",            label: "Payment",         icon: CreditCard },
  { key: "general",            label: "General",         icon: StickyNote },
];

const PRIORITY_STYLES = {
  low:      { border: "border-l-slate-500",  pill: "bg-slate-400/10 text-slate-400 border-slate-400/20" },
  medium:   { border: "border-l-amber-400",  pill: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  high:     { border: "border-l-orange-400", pill: "bg-orange-400/10 text-orange-400 border-orange-400/20" },
  critical: { border: "border-l-red-400",    pill: "bg-red-400/10 text-red-400 border-red-400/20" },
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key;
}

function NoteCard({ note, onResolve }) {
  const [resolving, setResolving] = useState(false);
  const style = PRIORITY_STYLES[note.priority] || PRIORITY_STYLES.low;

  const handleResolve = async () => {
    setResolving(true);
    await onResolve(note._id);
    setResolving(false);
  };

  return (
    <div className={`flex gap-3 px-4 py-3.5 rounded-2xl bg-[#13151f] border border-white/[0.06] border-l-[3px] ${style.border} hover:border-white/[0.12] transition-colors`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${style.pill}`}>
            {note.priority}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/[0.04] text-slate-400 border border-white/[0.07]">
            {categoryLabel(note.category)}
          </span>
          {note.orderNumber && (
            <span className="ml-auto text-[11px] font-mono text-slate-600">{note.orderNumber}</span>
          )}
        </div>

        <p className="text-[13px] text-slate-200 leading-relaxed mb-1.5">{note.text}</p>

        <div className="flex items-center gap-2.5 text-[11px] text-slate-600">
          <span>{note.createdByName || note.createdBy?.name || "Unknown"}</span>
          <span>·</span>
          <span>{timeAgo(note.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center flex-shrink-0">
        <button
          onClick={handleResolve}
          disabled={resolving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-400 bg-emerald-400/[0.06] border border-emerald-400/20 hover:bg-emerald-400/[0.15] disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {resolving
            ? <Loader2 size={12} className="animate-spin" />
            : <CheckCircle2 size={12} />
          }
          Resolve
        </button>
      </div>
    </div>
  );
}

function Pagination({ page, total, perPage, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pages = useMemo(() => {
    const arr = [];
    const start = page <= 3 ? 1 : page - 2;
    const end = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p++) arr.push(p);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#13151f] border border-white/[0.06]">
      <span className="text-xs text-slate-500">{from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
              p === page ? "bg-amber-400 text-black" : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function InternalNotesPage() {
  const { activeStore } = useStore();

  const [notes, setNotes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const fetchNotes = useCallback(async () => {
    if (!activeStore?.storeId) return;
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: perPage, storeId: activeStore.storeId };
      if (priority !== "all") params.priority = priority;
      if (category !== "all") params.category = category;

      const res = await api.get("/internal_notes/get_all", { params });
      setNotes(res.data?.internalNotes || []);
      // If the API returns a total count, use it; otherwise fall back to current page length
      setTotalCount(res.data?.total ?? res.data?.internalNotes?.length ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch internal notes");
    } finally {
      setLoading(false);
    }
  }, [activeStore, priority, category, page]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleResolve = async (noteId) => {
    try {
      await api.patch(`/internal_notes/resolve`, {
        storeId: activeStore?.storeId,
        noteId,
      });
      // Optimistically remove from the visible list since query excludes resolved notes
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to resolve note");
    }
  };

  const handleFilterChange = (type, key) => {
    if (type === "priority") setPriority(key);
    else setCategory(key);
    setPage(1);
  };

  return (
    <div className="min-h-full p-4 lg:p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Syne',sans-serif" }}>
              <StickyNote size={18} className="text-amber-400" />
              Internal Notes
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 text-xs font-semibold border border-white/[0.08]">
              {totalCount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Track delivery issues, complaints, and internal flags across orders.
          </p>
        </div>
      </div>

      {/* Priority filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5">
        {PRIORITIES.map(({ key, label }) => {
          const isActive = priority === key;
          const activeCls = {
            all: "border-amber-400 text-amber-400 bg-amber-400/10",
            low: "border-slate-400 text-slate-300 bg-slate-400/10",
            medium: "border-amber-400 text-amber-400 bg-amber-400/10",
            high: "border-orange-400 text-orange-400 bg-orange-400/10",
            critical: "border-red-400 text-red-400 bg-red-400/10",
          }[key];
          return (
            <button
              key={key}
              onClick={() => handleFilterChange("priority", key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 ${
                isActive ? activeCls : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4">
        {CATEGORIES.map(({ key, label, icon: Icon }) => {
          const isActive = category === key;
          return (
            <button
              key={key}
              onClick={() => handleFilterChange("category", key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
                isActive
                  ? "border-indigo-400/40 text-indigo-300 bg-indigo-400/10"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-2 mb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#13151f] border border-white/[0.06] rounded-2xl">
            <Loader2 size={28} className="animate-spin text-amber-400 mb-3" />
            <p className="text-sm text-slate-400">Loading notes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#13151f] border border-white/[0.06] rounded-2xl">
            <AlertTriangle size={28} className="text-red-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Failed to load notes</h3>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#13151f] border border-white/[0.06] rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
              <Inbox size={24} className="text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No notes found</h3>
            <p className="text-xs text-slate-600">Try adjusting your filters.</p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard key={note._id} note={note} onResolve={handleResolve} />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && notes.length > 0 && (
        <Pagination page={page} total={totalCount} perPage={perPage} onPage={setPage} />
      )}
    </div>
  );
}