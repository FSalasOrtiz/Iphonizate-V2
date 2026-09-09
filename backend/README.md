# iPhonizate OS — API

Backend en Node.js + Express + PostgreSQL. Da soporte a:

- **Login real**: usuario + PIN de 6 dígitos, PIN guardado con hash (bcrypt),
  bloqueo de 15 minutos tras 5 intentos fallidos, sesión con JWT (30 días).
- **Datos compartidos**: todo el estado de la app (equipos, ventas, clientes,
  garantías, etc.) vive en una tabla Postgres — accesible desde cualquier
  dispositivo, no solo el navegador que lo creó.

## Cómo correrlo en local

1. Necesitas una base Postgres corriendo. La forma más fácil es con el
   `docker-compose.yml` que está en la raíz del proyecto:
   ```bash
   cd ..
   docker compose up -d
   cd backend
   ```

2. Copia el archivo de variables de entorno y ajústalo si hace falta:
   ```bash
   cp .env.example .env
   ```

3. Instala dependencias, crea las tablas y el primer usuario:
   ```bash
   npm install
   npm run migrate
   npm run seed
   ```

4. Levanta el servidor:
   ```bash
   npm run dev
   ```
   Debería quedar escuchando en `http://localhost:4000`.

5. Prueba que responde:
   ```bash
   curl http://localhost:4000/api/health
   ```

## Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Cadena de conexión a Postgres |
| `JWT_SECRET` | Secreto para firmar las sesiones. Genera uno con `openssl rand -hex 32` |
| `FRONTEND_ORIGIN` | Dominio(s) del frontend permitidos por CORS, separados por coma |
| `PORT` | Puerto del servidor (Railway/Render lo definen solos) |
| `SEED_USUARIO`, `SEED_PIN`, `SEED_NOMBRE`, `SEED_ROL` | Usados solo por `npm run seed` |

## Endpoints

- `POST /api/auth/login` `{ usuario, pin }` → `{ token, user }`
- `GET  /api/auth/me` (requiere `Authorization: Bearer <token>`) → `{ user }`
- `GET  /api/data` (requiere auth) → `{ data }` — todo el estado de la app
- `PUT  /api/data` (requiere auth) `{ data }` → guarda el estado completo

## Agregar más usuarios

Por ahora no hay pantalla de administración de usuarios. Para agregar a
alguien más, corre el seed con otras variables:

```bash
SEED_USUARIO=maria SEED_PIN=654321 SEED_NOMBRE=María SEED_ROL=Vendedora npm run seed
```

(Está bien pedirme después una pantalla de "Usuarios" dentro de Configuración
si la necesitas — no la incluí todavía para no sobre-construir sin que la
pidieras.)

## Desplegar en Railway (recomendado para empezar)

1. Crea un proyecto nuevo en [railway.app](https://railway.app) y conecta
   este repo (o solo la carpeta `backend/`, Railway permite elegir el
   "root directory" del servicio).
2. Agrega un plugin de **PostgreSQL** desde el marketplace de Railway —
   te da automáticamente una `DATABASE_URL`.
3. En el servicio del backend, define las variables de entorno de la tabla
   de arriba (`JWT_SECRET`, `FRONTEND_ORIGIN`, y las `SEED_*` si quieres
   que el primer deploy cree el usuario automáticamente).
4. En "Deploy" configura:
   - Build command: `npm install`
   - Start command: `npm run migrate && npm run seed && npm start`
     (así cada deploy asegura que las tablas existan; `seed` no rompe nada
     si el usuario ya existe, solo lo actualiza).
5. Railway te da una URL pública tipo `https://tu-api.up.railway.app` —
   esa es la que va en `VITE_API_URL` del frontend.
