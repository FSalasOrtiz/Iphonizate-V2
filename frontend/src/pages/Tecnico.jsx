import React, { useState } from "react";
import { ScanLine, Plus, Trash2 } from "lucide-react";
import { Card, Empty, Badge } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtDateShort, daysBetween, fmtMoney } from "../lib/helpers";

export default function Tecnico() {
  const { data, patch, addAudit } = useApp();
  const [tecnico, setTecnico] = useState("");
  const [nuevoTecnico, setNuevoTecnico] = useState("");
  const [imei, setImei] = useState("");
  const [pendientes, setPendientes] = useState([]);
  const [cerrando, setCerrando] = useState(null);
  const [servicios, setServicios] = useState("");
  const [costo, setCosto] = useState(0);

  const agregarImei = () => {
    const eq = data.equipos.find((e) => e.imei === imei.trim() && e.estado !== "en_tecnico");
    if (!eq) return;
    if (!pendientes.find((p) => p.id === eq.id)) setPendientes((p) => [...p, eq]);
    setImei("");
  };

  const asignar = () => {
    if (!tecnico || pendientes.length === 0) return;
    const ids = pendientes.map((p) => p.id);
    patch("equipos", (arr) => arr.map((e) => (ids.includes(e.id) ? { ...e, estado: "en_tecnico" } : e)));
    patch("asignaciones", (arr) => [
      ...pendientes.map((p) => ({ id: uid(), equipoId: p.id, modelo: p.modelo, imei: p.imei, tecnico, fechaAsignado: new Date().toISOString() })),
      ...arr,
    ]);
    addAudit("Asignó equipos a técnico", `${pendientes.length} equipo(s) a ${tecnico}`);
    setPendientes([]); setTecnico("");
  };

  const agregarTecnico = () => {
    if (!nuevoTecnico) return;
    patch("tecnicos", (arr) => [...arr, { id: uid(), nombre: nuevoTecnico }]);
    setTecnico(nuevoTecnico);
    setNuevoTecnico("");
  };

  const enTaller = data.asignaciones.filter((a) => data.equipos.find((e) => e.id === a.equipoId)?.estado === "en_tecnico");

  const terminar = () => {
    if (!cerrando) return;
    const dias = daysBetween(new Date(cerrando.fechaAsignado), new Date());
    patch("reparaciones", (arr) => [{ id: uid(), modelo: cerrando.modelo, imei: cerrando.imei, tecnico: cerrando.tecnico, servicios, dias, costo: Number(costo), fechaSalida: new Date().toISOString() }, ...arr]);

    if (cerrando.garantiaId) {
      // Este equipo llegó desde una garantía: vuelve a "vendido" (es del
      // cliente, no stock nuevo) y la garantía se cierra sola con este arreglo.
      patch("equipos", (arr) => arr.map((e) => (e.id === cerrando.equipoId ? { ...e, estado: "vendido" } : e)));
      patch("garantias", (arr) =>
        arr.map((g) => {
          if (g.id !== cerrando.garantiaId) return g;
          const now = new Date();
          const diasGarantia = daysBetween(new Date(g.fechaIngreso), now);
          const slaCumplido = now <= new Date(g.slaFecha);
          return { ...g, estado: "resuelta", tipoArreglo: "Reparación", resolucion: servicios, fechaResuelta: now.toISOString(), dias: diasGarantia, slaCumplido, enTecnico: false };
        })
      );
      addAudit("Cerró una reparación de garantía", `${cerrando.modelo} · ${servicios}`);
    } else {
      patch("equipos", (arr) => arr.map((e) => (e.id === cerrando.equipoId ? { ...e, estado: "disponible" } : e)));
      addAudit("Cerró una reparación", `${cerrando.modelo} · ${servicios}`);
    }

    patch("asignaciones", (arr) => arr.filter((a) => a.id !== cerrando.id));
    setCerrando(null); setServicios(""); setCosto(0);
  };

  return (
    <>
      <h1 className="h1">Técnico</h1>
      <div className="h1-sub">Asignación de equipos a técnicos, seguimiento en taller y reparaciones hechas.</div>
      <Card title="Asignar equipos a un técnico">
        <div className="inline-form-grid">
          <select className="select" value={tecnico} onChange={(e) => setTecnico(e.target.value)}>
            <option value="">Selecciona…</option>
            {data.tecnicos.map((t) => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
          </select>
          <div className="row-actions">
            <input className="input" placeholder="Nombre del técnico" value={nuevoTecnico} onChange={(e) => setNuevoTecnico(e.target.value)} />
            <button className="btn btn-secondary" onClick={agregarTecnico}><Plus size={14} /> Agregar</button>
          </div>
        </div>
        <div className="search-row" style={{ marginTop: 10 }}>
          <ScanLine size={16} />
          <input className="search-input" placeholder="IMEI del equipo que se lleva el técnico" value={imei} onChange={(e) => setImei(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agregarImei()} />
          <button className="btn btn-primary" onClick={agregarImei}>Agregar</button>
        </div>
        {pendientes.length > 0 && (
          <div className="cart-list">
            {pendientes.map((p) => (<div key={p.id} className="cart-row"><span>{p.modelo} · {p.imei}</span><button className="btn-icon" onClick={() => setPendientes((arr) => arr.filter((x) => x.id !== p.id))}><Trash2 size={14} /></button></div>))}
          </div>
        )}
        <button className="btn btn-primary btn-block" disabled={!tecnico || pendientes.length === 0} onClick={asignar}>Asignar a un técnico · {pendientes.length} equipos</button>
      </Card>

      <Card title="En taller">
        {enTaller.length === 0 ? <Empty title="No hay equipos en manos de técnicos." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Modelo</th><th>IMEI</th><th>Técnico</th><th>Días</th><th>Origen</th><th></th></tr></thead>
              <tbody>
                {enTaller.map((a) => (
                  <tr key={a.id}>
                    <td>{a.modelo}</td><td>{a.imei}</td><td>{a.tecnico}</td><td>{daysBetween(new Date(a.fechaAsignado), new Date())}</td>
                    <td>{a.garantiaId ? <Badge tone="yellow">Garantía</Badge> : <Badge>Revisión</Badge>}</td>
                    <td>
                      {cerrando?.id === a.id ? (
                        <div className="inline-form">
                          <input className="input" placeholder="Servicios hechos" value={servicios} onChange={(e) => setServicios(e.target.value)} />
                          <input className="input" type="number" placeholder="Costo" value={costo} onChange={(e) => setCosto(e.target.value)} />
                          <button className="btn btn-primary" onClick={terminar}>Guardar</button>
                        </div>
                      ) : (
                        <button className="btn btn-secondary" onClick={() => setCerrando(a)}>Marcar hecha</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Historial de reparaciones">
        {data.reparaciones.length === 0 ? <Empty title="Todavía no hay reparaciones terminadas." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Modelo</th><th>IMEI</th><th>Técnico</th><th>Servicios hechos</th><th>Días</th><th>Costo servicios</th><th>Fecha de salida</th></tr></thead>
              <tbody>{data.reparaciones.map((r) => (<tr key={r.id}><td>{r.modelo}</td><td>{r.imei}</td><td>{r.tecnico}</td><td>{r.servicios}</td><td>{r.dias}</td><td>{fmtMoney(r.costo)}</td><td>{fmtDateShort(r.fechaSalida)}</td></tr>))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
