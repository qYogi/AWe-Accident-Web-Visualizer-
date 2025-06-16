import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { pool } from "./db/db";
import "dotenv/config";
import { addAccident, deleteAccident } from "./db/adminOps";
import { randomBytes } from "crypto";

const PORT = process.env.PORT || 3000;
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

const PARTIALS_DIR = join(ROOT, "partials");
const TEMPLATE_PATH = join(ROOT, "templates/index.template.html");
const STATIC_DIR = join(ROOT, "public");

const ADMIN_USER = "admin";
const ADMIN_PASS = "password123";
const SESSIONS = new Set<string>();

function parseCookies(cookieHeader?: string) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(";")) {
    const [key, ...v] = pair.trim().split("=");
    cookies[key] = decodeURIComponent(v.join("="));
  }
  return cookies;
}

function parseForm(body: string) {
  return Object.fromEntries(
    body.split("&").map((kv) => {
      const [k, v] = kv.split("=");
      return [
        decodeURIComponent(k.replace(/\+/g, " ")),
        decodeURIComponent((v || "").replace(/\+/g, " ")),
      ];
    })
  );
}

async function getHtmlWithPartials() {
  let template = await readFile(TEMPLATE_PATH, "utf-8");
  const partials = ["advanced-filter", "table"];
  for (const name of partials) {
    const content = await readFile(join(PARTIALS_DIR, `${name}.html`), "utf-8");
    template = template.replace(`{{partial ${name}}}`, content);
  }
  return template;
}

async function servePartial(res: any, partial: string) {
  const html = await readFile(join(PARTIALS_DIR, partial), "utf-8");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
}

createServer(async (req, res) => {
  try {
    const { pathname, searchParams } = new URL(
      req.url!,
      `http://${req.headers.host}`
    );
    const cookies = parseCookies(req.headers.cookie);
    const isLoggedIn =
      cookies["admin_session"] && SESSIONS.has(cookies["admin_session"]);

    if (pathname === "/admin" && req.method === "GET") {
      if (!isLoggedIn) {
        await servePartial(res, "admin-login.html");
      } else {
        await servePartial(res, "admin-dashboard.html");
      }
      return;
    }

    if (pathname === "/admin/login" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const form = parseForm(body);
        if (form.username === ADMIN_USER && form.password === ADMIN_PASS) {
          const token = randomBytes(16).toString("hex");
          SESSIONS.add(token);
          res.writeHead(302, {
            "Set-Cookie": `admin_session=${token}; HttpOnly; Path=/`,
            Location: "/admin",
          });
          res.end();
        } else {
          res.writeHead(401);
          res.end("Invalid credentials");
        }
      });
      return;
    }

    if (pathname === "/admin/logout" && req.method === "POST") {
      if (isLoggedIn) SESSIONS.delete(cookies["admin_session"]);
      res.writeHead(302, {
        "Set-Cookie": `admin_session=; HttpOnly; Path=/; Max-Age=0`,
        Location: "/admin",
      });
      res.end();
      return;
    }

    if (
      (pathname === "/admin/add" || pathname === "/admin/delete") &&
      req.method === "POST"
    ) {
      if (!isLoggedIn) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        const form = parseForm(body);
        try {
          if (pathname === "/admin/add") {
            const accident: any = {
              id: form.id,
              severity: Number(form.severity),
              start_time: form.start_time,
              end_time: form.end_time,
              start_lat: Number(form.start_lat),
              start_lng: form.start_lng ? Number(form.start_lng) : null,
              end_lat: form.end_lat ? Number(form.end_lat) : null,
              end_lng: form.end_lng ? Number(form.end_lng) : null,
              distance_mi: form.distance_mi ? Number(form.distance_mi) : null,
              description: form.description || null,
              street: form.street,
              city: form.city,
              county: form.county || null,
              state: form.state,
              zipcode: form.zipcode || null,
              country: form.country,
              timezone: form.timezone || null,
              airport_code: form.airport_code || null,
              weather_timestamp: form.weather_timestamp || null,
              temperature_f: form.temperature_f
                ? Number(form.temperature_f)
                : null,
              wind_chill_f: form.wind_chill_f
                ? Number(form.wind_chill_f)
                : null,
              humidity_percent: form.humidity_percent
                ? Number(form.humidity_percent)
                : null,
              pressure_in: form.pressure_in ? Number(form.pressure_in) : null,
              visibility_mi: form.visibility_mi
                ? Number(form.visibility_mi)
                : null,
              wind_direction: form.wind_direction || null,
              wind_speed_mph: form.wind_speed_mph
                ? Number(form.wind_speed_mph)
                : null,
              precipitation_in: form.precipitation_in
                ? Number(form.precipitation_in)
                : null,
              weather_condition: form.weather_condition || null,
              amenity: form.amenity === "true" ? true : false,
              bump: form.bump === "true" ? true : false,
              crossing: form.crossing === "true" ? true : false,
              give_way: form.give_way === "true" ? true : false,
              junction: form.junction === "true" ? true : false,
              no_exit: form.no_exit === "true" ? true : false,
              railway: form.railway === "true" ? true : false,
              roundabout: form.roundabout === "true" ? true : false,
              station: form.station === "true" ? true : false,
              stop: form.stop === "true" ? true : false,
              traffic_calming: form.traffic_calming === "true" ? true : false,
              traffic_signal: form.traffic_signal === "true" ? true : false,
              turning_loop: form.turning_loop === "true" ? true : false,
              sunrise_sunset: form.sunrise_sunset || null,
              civil_twilight: form.civil_twilight || null,
              nautical_twilight: form.nautical_twilight || null,
              astronomical_twilight: form.astronomical_twilight || null,
            };
            await addAccident(accident);
            res.writeHead(302, { Location: "/admin" });
            res.end();
          } else if (pathname === "/admin/delete") {
            await deleteAccident(form.id);
            res.writeHead(302, { Location: "/admin" });
            res.end();
          }
        } catch (e) {
          res.writeHead(500);
          res.end("DB error: " + (e as Error).message);
        }
      });
      return;
    }

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

        query += ` ORDER BY start_time DESC LIMIT 100`;

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
