import {
  LayoutDashboard, ShoppingCart, CalendarClock, ShieldCheck, Users, ListChecks,
  Package, Boxes, ArrowLeftRight, Wrench, Headphones, Tag, Wallet, ClipboardCheck,
  Receipt, Target, BarChart3, FileSearch, Settings, UserCog,
} from "lucide-react";

export const TIENDAS = ["Black Pink Phone", "Riffstore", "iPhonizate", "Bodega central"];

export const TIENDA_COLOR = {
  "Black Pink Phone": "#ec1f80",
  Riffstore: "#8b5cf6",
  iPhonizate: "#f59e0b",
  "Bodega central": "#38bdf8",
};

export const ESTADO_LABELS = {
  disponible: "Disponible",
  por_revisar: "Por revisar",
  en_tecnico: "En técnico",
  reservado: "Reservado",
  garantia: "Garantía",
  vendido: "Vendido",
  entregado: "Entregado",
};

export const ESTADO_TONE = {
  disponible: "green",
  por_revisar: "yellow",
  en_tecnico: "blue",
  reservado: "purple",
  garantia: "red",
  vendido: "gray",
  entregado: "gray",
};

export const CATEGORIAS_ACCESORIO = ["Cargador", "Carcasa", "Mica", "Audífonos", "Otro"];
export const CATEGORIAS_GASTO = ["Arriendo", "Remuneraciones", "Publicidad", "Servicios", "Otro"];
export const METODOS_PAGO = ["Efectivo", "Transferencia", "Crédito", "Parte de pago"];
export const URGENCIAS = ["Alta", "Media", "Baja"];

// Admin: ve todo. Vendedor: solo OPERACIÓN. Bodeguero: solo INVENTARIO.
// Configuración y cerrar sesión quedan disponibles para los tres.
export const ROLES = ["Admin", "Vendedor", "Bodeguero"];

export const SESSION_TIMEOUT_OPTIONS = [
  { label: "5 minutos", value: 5 },
  { label: "15 minutos", value: 15 },
  { label: "30 minutos", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "Nunca", value: 0 },
];

export const DEFAULT_THEME_ID = "claro";

// V2 adopta el lenguaje de un back-office financiero (Stripe / Mercury):
// claro y sobrio, orientado a datos (números tabulares, tablas densas),
// acento morado Stripe (#635bff) solo en acciones y links, y color
// verde/rojo reservado para éxito/fallo. Claro por defecto + variante oscura.
// --primary = texto oscuro de referencia; --pink* = el acento morado.
export const THEMES = [
  {
    id: "claro",
    label: "Claro",
    colors: {
      bg: "#f6f9fc", bgElev: "#ffffff", surface: "#ffffff", surface2: "#f7fafc",
      border: "#e3e8ee", borderSoft: "#eef1f6",
      text: "#1a1f36", textDim: "#3c4257", textFaint: "#697386",
      primary: "#1a1f36", primaryFg: "#ffffff", primaryHover: "#0b0e1c",
      pink: "#635bff", pinkDark: "#4b45c6", pinkSecondary: "#7a73ff",
    },
  },
  {
    id: "oscuro",
    label: "Oscuro",
    colors: {
      bg: "#0a0e27", bgElev: "#111634", surface: "#111634", surface2: "#1a2044",
      border: "#2a3157", borderSoft: "#1f2647",
      text: "#f5f6fb", textDim: "#b3b9d4", textFaint: "#8a91b4",
      primary: "#f5f6fb", primaryFg: "#0a0e27", primaryHover: "#e2e5f3",
      pink: "#8f88ff", pinkDark: "#635bff", pinkSecondary: "#a29bff",
    },
  },
];

const OPERACION_ROLES = ["Admin", "Vendedor"];
const INVENTARIO_ROLES = ["Admin", "Bodeguero"];
const ADMIN_ONLY = ["Admin"];

