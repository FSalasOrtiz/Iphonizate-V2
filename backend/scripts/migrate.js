import dotenv from "dotenv";
dotenv.config();
import { pool } from "../src/db.js";

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'Vendedor',
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_data (
  id SMALLINT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);
`;

async function run() {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  await pool.query(sql);
  console.log("✓ Migración completa: tablas 'users' y 'app_data' listas.");
  process.exit(0);
}

run().catch((err) => {
  console.error("✗ Falló la migración:", err.message);
  process.exit(1);
});
