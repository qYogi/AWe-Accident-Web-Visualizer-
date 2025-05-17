import * as http from "http";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  host: process.env.VITE_DB_HOST,
  port: process.env.VITE_DB_PORT,
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
  database: process.env.VITE_DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

const server = http.createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(
    req.url,
    `http://${req.headers.host}`
  );

  if (pathname === "/api/accidents") {
    const state = searchParams.get("state") || "CA";
    const limit = parseInt(searchParams.get("limit")) || 50;

    try {
      const result = await pool.query(
        `SELECT * FROM accidents WHERE state = $1 LIMIT $2`,
        [state, limit]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result.rows));
    } catch (error) {
      res.writeHead(500);
      res.end("Error queryiing db");
    }
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
