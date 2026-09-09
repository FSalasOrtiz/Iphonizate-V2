// Autenticación 100% en el navegador (sin backend). Los usuarios viven en
// localStorage; el PIN se guarda hasheado con SHA-256 + sal, no en texto
// plano. No es seguridad real —todo corre en el cliente— pero mantiene el
// mismo flujo de login, roles y bloqueo por intentos que tenía la API.

const USERS_KEY = "iphonizate-users";
const SALT = "iphonizate-os::";
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export const PIN_RE = /^\d{6}$/;

// --- almacenamiento ---------------------------------------------------------

function readUsers() {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// --- utilidades -----------------------------------------------------------

const newId = () =>
  (window.crypto?.randomUUID?.() ||
    Math.random().toString(36).slice(2) + Date.now().toString(36));

async function hashPin(pin) {
  const bytes = new TextEncoder().encode(SALT + String(pin));
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function publicUser(u) {
  return { id: u.id, usuario: u.usuario, nombre: u.nombre, rol: u.rol };
}

// --- API pública ----------------------------------------------------------

// Crea el usuario inicial la primera vez que se abre la app.
export async function seedIfEmpty() {
  if (readUsers().length > 0) return;
  const pinHash = await hashPin("123456");
  writeUsers([
    {
      id: newId(),
      usuario: "renato",
      pinHash,
      nombre: "Renato",
      rol: "Admin",
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
    },
  ]);
}

export function listUsers() {
  return readUsers()
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((u) => ({
      id: u.id,
      usuario: u.usuario,
      nombre: u.nombre,
      rol: u.rol,
      failedAttempts: u.failedAttempts || 0,
      lockedUntil: u.lockedUntil || null,
      createdAt: u.createdAt,
    }));
}

export function getUserById(id) {
  const u = readUsers().find((x) => x.id === id);
  return u ? publicUser(u) : null;
}

export async function verifyLogin(usuario, pin) {
  if (!usuario || !pin) return { ok: false, error: "Usuario y PIN son obligatorios." };

  const users = readUsers();
  const idx = users.findIndex((u) => u.usuario.toLowerCase() === String(usuario).toLowerCase());
  const user = idx >= 0 ? users[idx] : null;

  // Mismo mensaje exista o no el usuario.
  if (!user) return { ok: false, error: "Usuario o PIN incorrecto." };

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const mins = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
    return { ok: false, error: `Cuenta bloqueada. Intenta de nuevo en ${mins} min.` };
  }

  const ok = (await hashPin(pin)) === user.pinHash;

  if (!ok) {
    const attempts = (user.failedAttempts || 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      users[idx] = { ...user, failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() };
      writeUsers(users);
      return { ok: false, error: `Demasiados intentos. La cuenta se bloqueó por ${LOCK_MINUTES} minutos.` };
    }
    users[idx] = { ...user, failedAttempts: attempts };
    writeUsers(users);
    return { ok: false, error: "Usuario o PIN incorrecto." };
  }

  users[idx] = { ...user, failedAttempts: 0, lockedUntil: null };
  writeUsers(users);
  return { ok: true, user: publicUser(user) };
}

export async function createUser({ usuario, pin, nombre, rol }) {
  if (!usuario || !pin || !nombre || !rol) {
    return { ok: false, error: "Usuario, PIN, nombre y rol son obligatorios." };
  }
  if (!PIN_RE.test(String(pin))) {
    return { ok: false, error: "El PIN debe tener exactamente 6 dígitos." };
  }
  const users = readUsers();
  if (users.some((u) => u.usuario.toLowerCase() === String(usuario).toLowerCase())) {
    return { ok: false, error: "Ya existe un usuario con ese nombre de usuario." };
  }
  const user = {
    id: newId(),
    usuario: String(usuario).trim(),
    pinHash: await hashPin(pin),
    nombre: String(nombre).trim(),
    rol,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return { ok: true, user: publicUser(user) };
}

export async function updateUser(id, { nombre, rol, pin, unlock } = {}) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return { ok: false, error: "Usuario no encontrado." };

  if (pin != null && !PIN_RE.test(String(pin))) {
    return { ok: false, error: "El PIN debe tener exactamente 6 dígitos." };
  }

  const next = { ...users[idx] };
  if (nombre) next.nombre = String(nombre).trim();
  if (rol) next.rol = rol;
  if (pin) next.pinHash = await hashPin(pin);
  if (unlock) {
    next.failedAttempts = 0;
    next.lockedUntil = null;
  }

  // No dejar la app sin ningún Admin.
  if (rol && users[idx].rol === "Admin" && rol !== "Admin") {
    const otrosAdmins = users.filter((u) => u.id !== id && u.rol === "Admin").length;
    if (otrosAdmins === 0) return { ok: false, error: "Debe quedar al menos un usuario con rol Admin." };
  }

  users[idx] = next;
  writeUsers(users);
  return { ok: true, user: publicUser(next) };
}

export function deleteUser(id, currentUserId) {
  const users = readUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return { ok: false, error: "Usuario no encontrado." };
  if (id === currentUserId) return { ok: false, error: "No puedes eliminar tu propio usuario." };
  if (target.rol === "Admin" && users.filter((u) => u.rol === "Admin").length <= 1) {
    return { ok: false, error: "No puedes eliminar al último usuario con rol Admin." };
  }
  writeUsers(users.filter((u) => u.id !== id));
  return { ok: true };
}
