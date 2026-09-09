import React, { useState } from "react";
import { Search, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Empty, Badge } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtMoney, fmtDateShort } from "../lib/helpers";

const EMPTY = { nombre: "", telefono: "" };

export default function Clientes() {
  const { data, patch, addAudit } = useApp();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const list = data.clientes.filter(
    (c) => query === "" || c.nombre.toLowerCase().includes(query.toLowerCase()) || (c.telefono || "").includes(query)
  );

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  };

  const guardar = () => {
    if (!form.nombre) return;
    if (editingId) {
      patch("clientes", (arr) => arr.map((c) => (c.id === editingId ? { ...c, nombre: form.nombre, telefono: form.telefono } : c)));
      addAudit("Editó un cliente", form.nombre);
    } else {
      patch("clientes", (arr) => [{ id: uid(), nombre: form.nombre, telefono: form.telefono, fechaAlta: new Date().toISOString() }, ...arr]);
      addAudit("Creó un cliente", form.nombre);
    }
    resetForm();
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ nombre: c.nombre, telefono: c.telefono || "" });
    setShowForm(true);
  };

  const eliminar = (c) => {
    if (!window.confirm(`¿Eliminar a ${c.nombre}? Sus ventas y garantías quedan en el historial, pero la ficha del cliente se borra.`)) return;
    patch("clientes", (arr) => arr.filter((x) => x.id !== c.id));
    addAudit("Eliminó un cliente", c.nombre);
    if (expanded === c.id) setExpanded(null);
  };

  return (
    <>
      <h1 className="h1">Clientes</h1>
      <div className="h1-sub">Historial de compras, garantías y contacto.</div>
      <Card right={<button className="btn btn-primary" onClick={() => (showForm ? resetForm() : setShowForm(true))}><Plus size={14} /> Nuevo cliente</button>}>
        {showForm && (
          <>
            {editingId && <div className="editing-hint">Editando cliente</div>}
            <div className="inline-form-grid">
              <input className="input" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
              <input className="input" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />
              <button className="btn btn-primary" disabled={!form.nombre} onClick={guardar}>{editingId ? "Guardar cambios" : "Guardar"}</button>
              {editingId && <button className="btn btn-ghost" onClick={resetForm}>Cancelar</button>}
            </div>
          </>
        )}

        <div className="search-row"><Search size={16} /><input className="search-input" placeholder="Buscar por nombre o teléfono" value={query} onChange={(e) => setQuery(e.target.value)} /></div>

        {list.length === 0 ? (
          <Empty icon={Users} title="Todavía no hay clientes registrados." subtitle="Créalo manualmente arriba, o aparecen solos cuando registras una venta o reserva con cliente." />
        ) : (
          <div className="client-list">
            {list.map((c) => {
              const ventas = data.ventas.filter((v) => v.clienteId === c.id);
              const garantias = data.garantias.filter((g) => g.clienteId === c.id);
              const isOpen = expanded === c.id;
              return (
                <div key={c.id} className="client-row">
                  <div className="client-row-top">
                    <button className="client-row-head" onClick={() => setExpanded(isOpen ? null : c.id)}>
                      <div>
                        <div className="client-name">{c.nombre}</div>
                        <div className="client-phone">{c.telefono || "Sin teléfono"}</div>
                      </div>
                    </button>
                    <div className="row-actions">
                      <Badge>{ventas.length} compras</Badge>
                      {garantias.length > 0 && <Badge tone="yellow">{garantias.length} garantías</Badge>}
                      <button className="btn-icon" title="Editar" onClick={() => startEdit(c)}><Pencil size={14} /></button>
                      <button className="btn-icon" title="Eliminar" onClick={() => eliminar(c)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="client-detail">
                      <div className="table-caption">COMPRAS</div>
                      {ventas.length === 0 ? <div className="empty-inline">Sin compras registradas.</div> : (
                        <table className="table">
                          <thead><tr><th>Fecha</th><th>Tienda</th><th>Equipos</th><th>Total</th></tr></thead>
                          <tbody>{ventas.map((v) => (<tr key={v.id}><td>{fmtDateShort(v.fecha)}</td><td>{v.tienda}</td><td>{v.equipoIds.length}</td><td>{fmtMoney(v.total)}</td></tr>))}</tbody>
                        </table>
                      )}
                      <div className="table-caption" style={{ marginTop: 10 }}>GARANTÍAS</div>
                      {garantias.length === 0 ? <div className="empty-inline">Sin garantías registradas.</div> : (
                        <table className="table">
                          <thead><tr><th>Ingreso</th><th>Equipo</th><th>Falla</th><th>Estado</th></tr></thead>
                          <tbody>
                            {garantias.map((g) => (
                              <tr key={g.id}>
                                <td>{fmtDateShort(g.fechaIngreso)}</td><td>{g.modelo}</td><td>{g.falla}</td>
                                <td><Badge tone={g.estado === "abierta" ? "yellow" : "green"}>{g.estado}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
