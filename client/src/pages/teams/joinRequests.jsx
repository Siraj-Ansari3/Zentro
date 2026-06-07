import { useEffect, useState } from "react";
import {
  UserPlus,
  Check,
  X,
  Clock,
  Shield,
  RefreshCcw,
  Search,
  Mail,
  Inbox
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";

// Role badge styling map for consistency
const roleColorMap = {
  super_admin: "bg-red-400/10 text-red-400 border-red-400/20",
  admin: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  manager: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  editor: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  packer: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  dispatcher: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  support: "bg-sky-400/10 text-sky-400 border-sky-400/20",
  viewer: "bg-slate-400/10 text-slate-400 border-slate-400/20",
};

export default function JoinRequests() {
  const { user } = useAuth();
  const { activeStore } = useStore();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // ─────────────────────────────────────
  // FETCH REQUESTS
  // ─────────────────────────────────────
  useEffect(() => {
    if (!activeStore?.storeId) {
      setLoading(false);
      return;
    }
    fetchRequests();
  }, [activeStore]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Adjust this endpoint to match your actual backend route
      const res = await api.get(`/requests/join-requests?storeId=${activeStore.storeId}`);
      
      // Assuming the backend returns an array of JoinRequest documents
      // populated with the userId (so we can display their email/name)
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────
  // APPROVE / REJECT ACTIONS
  // ─────────────────────────────────────
  const handleAction = async (requestId, action) => {
    try {
      setProcessingId(requestId);
      
      // Adjust endpoints based on your backend routing
      const endpoint = action === "approve" 
        ? "/stores/join-requests/approve" 
        : "/stores/join-requests/reject";

      await api.post(endpoint, {
        requestId,
        storeId: activeStore.storeId
      });

      // Remove the processed request from the UI locally
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
      
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      alert(err?.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  // ─────────────────────────────────────
  // FILTERING
  // ─────────────────────────────────────
  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase();
    const userEmail = req.userId?.email?.toLowerCase() || "";
    const requestedRole = req.requestedRole?.toLowerCase() || "";
    return userEmail.includes(query) || requestedRole.includes(query);
  });

  // ─────────────────────────────────────
  // RENDER: LOADING STATE
  // ─────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 text-slate-400 flex items-center gap-2">
        <RefreshCcw className="animate-spin" size={16} />
        Loading requests...
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white">Access Requests</h2>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-amber-400 text-xs font-semibold border border-white/[0.08]">
              {requests.length} Pending
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Review and manage users requesting to join {activeStore?.storeName}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors w-full sm:w-64"
            />
          </div>
          <button 
            onClick={fetchRequests}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
          >
            <RefreshCcw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── REQUESTS LIST ── */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#13151f] border border-white/[0.06] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
            <Inbox size={28} className="text-slate-600" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No pending requests</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            You're all caught up! When users request to join your store, they will appear here for your review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors"
            >
              {/* User Info Section */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 border border-white/10">
                  {req.userId?.email?.charAt(0).toUpperCase() || <UserPlus size={16} />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1 text-white">
                    <span className="font-semibold text-sm">
                      {req.userId?.name || "Unknown User"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${roleColorMap[req.requestedRole] || roleColorMap.viewer}`}>
                      {req.requestedRole}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-500" />
                      {req.userId?.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-500" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {req.message && (
                    <div className="mt-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-xs text-slate-300 italic">
                      "{req.message}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                <button
                  onClick={() => handleAction(req._id, "reject")}
                  disabled={processingId === req._id}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-50 transition-colors"
                >
                  <X size={14} /> Reject
                </button>
                <button
                  onClick={() => handleAction(req._id, "approve")}
                  disabled={processingId === req._id}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-70 transition-all shadow-lg shadow-emerald-400/20"
                >
                  <Check size={14} /> Approve
                </button>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && searchQuery && (
            <div className="py-10 text-center text-slate-500 text-sm">
              No requests found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}