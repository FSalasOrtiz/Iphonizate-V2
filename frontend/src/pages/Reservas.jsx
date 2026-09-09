import React, { useState } from "react";
import { Search, Plus, X, Trash2 } from "lucide-react";
import { Card, Empty, Badge } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtMoney, fmtDateShort } from "../lib/helpers";

export default function Reservas() {
  const { data, patch, activeTienda, addAudit } = useApp();
  const [query, setQuery] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [clienteQuery, setClienteQuery] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [abono, setAbono] = useState(0);

  const equiposDisp = data.equipos.filter(
    (e) => e.ubicacion === activeTienda && e.estado === "disponible" && !carrito.includes(e.id) &&
      (query === "" || e.modelo.toLowerCase().includes(query.toLowerCase()) || e.imei.includes(query))
  );
  const equiposEnCarrito = data.equipos.filter((e) => carrito.includes(e.id));
  const total = equiposEnCarrito.reduce((s, e) => s + e.precio, 0);
  const saldo = Math.max(0, total - (Number(abono) || 0));

  const clientesFiltrados = clienteQuery.length > 0
    ? data.clientes.filter((c) => c.nombre.toLowerCase().includes(clienteQuery.toLowerCase()) || c.telefono.includes(clienteQuery))
    : [];

  const reservasActivas = data.reservas.filter((r) => r.estado === "activa" && r.tienda === activeTienda);
  const historial = data.reservas.filter((r) => r.estado !== "activa" && r.tienda === activeTienda);

  const cobrar = () => {
    const r = {
      id: uid(), fecha: new Date().toISOString(), tienda: activeTienda, clienteId: clienteSel?.id,
      clienteNombre: clienteSel?.nombre, equipoIds: [...carrito], total, abono: Number(abono) || 0, saldo, estado: "activa",
    };
    patch("reservas", (arr) => [r, ...arr]);
    patch("equipos", (arr) => arr.map((e) => (carrito.includes(e.id) ? { ...e, estado: "reservado" } : e)));
    addAudit("Creó una reserva", `${equiposEnCarrito.length} equipo(s) · abono ${fmtMoney(abono)}`, activeTienda);
    setCarrito([]); setClienteSel(null); setAbono(0);
  };

  const completar = (r) => {
    const venta = {
      id: uid(), fecha: new Date().toISOString(), tienda: r.tienda, clienteId: r.clienteId, clienteNombre: r.clienteNombre,
      equipoIds: r.equipoIds, accesorios: [], subtotalEquipos: r.total, subtotalAcc: 0, total: r.total,
      margen: data.equipos.filter((e) => r.equipoIds.includes(e.id)).reduce((s, e) => s + (e.precio - e.costo), 0),
      conBoleta: true, metodoPago: "Efectivo", reviewStatus: "pendiente",
    };
    patch("ventas", (arr) => [venta, ...arr]);
    patch("equipos", (arr) => arr.map((e) => (r.equipoIds.includes(e.id) ? { ...e, estado: "vendido" } : e)));
    patch("reservas", (arr) => arr.map((x) => (x.id === r.id ? { ...x, estado: "completada" } : x)));
    addAudit("Completó una reserva", `Reserva de ${r.clienteNombre || "cliente"} pasó a venta`, r.tienda);
  };

  const cancelar = (r) => {
    patch("equipos", (arr) => arr.map((e) => (r.equipoIds.includes(e.id) ? { ...e, estado: "disponible" } : e)));
    patch("reservas", (arr) => arr.map((x) => (x.id === r.id ? { ...x, estado: "cancelada" } : x)));
    addAudit("Canceló una reserva", `Reserva de ${r.clienteNombre || "cliente"}`, activeTienda);
  };

  return (
    <>
      <h1 className="h1">Reservas</h1>
      <div className="h1-sub">Equipos apartados con abono en {activeTienda} · no cuentan como venta hasta completarse</div>

      <Card>
        <div className="search-row"><Search size={16} /><input className="search-input" placeholder="Buscar por modelo o IMEI…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <div className="table-caption">EQUIPOS DISPONIBLES EN {activeTienda.toUpperCase()}</div>
          {equiposDisp.length === 0 ? <Empty title="No hay equipos disponibles en esta tienda." /> : (
            <table className="table">
              <thead><tr><th>Modelo</th><th>GB</th><th>Color</th><th>IMEI</th><th></th></tr></thead>
              <tbody>
                {equiposDisp.map((e) => (
                  <tr key={e.id} className="clickable" onClick={() => setCarrito((c) => [...c, e.id])}>
                    <td>{e.modelo}</td><td>{e.gb}</td><td>{e.color}</td><td>{e.imei}</td>
                    <td><button className="btn-icon"><Plus size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card title="Nueva reserva">
        <div className="field-label">CLIENTE (OBLIGATORIO)</div>
        {clienteSel ? (
          <div className="selected-pill">{clienteSel.nombre} — {clienteSel.telefono}<button className="btn-icon" onClick={() => setClienteSel(null)}><X size={14} /></button></div>
        ) : (
          <>
            <input className="input" placeholder="Nombre o teléfono" value={clienteQuery} onChange={(e) => setClienteQuery(e.target.value)} />
            {clienteQuery && (
              clientesFiltrados.length > 0 ? (
                <div className="dropdown-list">
                  {clientesFiltrados.map((c) => (
                    <button key={c.id} className="dropdown-item" onClick={() => { setClienteSel(c); setClienteQuery(""); }}>{c.nombre} — {c.telefono}</button>
                  ))}
                </div>
              ) : (
                <button className="btn btn-secondary" style={{ marginTop: 6 }} onClick={() => {
                  const c = { id: uid(), nombre: clienteQuery, telefono: "" };
                  patch("clientes", (arr) => [c, ...arr]);
                  setClienteSel(c); setClienteQuery("");
                }}>+ Crear cliente "{clienteQuery}"</button>
              )
            )}
          </>
        )}

        {carrito.length === 0 ? <div className="dashed-box">Escanea o agrega los equipos y accesorios a apartar.</div> : (
          <div className="cart-list">
            {equiposEnCarrito.map((e) => (
              <div key={e.id} className="cart-row">
                <span>{e.modelo} · {e.imei}</span><span>{fmtMoney(e.precio)}</span>
                <button className="btn-icon" onClick={() => setCarrito((c) => c.filter((id) => id !== e.id))}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}

        <div className="totals">
          <div className="totals-row"><span>Total</span><span>{fmtMoney(total)}</span></div>
          <div className="field-label" style={{ marginTop: 8 }}>ABONO</div>
          <input className="input" type="number" min="0" value={abono} onChange={(e) => setAbono(e.target.value)} />
          <div className="totals-row" style={{ marginTop: 6 }}><span>Saldo pendiente</span><span>{fmtMoney(saldo)}</span></div>
        </div>

        <button className="btn btn-primary btn-block" disabled={carrito.length === 0 || !clienteSel} onClick={cobrar}>Cobrar el abono</button>
      </Card>

      <Card title="Reservas activas">
        {reservasActivas.length === 0 ? <Empty title="No hay reservas activas." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Cliente</th><th>Equipos</th><th>Total</th><th>Abono</th><th>Saldo</th><th></th></tr></thead>
              <tbody>
                {reservasActivas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.clienteNombre}</td><td>{r.equipoIds.length}</td><td>{fmtMoney(r.total)}</td><td>{fmtMoney(r.abono)}</td><td>{fmtMoney(r.saldo)}</td>
                    <td className="row-actions"><button className="btn btn-secondary" onClick={() => completar(r)}>Completar</button><button className="btn btn-ghost" onClick={() => cancelar(r)}>Cancelar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Historial">
        {historial.length === 0 ? <Empty title="Todavía no hay reservas cerradas." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Cliente</th><th>Tienda</th><th>Equipos</th><th>Total</th><th>Abono</th><th>Estado</th></tr></thead>
              <tbody>
                {historial.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDateShort(r.fecha)}</td><td>{r.clienteNombre}</td><td>{r.tienda}</td><td>{r.equipoIds.length}</td><td>{fmtMoney(r.total)}</td><td>{fmtMoney(r.abono)}</td>
                    <td><Badge tone={r.estado === "completada" ? "green" : "red"}>{r.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
