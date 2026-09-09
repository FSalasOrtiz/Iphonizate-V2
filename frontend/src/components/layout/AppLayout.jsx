import React, { useState } from "react";
import { HardDriveDownload } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { useApp } from "../../context/AppContext";

import Dashboard from "../../pages/Dashboard.jsx";
import Vender from "../../pages/Vender.jsx";
import Reservas from "../../pages/Reservas.jsx";
import Garantias from "../../pages/Garantias.jsx";
import Clientes from "../../pages/Clientes.jsx";
import Tareas from "../../pages/Tareas.jsx";
import Stock from "../../pages/Stock.jsx";
import Inventario from "../../pages/Inventario.jsx";
import Movimientos from "../../pages/Movimientos.jsx";
import Tecnico from "../../pages/Tecnico.jsx";
import Accesorios from "../../pages/Accesorios.jsx";
import Precios from "../../pages/Precios.jsx";
import Caja from "../../pages/Caja.jsx";
import Revision from "../../pages/Revision.jsx";
import Gastos from "../../pages/Gastos.jsx";
import Metas from "../../pages/Metas.jsx";
import Reportes from "../../pages/Reportes.jsx";
import Auditoria from "../../pages/Auditoria.jsx";
import Configuracion from "../../pages/Configuracion.jsx";
import Usuarios from "../../pages/Usuarios.jsx";

const PAGES = {
  dashboard: Dashboard,
  vender: Vender,
  reservas: Reservas,
  garantias: Garantias,
  clientes: Clientes,
  tareas: Tareas,
  stock: Stock,
  inventario: Inventario,
  movimientos: Movimientos,
  tecnico: Tecnico,
  accesorios: Accesorios,
  precios: Precios,
  caja: Caja,
  revision: Revision,
  gastos: Gastos,
  metas: Metas,
  reportes: Reportes,
  auditoria: Auditoria,
  usuarios: Usuarios,
  configuracion: Configuracion,
};

export default function AppLayout() {
  const { loaded } = useApp();
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!loaded) {
    return <div className="boot">Cargando iPhonizate OS…</div>;
  }

  const Page = PAGES[section] || Dashboard;

  return (
    <div className="ios-app">
      <Sidebar section={section} onNavigate={setSection} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-col">
        <Topbar section={section} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="content">
          <Page navigate={setSection} />
          <div className="foot-note">
            <HardDriveDownload size={12} /> Versión de demostración · los datos se guardan solo en este navegador.
          </div>
        </main>
      </div>
    </div>
  );
}
