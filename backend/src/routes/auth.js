import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

router.post("/login", async (req, res) => {
  const { usuario, pin } = req.body || {};
  if (!usuario || !pin) {
    return res.status(400).json({ error: "Usuario y PIN son obligatorios." });
  }

  const { rows } = await pool.query("SELECT * FROM users WHERE lower(usuario) = lower($1)", [usuario]);
  const user = rows[0];

  // Mismo mensaje exista o no el usuario, para no filtrar qué usuarios existen.
  if (!user) {
    return res.status(401).json({ error: "Usuario o PIN incorrecto." });
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const mins = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
    return res.status(423).json({ error: `Cuenta bloqueada. Intenta de nuevo en ${mins} min.` });
  }

  const ok = await bcrypt.compare(String(pin), user.pin_hash);

  if (!ok) {
    const attempts = (user.failed_attempts || 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
      await pool.query("UPDATE users SET failed_attempts = 0, locked_until = $2 WHERE id = $1", [user.id, lockedUntil]);
      return res.status(423).json({ error: `Demasiados intentos. La cuenta se bloqueó por ${LOCK_MINUTES} minutos.` });
    }
    await pool.query("UPDATE users SET failed_attempts = $2 WHERE id = $1", [user.id, attempts]);
    return res.status(401).json({ error: "Usuario o PIN incorrecto." });
  }

  await pool.query("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1", [user.id]);

  const token = jwt.sign(
    { sub: user.id, usuario: user.usuario, nombre: user.nombre, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.json({ token, user: { usuario: user.usuario, nombre: user.nombre, rol: user.rol } });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { usuario: req.user.usuario, nombre: req.user.nombre, rol: req.user.rol } });
});

export default router;
