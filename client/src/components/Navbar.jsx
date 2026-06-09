import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  Menu, Search, Bell, SunMedium, Command, LogOut, 
  User, ChevronDown, Zap, Store, Check 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

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

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user, logOut } = useAuth();
  
  // Extract the new variables from StoreContext
  const { activeStore, availableStores, switchStore } = useStore();
  
  const navigate = useNavigate();
  const pageTitle = routeLabels[pathname] ?? "Dashboard";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false); // New state for store selector
  
  const dropdownRef = useRef(null);
  const storeDropdownRef = useRef(null); // New ref for store selector

  const initial = user?.email?.[0]?.toUpperCase() ?? "A";

  async function handleSignOut() {
    setDropdownOpen(false);
    await logOut();
    navigate("/login");
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(e.target)) {
        setStoreDropdownOpen(false);
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

      {/* Page Title & Store Selector Group */}
      <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
        <h1
          className="text-white font-semibold text-base"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {pageTitle}
        </h1>

        {/* Divider */}
        <div className="h-4 w-px bg-white/[0.15]" />

        {/* SHOPIFY-STYLE STORE SELECTOR */}
        <div className="relative" ref={storeDropdownRef}>
          <button
            onClick={() => setStoreDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Store size={11} />
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate max-w-[140px]">
              {activeStore?.storeName || "Select Store"}
            </span>
            <ChevronDown 
              size={12} 
              className={`text-slate-500 transition-transform duration-200 ${storeDropdownOpen ? "rotate-180" : ""}`} 
            />
          </button>

          {/* Store Selector Dropdown */}
          {storeDropdownOpen && (
            <div className="absolute left-0 top-[calc(100%+10px)] w-56 rounded-2xl border border-white/[0.08] bg-[#13162a] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-1.5 z-50 animate-in fade-in zoom-in-95 origin-top-left duration-150">
              <div className="px-2.5 py-2 mb-0.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Your Stores
                </p>
              </div>
              
              <div className="space-y-0.5 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {availableStores?.map((store) => {
                  const isActive = store.storeId === activeStore?.storeId;
                  return (
                    <button
                      key={store.storeId}
                      onClick={() => {
                        switchStore(store.storeId);
                        setStoreDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                        isActive 
                          ? "bg-amber-400/10 text-amber-400 font-medium" 
                          : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <span className="truncate pr-3">{store.storeName}</span>
                      {isActive && <Check size={14} className="flex-shrink-0" />}
                    </button>
                  );
                })}
                
                {availableStores?.length === 0 && (
                  <div className="px-2.5 py-3 text-xs text-slate-500 text-center">
                    No approved stores found.
                  </div>
                )}
              </div>

              <div className="my-1 h-px bg-white/[0.06]" />
              
              {/* Quick action to go to onboarding */}
              <Link
                to="/store-onboarding"
                onClick={() => setStoreDropdownOpen(false)}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] transition-colors"
              >
                Create or join another store
              </Link>
            </div>
          )}
        </div>
      </div>

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
                      {user?.dbUser?.displayName || user?.displayName || "Store User"}
                    </p>
                  </div>
                </div>

                {/* Role badge */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Zap size={9} />
                  {activeStore?.role || "Member"}
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