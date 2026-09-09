import React, { useState } from "react";
import { Check, LogOut } from "lucide-react";
import { Card, Empty, Badge } from "../components/ui";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { uid } from "../lib/helpers";
import { TIENDAS, SESSION_TIMEOUT_OPTIONS } from "../lib/constants";

export default function Configuracion() {
  const { data, patch } = useApp();
  const { session, logout, sessionTimeoutMinutes, setSessionTimeoutMinutes } = useAuth();
  const { themeId, setThemeId, themes } = useTheme();
  const [nombre, setNombre] = useState("");
  const [tienda, setTienda] = useState("");
  const [key, setKey] = useState(null);

  const generarClave = () => setKey(uid() + uid());

  const agregarMac = () => {
    if (!nombre || !tienda) return;
    patch("macs", (arr) => [...arr, { id: uid(), nombre, tienda, estado: "Pendiente", ultimoLatido: "—", version: "—" }]);
    setNombre(""); setTienda("");
  };

  return (
    <>
      <h1 className="h1">Configuración</h1>
      <div className="h1-sub">Tu sesión, la apariencia de la app y los lectores por USB.</div>

      <Card title="Sesión" subtitle={`Conectado como ${session?.nombre} · ${session?.rol}`}>
        <div className="session-row">
          <div>
            <div className="field-label">CERRAR SESIÓN AUTOMÁTICAMENTE TRAS INACTIVIDAD</div>
            <select
              className="select"
              style={{ marginTop: 6, width: 220 }}
              value={sessionTimeoutMinutes}
              onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
            >
              {SESSION_TIMEOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={logout}>
            <LogOut size={14} /> Cerrar sesión ahora
          </button>
        </div>
      </Card>

      <Card title="Apariencia" subtitle="Cambia entre modo claro y oscuro.">
        <div className="theme-grid">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-swatch ${themeId === t.id ? "theme-swatch-active" : ""}`}
              onClick={() => setThemeId(t.id)}
              title={t.label}
            >
              <span
                className="theme-swatch-dot"
                style={{ background: t.colors.bgElev, color: t.colors.pink }}
              >
                {themeId === t.id && <Check size={16} />}
              </span>
              <span className="theme-swatch-label">{t.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Macs lectores (lectura por USB)" subtitle="Los Mac del mostrador con el lector instalado leen el iPhone conectado y llenan el ingreso solo.">
        <div className="inline-form-grid">
          <input className="input" placeholder="ej: Mostrador 1" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <select className="select" value={tienda} onChange={(e) => setTienda(e.target.value)}><option value="">Selecciona…</option>{TIENDAS.map((t) => <option key={t}>{t}</option>)}</select>
          <button className="btn btn-primary" onClick={agregarMac}>Agregar Mac</button>
        </div>
        {data.macs.length === 0 ? <Empty title="Todavía no hay ningún Mac con lector registrado." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Mac</th><th>Tienda</th><th>Estado</th><th>Último latido</th><th>Versión</th></tr></thead>
              <tbody>{data.macs.map((m) => (<tr key={m.id}><td>{m.nombre}</td><td>{m.tienda}</td><td><Badge tone="yellow">{m.estado}</Badge></td><td>{m.ultimoLatido}</td><td>{m.version}</td></tr>))}</tbody>
            </table>
          </div>
        )}
        <div className="install-steps">
          <div className="table-caption">CÓMO INSTALAR EL LECTOR EN UN MAC</div>
          <ol className="steps-list">
            <li><b>Genera la clave de la tienda.</b> Botón "Generar clave" abajo. Cópiala antes de empezar porque se muestra una sola vez.</li>
            <li><b>Abre la Terminal del Mac.</b> Aprieta <code>Cmd + Espacio</code>, escribe Terminal y aprieta Enter.</li>
            <li><b>Pega la clave de la tienda cuando la pida.</b> El instalador la compara con el servidor.</li>
            <li><b>Espera a que diga "✓ Listo".</b> Deja la Terminal abierta hasta que termine.</li>
            <li><b>Conecta el iPhone.</b> Confía en el equipo desde la pantalla del iPhone.</li>
          </ol>
          <button className="btn btn-secondary" onClick={generarClave}>Generar clave</button>
          {key && <div className="key-box">{key} <span className="stat-sub">(cópiala ahora, no se vuelve a mostrar)</span></div>}
        </div>
      </Card>
    </>
  );
}
