import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Empty, StatCard } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtMoney, fmtDateShort, todayISO } from "../lib/helpers";
import { CATEGORIAS_GASTO, TIENDAS } from "../lib/constants";

const emptyForm = () => ({ categoria: CATEGORIAS_GASTO[0], descripcion: "", monto: 0, tienda: TIENDAS[0], fecha: todayISO() });

export default function Gastos() {
  const { data, patch, addAudit } = useApp();
  const [cat, setCat] = useState("Todas");
  const [tienda, setTienda] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = data.gastos.filter((g) => (cat === "Todas" || g.categoria === cat) && (tienda === "Todas" || g.tienda === tienda));
  const total = filtered.reduce((s, g) => s + g.monto, 0);
  const porCategoria = CATEGORIAS_GASTO.map((c) => ({ c, total: filtered.filter((g) => g.categoria === c).reduce((s, g) => s + g.monto, 0) })).filter((x) => x.total > 0);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const guardar = () => {
    if (!form.descripcion || !form.monto) return;
    if (editingId) {
      patch("gastos", (arr) => arr.map((g) => (g.id === editingId ? { ...g, ...form, monto: Number(form.monto) } : g)));
      addAudit("Editó un gasto", `${form.categoria} · ${fmtMoney(form.monto)}`, form.tienda);
    } else {
      patch("gastos", (arr) => [{ id: uid(), ...form, monto: Number(form.monto) }, ...arr]);
      addAudit("Registró un gasto", `${form.categoria} · ${fmtMoney(form.monto)}`, form.tienda);
    }
    resetForm();
  };

  const startEdit = (g) => {
    setEditingId(g.id);
    setForm({ categoria: g.categoria, descripcion: g.descripcion, monto: g.monto, tienda: g.tienda, fecha: g.fecha });
    setShowForm(true);
  };

  const eliminar = (g) => {
    if (!window.confirm(`¿Eliminar el gasto "${g.descripcion}" (${fmtMoney(g.monto)})?`)) return;
    patch("gastos", (arr) => arr.filter((x) => x.id !== g.id));
    addAudit("Eliminó un gasto", `${g.categoria} · ${fmtMoney(g.monto)}`, g.tienda);
  };

  return (
    <>
      <h1 className="h1">Gastos</h1>
      <div className="h1-sub">Arriendos, remuneraciones, publicidad y gastos operativos por tienda.</div>
      <Card right={<button className="btn btn-primary" onClick={() => (showForm ? resetForm() : setShowForm(true))}><Plus size={14} /> Nuevo gasto</button>}>
        {showForm && (
          <>
            {editingId && <div className="editing-hint">Editando gasto</div>}
            <div className="inline-form-grid">
              <select className="select" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>{CATEGORIAS_GASTO.map((c) => <option key={c}>{c}</option>)}</select>
              <input className="input" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
              <input className="input" type="number" placeholder="Monto" value={form.monto} onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))} />
              <select className="select" value={form.tienda} onChange={(e) => setForm((f) => ({ ...f, tienda: e.target.value }))}>{TIENDAS.map((t) => <option key={t}>{t}</option>)}</select>
              <input className="input" type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} />
              <button className="btn btn-primary" onClick={guardar}>{editingId ? "Guardar cambios" : "Guardar"}</button>
              {editingId && <button className="btn btn-ghost" onClick={resetForm}>Cancelar</button>}
            </div>
          </>
        )}
        <div className="stat-grid stat-grid-2">
          <StatCard label="TOTAL DEL PERÍODO" value={fmtMoney(total)} sub={`${filtered.length} gastos`} />
          <div className="stat">
            <div className="stat-label">DESGLOSE POR CATEGORÍA</div>
            {porCategoria.length === 0 ? <div className="stat-sub">Sin gastos en el período filtrado</div> : (
              porCategoria.map((x) => <div key={x.c} className="progress-row"><span>{x.c}</span><span>{fmtMoney(x.total)}</span></div>)
            )}
          </div>
        </div>
        <div className="chip-row">
          <select className="select-inline" value={cat} onChange={(e) => setCat(e.target.value)}><option>Todas</option>{CATEGORIAS_GASTO.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="select-inline" value={tienda} onChange={(e) => setTienda(e.target.value)}><option>Todas</option>{TIENDAS.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        {filtered.length === 0 ? <Empty title="Sin gastos para estos filtros" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th>Tienda</th><th></th></tr></thead>
              <tbody>{filtered.map((g) => (
                <tr key={g.id}>
                  <td>{fmtDateShort(g.fecha)}</td><td>{g.categoria}</td><td>{g.descripcion}</td><td>{fmtMoney(g.monto)}</td><td>{g.tienda}</td>
                  <td className="row-actions">
                    <button className="btn-icon" title="Editar" onClick={() => startEdit(g)}><Pencil size={14} /></button>
                    <button className="btn-icon" title="Eliminar" onClick={() => eliminar(g)}><Trash2 size={14} /></button>
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
