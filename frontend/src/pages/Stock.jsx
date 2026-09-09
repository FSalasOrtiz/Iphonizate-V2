import React, { useState } from "react";
import { Search, Package } from "lucide-react";
import { Card, Empty, Badge, Chip } from "../components/ui";
import { useApp } from "../context/AppContext";
import { fmtMoney } from "../lib/helpers";

export default function Stock() {
  const { data, activeTienda } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("disponible");

  const base = data.equipos.filter((e) => e.ubicacion === activeTienda);
  const counts = {
    por_revisar: base.filter((e) => e.estado === "por_revisar").length,
    en_tecnico: base.filter((e) => e.estado === "en_tecnico").length,
    reservado: base.filter((e) => e.estado === "reservado").length,
  };
  const filtered = base.filter(
    (e) => e.estado === filter && (query === "" || e.modelo.toLowerCase().includes(query.toLowerCase()) || e.color.toLowerCase().includes(query.toLowerCase()) || e.imei.includes(query))
  );

  return (
    <>
      <h1 className="h1">Stock</h1>
      <div className="h1-sub">Equipos disponibles por tienda, con batería, capacidad y precio de lista.</div>
      <Card right={<Badge tone="green">{base.filter((e) => e.estado === "disponible").length} disponibles</Badge>}>
        <div className="search-row"><Search size={16} /><input className="search-input" placeholder="Escanea o escribe el IMEI y presiona Enter · también busca por modelo o color" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="chip-row">
          <span className="field-label">VER TAMBIÉN</span>
          <Chip active={filter === "por_revisar"} onClick={() => setFilter("por_revisar")}>Por revisar {counts.por_revisar}</Chip>
          <Chip active={filter === "en_tecnico"} onClick={() => setFilter("en_tecnico")}>En técnico {counts.en_tecnico}</Chip>
          <Chip active={filter === "reservado"} onClick={() => setFilter("reservado")}>Reservado {counts.reservado}</Chip>
          <Chip active={filter === "disponible"} onClick={() => setFilter("disponible")}>Disponible</Chip>
        </div>
        {filtered.length === 0 ? (
          <Empty icon={Package} title="No hay equipos que mostrar" subtitle="Nada calza con el filtro. Prueba con otro criterio, activa los estados de arriba o ingresa equipos nuevos." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Modelo</th><th>GB</th><th>Color</th><th>Batería %</th><th>IMEI</th><th>Precio</th></tr></thead>
              <tbody>{filtered.map((e) => (<tr key={e.id}><td>{e.modelo}</td><td>{e.gb}</td><td>{e.color}</td><td>{e.bateria}%</td><td>{e.imei}</td><td>{fmtMoney(e.precio)}</td></tr>))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
