import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool({
  host: process.env.VITE_DB_HOST,
  port: Number(process.env.VITE_DB_PORT),
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
  database: process.env.VITE_DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});
