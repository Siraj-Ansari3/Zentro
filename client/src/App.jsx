import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar  from "./components/Navbar";
import AppRouter from "./router/index";
import Login from "./pages/auth/Login";
import "./App.css";
import StoreOnBoarding from "./pages/storeSecurity/StoreOnBoarding";
import StoreSelector from "./pages/storeSecurity/StoreSelector";
import { StoreProvider, useStore } from "./context/StoreContext";

// ─────────────────────────────────────────────────────────────
// LOADING SCREEN — shown while Firebase resolves session
// ─────────────────────────────────────────────────────────────
function FullscreenLoader() {
  return (
    <div className="min-h-screen bg-[#080a12] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30 animate-pulse">
          <svg viewBox="0 0 24 24" fill="black" className="w-5 h-5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PROTECTED LAYOUT — only renders if user is authenticated
// ─────────────────────────────────────────────────────────────
function ProtectedShell() {
  const { user, loading: authLoading } = useAuth();
  const { memberships, activeStore, loading: storeLoading } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading || storeLoading) {
    return <FullscreenLoader />;
  }

  // 1. NOT LOGGED IN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. LOGGED IN BUT NO STORE
  if (!memberships || memberships.length === 0) {
    return <StoreOnBoarding />;
  }

  // 3. LOGGED IN BUT NO ACTIVE STORE
  if (!activeStore) {
    return <StoreSelector />;
  }

  // 4. FULL APP ACCESS
  return (
    <div className="flex h-screen bg-[#0a0c14] overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <AppRouter />
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PUBLIC LOGIN ROUTE — redirects away if already logged in
// ─────────────────────────────────────────────────────────────
function PublicLoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullscreenLoader />;
  if (user)    return <Navigate to="/" replace />;
  return <Login />;
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            <Route path="/login" element={<PublicLoginRoute />} />
            <Route path="/*" element={<ProtectedShell />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}