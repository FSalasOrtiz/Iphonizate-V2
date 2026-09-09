import React, { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Card, Empty, Badge, Chip } from "../components/ui";
import { useApp } from "../context/AppContext";
import { fmtMoney, fmtDateShort } from "../lib/helpers";
import { TIENDAS } from "../lib/constants";

export default function Revision() {
  const { data, patch } = useApp();
  const [tienda, setTienda] = useState("Todas las tiendas");
  const [filter, setFilter] = useState("Pendientes");

  const filtered = data.ventas.filter((v) => {
    if (tienda !== "Todas las tiendas" && v.tienda !== tienda) return false;
    if (filter === "Pendientes") return v.reviewStatus === "pendiente";
    if (filter === "Revisadas") return v.reviewStatus === "revisada";
    if (filter === "Con problema") return v.reviewStatus === "problema";
    return true;
  });

  const pendientesCount = data.ventas.filter((v) => v.reviewStatus === "pendiente").length;

  const mark = (id, status) => patch("ventas", (arr) => arr.map((v) => (v.id === id ? { ...v, reviewStatus: status } : v)));

  return (
    <>
      <h1 className="h1">Revisión de pagos</h1>
      <div className="h1-sub">Control de las formas de pago de cada venta</div>
      <Card right={<div className="stat-mini"><div className="field-label">PENDIENTES DE REVISAR</div><div className="stat-mini-value">{pendientesCount}</div></div>}>
        <div className="chip-row">
          <select className="select-inline" value={tienda} onChange={(e) => setTienda(e.target.value)}>
            <option>Todas las tiendas</option>
            {TIENDAS.map((t) => <option key={t}>{t}</option>)}
          </select>
          {["Todas", "Pendientes", "Revisadas", "Con problema"].map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
          ))}
        </div>
        {filtered.length === 0 ? <Empty title="No hay ventas con esos filtros." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Tienda</th><th>Cliente</th><th>Total</th><th>Métodos de pago</th><th>Revisión</th></tr></thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id}>
                    <td>{fmtDateShort(v.fecha)}</td><td>{v.tienda}</td><td>{v.clienteNombre || "—"}</td><td>{fmtMoney(v.total)}</td><td>{v.metodoPago}</td>
                    <td className="row-actions">
                      <Badge tone={v.reviewStatus === "revisada" ? "green" : v.reviewStatus === "problema" ? "red" : "yellow"}>{v.reviewStatus}</Badge>
                      {v.reviewStatus === "pendiente" && (
                        <>
                          <button className="btn-icon" title="Marcar revisada" onClick={() => mark(v.id, "revisada")}><Check size={14} /></button>
                          <button className="btn-icon" title="Marcar con problema" onClick={() => mark(v.id, "problema")}><AlertCircle size={14} /></button>
                        </>
                      )}
                    </td>
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
