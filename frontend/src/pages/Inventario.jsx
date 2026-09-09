import React, { useRef, useState } from "react";
import { Search, Plus, Download, Boxes, Pencil, Trash2 } from "lucide-react";
import { Card, Empty, Badge, Chip } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid } from "../lib/helpers";
import { TIENDAS, ESTADO_LABELS, ESTADO_TONE } from "../lib/constants";

const emptyForm = () => ({ imei: "", modelo: "", gb: "", color: "", bateria: 100, ubicacion: TIENDAS[0], costo: 0, precio: 0 });

export default function Inventario() {
  const { data, patch, addAudit } = useApp();
  const [query, setQuery] = useState("");
  const [ubic, setUbic] = useState("Todas");
  const [estado, setEstado] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = data.equipos.filter((e) => {
    if (ubic !== "Todas" && e.ubicacion !== ubic) return false;
    if (estado !== "Todos" && e.estado !== estado) return false;
    if (query && !(e.imei.includes(query) || e.modelo.toLowerCase().includes(query.toLowerCase()) || e.color.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  const estadoCounts = Object.keys(ESTADO_LABELS).reduce((acc, k) => {
    acc[k] = data.equipos.filter((e) => e.estado === k).length;
    return acc;
  }, {});

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const guardar = () => {
    if (!form.imei || !form.modelo) return;
    const campos = {
      imei: form.imei, modelo: form.modelo, gb: String(form.gb), color: form.color,
      bateria: Number(form.bateria), ubicacion: form.ubicacion, costo: Number(form.costo), precio: Number(form.precio),
    };
    if (editingId) {
      patch("equipos", (arr) => arr.map((e) => (e.id === editingId ? { ...e, ...campos } : e)));
      addAudit("Editó un equipo", `${campos.modelo} · ${campos.imei}`, campos.ubicacion);
    } else {
      patch("equipos", (arr) => [{ id: uid(), ...campos, estado: "disponible", fechaIngreso: new Date().toISOString() }, ...arr]);
      addAudit("Ingresó un equipo", `${campos.modelo} · ${campos.imei}`, campos.ubicacion);
    }
    resetForm();
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setForm({ imei: e.imei, modelo: e.modelo, gb: e.gb, color: e.color, bateria: e.bateria, ubicacion: e.ubicacion, costo: e.costo, precio: e.precio });
    setShowForm(true);
  };

  const eliminar = (e) => {
    const extra = e.estado !== "disponible" ? `\n\nOJO: este equipo está en estado "${ESTADO_LABELS[e.estado]}".` : "";
    if (!window.confirm(`¿Eliminar ${e.modelo} · ${e.imei} del inventario?${extra}`)) return;
    patch("equipos", (arr) => arr.filter((x) => x.id !== e.id));
    addAudit("Eliminó un equipo", `${e.modelo} · ${e.imei}`, e.ubicacion);
  };

  const onFile = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nuevos = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const row = {};
        headers.forEach((h, i) => (row[h] = cols[i]));
        return {
          id: uid(), imei: row.imei || "", modelo: row.modelo || "", gb: row.gb || "",
          color: row.color || "", bateria: Number(row.bateria) || 100, ubicacion: row.ubicacion || TIENDAS[0],
          costo: Number(row.costo) || 0, precio: Number(row.precio) || 0, estado: "disponible", fechaIngreso: new Date().toISOString(),
        };
      }).filter((r) => r.imei);
      if (nuevos.length) {
        patch("equipos", (arr) => [...nuevos, ...arr]);
        addAudit("Importó equipos desde Excel", `${nuevos.length} equipo(s)`);
      }
    };
    reader.readAsText(file);
    ev.target.value = "";
  };

  return (
    <>
      <h1 className="h1">Inventario</h1>
      <div className="h1-sub">Equipos de la cadena por IMEI, estado, ubicación y días en stock.</div>
      <Card right={
        <div className="row-actions">
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={onFile} />
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}><Download size={14} /> Importar desde Excel</button>
          <button className="btn btn-primary" onClick={() => (showForm ? resetForm() : setShowForm(true))}><Plus size={14} /> Ingresar equipo</button>
        </div>
      }>
        {showForm && (
          <>
            {editingId && <div className="editing-hint">Editando equipo</div>}
            <div className="inline-form-grid">
              <input className="input" placeholder="IMEI" value={form.imei} onChange={(e) => setForm((f) => ({ ...f, imei: e.target.value }))} />
              <input className="input" placeholder="Modelo" value={form.modelo} onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))} />
              <input className="input" placeholder="GB" value={form.gb} onChange={(e) => setForm((f) => ({ ...f, gb: e.target.value }))} />
              <input className="input" placeholder="Color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
              <input className="input" type="number" placeholder="Batería %" value={form.bateria} onChange={(e) => setForm((f) => ({ ...f, bateria: e.target.value }))} />
              <select className="select" value={form.ubicacion} onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))}>
                {TIENDAS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input className="input" type="number" placeholder="Costo" value={form.costo} onChange={(e) => setForm((f) => ({ ...f, costo: e.target.value }))} />
              <input className="input" type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))} />
              <button className="btn btn-primary" onClick={guardar}>{editingId ? "Guardar cambios" : "Guardar equipo"}</button>
              {editingId && <button className="btn btn-ghost" onClick={resetForm}>Cancelar</button>}
            </div>
          </>
        )}

        <div className="search-row" style={{ marginTop: 12 }}><Search size={16} /><input className="search-input" placeholder="Escanea o escribe el IMEI y presiona Enter · también busca por modelo o color" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="chip-row">
          <span className="field-label">UBICACIÓN</span>
          <Chip active={ubic === "Todas"} onClick={() => setUbic("Todas")}>Todas</Chip>
          {TIENDAS.map((t) => <Chip key={t} active={ubic === t} onClick={() => setUbic(t)}>{t}</Chip>)}
        </div>
        <div className="chip-row">
          <span className="field-label">ESTADO</span>
          <Chip active={estado === "Todos"} onClick={() => setEstado("Todos")}>Todos {data.equipos.length}</Chip>
          {Object.entries(ESTADO_LABELS).map(([k, label]) => (
            <Chip key={k} active={estado === k} onClick={() => setEstado(k)}>{label} {estadoCounts[k]}</Chip>
          ))}
        </div>

        <div className="table-caption" style={{ marginTop: 10 }}>EQUIPOS DE LA CADENA</div>
        {filtered.length === 0 ? (
          <Empty icon={Boxes} title="Acá no hay nada que mostrar" subtitle="Ningún equipo calza con el filtro. Prueba con otro criterio o ingresa equipos nuevos." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>IMEI</th><th>Modelo</th><th>GB</th><th>Color</th><th>Batería</th><th>Ubicación</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>{e.imei}</td><td>{e.modelo}</td><td>{e.gb}</td><td>{e.color}</td><td>{e.bateria}%</td><td>{e.ubicacion}</td>
                    <td><Badge tone={ESTADO_TONE[e.estado]}>{ESTADO_LABELS[e.estado]}</Badge></td>
                    <td className="row-actions">
                      <button className="btn-icon" title="Editar" onClick={() => startEdit(e)}><Pencil size={14} /></button>
                      <button className="btn-icon" title="Eliminar" onClick={() => eliminar(e)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footnote">{filtered.length} equipos en pantalla</div>
      </Card>
    </>
  );
}
