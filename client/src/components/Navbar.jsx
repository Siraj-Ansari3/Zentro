import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, SunMedium, Command, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const routeLabels = {
  "/":                        "Dashboard",
  "/orders/all":              "All Orders",
  "/orders/pending":          "Pending Verification",
  "/orders/packed":           "Packed Orders",
  "/orders/shipped":          "Shipped Orders",
  "/orders/failed":           "Failed Deliveries",
  "/orders/returns":          "Returns & Exchanges",
  "/customers/profiles":      "Customers",
  "/courier/dashboard":       "Courier Dashboard",
  "/courier/performance":     "Courier Performance",
  "/courier/tracking":        "Shipment Tracking",
  "/analytics/revenue":       "Revenue Insights",
  "/settings/profile":        "Profile Settings",
};

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const pageTitle = routeLabels[pathname] ?? "Dashboard";

  async function handleSignOut() {
    await logOut();
    navigate("/login");
  }

  // Avatar initials from email
  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="h-16 flex items-center px-4 lg:px-6 gap-4 border-b border-white/[0.06] bg-[#0d0f1a]/80 backdrop-blur-md sticky top-0 z-20">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/[0.06]"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <h1
        className="text-white font-semibold text-base hidden sm:block flex-shrink-0"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {pageTitle}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-auto sm:mx-0 sm:ml-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search anything…"
            className="w-full pl-8 pr-10 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.07] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 focus:bg-white/[0.06] transition-all duration-150"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <Command size={10} className="text-slate-600" />
            <span className="text-[10px] text-slate-600">K</span>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/[0.06]">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 ring-1 ring-[#0d0f1a]" />
        </button>

        {/* Theme toggle */}
        <button className="w-9 h-9 hidden sm:flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/[0.06]">
          <SunMedium size={16} />
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="w-9 h-9 hidden sm:flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-colors border border-white/[0.06]"
        >
          <LogOut size={15} />
        </button>

        {/* Avatar */}
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ring-2 ring-indigo-400/20 hover:ring-indigo-400/50 transition-all">
          {initial}
        </button>
      </div>
    </header>
  );
}
