import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// Solo Admin puede administrar usuarios.
router.use(requireAuth, requireRole("Admin"));

const PIN_RE = /^\d{6}$/;

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, usuario, nombre, rol, failed_attempts, locked_until, created_at FROM users ORDER BY created_at ASC"
  );
  res.json({ users: rows });
});

router.post("/", async (req, res) => {
  const { usuario, pin, nombre, rol } = req.body || {};
  if (!usuario || !pin || !nombre || !rol) {
    return res.status(400).json({ error: "Usuario, PIN, nombre y rol son obligatorios." });
  }
  if (!PIN_RE.test(String(pin))) {
    return res.status(400).json({ error: "El PIN debe tener exactamente 6 dígitos." });
  }

  const existing = await pool.query("SELECT id FROM users WHERE lower(usuario) = lower($1)", [usuario]);
  if (existing.rows.length) {
    return res.status(409).json({ error: "Ya existe un usuario con ese nombre de usuario." });
  }

  const pinHash = await bcrypt.hash(String(pin), 10);
  const { rows } = await pool.query(
    `INSERT INTO users (usuario, pin_hash, nombre, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING id, usuario, nombre, rol, failed_attempts, locked_until, created_at`,
    [usuario, pinHash, nombre, rol]
  );
  res.status(201).json({ user: rows[0] });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, rol, pin, unlock } = req.body || {};

  const fields = [];
  const values = [];
  let i = 1;

  if (nombre) { fields.push(`nombre = $${i++}`); values.push(nombre); }
  if (rol) { fields.push(`rol = $${i++}`); values.push(rol); }
  if (pin) {
    if (!PIN_RE.test(String(pin))) {
      return res.status(400).json({ error: "El PIN debe tener exactamente 6 dígitos." });
    }
    fields.push(`pin_hash = $${i++}`);
    values.push(await bcrypt.hash(String(pin), 10));
  }
  if (unlock) {
    fields.push("failed_attempts = 0");
    fields.push("locked_until = NULL");
  }

  if (!fields.length) {
    return res.status(400).json({ error: "No hay nada que actualizar." });
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${i}
     RETURNING id, usuario, nombre, rol, failed_attempts, locked_until, created_at`,
    values
  );

  if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado." });
  res.json({ user: rows[0] });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === req.user.sub) {
    return res.status(400).json({ error: "No puedes eliminar tu propio usuario." });
  }

  const target = await pool.query("SELECT rol FROM users WHERE id = $1", [id]);
  if (!target.rows.length) return res.status(404).json({ error: "Usuario no encontrado." });

  if (target.rows[0].rol === "Admin") {
    const { rows: admins } = await pool.query("SELECT id FROM users WHERE rol = 'Admin'");
    if (admins.length <= 1) {
      return res.status(400).json({ error: "No puedes eliminar al último usuario con rol Admin." });
    }
  }

  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  res.json({ ok: true });
});

export default router;
