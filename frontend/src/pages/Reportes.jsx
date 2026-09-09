import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, Empty, StatCard, Chip } from "../components/ui";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { fmtMoney, downloadCSV, todayISO, daysBetween } from "../lib/helpers";
import { TIENDAS } from "../lib/constants";

export default function Reportes() {
  const { data } = useApp();
  const { theme } = useTheme();
  const [preset, setPreset] = useState("Este mes");
  const [tienda, setTienda] = useState("Todas las tiendas");
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [hasta, setHasta] = useState(todayISO());

  useEffect(() => {
    const now = new Date();
    if (preset === "Hoy") { setDesde(todayISO()); setHasta(todayISO()); }
    else if (preset === "Esta semana") { const d = new Date(); d.setDate(d.getDate() - d.getDay()); setDesde(d.toISOString().slice(0, 10)); setHasta(todayISO()); }
    else if (preset === "Este mes") { const d = new Date(now.getFullYear(), now.getMonth(), 1); setDesde(d.toISOString().slice(0, 10)); setHasta(todayISO()); }
    else if (preset === "Mes pasado") { const d = new Date(now.getFullYear(), now.getMonth() - 1, 1); const f = new Date(now.getFullYear(), now.getMonth(), 0); setDesde(d.toISOString().slice(0, 10)); setHasta(f.toISOString().slice(0, 10)); }
  }, [preset]);

  const ventas = data.ventas.filter((v) => {
    const f = v.fecha.slice(0, 10);
    if (f < desde || f > hasta) return false;
    if (tienda !== "Todas las tiendas" && v.tienda !== tienda) return false;
    return true;
  });

  const ingresos = ventas.reduce((s, v) => s + v.total, 0);
  const ganancia = ventas.reduce((s, v) => s + v.margen, 0);
  const equiposVendidos = ventas.reduce((s, v) => s + v.equipoIds.length, 0);

  const porDia = {};
  ventas.forEach((v) => { const d = v.fecha.slice(0, 10); porDia[d] = (porDia[d] || 0) + v.total; });
  const chartData = Object.entries(porDia).sort(([a], [b]) => (a < b ? -1 : 1)).map(([d, total]) => ({ dia: d.slice(8, 10) + "/" + d.slice(5, 7), total }));

  const ranking = {};
  ventas.forEach((v) => {
    v.equipoIds.forEach((id) => {
      const eq = data.equipos.find((e) => e.id === id);
      if (!eq) return;
      if (!ranking[eq.modelo]) ranking[eq.modelo] = { unidades: 0, ingreso: 0, margen: 0 };
      ranking[eq.modelo].unidades += 1;
      ranking[eq.modelo].ingreso += eq.precio;
      ranking[eq.modelo].margen += eq.precio - eq.costo;
    });
  });
  const rankingRows = Object.entries(ranking).map(([modelo, r]) => ({ modelo, ...r, margenProm: r.unidades ? r.margen / r.unidades : 0 })).sort((a, b) => b.unidades - a.unidades);

  const porTienda = TIENDAS.map((t) => {
    const vs = ventas.filter((v) => v.tienda === t);
    return { tienda: t, ventas: vs.length, ingresos: vs.reduce((s, v) => s + v.total, 0), ticket: vs.length ? vs.reduce((s, v) => s + v.total, 0) / vs.length : 0, ganancia: vs.reduce((s, v) => s + v.margen, 0) };
  }).filter((r) => r.ventas > 0);

  const disponibles = data.equipos.filter((e) => e.estado === "disponible");
  const promedioDias = disponibles.length ? Math.round(disponibles.reduce((s, e) => s + daysBetween(new Date(e.fechaIngreso), new Date()), 0) / disponibles.length) : 0;

  return (
    <>
      <h1 className="h1">Reportes</h1>
      <div className="h1-sub">Ventas, margen y rotación por período y tienda. Todo excluye las ventas anuladas.</div>
      <Card>
        <div className="chip-row">
          {["Hoy", "Esta semana", "Este mes", "Mes pasado"].map((p) => <Chip key={p} active={preset === p} onClick={() => setPreset(p)}>{p}</Chip>)}
          <span className="field-label">DESDE</span>
          <input className="input-mini-date" type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPreset("custom"); }} />
          <span className="field-label">HASTA</span>
          <input className="input-mini-date" type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPreset("custom"); }} />
          <select className="select-inline" value={tienda} onChange={(e) => setTienda(e.target.value)}>
            <option>Todas las tiendas</option>{TIENDAS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      <Card title="Ventas por período" subtitle="Equipos vendidos, ingresos y evolución diaria." right={<button className="btn-icon" onClick={() => downloadCSV("ventas.csv", ventas.map((v) => ({ fecha: v.fecha, tienda: v.tienda, cliente: v.clienteNombre, total: v.total, margen: v.margen })))}><Download size={14} /> CSV</button>}>
        <div className="stat-grid stat-grid-4">
          <StatCard label="VENTAS" value={ventas.length} />
          <StatCard label="EQUIPOS VENDIDOS" value={equiposVendidos} />
          <StatCard label="INGRESOS" value={fmtMoney(ingresos)} />
          <StatCard label="GANANCIA" value={fmtMoney(ganancia)} />
        </div>
        <div style={{ height: 220, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke={theme.colors.borderSoft} strokeDasharray="3 3" />
              <XAxis dataKey="dia" stroke={theme.colors.textFaint} fontSize={11} />
              <YAxis stroke={theme.colors.textFaint} fontSize={11} />
              <Tooltip
                contentStyle={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 8, color: theme.colors.text }}
                formatter={(v) => fmtMoney(v)}
              />
              <Line type="monotone" dataKey="total" stroke={theme.colors.pink} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Ranking de modelos" subtitle="Ordenable por cualquier columna." right={<button className="btn-icon" onClick={() => downloadCSV("ranking.csv", rankingRows)}><Download size={14} /> CSV</button>}>
        {rankingRows.length === 0 ? <Empty title="Sin ventas de equipos en el período" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Modelo</th><th>Unidades</th><th>Ingreso total</th><th>Margen promedio</th></tr></thead>
              <tbody>{rankingRows.map((r) => (<tr key={r.modelo}><td>{r.modelo}</td><td>{r.unidades}</td><td>{fmtMoney(r.ingreso)}</td><td>{fmtMoney(r.margenProm)}</td></tr>))}</tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Rendimiento por tienda" right={<button className="btn-icon" onClick={() => downloadCSV("tiendas.csv", porTienda)}><Download size={14} /> CSV</button>}>
        {porTienda.length === 0 ? <Empty title="Sin ventas en el período" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Tienda</th><th>Ventas</th><th>Ingresos</th><th>Ticket promedio</th><th>Ganancia</th></tr></thead>
              <tbody>{porTienda.map((r) => (<tr key={r.tienda}><td>{r.tienda}</td><td>{r.ventas}</td><td>{fmtMoney(r.ingresos)}</td><td>{fmtMoney(r.ticket)}</td><td>{fmtMoney(r.ganancia)}</td></tr>))}</tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Rotación de inventario" subtitle="Equipos disponibles y su antigüedad en stock.">
        <div className="stat-grid stat-grid-2">
          <StatCard label="PROMEDIO DÍAS EN STOCK" value={promedioDias} />
          <StatCard label="EQUIPOS DISPONIBLES" value={disponibles.length} />
        </div>
      </Card>
    </>
  );
}
