import React, { useEffect, useState } from "react";
import { Search, Plus, X, Users, Trash2 } from "lucide-react";
import { Card, Empty, Chip } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtMoney } from "../lib/helpers";
import { METODOS_PAGO } from "../lib/constants";

export default function Vender() {
  const { data, patch, activeTienda, addAudit } = useApp();
  const [tab, setTab] = useState("equipos");
  const [query, setQuery] = useState("");
  const [carritoEquipos, setCarritoEquipos] = useState([]);
  const [carritoAcc, setCarritoAcc] = useState([]);
  const [clienteQuery, setClienteQuery] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [nuevoClienteMode, setNuevoClienteMode] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "" });
  const [conBoleta, setConBoleta] = useState(false);
  const [metodoPago, setMetodoPago] = useState(METODOS_PAGO[0]);
  const [flash, setFlash] = useState("");

  // El aviso de "venta registrada" desaparece apenas se arma una venta nueva.
  useEffect(() => {
    if (carritoEquipos.length || carritoAcc.length) setFlash("");
  }, [carritoEquipos, carritoAcc]);

  const equiposDisp = data.equipos.filter(
    (e) =>
      e.ubicacion === activeTienda &&
      e.estado === "disponible" &&
      !carritoEquipos.includes(e.id) &&
      (query === "" || e.modelo.toLowerCase().includes(query.toLowerCase()) || e.imei.includes(query))
  );
  const accDisp = data.accesorios.filter(
    (a) => (a.stock?.[activeTienda] || 0) > 0 && (query === "" || a.nombre.toLowerCase().includes(query.toLowerCase()))
  );

  const clientesFiltrados =
    clienteQuery.length > 0
      ? data.clientes.filter((c) => c.nombre.toLowerCase().includes(clienteQuery.toLowerCase()) || c.telefono.includes(clienteQuery))
      : [];

  const equiposEnCarrito = data.equipos.filter((e) => carritoEquipos.includes(e.id));
  const subtotalEquipos = equiposEnCarrito.reduce((s, e) => s + e.precio, 0);
  const subtotalAcc = carritoAcc.reduce((s, c) => {
    const a = data.accesorios.find((x) => x.id === c.id);
    return s + (a ? a.precio * c.qty : 0);
  }, 0);
  const total = subtotalEquipos + subtotalAcc;
  const margen =
    equiposEnCarrito.reduce((s, e) => s + (e.precio - e.costo), 0) +
    carritoAcc.reduce((s, c) => {
      const a = data.accesorios.find((x) => x.id === c.id);
      return s + (a ? (a.precio - a.costo) * c.qty : 0);
    }, 0);

  const canSell = carritoEquipos.length + carritoAcc.length > 0;

  const confirmar = () => {
    const clienteId = clienteSel?.id || null;
    const clienteNombre = clienteSel?.nombre || null;
    const venta = {
      id: uid(), fecha: new Date().toISOString(), tienda: activeTienda, clienteId, clienteNombre,
      equipoIds: [...carritoEquipos], accesorios: carritoAcc.map((c) => ({ ...c })),
      subtotalEquipos, subtotalAcc, total, margen, conBoleta, metodoPago, reviewStatus: "pendiente",
    };
    patch("ventas", (arr) => [venta, ...arr]);
    patch("equipos", (arr) => arr.map((e) => (carritoEquipos.includes(e.id) ? { ...e, estado: "vendido" } : e)));
    patch("accesorios", (arr) =>
      arr.map((a) => {
        const c = carritoAcc.find((x) => x.id === a.id);
        if (!c) return a;
        return { ...a, stock: { ...a.stock, [activeTienda]: (a.stock[activeTienda] || 0) - c.qty } };
      })
    );
    addAudit("Registró una venta", `${equiposEnCarrito.length} equipo(s) · ${fmtMoney(total)}`, activeTienda);
    setFlash(`Venta registrada · ${fmtMoney(total)}. Queda pendiente de revisión de pagos.`);
    setCarritoEquipos([]); setCarritoAcc([]); setClienteSel(null); setConBoleta(false); setQuery("");
    setMetodoPago(METODOS_PAGO[0]);
  };

  return (
    <>
      <h1 className="h1">Vender</h1>
      <div className="h1-sub">Venta en {activeTienda} · solo equipos disponibles en esta tienda</div>

      <Card>
        <div className="search-row">
          <Search size={16} />
          <input className="search-input" placeholder="Buscar por modelo o IMEI…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="chip-row">
          <Chip active={tab === "equipos"} onClick={() => setTab("equipos")}>Equipos</Chip>
          <Chip active={tab === "accesorios"} onClick={() => setTab("accesorios")}>Accesorios</Chip>
        </div>

        {tab === "equipos" ? (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <div className="table-caption">EQUIPOS DISPONIBLES EN {activeTienda.toUpperCase()}</div>
            {equiposDisp.length === 0 ? (
              <Empty title="No hay equipos disponibles en esta tienda." />
            ) : (
              <table className="table">
                <thead><tr><th>Modelo</th><th>GB</th><th>Color</th><th>Batería %</th><th>IMEI</th><th></th></tr></thead>
                <tbody>
                  {equiposDisp.map((e) => (
                    <tr key={e.id} className="clickable" onClick={() => setCarritoEquipos((c) => [...c, e.id])}>
                      <td>{e.modelo}</td><td>{e.gb}</td><td>{e.color}</td><td>{e.bateria}%</td><td>{e.imei}</td>
                      <td><button className="btn-icon"><Plus size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            {accDisp.length === 0 ? (
              <Empty title="No hay accesorios con stock en esta tienda." />
            ) : (
              <table className="table">
                <thead><tr><th>Nombre</th><th>Categoría</th><th>Stock</th><th>Precio</th><th></th></tr></thead>
                <tbody>
                  {accDisp.map((a) => (
                    <tr key={a.id} className="clickable" onClick={() =>
                      setCarritoAcc((c) => {
                        const ex = c.find((x) => x.id === a.id);
                        if (ex) return c.map((x) => (x.id === a.id ? { ...x, qty: x.qty + 1 } : x));
                        return [...c, { id: a.id, qty: 1 }];
                      })
                    }>
                      <td>{a.nombre}</td><td>{a.categoria}</td><td>{a.stock[activeTienda] || 0}</td><td>{fmtMoney(a.precio)}</td>
                      <td><button className="btn-icon"><Plus size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      <Card title="La venta">
        <div className="field-label" style={{ marginBottom: 4 }}>CLIENTE</div>
        {clienteSel ? (
          <div className="selected-pill">
            {clienteSel.nombre} — {clienteSel.telefono}
            <button className="btn-icon" onClick={() => setClienteSel(null)}><X size={14} /></button>
          </div>
        ) : nuevoClienteMode ? (
          <div className="inline-form">
            <input className="input" placeholder="Nombre" value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente((c) => ({ ...c, nombre: e.target.value }))} />
            <input className="input" placeholder="Teléfono" value={nuevoCliente.telefono} onChange={(e) => setNuevoCliente((c) => ({ ...c, telefono: e.target.value }))} />
            <button
              className="btn btn-primary"
              disabled={!nuevoCliente.nombre}
              onClick={() => {
                const c = { id: uid(), nombre: nuevoCliente.nombre, telefono: nuevoCliente.telefono };
                patch("clientes", (arr) => [c, ...arr]);
                setClienteSel(c); setNuevoClienteMode(false); setNuevoCliente({ nombre: "", telefono: "" });
              }}
            >
              Guardar
            </button>
            <button className="btn btn-ghost" onClick={() => setNuevoClienteMode(false)}>Cancelar</button>
          </div>
        ) : (
          <>
            <div className="search-row">
              <Search size={16} />
              <input className="search-input" placeholder="Buscar por nombre o teléfono" value={clienteQuery} onChange={(e) => setClienteQuery(e.target.value)} />
            </div>
            {clienteQuery && clientesFiltrados.length > 0 && (
              <div className="dropdown-list">
                {clientesFiltrados.map((c) => (
                  <button key={c.id} className="dropdown-item" onClick={() => { setClienteSel(c); setClienteQuery(""); }}>
                    {c.nombre} — {c.telefono}
                  </button>
                ))}
              </div>
            )}
            <div className="row-between" style={{ marginTop: 6 }}>
              <span className="warn-text">Venta sin cliente asignado</span>
              <button className="link-btn" onClick={() => setNuevoClienteMode(true)}><Users size={14} /> Cliente nuevo</button>
            </div>
          </>
        )}

        {carritoEquipos.length === 0 && carritoAcc.length === 0 ? (
          <div className="dashed-box">Escanea o agrega equipos y accesorios para armar la venta.</div>
        ) : (
          <div className="cart-list">
            {equiposEnCarrito.map((e) => (
              <div key={e.id} className="cart-row">
                <span>{e.modelo} · {e.imei}</span>
                <span>{fmtMoney(e.precio)}</span>
                <button className="btn-icon" onClick={() => setCarritoEquipos((c) => c.filter((id) => id !== e.id))}><Trash2 size={14} /></button>
              </div>
            ))}
            {carritoAcc.map((c) => {
              const a = data.accesorios.find((x) => x.id === c.id);
              if (!a) return null;
              return (
                <div key={c.id} className="cart-row">
                  <span>{a.nombre} × {c.qty}</span>
                  <span>{fmtMoney(a.precio * c.qty)}</span>
                  <button className="btn-icon" onClick={() => setCarritoAcc((arr) => arr.filter((x) => x.id !== c.id))}><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        )}

        <div className="totals">
          <div className="totals-row"><span>Subtotal equipos</span><span>{fmtMoney(subtotalEquipos)}</span></div>
          <div className="totals-row"><span>Subtotal accesorios</span><span>{fmtMoney(subtotalAcc)}</span></div>
          <div className="totals-row"><span>Método de pago</span>
            <select className="select-inline" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              {METODOS_PAGO.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="totals-row"><span>Con boleta</span>
            <button className={`toggle ${conBoleta ? "toggle-on" : ""}`} onClick={() => setConBoleta((v) => !v)}><span className="toggle-knob" /></button>
          </div>
        </div>

        <div className="grand-total">
          <div><span>Total</span><div className="grand-total-value">{fmtMoney(total)}</div></div>
          <div className="margen-line">Margen estimado {fmtMoney(margen)}</div>
        </div>

        {flash && <div className="flash-ok">{flash}</div>}
        <button className="btn btn-primary btn-block" disabled={!canSell} onClick={confirmar}>Registrar venta</button>
      </Card>
    </>
  );
}
