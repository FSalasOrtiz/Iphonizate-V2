import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { emptyData, uid } from "../lib/helpers";
import { loadData, saveData } from "../lib/storage";
import { TIENDAS } from "../lib/constants";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTienda, setActiveTienda] = useState(TIENDAS[0]);
  const saveTimer = useRef(null);

  // Carga inicial desde el almacenamiento local.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadData();
      if (cancelled) return;
      setData(stored ? { ...emptyData(), ...stored } : emptyData());
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Guarda con un pequeño debounce para no escribir en cada tecla.
  useEffect(() => {
    if (!loaded || !data) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveData(data);
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [data, loaded]);

  const patch = (key, updater) =>
    setData((prev) => ({
      ...prev,
      [key]: typeof updater === "function" ? updater(prev[key]) : updater,
    }));

  const addAudit = (accion, detalle, tienda) => {
    patch("auditoria", (arr) => [
      {
        id: uid(),
        fecha: new Date().toISOString(),
        usuario: session?.nombre || "Sistema",
        rol: session?.rol || "—",
        tienda: tienda || activeTienda,
        accion,
        detalle,
      },
      ...arr,
    ]);
  };

  const value = { data, patch, addAudit, loaded, activeTienda, setActiveTienda, session };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() debe usarse dentro de <AppProvider>");
  return ctx;
}
