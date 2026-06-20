import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AllOrders from "../pages/orders/AllOrders";
import Customers from "../pages/customers/CustomerProfiles";
import CourierDashboard from "../pages/courier/CourierDashboard";
import CourierPerformance from "../pages/courier/CourierPerformance";
import CourierIntegration from "../pages/integrations/CourierIntegration";
import JoinRequests from "../pages/teams/joinRequests";
import ProfilePage from "../pages/profile/ProfilePage";
import StoreOnboarding from "../pages/storeSecurity/StoreOnBoarding";
import PackingQueue from "../pages/warehouse/PackingQueue";
import DispatchQueue from "../pages/warehouse/DispatchQueue";
import ReadyToShip from "../pages/warehouse/ReadyToShip";
import InternalNotesPage from "../pages/communications/InternalNotesPage";

function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6">
      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
        {title}
      </h2>
      <p className="text-sm text-slate-500">This page is under construction.</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<Dashboard />} />


      {/* Orders */}
      <Route path="/orders/all" element={<AllOrders />} />
      <Route path="/orders/pending" element={<Placeholder title="Pending Verification" />} />
      <Route path="/orders/packed" element={<Placeholder title="Packed Orders" />} />
      <Route path="/orders/shipped" element={<Placeholder title="Shipped Orders" />} />
      <Route path="/orders/failed" element={<Placeholder title="Failed Deliveries" />} />
      <Route path="/orders/returns" element={<Placeholder title="Returns & Exchanges" />} />

      {/* Customers */}
      <Route path="/customers/profiles" element={<Customers />} />
      <Route path="/customers/risk" element={<Placeholder title="Risk Profiles" />} />
      <Route path="/customers/blacklisted" element={<Placeholder title="Blacklisted Customers" />} />
      <Route path="/customers/cod-rejectors" element={<Placeholder title="Repeat COD Rejectors" />} />
      <Route path="/customers/timeline" element={<Placeholder title="Customer Timeline" />} />

      {/* Courier Operations */}
      <Route path="/courier/tracking" element={<Placeholder title="Shipment Tracking" />} />
      <Route path="/courier/dashboard" element={<CourierDashboard />} />
      <Route path="/courier/delayed" element={<Placeholder title="Delayed Shipments" />} />
      <Route path="/courier/failed" element={<Placeholder title="Failed Deliveries" />} />
      <Route path="/courier/performance" element={<CourierPerformance />} />

      {/* Warehouse */}
      <Route path="/warehouse/packing" element={<PackingQueue/>} />
      <Route path="/warehouse/dispatch" element={<DispatchQueue/>} />
      <Route path="/warehouse/ready" element={<ReadyToShip/>} />
      <Route path="/warehouse/checkpoints" element={<Placeholder title="Fulfillment Checkpoints" />} />
      <Route path="/warehouse/employees" element={<Placeholder title="Employee Activity" />} />

      {/* Automation */}
      <Route path="/automation/workflows" element={<Placeholder title="Workflow Rules" />} />
      <Route path="/automation/sla" element={<Placeholder title="SLA Monitoring" />} />
      <Route path="/automation/tasks" element={<Placeholder title="Task Assignment" />} />
      <Route path="/automation/escalation" element={<Placeholder title="Escalation Rules" />} />
      <Route path="/automation/triggers" element={<Placeholder title="Notification Triggers" />} />

      {/* Communications */}
      <Route path="/comms/whatsapp" element={<Placeholder title="WhatsApp Logs" />} />
      <Route path="/comms/conversations" element={<Placeholder title="Customer Conversations" />} />
      <Route path="/comms/notes" element={<InternalNotesPage/>} />
      <Route path="/comms/escalation" element={<Placeholder title="Escalation Timeline" />} />

      {/* Analytics */}
      <Route path="/analytics/cod-loss" element={<Placeholder title="COD Loss Analytics" />} />
      <Route path="/analytics/returns" element={<Placeholder title="Return Analytics" />} />
      <Route path="/analytics/courier" element={<Placeholder title="Courier Analytics" />} />
      <Route path="/analytics/bottlenecks" element={<Placeholder title="Operational Bottlenecks" />} />
      <Route path="/analytics/team" element={<Placeholder title="Team Performance" />} />
      <Route path="/analytics/revenue" element={<Placeholder title="Revenue Insights" />} />

      {/* Teams */}
      <Route path="/teams/members" element={<Placeholder title="Team Members" />} />
      <Route path="/teams/roles" element={<Placeholder title="Roles & Permissions" />} />
      <Route path="/teams/join-requests" element={<JoinRequests />} />
      <Route path="/teams/audit" element={<Placeholder title="Audit Logs" />} />
      <Route path="/teams/activity" element={<Placeholder title="Activity Logs" />} />

      {/* Integrations */}
      <Route path="/integrations/courier" element={<CourierIntegration />} />
      <Route path="/integrations/whatsapp" element={<Placeholder title="WhatsApp Integration" />} />
      <Route path="/integrations/api-keys" element={<Placeholder title="API Keys" />} />
      <Route path="/integrations/webhooks" element={<Placeholder title="Webhooks" />} />

      {/* Settings */}
      <Route path="/settings/store" element={<Placeholder title="Store Settings" />} />
      <Route path="/settings/org" element={<Placeholder title="Organization Settings" />} />
      <Route path="/settings/notifications" element={<Placeholder title="Notification Settings" />} />
      <Route path="/settings/billing" element={<Placeholder title="Billing" />} />
      <Route path="/settings/profile" element={<ProfilePage />} />

      <Route path="/store-onboarding" element={<StoreOnboarding />} />

      {/* Fallback */}
      <Route path="*" element={<Placeholder title="404 — Not Found" />} />
    </Routes>
  );
}