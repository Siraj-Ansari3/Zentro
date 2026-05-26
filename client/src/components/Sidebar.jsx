import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Clock,
  Package,
  Truck,
  XCircle,
  RefreshCcw,
  Users,
  ShieldAlert,
  Ban,
  PhoneOff,
  History,
  Navigation,
  BarChart2,
  AlertTriangle,
  Gauge,
  Warehouse,
  ListOrdered,
  SendHorizonal,
  CheckCircle2,
  MapPin,
  UserCog,
  Workflow,
  Timer,
  ClipboardList,
  Siren,
  Bell,
  MessageCircle,
  MessagesSquare,
  StickyNote,
  GitBranch,
  BarChart3,
  RotateCcw,
  Wrench,
  Users2,
  Shield,
  ScrollText,
  Activity,
  Link2,
  MessageSquare,
  KeyRound,
  Webhook,
  Settings,
  Building2,
  BellDot,
  CreditCard,
  UserCircle,
  TrendingDown,
  ChevronRight,
  X,
  Zap,
} from "lucide-react";

const navigation = [
  {
    type: "link",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/",
  },
  {
    type: "group",
    label: "Orders",
    icon: ShoppingCart,
    basePath: "/orders",
    items: [
      { label: "All Orders",              icon: ShoppingCart,  to: "/orders/all" },
      { label: "Pending Verification",    icon: Clock,         to: "/orders/pending" },
      { label: "Packed Orders",           icon: Package,       to: "/orders/packed" },
      { label: "Shipped Orders",          icon: Truck,         to: "/orders/shipped" },
      { label: "Failed Deliveries",       icon: XCircle,       to: "/orders/failed" },
      { label: "Returns & Exchanges",     icon: RefreshCcw,    to: "/orders/returns" },
    ],
  },
  {
    type: "group",
    label: "Customers",
    icon: Users,
    basePath: "/customers",
    items: [
      { label: "Customer Profiles",       icon: Users,         to: "/customers/profiles" },
      { label: "Risk Profiles",           icon: ShieldAlert,   to: "/customers/risk" },
      { label: "Blacklisted",             icon: Ban,           to: "/customers/blacklisted" },
      { label: "Repeat COD Rejectors",    icon: PhoneOff,      to: "/customers/cod-rejectors" },
      { label: "Customer Timeline",       icon: History,       to: "/customers/timeline" },
    ],
  },
  {
    type: "group",
    label: "Courier Operations",
    icon: Truck,
    basePath: "/courier",
    items: [
      { label: "Shipment Tracking",       icon: Navigation,    to: "/courier/tracking" },
      { label: "Courier Dashboard",       icon: Gauge,         to: "/courier/dashboard" },
      { label: "Delayed Shipments",       icon: AlertTriangle, to: "/courier/delayed" },
      { label: "Failed Deliveries",       icon: XCircle,       to: "/courier/failed" },
      { label: "Courier Performance",     icon: BarChart2,     to: "/courier/performance" },
    ],
  },
  {
    type: "group",
    label: "Warehouse",
    icon: Warehouse,
    basePath: "/warehouse",
    items: [
      { label: "Packing Queue",           icon: ListOrdered,   to: "/warehouse/packing" },
      { label: "Dispatch Queue",          icon: SendHorizonal, to: "/warehouse/dispatch" },
      { label: "Ready To Ship",           icon: CheckCircle2,  to: "/warehouse/ready" },
      { label: "Fulfillment Checkpoints", icon: MapPin,        to: "/warehouse/checkpoints" },
      { label: "Employee Activity",       icon: UserCog,       to: "/warehouse/employees" },
    ],
  },
  {
    type: "group",
    label: "Automation",
    icon: Workflow,
    basePath: "/automation",
    items: [
      { label: "Workflow Rules",          icon: GitBranch,     to: "/automation/workflows" },
      { label: "SLA Monitoring",          icon: Timer,         to: "/automation/sla" },
      { label: "Task Assignment",         icon: ClipboardList, to: "/automation/tasks" },
      { label: "Escalation Rules",        icon: Siren,         to: "/automation/escalation" },
      { label: "Notification Triggers",   icon: Bell,          to: "/automation/triggers" },
    ],
  },
  {
    type: "group",
    label: "Communications",
    icon: MessageCircle,
    basePath: "/comms",
    items: [
      { label: "WhatsApp Logs",           icon: MessageSquare, to: "/comms/whatsapp" },
      { label: "Conversations",           icon: MessagesSquare,to: "/comms/conversations" },
      { label: "Internal Notes",          icon: StickyNote,    to: "/comms/notes" },
      { label: "Escalation Timeline",     icon: GitBranch,     to: "/comms/escalation" },
    ],
  },
  {
    type: "group",
    label: "Analytics",
    icon: BarChart3,
    basePath: "/analytics",
    items: [
      { label: "COD Loss Analytics",      icon: TrendingDown,  to: "/analytics/cod-loss" },
      { label: "Return Analytics",        icon: RotateCcw,     to: "/analytics/returns" },
      { label: "Courier Analytics",       icon: Truck,         to: "/analytics/courier" },
      { label: "Bottlenecks",             icon: Wrench,        to: "/analytics/bottlenecks" },
      { label: "Team Performance",        icon: Users2,        to: "/analytics/team" },
      { label: "Revenue Insights",        icon: BarChart2,     to: "/analytics/revenue" },
    ],
  },
  {
    type: "group",
    label: "Teams",
    icon: Users2,
    basePath: "/teams",
    items: [
      { label: "Team Members",            icon: Users,         to: "/teams/members" },
      { label: "Roles & Permissions",     icon: Shield,        to: "/teams/roles" },
      { label: "Audit Logs",              icon: ScrollText,    to: "/teams/audit" },
      { label: "Activity Logs",           icon: Activity,      to: "/teams/activity" },
    ],
  },
  {
    type: "group",
    label: "Integrations",
    icon: Link2,
    basePath: "/integrations",
    items: [
      { label: "Courier Integrations",    icon: Truck,         to: "/integrations/courier" },
      { label: "WhatsApp",                icon: MessageSquare, to: "/integrations/whatsapp" },
      { label: "API Keys",                icon: KeyRound,      to: "/integrations/api-keys" },
      { label: "Webhooks",                icon: Webhook,       to: "/integrations/webhooks" },
    ],
  },
  {
    type: "group",
    label: "Settings",
    icon: Settings,
    basePath: "/settings",
    items: [
      { label: "Store Settings",          icon: Settings,      to: "/settings/store" },
      { label: "Organization",            icon: Building2,     to: "/settings/org" },
      { label: "Notifications",           icon: BellDot,       to: "/settings/notifications" },
      { label: "Billing",                 icon: CreditCard,    to: "/settings/billing" },
      { label: "Profile Settings",        icon: UserCircle,    to: "/settings/profile" },
    ],
  },
];

