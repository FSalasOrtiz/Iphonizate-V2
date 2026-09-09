import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Todo el estado de la app (equipos, ventas, clientes, etc.) vive como un
// único documento JSON compartido por toda la cadena — el mismo formato
// que antes vivía en localStorage, solo que ahora en Postgres y accesible
// desde cualquier dispositivo autenticado.

router.get("/", requireAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT data FROM app_data WHERE id = 1");
  res.json({ data: rows[0]?.data ?? null });
});

router.put("/", requireAuth, async (req, res) => {
  const { data } = req.body || {};
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Falta 'data' (objeto) en el body." });
  }

  await pool.query(
    `INSERT INTO app_data (id, data, updated_at, updated_by)
     VALUES (1, $1, now(), $2)
     ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = now(), updated_by = $2`,
    [data, req.user.nombre]
  );

  res.json({ ok: true });
});

export default router;
