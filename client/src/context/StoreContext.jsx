import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // NEW: Filter only approved stores (created or joined)
  // ─────────────────────────────────────────────────────────────
  const availableStores = memberships.filter((m) => m.status === "approved");
  
  console.log("available stores:", availableStores)
  // ─────────────────────────────────────────────────────────────
  // NEW: Selector function to switch active store safely
  // ─────────────────────────────────────────────────────────────
  const switchStore = (storeId) => {
    const storeToSelect = availableStores.find((m) => m.storeId === storeId);
    if (storeToSelect) {
      setActiveStore(storeToSelect);
    } else {
      console.warn(`Store with ID ${storeId} not found or not approved.`);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchStores = async () => {
      try {
        const res = await api.get("/auth/bootstrap");
        setMemberships(res.data.memberships || []);

        // auto-select first approved store
        const approved = res.data.memberships.find(
          (m) => m.status === "approved"
        );

        if (approved) {
          console.log("Auto-selecting approved store:", approved);
          setActiveStore(approved);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [user]);

  return (
    <StoreContext.Provider value={{
      memberships,
      availableStores, // Export the filtered list
      activeStore,
      setActiveStore,
      switchStore,     // Export the selector function
      loading
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);