import { addAccident, deleteAccident } from "../db/adminOps.js";
import { servePartial, parseForm } from "../utils/serverUtils.js";
import { randomBytes } from "crypto";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const PARTIALS_DIR = join(ROOT, "partials");

const ADMIN_USER = "admin";
const ADMIN_PASS = "password123";
const SESSIONS = new Set<string>();

export async function handleAdminRoutes(
  req: any,
  res: any,
  pathname: string,
  cookies: Record<string, string>,
  searchParams: URLSearchParams
) {
  const isLoggedIn = Boolean(
    cookies["admin_session"] && SESSIONS.has(cookies["admin_session"])
  );

  if (pathname === "/admin" && req.method === "GET") {
    if (!isLoggedIn) {
      await servePartial(res, "admin-login.html", PARTIALS_DIR);
    } else {
      await servePartial(res, "admin-dashboard.html", PARTIALS_DIR);
    }
    return;
  }

  if (pathname === "/admin/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk: any) => (body += chunk));
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
    req.on("data", (chunk: any) => (body += chunk));
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
            wind_chill_f: form.wind_chill_f ? Number(form.wind_chill_f) : null,
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

  res.writeHead(404);
  res.end("Admin Not Found");
}
