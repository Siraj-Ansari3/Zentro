import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  RefreshCw, ArrowLeftRight, Search, ChevronLeft, ChevronRight,
  ChevronDown, X, Eye, UserCheck, GitBranch, CheckCircle2, XCircle,
  Loader2, AlertTriangle, Inbox, MoreHorizontal, Phone, MapPin,
  Package, Tag, CreditCard, ClipboardList, StickyNote, Send,
  Plus, Trash2, PackagePlus, FileText,
} from "lucide-react";
import api from "../../api/axios";         // adjust path as needed
import { useStore } from "../../context/StoreContext"; // adjust path as needed

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const REQUEST_TYPES = ["RETURN", "EXCHANGE"];

const TYPE_CONFIG = {
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

const STATUS_CONFIG = {
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

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const NOTE_PRIORITY_CONFIG = {
  low:      { cls: "bg-slate-400/10 text-slate-400 border-slate-400/20",   border: "border-l-slate-500"  },
  medium:   { cls: "bg-amber-400/10 text-amber-400 border-amber-400/20",   border: "border-l-amber-400"  },
  high:     { cls: "bg-orange-400/10 text-orange-400 border-orange-400/20",border: "border-l-orange-400" },
  critical: { cls: "bg-red-400/10 text-red-400 border-red-400/20",         border: "border-l-red-400"    },
};

// ─────────────────────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || { label: type, cls: "bg-slate-400/10 text-slate-400 border-slate-400/20" };
  const Icon = cfg.icon || RefreshCw;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${cfg.cls}`}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: "bg-slate-400/10 text-slate-400 border-slate-400/20" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function Pill({ label, active, onClick, activeCls }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex-shrink-0 ${
        active ? activeCls : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
      }`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT CARDS
// ─────────────────────────────────────────────────────────────
function StatCards({ stats, loading }) {
  const cards = [
    { key: "total",    label: "Total",           icon: ClipboardList, color: "text-slate-300",  bg: "bg-slate-400/10" },
    { key: "returns",  label: "Returns",         icon: RefreshCw,     color: "text-blue-400",   bg: "bg-blue-400/10"  },
    { key: "exchanges",label: "Exchanges",       icon: ArrowLeftRight,color: "text-violet-400", bg: "bg-violet-400/10"},
    { key: "pending",  label: "Pending Review",  icon: AlertTriangle, color: "text-amber-400",  bg: "bg-amber-400/10" },
    { key: "closed",   label: "Closed",          icon: CheckCircle2,  color: "text-emerald-400",bg: "bg-emerald-400/10"},
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-4">
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06]" />
              <div className="h-6 w-10 bg-white/[0.06] rounded" />
              <div className="h-3 w-16 bg-white/[0.04] rounded" />
            </div>
          ) : (
            <>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={14} className={color} />
              </div>
              <p className="text-xl font-bold text-white mb-0.5">{stats?.[key] ?? 0}</p>
              <p className="text-[11px] text-slate-500">{label}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ACTION DROPDOWN
// ─────────────────────────────────────────────────────────────
function ActionDropdown({ request, onView, onStatusChange, onApprove, onReject, onClose }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const actions = [
    { label: "View Details",   icon: Eye,         onClick: () => { onView(request); setOpen(false); } },
    { divider: true },
    { label: "Approve",        icon: CheckCircle2,onClick: () => { onApprove(request); setOpen(false); }, disabled: request.status === "APPROVED" || request.status === "CLOSED" },
    { label: "Reject",         icon: XCircle,     onClick: () => { onReject(request); setOpen(false); }, danger: true, disabled: request.status === "REJECTED" || request.status === "CLOSED" },
    { label: "Close Request",  icon: GitBranch,   onClick: () => { onClose(request); setOpen(false); }, danger: true, disabled: request.status === "CLOSED" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
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
                disabled={a.disabled}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  a.danger ? "text-red-400 hover:bg-red-400/10" : "text-slate-300 hover:bg-white/[0.06]"
                }`}
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
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, description, confirmLabel, danger, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]" onClick={onCancel} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-[#0f1120] border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>{title}</h3>
          <p className="text-xs text-slate-400 mb-6">{description}</p>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-60 transition-colors ${
                danger
                  ? "bg-red-500 hover:bg-red-400 text-white"
                  : "bg-amber-400 hover:bg-amber-300 text-black"
              }`}
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// INTERNAL NOTES PANEL
// ─────────────────────────────────────────────────────────────
function InternalNotesPanel({ orderId, storeId }) {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ text: "", priority: "medium", category: "return" });

  const fetchNotes = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await api.get("/internal_notes/get_all", {
        params: { orderId, storeId },
      });
      setNotes(res.data?.internalNotes || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [orderId, storeId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSubmit = async () => {
    if (!form.text.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/internal-notes", {
        text: form.text,
        orderId,
        storeId,
        category: form.category,
        priority: form.priority,
      });
      setForm({ text: "", priority: "medium", category: "return" });
      setShowForm(false);
      fetchNotes();
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <StickyNote size={12} /> Internal Notes
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-400 border border-amber-400/20 bg-amber-400/5 hover:bg-amber-400/10 transition-colors"
        >
          <Plus size={11} /> Add
        </button>
      </div>

      {showForm && (
        <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-2">
          <textarea
            rows={2}
            placeholder="Note text…"
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
          />
          <div className="flex gap-2">
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="flex-1 appearance-none px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-300 focus:outline-none"
            >
              {["low", "medium", "high", "critical"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="flex-1 appearance-none px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-300 focus:outline-none"
            >
              {["return", "delivery_issue", "customer_complaint", "payment", "general"].map((c) => (
                <option key={c} value={c}>{c.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.text.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition-colors"
            >
              {submitting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-[11px] text-slate-600 italic py-3 text-center">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => {
            const pcfg = NOTE_PRIORITY_CONFIG[note.priority] || NOTE_PRIORITY_CONFIG.low;
            return (
              <div key={note._id} className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] border-l-2 ${pcfg.border}`}>
                <p className="text-[12px] text-slate-300 leading-relaxed mb-1.5">{note.text}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${pcfg.cls}`}>{note.priority}</span>
                  <span className="text-[10px] text-slate-600">{note.category?.replace("_", " ")}</span>
                  <span className="ml-auto text-[10px] text-slate-600">{fmtDate(note.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAILS DRAWER
// ─────────────────────────────────────────────────────────────
function ReturnDetailsDrawer({ request, storeId, onClose, onStatusChange }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | notes

  useEffect(() => {
    if (!request?._id) return;
    setLoading(true);
    api.get(`/returns/${request._id}`, { params: { storeId } })
      .then((r) => setDetail(r.data))
      .catch(() => setDetail(request)) // fallback to row data
      .finally(() => setLoading(false));
  }, [request?._id, storeId]);

  const data = detail || request;
  if (!request) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f1120] border-l border-white/[0.07] z-50 flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-white font-mono">{data?.requestId || data?._id}</span>
              <TypeBadge type={data?.type} />
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={data?.status} />
              <span className="text-[11px] text-slate-600">{fmtDate(data?.createdAt)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] flex-shrink-0">
          {[
            { key: "overview", label: "Overview" },
            { key: "notes",    label: "Notes" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === t.key
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading ? (
            <div className="space-y-3">
              {[80, 120, 100, 80].map((h, i) => (
                <div key={i} className={`h-${h === 80 ? '20' : h === 120 ? '28' : '24'} rounded-xl bg-white/[0.03] animate-pulse`} />
              ))}
            </div>
          ) : activeTab === "overview" ? (
            <>
              {/* Request info */}
              <section>
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2.5">Request Details</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
                  <Row label="Type"><TypeBadge type={data?.type} /></Row>
                  <Row label="Status"><StatusBadge status={data?.status} /></Row>
                  <Row label="Reason"><span className="text-xs text-slate-300">{data?.reason || "—"}</span></Row>
                  <Row label="Refund Amount">
                    <span className="text-xs font-semibold text-white">
                      {data?.refundAmount ? `Rs ${data?.refundAmount.toLocaleString()}` : "—"}
                    </span>
                  </Row>
                  <Row label="Inspection"><span className="text-xs text-slate-300">{data?.inspectionResult || "—"}</span></Row>
                  <Row label="Assigned To"><span className="text-xs text-slate-300">{data?.assignedTo?.displayName || "Unassigned"}</span></Row>
                  <Row label="Created By"><span className="text-xs text-slate-300">{data?.createdBy?.displayName || "—"}</span></Row>
                </div>
              </section>

              {/* Order info (populated from Order) */}
              {data?.orderId && (
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2.5">Order Details</h3>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
                    <Row label="Order #">
                      <span className="text-xs font-mono text-slate-200">{data.orderId?.orderNumber || "—"}</span>
                    </Row>
                    <Row label="Customer">
                      <span className="text-xs text-slate-300">{data.orderId?.shippingAddress?.fullName || data.customerId?.name || "—"}</span>
                    </Row>
                    <Row label="Phone">
                      <span className="text-xs text-slate-300 flex items-center gap-1">
                        <Phone size={10} className="text-slate-600" />
                        {data.orderId?.shippingAddress?.phone || "—"}
                      </span>
                    </Row>
                    <Row label="City">
                      <span className="text-xs text-slate-300 flex items-center gap-1">
                        <MapPin size={10} className="text-slate-600" />
                        {data.orderId?.shippingAddress?.city || "—"}
                      </span>
                    </Row>
                    <Row label="Order Total">
                      <span className="text-xs font-semibold text-white">
                        {data.orderId?.totalAmount ? `Rs ${data.orderId?.totalAmount.toLocaleString()}` : "—"}
                      </span>
                    </Row>
                  </div>
                </section>
              )}

              {/* Exchange product — only for EXCHANGE type */}
              {data?.type === "EXCHANGE" && (
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2.5">Exchange Product</h3>
                  <div className="bg-violet-400/[0.04] border border-violet-400/20 rounded-xl p-4 space-y-2.5">
                    <Row label="Existing Product">
                      <span className="text-xs text-slate-300">
                        {data.orderId?.items?.[0]?.name || "—"}
                      </span>
                    </Row>
                    <Row label="Exchange For">
                      <span className="text-xs font-semibold text-violet-300">
                        {data.exchangeProductId?.name || "—"}
                      </span>
                    </Row>
                  </div>
                </section>
              )}

              {/* Status change quick actions */}
              <section>
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2.5">Update Status</h3>
                <div className="relative">
                  <select
                    value={data?.status || ""}
                    onChange={(e) => onStatusChange(data._id, e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl text-xs bg-white/[0.04] border border-white/[0.08] text-slate-200 focus:outline-none focus:border-amber-400/50 cursor-pointer transition-colors"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </section>
            </>
          ) : (
            /* Notes tab */
            <InternalNotesPanel
              orderId={typeof data?.orderId === "object" ? data.orderId?._id : data?.orderId}
              storeId={storeId}
            />
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-[11px] text-slate-500 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────
function Pagination({ page, total, perPage, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  const pages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.06]">
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

// ─────────────────────────────────────────────────────────────
// CREATE RETURN / EXCHANGE MODAL
// ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  type: "RETURN",
  orderNumber: "",
  reason: "",
  refundAmount: "",
  exchangeProductName: "", // free-text for now; swap for a product search if needed
  notes: "",
};

function CreateReturnModal({ onClose, onCreated, storeId }) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  // Order lookup state — user types order number, we resolve the orderId
  const [orderLookup, setOrderLookup]   = useState({ loading: false, data: null, error: "" });
  const lookupTimeout = useRef(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  // ── Debounced order lookup when orderNumber changes
  useEffect(() => {
    const num = form.orderNumber.trim();
    if (!num) { setOrderLookup({ loading: false, data: null, error: "" }); return; }
    clearTimeout(lookupTimeout.current);
    lookupTimeout.current = setTimeout(async () => {
      setOrderLookup({ loading: true, data: null, error: "" });
      try {
        const res = await api.get("/order/get_order", {
          params: { storeId, search: num,  },
        });
        const found = res.data?.order || null;
        setOrderLookup({
          loading: false,
          data: found,
          error: found ? "" : "No order found with that number.",
        });
      } catch {
        setOrderLookup({ loading: false, data: null, error: "Could not look up order." });
      }
    }, 500);
    return () => clearTimeout(lookupTimeout.current);
  }, [form.orderNumber, storeId]);

  const validate = () => {
    const e = {};
    if (!form.orderNumber.trim())   e.orderNumber = "Order number is required";
    if (!orderLookup.data)          e.orderNumber = e.orderNumber || "Please enter a valid order number";
    if (!form.reason.trim())        e.reason      = "Reason is required";
    if (form.type === "EXCHANGE" && !form.exchangeProductName.trim())
      e.exchangeProductName = "Exchange product is required";
    if (form.type === "REFUND" && form.refundAmount && isNaN(Number(form.refundAmount)))
      e.refundAmount = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const order = orderLookup.data;
      const body = {
        storeId,
        orderId:    order._id,
        customerId: order.customerId?._id || order.customerId,
        type:       form.type,
        reason:     form.reason,
      };
      if (form.type === "RETURN" && form.refundAmount)
        body.refundAmount = Number(form.refundAmount);
      if (form.type === "EXCHANGE" && form.exchangeProductName)
        body.exchangeProductName = form.exchangeProductName; // backend maps to exchangeProductId if needed
      if (form.notes.trim())
        body.initialNote = form.notes.trim();

      await api.post("/requests/returns", body);
      setSuccess(true);
      setTimeout(() => { onCreated(); onClose(); }, 1000);
    } catch (err) {
      setErrors((e) => ({ ...e, _server: err?.response?.data?.message || "Failed to create request" }));
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { key: "RETURN",   label: "Return",   icon: RefreshCw,    desc: "Customer wants to send back an item" },
    { key: "EXCHANGE", label: "Exchange", icon: ArrowLeftRight,desc: "Customer wants a different item instead" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0f1120] border border-white/[0.08] rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl shadow-black/80">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <PackagePlus size={15} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
                  New Request
                </h2>
                <p className="text-[11px] text-slate-500">Log a return or exchange for an order</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Server error */}
            {errors._server && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20 text-xs text-red-400">
                <AlertTriangle size={13} />{errors._server}
              </div>
            )}

            {/* ── Request Type ── */}
            <section>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Request Type <span className="text-amber-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map(({ key, label, icon: Icon, desc }) => (
                  <button
                    key={key}
                    onClick={() => set("type", key)}
                    className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border text-left transition-all ${
                      form.type === key
                        ? key === "RETURN"
                          ? "border-blue-400/40 bg-blue-400/[0.07]"
                          : "border-violet-400/40 bg-violet-400/[0.07]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      form.type === key
                        ? key === "RETURN" ? "bg-blue-400/15" : "bg-violet-400/15"
                        : "bg-white/[0.04]"
                    }`}>
                      <Icon size={13} className={
                        form.type === key
                          ? key === "RETURN" ? "text-blue-400" : "text-violet-400"
                          : "text-slate-500"
                      } />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${form.type === key ? "text-white" : "text-slate-400"}`}>
                        {label}
                      </p>
                      <p className="text-[10px] text-slate-600 leading-snug mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* ── Order Lookup ── */}
            <section>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Order Number <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ORD-2291"
                  value={form.orderNumber}
                  onChange={(e) => set("orderNumber", e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs bg-white/[0.04] border text-slate-200 placeholder-slate-600 focus:outline-none transition-colors ${
                    errors.orderNumber ? "border-red-400/40" : "border-white/[0.08] focus:border-amber-400/50"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {orderLookup.loading && <Loader2 size={13} className="animate-spin text-slate-500" />}
                  {orderLookup.data    && <CheckCircle2 size={13} className="text-emerald-400" />}
                  {orderLookup.error   && <AlertTriangle size={13} className="text-red-400" />}
                </div>
              </div>
              {errors.orderNumber && (
                <p className="mt-1 text-[10px] text-red-400">{errors.orderNumber}</p>
              )}

              {/* Order preview card */}
              {orderLookup.data && (
                <div className="mt-2 px-3 py-2.5 rounded-xl bg-emerald-400/[0.04] border border-emerald-400/20 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {orderLookup.data.shippingAddress?.fullName?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-emerald-300 truncate">
                      {orderLookup.data.shippingAddress?.fullName || "Customer"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {orderLookup.data.items?.length || 0} item{orderLookup.data.items?.length !== 1 ? "s" : ""} ·
                      Rs {(orderLookup.data.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">
                    {orderLookup.data.orderNumber}
                  </span>
                </div>
              )}
            </section>

            {/* ── Reason ── */}
            <section>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Reason <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe why the customer is requesting this…"
                value={form.reason}
                onChange={(e) => set("reason", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs bg-white/[0.04] border text-slate-200 placeholder-slate-600 focus:outline-none transition-colors resize-none ${
                  errors.reason ? "border-red-400/40" : "border-white/[0.08] focus:border-amber-400/50"
                }`}
              />
              {errors.reason && <p className="mt-1 text-[10px] text-red-400">{errors.reason}</p>}
            </section>

            {/* ── EXCHANGE: product name ── */}
            {form.type === "EXCHANGE" && (
              <section>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Exchange For <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Product name or SKU the customer wants instead"
                  value={form.exchangeProductName}
                  onChange={(e) => set("exchangeProductName", e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs bg-white/[0.04] border text-slate-200 placeholder-slate-600 focus:outline-none transition-colors ${
                    errors.exchangeProductName ? "border-red-400/40" : "border-white/[0.08] focus:border-violet-400/50"
                  }`}
                />
                {errors.exchangeProductName && (
                  <p className="mt-1 text-[10px] text-red-400">{errors.exchangeProductName}</p>
                )}
              </section>
            )}

            {/* ── RETURN: refund amount (optional) ── */}
            {form.type === "RETURN" && (
              <section>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Expected Refund Amount (Rs) <span className="text-slate-600 normal-case font-normal">— optional</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">Rs</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.refundAmount}
                    onChange={(e) => set("refundAmount", e.target.value)}
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl text-xs bg-white/[0.04] border text-slate-200 placeholder-slate-600 focus:outline-none transition-colors ${
                      errors.refundAmount ? "border-red-400/40" : "border-white/[0.08] focus:border-amber-400/50"
                    }`}
                  />
                </div>
                {errors.refundAmount && <p className="mt-1 text-[10px] text-red-400">{errors.refundAmount}</p>}
              </section>
            )}

            {/* ── Internal note (optional) ── */}
            <section>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Internal Note <span className="text-slate-600 normal-case font-normal">— optional</span>
              </label>
              <textarea
                rows={2}
                placeholder="Any additional context for your team…"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-white/[0.04] border border-white/[0.08] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
              />
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] text-slate-600">
              {TYPE_CONFIG[form.type]?.label} · {orderLookup.data?.orderNumber || "no order yet"}
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
                    : <><PackagePlus size={13} /> Create Request</>
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
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "requestId",  label: "Request ID" },
  { key: "order",      label: "Order #" },
  { key: "type",       label: "Type" },
  { key: "status",     label: "Status" },
  { key: "customer",   label: "Customer" },
  { key: "reason",     label: "Reason" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "createdAt",  label: "Date" },
  { key: "actions",    label: "" },
];

const EMPTY_CONFIRM = { open: false, title: "", description: "", confirmLabel: "", danger: false, onConfirm: null };

export default function ReturnsPage() {
  const { activeStore } = useStore();
  const storeId = activeStore?.storeId;

  // ── Data state
  const [requests, setRequests]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]         = useState("");

  // ── Filters
  const [typeFilter, setTypeFilter]     = useState("all"); // all | RETURN | EXCHANGE
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const perPage = 10;

  // ── UI state
  const [drawerRequest, setDrawerRequest] = useState(null);
  const [confirm, setConfirm]             = useState(EMPTY_CONFIRM);
  const [actionLoading, setActionLoading] = useState(false);
  const [selected, setSelected]           = useState(new Set());
  const [showCreate, setShowCreate]       = useState(false);

  // ─────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError("");
    try {
      const params = { storeId, page, limit: perPage };
      if (typeFilter   !== "all") params.type   = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim())          params.search = search.trim();

      const res = await api.get("/requests/returns", { params });
      console.log(res.data?.requests)
      setRequests(res.data?.requests || []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [storeId, page, perPage, typeFilter, statusFilter, search]);

  const fetchStats = useCallback(async () => {
    if (!storeId) return;
    setStatsLoading(true);
    try {
      const res = await api.get("/returns/stats", { params: { storeId } });
      setStats(res.data);
    } catch {
      /* non-critical */
    } finally {
      setStatsLoading(false);
    }
  }, [storeId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { fetchStats(); },    [fetchStats]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, search]);

  // ─────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────
  const runAction = async (fn) => {
    setActionLoading(true);
    try {
      await fn();
      await fetchRequests();
      await fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
      setConfirm(EMPTY_CONFIRM);
    }
  };

  const handleApprove = (req) => {
    setConfirm({
      open: true,
      title: "Approve request",
      description: `Approve ${TYPE_CONFIG[req.type]?.label || req.type} request ${req.requestId || req._id}?`,
      confirmLabel: "Approve",
      danger: false,
      onConfirm: () => runAction(() => api.patch(`/returns/${req._id}/approve`, { storeId })),
    });
  };

  const handleReject = (req) => {
    setConfirm({
      open: true,
      title: "Reject request",
      description: `Reject this request? This action cannot be undone.`,
      confirmLabel: "Reject",
      danger: true,
      onConfirm: () => runAction(() => api.patch(`/returns/${req._id}/reject`, { storeId })),
    });
  };

  const handleClose = (req) => {
    setConfirm({
      open: true,
      title: "Close request",
      description: `Close request ${req.requestId || req._id}? This marks it as resolved.`,
      confirmLabel: "Close",
      danger: true,
      onConfirm: () => runAction(() => api.patch(`/returns/${req._id}/close`, { storeId })),
    });
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/returns/${id}/status`, { status, storeId });
      await fetchRequests();
      // update drawer data inline
      setDrawerRequest((prev) => prev && prev._id === id ? { ...prev, status } : prev);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  // ─────────────────────────────────────
  // TYPE FILTER PILLS
  // ─────────────────────────────────────
  const typeOptions = [
    { key: "all",      label: "All types",  activeCls: "border-amber-400 text-amber-400 bg-amber-400/10" },
    { key: "RETURN",   label: "Returns",    activeCls: "border-blue-400 text-blue-400 bg-blue-400/10" },
    { key: "EXCHANGE", label: "Exchanges",  activeCls: "border-violet-400 text-violet-400 bg-violet-400/10" },
  ];

  // ─────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────
  return (
    <div className="min-h-full p-4 lg:p-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
              Returns & Exchanges
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 text-xs font-semibold border border-white/[0.08]">
              {total.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-slate-500">Manage return requests and exchange orders.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20 flex-shrink-0"
        >
          <Plus size={13} /> New Request
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <StatCards stats={stats} loading={statsLoading} />

      {/* ── Type Filter Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3">
        {typeOptions.map((t) => (
          <Pill
            key={t.key}
            label={t.label}
            active={typeFilter === t.key}
            onClick={() => setTypeFilter(t.key)}
            activeCls={t.activeCls}
          />
        ))}
      </div>

      {/* ── Search + Status Filter ── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order # or request ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-300 focus:outline-none focus:border-amber-400/40 cursor-pointer transition-colors"
          >
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pl-4 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={requests.length > 0 && requests.every((r) => selected.has(r._id))}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(requests.map((r) => r._id)) : new Set())
                    }
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
                  />
                </th>
                {COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1}>
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 size={28} className="animate-spin text-amber-400 mb-3" />
                      <p className="text-sm text-slate-400">Loading requests…</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1}>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <AlertTriangle size={28} className="text-red-400 mb-3" />
                      <p className="text-sm font-bold text-white mb-1">Failed to load</p>
                      <p className="text-xs text-slate-500 mb-4">{error}</p>
                      <button
                        onClick={fetchRequests}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300 transition-colors"
                      >
                        <RefreshCw size={13} /> Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1}>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
                        <Inbox size={24} className="text-slate-600" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">No requests found</p>
                      <p className="text-xs text-slate-600">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req._id}
                    onClick={() => setDrawerRequest(req)}
                    className={`border-t border-white/[0.04] cursor-pointer transition-colors group ${
                      selected.has(req._id) ? "bg-amber-400/[0.05]" : "hover:bg-white/[0.025]"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="pl-4 pr-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(req._id)}
                        onChange={(e) => {
                          const n = new Set(selected);
                          e.target.checked ? n.add(req._id) : n.delete(req._id);
                          setSelected(n);
                        }}
                        className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"
                      />
                    </td>

                    {/* Request ID */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        {req.requestId || req._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>

                    {/* Order # */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-400">
                        {req.orderId?.orderNumber || req.orderNumber || "—"}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-3"><TypeBadge type={req.type} /></td>

                    {/* Status */}
                    <td className="px-3 py-3"><StatusBadge status={req.status} /></td>

                    {/* Customer */}
                    <td className="px-3 py-3">
                      <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                        { req.customerId?.fullName || req.orderId?.shippingAddress?.fullName || "—"}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {req.orderId?.shippingAddress?.phone || ""}
                      </p>
                    </td>

                    {/* Reason */}
                    <td className="px-3 py-3">
                      <span className="text-xs text-slate-400 truncate max-w-[140px] block">
                        {req.reason || <span className="italic text-slate-600">—</span>}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="px-3 py-3">
                      {req.assignedTo ? (
                        <span className="text-xs text-slate-300 flex items-center gap-1">
                          <UserCheck size={11} className="text-slate-600" />
                          {req.assignedTo?.name || "—"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-xs text-slate-500">{fmtDate(req.createdAt)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <ActionDropdown
                        request={req}
                        onView={setDrawerRequest}
                        onStatusChange={handleStatusChange}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onClose={handleClose}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <CreateReturnModal
          storeId={storeId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            fetchRequests();
            fetchStats();
            setShowCreate(false);
          }}
        />
      )}

      {/* ── Drawer ── */}
      {drawerRequest && (
        <ReturnDetailsDrawer
          request={drawerRequest}
          storeId={storeId}
          onClose={() => setDrawerRequest(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog
        {...confirm}
        loading={actionLoading}
        onCancel={() => setConfirm(EMPTY_CONFIRM)}
      />
    </div>
  );
}