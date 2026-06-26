import { useEffect, useState } from "react";
import { useStore } from "../../context/StoreContext";
import api from "../../api/axios";

import {
  Search, Download, Upload, Plus, ChevronDown, ChevronLeft, ChevronRight,
  X, MoreHorizontal, Eye, Edit3, UserCheck, Truck, Printer, GitBranch,
  Trash2, XCircle, RefreshCcw, AlertTriangle, ArrowUpDown, Inbox, Copy,
  Phone, Mail, MapPin, TrendingDown, MessageSquare, StickyNote, BadgeAlert,
  PackagePlus, Loader2, CheckCircle2,
} from "lucide-react";

export default function AssignCourierModal({ order, onClose, onAssigned }) {
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null); 
    const [error, setError] = useState("");
    const { activeStore } = useStore();




    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    useEffect(() => {
        const fetchCouriers = async () => {
            try {
                const res = await api.get("/courier/get_couriers", {
                    params: { storeId: activeStore?.storeId }
                });
                setCouriers(res.data);
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to load couriers");
            } finally {
                setLoading(false);
            }
        };
        fetchCouriers();
    }, []);

    const handleSelect = async (courier) => {
        const courierName = courier.courierId?.name || courier.name || "Unknown";
        setAssigning(courier._id);
        try {
            const res = await api.post("/order/assign_order", {
                courier: courierName,
                orderNumber: order.orderNumber,
            }, {
                params: {
                    storeId: activeStore?.storeId
                }
            });
            onAssigned?.(res.data.message || "Order assigned successfully");
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to assign courier");
            setAssigning(null);
        }
    };

    // Courier logo placeholder — initials in a coloured circle
    const initials = (name = "") =>
        name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const colors = [
        "from-violet-500 to-indigo-600",
        "from-amber-500 to-orange-600",
        "from-emerald-500 to-teal-600",
        "from-blue-500 to-cyan-600",
        "from-rose-500 to-pink-600",
    ];

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-[#0f1120] border border-white/[0.08] rounded-2xl w-full max-w-sm flex flex-col shadow-2xl shadow-black/80">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                                <Truck size={14} className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
                                    Assign Courier
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Order <span className="font-mono text-slate-400">{order.orderNumber}</span>
                                </p>
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
                    <div className="px-5 py-4 min-h-[140px] flex flex-col">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
                                <Loader2 size={22} className="animate-spin text-amber-400" />
                                <p className="text-xs text-slate-500">Loading couriers…</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20 text-xs text-red-400">
                                <AlertTriangle size={13} />{error}
                            </div>
                        ) : couriers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <GitBranch size={22} className="text-slate-600" />
                                <p className="text-xs text-slate-500">No connected couriers found.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-[11px] text-slate-600 mb-3">
                                    Select a courier to assign this order to:
                                </p>
                                {couriers.map((courier, idx) => {
                                    const name = courier.courierId?.name || courier.name || "Courier";
                                    const isAssigning = assigning === courier._id;
                                    return (
                                        <button
                                            key={courier._id || idx}
                                            onClick={() => handleSelect(courier)}
                                            disabled={!!assigning}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-amber-400/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all group"
                                        >
                                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>
                                                {initials(name)}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                                    {name}
                                                </p>
                                                <p className="text-[10px] text-slate-600">Active integration</p>
                                            </div>
                                            {isAssigning
                                                ? <Loader2 size={14} className="animate-spin text-amber-400 flex-shrink-0" />
                                                : <ChevronRight size={14} className="text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                                            }
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-white/[0.06]">
                        <button
                            onClick={onClose}
                            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}