# iPhonizate OS

Panel de gestión para tiendas de celulares: ventas, reservas, garantías,
inventario, técnico, caja, reportes y más. Los datos se guardan en el
`localStorage` del navegador (por dispositivo, no sincronizado entre equipos).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).

## Login

Credenciales de demo (cámbialas en `src/context/AuthContext.jsx`):

- Usuario: `renato`
- PIN: `123456`

## Estructura del proyecto

```
src/
  main.jsx                 # punto de entrada
  App.jsx                  # arma los providers y decide login vs app
  lib/
    constants.js            # tiendas, estados, navegación, textos de página
    helpers.js               # formateo de fechas/dinero, ids, CSV, datos vacíos
    storage.js                # persistencia en localStorage
  context/
    AppContext.jsx            # estado de datos + acciones (patch, auditoría)
    AuthContext.jsx            # sesión / login / bloqueo por intentos
  components/
    ui/                        # piezas reutilizables (Card, Badge, Empty…)
    layout/                    # Sidebar, Topbar, AppLayout
    auth/LoginPage.jsx          # pantalla de ingreso
  pages/                        # una pantalla por archivo (Dashboard, Vender…)
  styles/globals.css             # todo el tema visual (oscuro + rosa)
```

## Notas

- Es un proyecto 100% frontend: no hay backend real, base de datos, ni el
  lector USB de Mac (esa sección queda como formulario de referencia).
- Para producción real necesitarías un backend (auth de verdad, base de
  datos compartida entre tiendas, etc.) — esto es el punto de partida de UI
  y lógica de negocio.
