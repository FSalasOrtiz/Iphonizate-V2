import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { pool } from "../src/db.js";

async function run() {
  const usuario = process.env.SEED_USUARIO || "renato";
  const pin = process.env.SEED_PIN || "123456";
  const nombre = process.env.SEED_NOMBRE || "Renato";
  const rol = process.env.SEED_ROL || "Dirección";

  const pinHash = await bcrypt.hash(String(pin), 10);

  await pool.query(
    `INSERT INTO users (usuario, pin_hash, nombre, rol)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (usuario) DO UPDATE SET pin_hash = $2, nombre = $3, rol = $4, failed_attempts = 0, locked_until = NULL`,
    [usuario, pinHash, nombre, rol]
  );

  console.log(`✓ Usuario "${usuario}" listo. PIN: ${pin}`);
  console.log(`  Cámbialo corriendo este script de nuevo con otro SEED_PIN.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("✗ Falló el seed:", err.message);
  process.exit(1);
});
