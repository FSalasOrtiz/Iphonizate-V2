export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const fmtMoney = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

export const fmtDateLong = (d) => {
  const s = d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const fmtDateShort = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const fmtDateTime = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
  );
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const daysBetween = (a, b) => Math.floor((b - a) / (1000 * 60 * 60 * 24));

export function relativeDays(iso) {
  const days = daysBetween(new Date(iso), new Date());
  if (days <= 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}

export function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function emptyData() {
  return {
    equipos: [],
    accesorios: [],
    precios: [],
    clientes: [],
    ventas: [],
    reservas: [],
    garantias: [],
    tareas: [],
    movimientos: [],
    tecnicos: [],
    asignaciones: [],
    reparaciones: [],
    gastos: [],
    metas: {},
    cierresCaja: [],
    auditoria: [],
    macs: [],
  };
}
