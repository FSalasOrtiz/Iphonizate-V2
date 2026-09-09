import React from "react";
import { NAV } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ section, onNavigate, open, onClose }) {
  const { session } = useAuth();

  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-badge">i</div>
          <div className="brand-name">
            iPhonizate <span>OS</span>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((group, gi) => {
            const items = group.items.filter((item) => !item.roles || item.roles.includes(session?.rol));
            if (items.length === 0) return null;
            return (
              <div key={gi} className="nav-group">
                {group.group && <div className="nav-group-label">{group.group}</div>}
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${section === item.id ? "nav-item-active" : ""}`}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
