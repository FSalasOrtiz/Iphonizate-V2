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

export const DEFAULT_THEME_ID = "rosa";

// Cada tema define TODA la paleta (fondo, superficies, texto y acento),
// no solo un color de acento — así el cambio se nota en toda la app.
export const THEMES = [
  {
    id: "rosa",
    label: "Rosa Nocturno",
    colors: {
      bg: "#0b0710", bgElev: "#130d1c", surface: "#171021", surface2: "#1d1529",
      border: "#2b2138", borderSoft: "#221a2e",
      text: "#f3eef7", textDim: "#a99bb8", textFaint: "#7c6f8c",
      pink: "#ec1f80", pinkDark: "#c2137f", pinkSecondary: "#a020c0",
    },
  },
  {
    id: "azul",
    label: "Azul Medianoche",
    colors: {
      bg: "#070b14", bgElev: "#0d1420", surface: "#111a2b", surface2: "#162236",
      border: "#22314a", borderSoft: "#1a2740",
      text: "#eef3fb", textDim: "#9fb0c9", textFaint: "#71829c",
      pink: "#38bdf8", pinkDark: "#0284c7", pinkSecondary: "#0ea5e9",
    },
  },
  {
    id: "verde",
    label: "Verde Bosque",
    colors: {
      bg: "#070f0c", bgElev: "#0c1712", surface: "#101d17", surface2: "#15271f",
      border: "#233a2f", borderSoft: "#1b2e25",
      text: "#eef7f1", textDim: "#9dbdaa", textFaint: "#6f8c7c",
      pink: "#34d399", pinkDark: "#10b981", pinkSecondary: "#059669",
    },
  },
  {
    id: "atardecer",
    label: "Atardecer",
    colors: {
      bg: "#140a06", bgElev: "#1d0f08", surface: "#24140c", surface2: "#2e1a10",
      border: "#452817", borderSoft: "#382012",
      text: "#fbf1e8", textDim: "#d9b79c", textFaint: "#a37f62",
      pink: "#f59e0b", pinkDark: "#d97706", pinkSecondary: "#ea580c",
    },
  },
  {
    id: "claro",
    label: "Claro",
    colors: {
      bg: "#f5f4f8", bgElev: "#ffffff", surface: "#ffffff", surface2: "#f0eef5",
      border: "#e2dfec", borderSoft: "#ebe8f2",
      text: "#221a2e", textDim: "#5c5470", textFaint: "#8b84a0",
      pink: "#ec1f80", pinkDark: "#c2137f", pinkSecondary: "#a020c0",
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
