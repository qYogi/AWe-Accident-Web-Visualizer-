import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { pool } from "./db/db";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

const PARTIALS_DIR = join(ROOT, "partials");
const TEMPLATE_PATH = join(ROOT, "templates/index.template.html");
const STATIC_DIR = join(ROOT, "public");

async function getHtmlWithPartials() {
  let template = await readFile(TEMPLATE_PATH, "utf-8");
  const partials = ["advanced-filter", "table"];
  for (const name of partials) {
    const content = await readFile(join(PARTIALS_DIR, `${name}.html`), "utf-8");
    template = template.replace(`{{partial ${name}}}`, content);
  }
  return template;
}

createServer(async (req, res) => {
  try {
    const { pathname, searchParams } = new URL(
      req.url!,
      `http://${req.headers.host}`
    );

    if (pathname === "/api/accidents") {
      const startDate = searchParams.get("start_date");
      const endDate = searchParams.get("end_date");

      const state = searchParams.get("state");
      const severity = searchParams.get("severity");

      if (!startDate || !endDate) {
        res.writeHead(400);
        res.end("Start date and end date are required");
        return;
      }

      try {
        let query = `SELECT id, severity, start_time, end_time, description, street, city, county, state, country, start_lat, start_lng FROM accidents WHERE start_time BETWEEN $1 AND $2`;
        const values = [startDate, endDate];
        let paramIndex = 3;

        if (state) {
          query += ` AND state = $${paramIndex++}`;
          values.push(state);
        }

        if (severity) {
          query += ` AND severity = $${paramIndex++}`;
          values.push(severity);
        }

        query += ` ORDER BY start_time DESC `;

        const result = await pool.query(query, values);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows));
      } catch (error) {
        console.error("Database error:", error);
        res.writeHead(500);
        res.end("Error querying database");
      }
      return;
    }

    if (pathname === "/" || pathname === "/index.template.html") {
      const html = await getHtmlWithPartials();
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
      return;
    }

    const filePath = join(STATIC_DIR, pathname);
    try {
      const content = await readFile(filePath);
      const ext = extname(filePath);
      const mime =
        {
          ".js": "text/javascript",
          ".css": "text/css",
          ".json": "application/json",
        }[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": mime });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not Found");
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Server error");
  }
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
