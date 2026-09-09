import React, { useState } from "react";
import { ScanLine } from "lucide-react";
import { Card, Empty, Badge } from "../components/ui";
import { useApp } from "../context/AppContext";
import { uid, fmtMoney, todayISO } from "../lib/helpers";
import { METODOS_PAGO } from "../lib/constants";

export default function Caja() {
  const { data, patch, activeTienda, addAudit, session } = useApp();
  const [fecha, setFecha] = useState(todayISO());
  const [fondoInicial, setFondoInicial] = useState(0);
  const [contado, setContado] = useState({ Efectivo: 0, Transferencia: 0, Crédito: 0, "Parte de pago": 0 });
  const [imei, setImei] = useState("");
  const [contados, setContados] = useState([]);

  const ventasDia = data.ventas.filter((v) => v.tienda === activeTienda && v.fecha.slice(0, 10) === fecha);
  const esperado = METODOS_PAGO.reduce((acc, m) => {
    acc[m] = ventasDia.filter((v) => v.metodoPago === m).reduce((s, v) => s + v.total, 0);
    return acc;
  }, {});

  const activos = data.equipos.filter((e) => e.ubicacion === activeTienda && (e.estado === "disponible" || e.estado === "por_revisar"));

  const escanear = () => {
    const eq = activos.find((e) => e.imei === imei.trim());
    if (eq && !contados.includes(eq.id)) setContados((c) => [...c, eq.id]);
    setImei("");
  };

  const cierresAnteriores = data.cierresCaja.filter((c) => c.tienda === activeTienda);

  const cerrar = () => {
    const diffDinero = METODOS_PAGO.reduce((s, m) => s + (Number(contado[m]) - esperado[m]), 0);
    const faltantes = activos.length - contados.length;
    patch("cierresCaja", (arr) => [
      { id: uid(), tienda: activeTienda, fecha, fondoInicial: Number(fondoInicial), contado, esperado, diffDinero, faltantes, cerro: session?.nombre || "—" },
      ...arr,
    ]);
    addAudit("Cerró caja", `${activeTienda} · ${fecha}`, activeTienda);
    setContado({ Efectivo: 0, Transferencia: 0, Crédito: 0, "Parte de pago": 0 });
    setContados([]); setFondoInicial(0);
  };

  return (
    <>
      <h1 className="h1">Caja</h1>
      <div className="h1-sub">Cierre de {activeTienda} del día seleccionado</div>

      <Card title="Cuadre de dinero" right={
        <div className="field-inline">
          <span className="field-label">FECHA DEL CIERRE</span>
          <input className="input-mini-date" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      }>
        <div className="field-label">FONDO INICIAL</div>
        <input className="input" type="number" value={fondoInicial} onChange={(e) => setFondoInicial(e.target.value)} />
        <div className="table-wrap" style={{ marginTop: 10 }}>
          <table className="table">
            <thead><tr><th>Método</th><th>Esperado</th><th>Contado</th><th>Diferencia</th></tr></thead>
            <tbody>
              {METODOS_PAGO.map((m) => {
                const diff = (Number(contado[m]) || 0) - esperado[m];
                return (
                  <tr key={m}>
                    <td>{m}</td><td>{fmtMoney(esperado[m])}</td>
                    <td><input className="input-mini" type="number" value={contado[m]} onChange={(e) => setContado((c) => ({ ...c, [m]: e.target.value }))} /></td>
                    <td className={diff === 0 ? "" : diff > 0 ? "text-green" : "text-red"}>{fmtMoney(diff)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Cuadre de equipos" right={<Badge>contados {contados.length} de {activos.length}</Badge>}>
        <div className="search-row"><ScanLine size={16} /><input className="search-input" placeholder="Escanea o escribe el IMEI y presiona Enter" value={imei} onChange={(e) => setImei(e.target.value)} onKeyDown={(e) => e.key === "Enter" && escanear()} /></div>
        {activos.length === 0 ? <Empty title="No hay equipos activos en esta tienda" /> : (
          <div className="empty-inline">{contados.length === activos.length ? "Todo cuadra: dinero y equipos." : `Faltan ${activos.length - contados.length} equipos por escanear.`}</div>
        )}
        <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={cerrar}>Cerrar caja</button>
      </Card>

      <Card title="Cierres anteriores">
        {cierresAnteriores.length === 0 ? <Empty title="Aún no hay cierres guardados" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Tienda</th><th>Cerró</th><th>Diferencia en dinero</th><th>Equipos faltantes</th></tr></thead>
              <tbody>{cierresAnteriores.map((c) => (<tr key={c.id}><td>{c.fecha}</td><td>{c.tienda}</td><td>{c.cerro}</td><td>{fmtMoney(c.diffDinero)}</td><td>{c.faltantes}</td></tr>))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
