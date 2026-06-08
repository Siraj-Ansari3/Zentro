import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Menu, Search, Bell, SunMedium, Command, LogOut, User, ChevronDown, Zap } from "lucide-react";
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

// Hardcoded user details — swap with real data source when ready
const HARDCODED_EMAIL = "ali.raza@company.com";
const HARDCODED_ROLE  = "Admin";

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const pageTitle = routeLabels[pathname] ?? "Dashboard";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initial = user?.email?.[0]?.toUpperCase() ?? "A";

  async function handleSignOut() {
    setDropdownOpen(false);
    await logOut();
    navigate("/login");
  }

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ring-2 ring-indigo-400/20 group-hover:ring-indigo-400/50 transition-all">
              {initial}
            </div>
            <ChevronDown
              size={12}
              className={`text-slate-500 hidden sm:block transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-60 rounded-2xl border border-white/[0.08] bg-[#13162a] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-1.5 z-50 animate-in fade-in zoom-in-95 origin-top-right duration-150">

              {/* User info header */}
              <div className="px-3 pt-3 pb-3 border-b border-white/[0.06] mb-1">
                <div className="flex items-center gap-2.5 mb-2.5">
                  {/* Larger avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ring-2 ring-indigo-400/20">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {user?.displayName ?? "Ali Raza"}
                    </p>
                  </div>
                </div>

                {/* Role badge */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Zap size={9} />
                  {HARDCODED_ROLE}
                </span>

                {/* Email */}
                <p className="mt-1.5 text-[11px] text-slate-500 truncate">
                  {user?.email ?? HARDCODED_EMAIL}
                </p>
              </div>

              {/* Profile link */}
              <Link
                to="/settings/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] transition-colors"
              >
                <User size={14} />
                Profile Settings
              </Link>

              <div className="my-1 h-px bg-white/[0.06]" />

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/[0.08] transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}