function NavGroup({ group, isExpanded, onToggle }) {
  const location = useLocation();
  const isGroupActive = location.pathname.startsWith(group.basePath);
  const Icon = group.icon;

  return (
    <div>
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-150 group border text-left
          ${isGroupActive
            ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
            : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border-transparent"
          }
        `}
      >
        <Icon
          size={16}
          className={`flex-shrink-0 transition-colors ${
            isGroupActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
          }`}
        />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronRight
          size={12}
          className={`flex-shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          } ${isGroupActive ? "text-amber-400/50" : "text-slate-600"}`}
        />
      </button>

      {/* Sub-items with CSS height transition */}
      <div
        style={{
          maxHeight: isExpanded ? `${group.items.length * 40}px` : "0px",
          opacity: isExpanded ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.22s ease, opacity 0.18s ease",
        }}
      >
        <div className="ml-3.5 pl-3 mt-0.5 mb-1 border-l border-white/[0.07] space-y-0.5 py-0.5">
          {group.items.map(({ label, icon: SubIcon, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12px] font-medium transition-all duration-100 group/sub
                ${isActive
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <SubIcon
                    size={13}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? "text-amber-400" : "text-slate-600 group-hover/sub:text-slate-400"
                    }`}
                  />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  // Auto-open active group on mount
  const getDefaultOpen = () => {
    const set = new Set();
    navigation.forEach((item) => {
      if (item.type === "group" && location.pathname.startsWith(item.basePath)) {
        set.add(item.label);
      }
    });
    return set;
  };

  const [expanded, setExpanded] = useState(getDefaultOpen);

  const toggle = (label) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 z-40 flex flex-col
          bg-[#0d0f1a] border-r border-white/[0.06]
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-[18px] border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <Zap size={14} className="text-black fill-black" />
            </div>
            <span
              className="text-white font-bold text-base tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Zentro
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable nav area */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            if (item.type === "link") {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group border
                    ${isActive
                      ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border-transparent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={16}
                        className={`flex-shrink-0 ${
                          isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            }

            return (
              <NavGroup
                key={item.label}
                group={item}
                isExpanded={expanded.has(item.label)}
                onToggle={() => toggle(item.label)}
              />
            );
          })}
        </nav>

        {/* User card */}
        <div className="px-2 py-3 border-t border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:bg-white/[0.06] transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ring-2 ring-indigo-400/30">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-none mb-0.5">
                Alex Morgan
              </p>
              <p className="text-[10px] text-slate-500 truncate">admin@zentro.io</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
