import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { seedIfEmpty, verifyLogin, getUserById } from "../lib/localAuth.js";

const AuthContext = createContext(null);

const SESSION_KEY = "iphonizate-session";
const TIMEOUT_KEY = "iphonizate-session-timeout";
const DEFAULT_TIMEOUT_MINUTES = 30; // 0 = nunca
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
const CHECK_INTERVAL_MS = 15000;

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readStoredTimeout() {
  try {
    const raw = window.localStorage.getItem(TIMEOUT_KEY);
    const n = raw === null ? DEFAULT_TIMEOUT_MINUTES : Number(raw);
    return Number.isFinite(n) ? n : DEFAULT_TIMEOUT_MINUTES;
  } catch {
    return DEFAULT_TIMEOUT_MINUTES;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutesState] = useState(readStoredTimeout);
  const lastActivityRef = useRef(Date.now());

  // Al cargar: crea el usuario inicial si hace falta y restaura la sesión
  // guardada, revalidando que el usuario siga existiendo (por si lo borraron).
  useEffect(() => {
    (async () => {
      await seedIfEmpty();
      const stored = readStoredSession();
      if (stored?.userId) {
        const user = getUserById(stored.userId);
        if (user) setSession(user);
        else window.localStorage.removeItem(SESSION_KEY);
      }
      setChecking(false);
    })();
  }, []);

  const login = async (usuario, pin) => {
    const res = await verifyLogin(usuario, pin);
    if (!res.ok) return { ok: false, error: res.error };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: res.user.id }));
    setSession(res.user);
    lastActivityRef.current = Date.now();
    return { ok: true };
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  const setSessionTimeoutMinutes = (minutes) => {
    const n = Number(minutes) || 0;
    setSessionTimeoutMinutesState(n);
    window.localStorage.setItem(TIMEOUT_KEY, String(n));
  };

  // Cierre de sesión automático por inactividad. Solo corre mientras hay
  // sesión activa y el usuario no eligió "Nunca" (0).
  useEffect(() => {
    if (!session || !sessionTimeoutMinutes) return;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, markActivity, { passive: true }));
    markActivity();

    const intervalId = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= sessionTimeoutMinutes * 60 * 1000) {
        logout();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActivity));
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionTimeoutMinutes]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        login,
        logout,
        checking,
        sessionTimeoutMinutes,
        setSessionTimeoutMinutes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
  return ctx;
}
