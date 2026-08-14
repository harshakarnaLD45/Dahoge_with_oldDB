import { createContext, useContext, useState, useEffect } from "react";

import { getVenues } from "../services/database";
import {
  getSession,
  listReservations,
  getSetting,
  setSetting,
} from "../services/storage";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
};

export const AppProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [hostUnseen, setHostUnseen] = useState(0);

  const reload = async () => {
    setLoading(true);

    try {
      const data = await getVenues();

      if (Array.isArray(data)) {
        setLocations(data);
      } else {
        setLocations([]);
      }
    } catch (err) {
      //console.error("Failed to reload locations:", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();

        if (!session || !session.betriebId) {
          setHostUnseen(0);
          return;
        }

        const seen = await getSetting(`seen:${session.betriebId}`);

        const res = (await listReservations(session.betriebId)) || [];

        setHostUnseen(res.filter((r) => !seen || r.createdAt > seen).length);
      } catch (err) {
        console.warn("Could not calculate unseen host reservations:", err);
      }
    })();
  }, [locations]);

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const value = {
    locations,
    reload,
    showToast,
    toast,
    loading,
    hostUnseen,
    setHostUnseen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
