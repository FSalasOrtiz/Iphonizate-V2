import React, { useState } from "react";
import { ScanLine, Search, X, Wrench, ShieldCheck } from "lucide-react";
import { Card, Empty, Badge } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtDateShort, fmtDateTime, relativeDays, daysBetween } from "../lib/helpers";

export default function Garantias() {
  const { data, patch, activeTienda, addAudit } = useApp();
  const [imeiScan, setImeiScan] = useState("");
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(null);
  const [falla, setFalla] = useState("");

  const [mandando, setMandando] = useState(null); // id de garantía con el picker de técnico abierto
  const [tecnicoSel, setTecnicoSel] = useState("");

  const [resolviendo, setResolviendo] = useState(null); // id de garantía resolviéndose
  const [resolucionTexto, setResolucionTexto] = useState("");

  // Enriquecemos cada equipo vendido con los datos de su venta y cliente,
  // para poder buscar por cliente/teléfono y mostrar contexto útil.
  const candidatos = data.equipos
    .filter((e) => e.estado === "vendido" || e.estado === "entregado")
    .map((e) => {
      const venta = data.ventas.find((v) => v.equipoIds.includes(e.id));
      const cliente = venta?.clienteId ? data.clientes.find((c) => c.id === venta.clienteId) : null;
      return {
        ...e,
        clienteId: cliente?.id || venta?.clienteId || null,
        clienteNombre: cliente?.nombre || venta?.clienteNombre || "Sin cliente",
        clienteTelefono: cliente?.telefono || "",
        ventaTienda: venta?.tienda || e.ubicacion,
        ventaFecha: venta?.fecha || e.fechaIngreso,
      };
    });

  const resultadosBusqueda = query
    ? candidatos.filter(
        (c) =>
          c.imei.includes(query) ||
          c.modelo.toLowerCase().includes(query.toLowerCase()) ||
          c.clienteNombre.toLowerCase().includes(query.toLowerCase()) ||
          c.clienteTelefono.includes(query)
      )
    : [];

  const escanear = () => {
    const c = candidatos.find((x) => x.imei === imeiScan.trim());
    if (c) {
      setSel(c);
      setImeiScan("");
      setQuery("");
    }
  };

  const abiertas = data.garantias.filter((g) => g.estado === "abierta");
  const resueltas = data.garantias.filter((g) => g.estado === "resuelta");

  const ingresar = () => {
    if (!sel || !falla) return;
    const now = new Date();
    const sla = new Date(now.getTime() + 72 * 3600000);
    const g = {
      id: uid(),
      equipoId: sel.id,
      modelo: sel.modelo,
      imei: sel.imei,
      clienteId: sel.clienteId,
      clienteNombre: sel.clienteNombre,
      clienteTelefono: sel.clienteTelefono,
      tienda: activeTienda,
      falla,
      fechaIngreso: now.toISOString(),
      slaFecha: sla.toISOString(),
      estado: "abierta",
      enTecnico: false,
      tecnico: null,
      fechaResuelta: null,
      resolucion: "",
      tipoArreglo: null,
      dias: null,
      slaCumplido: null,
    };
    patch("garantias", (arr) => [g, ...arr]);
    patch("equipos", (arr) => arr.map((e) => (e.id === sel.id ? { ...e, estado: "garantia" } : e)));
    addAudit("Ingresó una garantía", `${sel.modelo} · ${sel.imei}`, activeTienda);
    setSel(null);
    setFalla("");
    setQuery("");
  };

  const mandarATecnico = (g) => {
    if (!tecnicoSel) return;
    patch("equipos", (arr) => arr.map((e) => (e.id === g.equipoId ? { ...e, estado: "en_tecnico" } : e)));
    patch("asignaciones", (arr) => [
      { id: uid(), equipoId: g.equipoId, modelo: g.modelo, imei: g.imei, tecnico: tecnicoSel, fechaAsignado: new Date().toISOString(), garantiaId: g.id },
      ...arr,
    ]);
    patch("garantias", (arr) => arr.map((x) => (x.id === g.id ? { ...x, enTecnico: true, tecnico: tecnicoSel } : x)));
    addAudit("Envió una garantía a técnico", `${g.modelo} · ${tecnicoSel}`, activeTienda);
    setMandando(null);
    setTecnicoSel("");
  };

  const resolver = (g, tipo) => {
    const now = new Date();
    const dias = daysBetween(new Date(g.fechaIngreso), now);
    const slaCumplido = now <= new Date(g.slaFecha);
    patch("garantias", (arr) =>
      arr.map((x) =>
        x.id === g.id ? { ...x, estado: "resuelta", tipoArreglo: tipo, resolucion: resolucionTexto, fechaResuelta: now.toISOString(), dias, slaCumplido } : x
      )
    );
    patch("equipos", (arr) => arr.map((e) => (e.id === g.equipoId ? { ...e, estado: "vendido" } : e)));
    addAudit("Resolvió una garantía", `${g.modelo} · ${tipo}`, activeTienda);
    setResolviendo(null);
    setResolucionTexto("");
  };

  return (
    <>
      <h1 className="h1">Garantías</h1>
      <div className="h1-sub">Solicitudes de garantía, SLA de 72 horas y resoluciones por reparación o cambio.</div>

      <Card title="Ingresar garantía" right={<Badge>Entra a {activeTienda}</Badge>}>
        <div className="search-row">
          <ScanLine size={16} />
          <input
            className="search-input"
            placeholder="Escanea el IMEI del equipo que trae el cliente"
            value={imeiScan}
            onChange={(e) => setImeiScan(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && escanear()}
          />
        </div>
        <div className="search-row" style={{ marginTop: 8 }}>
          <Search size={16} />
          <input
            className="search-input"
            placeholder="O busca el equipo vendido por IMEI, modelo, cliente o teléfono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {query && !sel && (
          resultadosBusqueda.length === 0 ? (
            <Empty title="No encontramos equipos vendidos con ese criterio." />
          ) : (
            <div className="dropdown-list">
              {resultadosBusqueda.map((c) => (
                <button key={c.id} className="dropdown-item warranty-search-item" onClick={() => { setSel(c); setQuery(""); }}>
                  <div>
                    <div className="warranty-search-title">{c.modelo}{c.gb ? ` ${c.gb}GB` : ""} · {c.color}</div>
                    <div className="warranty-search-sub">{c.imei} · {c.clienteNombre}</div>
                  </div>
                  <div className="warranty-search-meta">
                    <div className="warranty-search-tienda">Atiende {activeTienda}</div>
                    <div className="warranty-search-fecha">{fmtDateTime(c.ventaFecha)} · {c.ventaTienda} · {relativeDays(c.ventaFecha)}</div>
                  </div>
                </button>
              ))}
            </div>
          )
        )}

        {sel && (
          <div className="inline-form" style={{ marginTop: 10 }}>
            <div className="selected-pill">
              {sel.modelo} — {sel.imei} — {sel.clienteNombre}
              <button className="btn-icon" onClick={() => setSel(null)}><X size={14} /></button>
            </div>
            <textarea className="input" rows={2} placeholder="Descripción de la falla" value={falla} onChange={(e) => setFalla(e.target.value)} />
            <button className="btn btn-primary" disabled={!falla} onClick={ingresar}>Registrar garantía</button>
          </div>
        )}
      </Card>

      <Card title="Garantías abiertas" right={<Badge tone="yellow">{abiertas.length} en curso · SLA 72h</Badge>}>
        {abiertas.length === 0 ? (
          <Empty title="No hay garantías abiertas ahora mismo." />
        ) : (
          <div className="warranty-grid">
            {abiertas.map((g) => {
              const horas = Math.max(0, Math.round((new Date(g.slaFecha) - new Date()) / 3600000));
              return (
                <div key={g.id} className="warranty-card">
                  <div className="warranty-card-head">
                    <div>
                      <div className="warranty-card-title">{g.modelo}</div>
                      <div className="warranty-card-imei">{g.imei}</div>
                    </div>
                    <Badge tone={horas < 12 ? "red" : "yellow"}>{horas}h de 72h</Badge>
                  </div>
                  <div className="warranty-card-cliente">
                    <div>{g.clienteNombre}</div>
                    <div className="stat-sub">{g.clienteTelefono} · {g.tienda}</div>
                  </div>
                  <div className="warranty-card-falla">{g.falla}</div>

                  {g.enTecnico ? (
                    <div className="warranty-card-status">
                      <Wrench size={14} /> En técnico: {g.tecnico}
                    </div>
                  ) : mandando === g.id ? (
                    <div className="inline-form">
                      <select className="select" value={tecnicoSel} onChange={(e) => setTecnicoSel(e.target.value)}>
                        <option value="">Selecciona técnico…</option>
                        {data.tecnicos.map((t) => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                      </select>
                      <button className="btn btn-primary" disabled={!tecnicoSel} onClick={() => mandarATecnico(g)}>Confirmar</button>
                      <button className="btn btn-ghost" onClick={() => setMandando(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <div className="warranty-card-actions">
                      <button className="btn btn-secondary" onClick={() => setMandando(g.id)}><Wrench size={14} /> Mandar a técnico</button>
                      <button className="btn btn-primary" onClick={() => setResolviendo(g.id)}><ShieldCheck size={14} /> Resolver</button>
                    </div>
                  )}

                  {resolviendo === g.id && (
                    <div className="inline-form" style={{ marginTop: 8 }}>
                      <input className="input" placeholder="Detalle de la resolución" value={resolucionTexto} onChange={(e) => setResolucionTexto(e.target.value)} />
                      <button className="btn btn-secondary" disabled={!resolucionTexto} onClick={() => resolver(g, "Reparación")}>Reparación</button>
                      <button className="btn btn-secondary" disabled={!resolucionTexto} onClick={() => resolver(g, "Cambio")}>Cambio</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Historial de garantías resueltas" right={<Badge>{resueltas.length} casos</Badge>}>
        {resueltas.length === 0 ? <Empty title="Todavía no hay garantías resueltas." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Ingreso</th><th>Equipo</th><th>Cliente</th><th>Falla</th><th>Resolución</th><th>Días</th><th>SLA</th><th>Arreglo</th></tr>
              </thead>
              <tbody>
                {resueltas.map((g) => (
                  <tr key={g.id}>
                    <td>{fmtDateShort(g.fechaIngreso)}</td>
                    <td>{g.modelo} · {g.imei}</td>
                    <td>{g.clienteNombre}</td>
                    <td>{g.falla}</td>
                    <td>{g.resolucion}</td>
                    <td>{g.dias}</td>
                    <td><Badge tone={g.slaCumplido ? "green" : "red"}>{g.slaCumplido ? "Cumplido" : "Vencido"}</Badge></td>
                    <td><Badge tone={g.tipoArreglo === "Cambio" ? "purple" : "blue"}>{g.tipoArreglo}</Badge></td>
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
