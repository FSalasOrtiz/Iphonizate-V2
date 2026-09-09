# iPhonizate OS

Panel de gestión para tiendas de celulares — ventas, reservas, garantías,
inventario, técnico, caja, reportes, auditoría y más.

## Demo en vivo

👉 **https://fsalasortiz.github.io/Iphonizate-V2/**

Entra con:

- Usuario: `renato`
- PIN: `123456`

Es una **versión de demostración**: funciona sin servidor y **los datos se
guardan solo en el navegador que estés usando** (no se comparten entre
computadores ni personas). Para borrar todo y empezar de cero, limpia los
datos del sitio en tu navegador.

## Cómo está organizado el repo

```
frontend/   App en React (Vite) — es lo que se publica en la demo
backend/    API en Node/Express + PostgreSQL — para la versión con datos
            compartidos entre dispositivos. Hoy la app NO lo usa.
```

### Correr el frontend en tu computador

Necesitas [Node.js](https://nodejs.org/) 20 o superior.

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestra (normalmente `http://localhost:5173`).

### Publicar la demo (GitHub Pages)

Ya está configurado. Cada vez que se hace `push` a la rama `main`, GitHub
Actions (`.github/workflows/deploy.yml`) compila `frontend/` y lo publica.

Para activarlo la primera vez: en el repo de GitHub, **Settings → Pages →
Build and deployment → Source: GitHub Actions**.

Si cambias el nombre del repositorio, ajusta el `BASE_PATH` en el workflow y
el `base` de `frontend/vite.config.js`.

## Volver a la versión con base de datos (más adelante)

El código del backend (`backend/`) sigue acá para cuando quieras datos
compartidos entre dispositivos y login real. En ese momento hay que:

1. Levantar `backend/` con PostgreSQL (ver `backend/README.md`).
2. Volver a apuntar `frontend/src/lib/storage.js` y
   `frontend/src/context/AuthContext.jsx` a la API en vez de `localStorage`.

## Qué NO incluye la demo

- Datos compartidos entre dispositivos (cada navegador tiene los suyos).
- Backups.
- El lector USB de Mac es solo el formulario de referencia.
