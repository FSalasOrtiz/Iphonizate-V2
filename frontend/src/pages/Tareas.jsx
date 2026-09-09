import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Card, Empty, Badge, Chip } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid } from "../lib/helpers";
import { URGENCIAS } from "../lib/constants";

export default function Tareas() {
  const { data, patch, addAudit } = useApp();
  const [filterUrg, setFilterUrg] = useState("Todas");
  const [filterPersona, setFilterPersona] = useState("Todas las personas");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", urgencia: "Media", responsable: "" });

  const personas = ["Todas las personas", ...new Set(data.tareas.map((t) => t.responsable).filter(Boolean))];

  const filtered = data.tareas.filter(
    (t) => (filterUrg === "Todas" || t.urgencia === filterUrg) && (filterPersona === "Todas las personas" || t.responsable === filterPersona)
  );
  const pendientes = filtered.filter((t) => !t.hecha);
  const hechas = filtered.filter((t) => t.hecha);

  const crear = () => {
    if (!form.titulo) return;
    const t = { id: uid(), ...form, hecha: false, fecha: new Date().toISOString() };
    patch("tareas", (arr) => [t, ...arr]);
    addAudit("Creó una tarea", form.titulo);
    setForm({ titulo: "", urgencia: "Media", responsable: "" });
    setShowForm(false);
  };

  const toggle = (id) => patch("tareas", (arr) => arr.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)));

  return (
    <>
      <h1 className="h1">Tareas</h1>
      <div className="h1-sub">Pendientes del equipo por urgencia y responsable.</div>
      <Card right={<button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}><Plus size={14} /> Nueva tarea</button>}>
        {showForm && (
          <div className="inline-form" style={{ marginBottom: 12 }}>
            <input className="input" placeholder="Título de la tarea" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
            <select className="select" value={form.urgencia} onChange={(e) => setForm((f) => ({ ...f, urgencia: e.target.value }))}>
              {URGENCIAS.map((u) => <option key={u}>{u}</option>)}
            </select>
            <input className="input" placeholder="Responsable" value={form.responsable} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value }))} />
            <button className="btn btn-primary" onClick={crear}>Crear</button>
          </div>
        )}
        <div className="chip-row">
          <Chip active={filterUrg === "Todas"} onClick={() => setFilterUrg("Todas")}>Todas</Chip>
          {URGENCIAS.map((u) => <Chip key={u} active={filterUrg === u} onClick={() => setFilterUrg(u)}>{u}</Chip>)}
          <select className="select-inline" value={filterPersona} onChange={(e) => setFilterPersona(e.target.value)}>
            {personas.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="table-caption" style={{ marginTop: 10 }}>PENDIENTES · {pendientes.length}</div>
        {pendientes.length === 0 ? <Empty title="Sin pendientes con esos filtros." /> : (
          <ul className="task-list">
            {pendientes.map((t) => (
              <li key={t.id}>
                <button className="checkbox" onClick={() => toggle(t.id)} />
                <span className="task-title">{t.titulo}</span>
                <Badge tone={t.urgencia === "Alta" ? "red" : t.urgencia === "Media" ? "yellow" : "gray"}>{t.urgencia}</Badge>
                {t.responsable && <span className="task-resp">{t.responsable}</span>}
              </li>
            ))}
          </ul>
        )}

        <div className="table-caption" style={{ marginTop: 14 }}>HECHAS · {hechas.length}</div>
        {hechas.length === 0 ? <Empty title="Todavía nada terminado." /> : (
          <ul className="task-list">
            {hechas.map((t) => (
              <li key={t.id}>
                <button className="checkbox checkbox-checked" onClick={() => toggle(t.id)}><Check size={12} /></button>
                <span className="task-title task-done">{t.titulo}</span>
                {t.responsable && <span className="task-resp">{t.responsable}</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
