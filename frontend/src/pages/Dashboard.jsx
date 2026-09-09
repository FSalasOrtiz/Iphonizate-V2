import React from "react";
import { ShieldCheck, ListChecks, ShoppingCart, AlertCircle } from "lucide-react";
import { Card, Empty, Badge, StatCard } from "../components/ui";
import { useApp } from "../context/AppContext";
import { fmtMoney, fmtDateShort, todayISO, monthKey } from "../lib/helpers";

export default function Dashboard({ navigate }) {
  const { data, activeTienda } = useApp();
  const today = todayISO();
  const mk = monthKey();

  const ventasHoy = data.ventas.filter((v) => v.tienda === activeTienda && v.fecha.slice(0, 10) === today);
  const ventasMes = data.ventas.filter((v) => v.tienda === activeTienda && v.fecha.slice(0, 7) === mk);

  const ingresosHoy = ventasHoy.reduce((s, v) => s + v.total, 0);
  const gananciaHoy = ventasHoy.reduce((s, v) => s + v.margen, 0);
  const ingresosMes = ventasMes.reduce((s, v) => s + v.total, 0);
  const gananciaMes = ventasMes.reduce((s, v) => s + v.margen, 0);

  const stockDisponible = data.equipos.filter((e) => e.estado === "disponible").length;

  const alertas = [];
  data.equipos
    .filter((e) => e.estado === "disponible")
    .forEach((e) => {
      if (e.bateria < 80) alertas.push(`${e.modelo} (${e.imei.slice(-4)}) tiene batería al ${e.bateria}%`);
    });
  data.garantias
    .filter((g) => g.estado === "abierta")
    .forEach((g) => {
      const horas = (new Date(g.slaFecha) - new Date()) / 3600000;
      if (horas < 12) alertas.push(`Garantía por vencer SLA en ${Math.max(0, Math.round(horas))}h`);
    });

  const meta = data.metas[activeTienda]?.[mk];
  const equiposVendidosMes = ventasMes.reduce((s, v) => s + v.equipoIds.length, 0);

  const tareasPendientes = data.tareas.filter((t) => !t.hecha).slice(0, 4);
  const ultimasVentas = data.ventas.filter((v) => v.tienda === activeTienda).slice(0, 6);

  return (
    <>
      <h1 className="h1">Resumen del día</h1>
      <div className="h1-sub">
        Operación de {activeTienda} · {new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
      </div>

      <div className="stat-grid">
        <StatCard label="VENTAS HOY" value={ventasHoy.length} sub={`${ventasHoy.reduce((s, v) => s + v.equipoIds.length, 0)} boletas emitidas hoy`} />
        <StatCard label="INGRESOS HOY" value={fmtMoney(ingresosHoy)} sub={`${fmtMoney(ingresosMes)} en el mes`} />
        <StatCard label="GANANCIA HOY" value={fmtMoney(gananciaHoy)} sub={`${fmtMoney(gananciaMes)} en el mes`} />
        <StatCard label="STOCK DISPONIBLE" value={stockDisponible} sub="Equipos disponibles en toda la cadena" />
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard label="VENTAS DEL MES" value={`${equiposVendidosMes} equipos`} />
        <StatCard label="INGRESOS DEL MES" value={fmtMoney(ingresosMes)} />
        <StatCard label="GANANCIA DEL MES" value={fmtMoney(gananciaMes)} />
      </div>

      <Card title="Alertas" right={<Badge tone={alertas.length ? "yellow" : "green"}>{alertas.length} activas</Badge>}>
        {alertas.length === 0 ? (
          <Empty icon={ShieldCheck} title="Todo impecable por acá" subtitle="Ni una alerta activa: la operación está al día. Aprovecha y vende." />
        ) : (
          <ul className="simple-list">
            {alertas.map((a, i) => (
              <li key={i}>
                <AlertCircle size={14} /> {a}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={`Meta del mes · ${new Date().toLocaleDateString("es-CL", { month: "long", year: "numeric" })}`}>
        {!meta ? (
          <div className="empty-inline">
            Esta tienda todavía no tiene meta definida para el período.{" "}
            <button className="link-btn" onClick={() => navigate("metas")}>
              Definir meta
            </button>
          </div>
        ) : (
          <div>
            <div className="progress-row">
              <span>Equipos</span>
              <span>
                {equiposVendidosMes} / {meta.equipos}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(100, (equiposVendidosMes / (meta.equipos || 1)) * 100)}%` }} />
            </div>
          </div>
        )}
      </Card>

      <Card title="Tareas pendientes" right={<button className="link-btn" onClick={() => navigate("tareas")}>Ver todas</button>}>
        {tareasPendientes.length === 0 ? (
          <Empty icon={ListChecks} title="Sin tareas pendientes." />
        ) : (
          <ul className="simple-list">
            {tareasPendientes.map((t) => (
              <li key={t.id}>
                <Badge tone={t.urgencia === "Alta" ? "red" : t.urgencia === "Media" ? "yellow" : "gray"}>{t.urgencia}</Badge>
                {t.titulo}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Últimas ventas" right={<Badge>{ultimasVentas.length} boletas · {fmtMoney(ingresosHoy)}</Badge>}>
        {ultimasVentas.length === 0 ? (
          <Empty icon={ShoppingCart} title="Todavía no se vende nada este mes" subtitle="Cuando registres la primera venta del período va a aparecer justo acá." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Equipos</th>
                  <th>Boleta</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ultimasVentas.map((v) => (
                  <tr key={v.id}>
                    <td>{fmtDateShort(v.fecha)}</td>
                    <td>{v.clienteNombre || "Sin cliente"}</td>
                    <td>{v.equipoIds.length}</td>
                    <td>{v.conBoleta ? "Sí" : "No"}</td>
                    <td>{fmtMoney(v.total)}</td>
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
