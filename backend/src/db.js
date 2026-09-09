import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Railway/Render entregan certificados que node-postgres no valida por
// defecto; rejectUnauthorized:false es lo estándar para esos hosts.
// En local (localhost) no usamos SSL.
const isLocal = (process.env.DATABASE_URL || "").includes("localhost");

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
