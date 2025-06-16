import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function addRecord(field1: string) {
  await pool.query("INSERT INTO your_table (field1) VALUES ($1)", [field1]);
}

export async function deleteRecord(id: string) {
  await pool.query("DELETE FROM your_table WHERE id = $1", [id]);
}

export async function modifyRecord(id: string, field1: string) {
  await pool.query("UPDATE your_table SET field1 = $1 WHERE id = $2", [
    field1,
    id,
  ]);
}