export const NAV = [
  { group: "", items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "OPERACIÓN",
    items: [
      { id: "vender", label: "Vender", icon: ShoppingCart, roles: OPERACION_ROLES },
      { id: "reservas", label: "Reservas", icon: CalendarClock, roles: OPERACION_ROLES },
      { id: "garantias", label: "Garantías", icon: ShieldCheck, roles: OPERACION_ROLES },
      { id: "clientes", label: "Clientes", icon: Users, roles: OPERACION_ROLES },
      { id: "tareas", label: "Tareas", icon: ListChecks, roles: OPERACION_ROLES },
    ],
  },
  {
    group: "INVENTARIO",
    items: [
      { id: "stock", label: "Stock", icon: Package, roles: INVENTARIO_ROLES },
      { id: "inventario", label: "Inventario", icon: Boxes, roles: INVENTARIO_ROLES },
      { id: "movimientos", label: "Movimientos", icon: ArrowLeftRight, roles: INVENTARIO_ROLES },
      { id: "tecnico", label: "Técnico", icon: Wrench, roles: INVENTARIO_ROLES },
      { id: "accesorios", label: "Accesorios", icon: Headphones, roles: INVENTARIO_ROLES },
      { id: "precios", label: "Precios", icon: Tag, roles: INVENTARIO_ROLES },
    ],
  },
  {
    group: "ADMINISTRACIÓN",
    items: [
      { id: "caja", label: "Caja", icon: Wallet, roles: ADMIN_ONLY },
      { id: "revision", label: "Revisión de pagos", icon: ClipboardCheck, roles: ADMIN_ONLY },
      { id: "gastos", label: "Gastos", icon: Receipt, roles: ADMIN_ONLY },
      { id: "metas", label: "Metas", icon: Target, roles: ADMIN_ONLY },
      { id: "reportes", label: "Reportes", icon: BarChart3, roles: ADMIN_ONLY },
      { id: "auditoria", label: "Auditoría", icon: FileSearch, roles: ADMIN_ONLY },
      { id: "usuarios", label: "Usuarios", icon: UserCog, roles: ADMIN_ONLY },
      { id: "configuracion", label: "Configuración", icon: Settings },
    ],
  },
];

export const PAGE_META = {
  dashboard: ["Dashboard", "Resumen del día"],
  vender: ["Vender", "Arma una venta y ciérrala"],
  reservas: ["Reservas", "Equipos apartados con abono · no cuentan como venta hasta completarse"],
  garantias: ["Garantías", "Solicitudes de garantía, SLA de 72 horas y resoluciones por reparación o cambio."],
  clientes: ["Clientes", "Historial de compras, garantías y contacto."],
  tareas: ["Tareas", "Pendientes del equipo por urgencia y responsable."],
  stock: ["Stock", "Equipos disponibles por tienda, con batería, capacidad y precio de lista."],
  inventario: ["Inventario", "Equipos de la cadena por IMEI, estado, ubicación y días en stock."],
  movimientos: ["Movimientos", "Traslados entre tiendas y bodega, con trazabilidad por equipo."],
  tecnico: ["Técnico", "Asignación de equipos a técnicos, seguimiento en taller y reparaciones hechas."],
  accesorios: ["Accesorios", "Catálogo de accesorios con stock por tienda, mínimos y ajustes registrados."],
  precios: ["Precios", "Precios sugeridos por modelo y capacidad, con control de actualización."],
  caja: ["Caja", "Cierre de la tienda del día seleccionado"],
  revision: ["Revisión de pagos", "Control de las formas de pago de cada venta"],
  gastos: ["Gastos", "Arriendos, remuneraciones, publicidad y gastos operativos por tienda."],
  metas: ["Metas", "Progreso mensual por tienda"],
  reportes: ["Reportes", "Ventas, margen y rotación por período y tienda. Todo excluye las ventas anuladas."],
  auditoria: ["Auditoría", "Registro de cambios de precio, stock y accesos, de todos los usuarios."],
  usuarios: ["Usuarios", "Gestiona quién puede entrar al sistema y con qué rol."],
  configuracion: ["Configuración", "Tu sesión, la apariencia de la app y los lectores por USB."],
};
