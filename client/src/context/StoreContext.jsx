import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStores = async () => {
      try {
        const res = await api.get("/auth/bootstrap");
        console.log(res.data);

        setMemberships(res.data.memberships || []);

        // auto-select first approved store
        const approved = res.data.memberships.find(
          m => m.status === "approved"
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
      activeStore,
      setActiveStore,
      loading
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);