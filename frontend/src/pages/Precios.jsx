import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Empty, Chip } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtMoney, fmtDateShort } from "../lib/helpers";

const EMPTY = { modelo: "", gb: "", precioSugerido: 0 };

export default function Precios() {
  const { data, patch, addAudit, session } = useApp();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("modelo");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const filtered = data.precios
    .filter((p) => query === "" || p.modelo.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sortBy === "modelo" ? a.modelo.localeCompare(b.modelo) : new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion)));

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  };

  const guardar = () => {
    if (!form.modelo) return;
    const quien = session?.nombre || "—";
    if (editingId) {
      patch("precios", (arr) =>
        arr.map((p) =>
          p.id === editingId
            ? { ...p, modelo: form.modelo, gb: String(form.gb), precioSugerido: Number(form.precioSugerido), fechaActualizacion: new Date().toISOString(), actualizado: quien }
            : p
        )
      );
      addAudit("Actualizó precio sugerido", `${form.modelo} ${form.gb}GB → ${fmtMoney(form.precioSugerido)}`);
    } else {
      patch("precios", (arr) => [
        { id: uid(), modelo: form.modelo, gb: String(form.gb), precioSugerido: Number(form.precioSugerido), fechaActualizacion: new Date().toISOString(), actualizado: quien },
        ...arr,
      ]);
      addAudit("Agregó precio sugerido", `${form.modelo} ${form.gb}GB → ${fmtMoney(form.precioSugerido)}`);
    }
    resetForm();
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ modelo: p.modelo, gb: p.gb, precioSugerido: p.precioSugerido });
    setShowForm(true);
  };

  const eliminar = (p) => {
    if (!window.confirm(`¿Eliminar el precio sugerido de ${p.modelo} ${p.gb}GB?`)) return;
    patch("precios", (arr) => arr.filter((x) => x.id !== p.id));
    addAudit("Eliminó precio sugerido", `${p.modelo} ${p.gb}GB`);
  };

  return (
    <>
      <h1 className="h1">Precios</h1>
      <div className="h1-sub">Precios sugeridos por modelo y capacidad, con control de actualización.</div>
      <Card right={<button className="btn btn-primary" onClick={() => (showForm ? resetForm() : setShowForm(true))}><Plus size={14} /> Nuevo precio</button>}>
        {showForm && (
          <>
            {editingId && <div className="editing-hint">Editando precio</div>}
            <div className="inline-form-grid">
              <input className="input" placeholder="Modelo" value={form.modelo} onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))} />
              <input className="input" placeholder="GB" value={form.gb} onChange={(e) => setForm((f) => ({ ...f, gb: e.target.value }))} />
              <input className="input" type="number" placeholder="Precio sugerido" value={form.precioSugerido} onChange={(e) => setForm((f) => ({ ...f, precioSugerido: e.target.value }))} />
              <button className="btn btn-primary" onClick={guardar}>{editingId ? "Guardar cambios" : "Guardar"}</button>
              {editingId && <button className="btn btn-ghost" onClick={resetForm}>Cancelar</button>}
            </div>
          </>
        )}
        <div className="search-row"><Search size={16} /><input className="search-input" placeholder="Buscar por modelo" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="chip-row">
          <Chip active={sortBy === "modelo"} onClick={() => setSortBy("modelo")}>Por modelo</Chip>
          <Chip active={sortBy === "actualizacion"} onClick={() => setSortBy("actualizacion")}>Por actualización</Chip>
        </div>
        <div className="table-caption">LISTA DE PRECIOS · {filtered.length} modelos</div>
        {filtered.length === 0 ? <Empty title="Todavía no hay precios cargados." /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Modelo</th><th>GB</th><th>Precio sugerido</th><th>Última actualización</th><th>Actualizado</th><th></th></tr></thead>
              <tbody>{filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.modelo}</td><td>{p.gb}</td><td>{fmtMoney(p.precioSugerido)}</td><td>{fmtDateShort(p.fechaActualizacion)}</td><td>{p.actualizado}</td>
                  <td className="row-actions">
                    <button className="btn-icon" title="Editar" onClick={() => startEdit(p)}><Pencil size={14} /></button>
                    <button className="btn-icon" title="Eliminar" onClick={() => eliminar(p)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
