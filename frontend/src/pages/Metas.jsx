import React, { useState } from "react";
import { Target } from "lucide-react";
import { Badge } from "../components/ui";
import { useApp } from "../context/AppContext";
import { fmtMoney, monthKey } from "../lib/helpers";
import { TIENDAS, TIENDA_COLOR } from "../lib/constants";

export default function Metas() {
  const { data, patch } = useApp();
  const mk = monthKey();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ equipos: 0, ganancia: 0 });

  const guardar = (tienda) => {
    patch("metas", (m) => ({ ...m, [tienda]: { ...(m[tienda] || {}), [mk]: { equipos: Number(form.equipos), ganancia: Number(form.ganancia) } } }));
    setEditing(null);
  };

  const diasQuedan = Math.max(0, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate());

  return (
    <>
      <h1 className="h1">Metas</h1>
      <div className="h1-sub">{new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" })} · quedan {diasQuedan} días</div>
      <div className="goal-grid">
        {TIENDAS.map((t) => {
          const ventasMes = data.ventas.filter((v) => v.tienda === t && v.fecha.slice(0, 7) === mk);
          const equiposVendidos = ventasMes.reduce((s, v) => s + v.equipoIds.length, 0);
          const ganancia = ventasMes.reduce((s, v) => s + v.margen, 0);
          const meta = data.metas[t]?.[mk];
          return (
            <div key={t} className="goal-card">
              <div className="goal-head"><span className="goal-name" style={{ color: TIENDA_COLOR[t] }}>{t}</span><Badge>{meta ? "con meta" : "sin meta"}</Badge></div>
              <div className="goal-big">{equiposVendidos} equipos vendidos</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${meta ? Math.min(100, (equiposVendidos / (meta.equipos || 1)) * 100) : 0}%`, background: TIENDA_COLOR[t] }} /></div>
              <div className="stat-sub">{meta ? `${Math.round((equiposVendidos / meta.equipos) * 100)}% de la meta de equipos` : "0% de la meta de equipos"}</div>
              <div className="progress-row" style={{ marginTop: 10 }}><span>GANANCIA</span></div>
              <div className="goal-money"><span>{fmtMoney(ganancia)}</span><span className="stat-sub">de {fmtMoney(meta?.ganancia || 0)}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${meta ? Math.min(100, (ganancia / (meta.ganancia || 1)) * 100) : 0}%`, background: TIENDA_COLOR[t] }} /></div>
              {editing === t ? (
                <div className="inline-form" style={{ marginTop: 10 }}>
                  <input className="input" type="number" placeholder="Meta de equipos" value={form.equipos} onChange={(e) => setForm((f) => ({ ...f, equipos: e.target.value }))} />
                  <input className="input" type="number" placeholder="Meta de ganancia" value={form.ganancia} onChange={(e) => setForm((f) => ({ ...f, ganancia: e.target.value }))} />
                  <button className="btn btn-primary" onClick={() => guardar(t)}>Guardar</button>
                </div>
              ) : (
                <button className="link-btn" style={{ marginTop: 10 }} onClick={() => { setEditing(t); setForm(meta || { equipos: 0, ganancia: 0 }); }}><Target size={14} /> Definir meta</button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
