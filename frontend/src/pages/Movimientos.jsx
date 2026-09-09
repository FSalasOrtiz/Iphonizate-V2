import React, { useState } from "react";
import { ScanLine, Trash2 } from "lucide-react";
import { Card, Empty } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtDateShort } from "../lib/helpers";
import { TIENDAS } from "../lib/constants";

export default function Movimientos() {
  const { data, patch, addAudit, session } = useApp();
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [imei, setImei] = useState("");
  const [pendientes, setPendientes] = useState([]);
  const [filterTienda, setFilterTienda] = useState("Todas");

  const agregarImei = () => {
    const eq = data.equipos.find((e) => e.imei === imei.trim());
    if (!eq) return;
    if (!pendientes.find((p) => p.id === eq.id)) setPendientes((p) => [...p, eq]);
    setImei("");
  };

  const confirmar = () => {
    if (!origen || !destino || origen === destino || pendientes.length === 0) return;
    const ids = pendientes.map((p) => p.id);
    patch("equipos", (arr) => arr.map((e) => (ids.includes(e.id) ? { ...e, ubicacion: destino } : e)));
    patch("movimientos", (arr) => [
      ...pendientes.map((p) => ({ id: uid(), equipo: `${p.modelo} · ${p.imei}`, desde: origen, hacia: destino, fecha: new Date().toISOString(), quien: session?.nombre || "—" })),
      ...arr,
    ]);
    addAudit("Trasladó equipos", `${pendientes.length} equipo(s) de ${origen} a ${destino}`);
    setPendientes([]); setOrigen(""); setDestino("");
  };

  const historial = data.movimientos.filter((m) => filterTienda === "Todas" || m.desde === filterTienda || m.hacia === filterTienda);

  return (
    <>
      <h1 className="h1">Movimientos</h1>
      <div className="h1-sub">Traslados entre tiendas y bodega, con trazabilidad por equipo.</div>
      <Card title="Trasladar equipos" right={<button className="btn btn-secondary" onClick={() => setDestino("Bodega central")}>Devolver a bodega</button>}>
        <div className="inline-form-grid" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
          <select className="select" value={origen} onChange={(e) => setOrigen(e.target.value)}>
            <option value="">Selecciona…</option>
            {TIENDAS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <span className="arrow">→</span>
          <select className="select" value={destino} onChange={(e) => setDestino(e.target.value)}>
            <option value="">Selecciona…</option>
            {TIENDAS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="search-row" style={{ marginTop: 10 }}>
          <ScanLine size={16} />
          <input className="search-input" placeholder="IMEI del equipo a trasladar" value={imei} onChange={(e) => setImei(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agregarImei()} />
          <button className="btn btn-primary" onClick={agregarImei}>Agregar</button>
        </div>
        {pendientes.length > 0 && (
          <div className="cart-list">
            {pendientes.map((p) => (
              <div key={p.id} className="cart-row"><span>{p.modelo} · {p.imei}</span><button className="btn-icon" onClick={() => setPendientes((arr) => arr.filter((x) => x.id !== p.id))}><Trash2 size={14} /></button></div>
            ))}
          </div>
        )}
        {origen && destino && origen === destino && (
          <div className="warn-text" style={{ marginTop: 8 }}>El origen y el destino no pueden ser la misma tienda.</div>
        )}
        <button className="btn btn-primary btn-block" disabled={!origen || !destino || origen === destino || pendientes.length === 0} onClick={confirmar}>Confirmar traslado de {pendientes.length} equipos</button>
      </Card>

      <Card title="Historial de movimientos">
        <div className="chip-row">
          <span className="field-label">TIENDA</span>
          <select className="select-inline" value={filterTienda} onChange={(e) => setFilterTienda(e.target.value)}>
            <option>Todas</option>
            {TIENDAS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        {historial.length === 0 ? <Empty title="Todavía no hay movimientos registrados con ese filtro." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Equipo</th><th>Desde</th><th>Hacia</th><th>Quién lo movió</th></tr></thead>
              <tbody>{historial.map((m) => (<tr key={m.id}><td>{fmtDateShort(m.fecha)}</td><td>{m.equipo}</td><td>{m.desde}</td><td>{m.hacia}</td><td>{m.quien}</td></tr>))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
