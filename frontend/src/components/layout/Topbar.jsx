import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, LogOut, Menu } from "lucide-react";
import { TIENDAS, TIENDA_COLOR, PAGE_META } from "../../lib/constants";
import { fmtDateLong } from "../../lib/helpers";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ section, onOpenSidebar }) {
  const { activeTienda, setActiveTienda } = useApp();
  const { session, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [title, subtitle] = PAGE_META[section];
  const menuRef = useRef(null);

  // Cierra el menú desplegado al hacer clic afuera o al presionar Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={onOpenSidebar}>
          <Menu size={18} />
        </button>
        <div>
          <div className="page-title">{title}</div>
          <div className="page-subtitle">
            {fmtDateLong(new Date())}
            {subtitle ? ` · ${subtitle}` : ""}
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="store-switch" ref={menuRef}>
          <button className="store-pill" onClick={() => setMenuOpen((v) => !v)}>
            <span className="dot" style={{ background: TIENDA_COLOR[activeTienda] }} />
            {activeTienda}
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="store-menu">
              {TIENDAS.map((t) => (
                <button
                  key={t}
                  className="store-menu-item"
                  onClick={() => {
                    setActiveTienda(t);
                    setMenuOpen(false);
                  }}
                >
                  <span className="dot" style={{ background: TIENDA_COLOR[t] }} />
                  {t}
                  {t === activeTienda && <Check size={14} />}
                </button>
              ))}
              <div className="store-menu-divider" />
              <div className="store-menu-user">
                <div className="avatar">{session?.nombre?.[0] || "?"}</div>
                <div>
                  <div className="user-name">{session?.nombre}</div>
                  <div className="user-role">{session?.rol}</div>
                </div>
              </div>
              <button
                className="store-menu-logout"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
