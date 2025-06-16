import http from "http";
import { parse } from "url";
import { StringDecoder } from "string_decoder";
import { Pool } from "pg";
import crypto from "crypto";
// --- CONFIG ---
const PORT = 3000;
const ADMIN_USER = "admin";
const ADMIN_PASS = "password"; // Change this in production!
const SESSION_SECRET = "changeme"; // Change this in production!
// PostgreSQL config
const pool = new Pool({
    user: "your_pg_user",
    host: "localhost",
    database: "your_db",
    password: "your_pg_password",
    port: 5432,
});
// --- SESSION MANAGEMENT ---
const sessions = {};
function createSession(username) {
    const sid = crypto.randomBytes(16).toString("hex");
    sessions[sid] = username;
    return sid;
}
function getSession(req) {
    const cookie = req.headers["cookie"];
    if (!cookie)
        return null;
    const match = cookie.match(/sid=([a-f0-9]+)/);
    if (match && sessions[match[1]])
        return match[1];
    return null;
}
function destroySession(sid) {
    delete sessions[sid];
}
// --- HTML TEMPLATES ---
function loginForm(msg = "") {
    return `<!DOCTYPE html><html><body>
    <h2>Admin Login</h2>
    ${msg ? `<p style='color:red;'>${msg}</p>` : ""}
    <form method="POST" action="/admin/login">
      <input name="username" placeholder="Username" required><br>
      <input name="password" type="password" placeholder="Password" required><br>
      <button type="submit">Login</button>
    </form>
  </body></html>`;
}
function adminDashboard(accidents) {
    return `<!DOCTYPE html><html><body>
    <h2>Admin Dashboard</h2>
    <a href="/admin/logout">Logout</a>
    <h3>Add Accident</h3>
    <form method="POST" action="/admin/add">
      <input name="description" placeholder="Description" required>
      <input name="date" type="date" required>
      <button type="submit">Add</button>
    </form>
    <h3>Existing Accidents</h3>
    <table border="1"><tr><th>ID</th><th>Description</th><th>Date</th><th>Actions</th></tr>
      ${accidents
        .map((a) => `
        <tr>
          <td>${a.id}</td>
          <td>${a.description}</td>
          <td>${a.date.toISOString().slice(0, 10)}</td>
          <td>
            <form method="POST" action="/admin/delete" style="display:inline;">
              <input type="hidden" name="id" value="${a.id}">
              <button type="submit">Delete</button>
            </form>
            <form method="POST" action="/admin/modify" style="display:inline;">
              <input type="hidden" name="id" value="${a.id}">
              <input name="description" value="${a.description}" required>
              <input name="date" type="date" value="${a.date
        .toISOString()
        .slice(0, 10)}" required>
              <button type="submit">Modify</button>
            </form>
          </td>
        </tr>
      `)
        .join("")}
    </table>
  </body></html>`;
}
// --- UTILS ---
function parseBody(req) {
    return new Promise((resolve) => {
        const decoder = new StringDecoder("utf-8");
        let buffer = "";
        req.on("data", (data) => {
            buffer += decoder.write(data);
        });
        req.on("end", () => {
            buffer += decoder.end();
            const params = new URLSearchParams(buffer);
            const obj = {};
            for (const [k, v] of params.entries())
                obj[k] = v;
            resolve(obj);
        });
    });
}
// --- SERVER ---
const server = http.createServer(async (req, res) => {
    const parsedUrl = parse(req.url || "", true);
    const path = parsedUrl.pathname || "";
    const method = req.method || "GET";
    // --- LOGIN ---
    if (path === "/admin" && method === "GET") {
        const sid = getSession(req);
        if (!sid) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(loginForm());
            return;
        }
        // Show dashboard
        try {
            const { rows } = await pool.query("SELECT * FROM accidents ORDER BY id DESC");
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(adminDashboard(rows));
        }
        catch (e) {
            res.writeHead(500);
            res.end("DB error");
        }
        return;
    }
    if (path === "/admin/login" && method === "POST") {
        const body = await parseBody(req);
        if (body.username === ADMIN_USER && body.password === ADMIN_PASS) {
            const sid = createSession(ADMIN_USER);
            res.writeHead(302, {
                "Set-Cookie": `sid=${sid}; HttpOnly; Path=/`,
                Location: "/admin",
            });
            res.end();
        }
        else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(loginForm("Invalid credentials"));
        }
        return;
    }
    if (path === "/admin/logout" && method === "GET") {
        const sid = getSession(req);
        if (sid)
            destroySession(sid);
        res.writeHead(302, {
            "Set-Cookie": "sid=; Max-Age=0; Path=/",
            Location: "/admin",
        });
        res.end();
        return;
    }
    // --- AUTH CHECK FOR DB OPS ---
    const sid = getSession(req);
    if (!sid || sessions[sid] !== ADMIN_USER) {
        res.writeHead(302, { Location: "/admin" });
        res.end();
        return;
    }
    // --- ADD ---
    if (path === "/admin/add" && method === "POST") {
        const body = await parseBody(req);
        try {
            await pool.query("INSERT INTO accidents (description, date) VALUES ($1, $2)", [body.description, body.date]);
            res.writeHead(302, { Location: "/admin" });
            res.end();
        }
        catch (e) {
            res.writeHead(500);
            res.end("DB error");
        }
        return;
    }
    // --- DELETE ---
    if (path === "/admin/delete" && method === "POST") {
        const body = await parseBody(req);
        try {
            await pool.query("DELETE FROM accidents WHERE id = $1", [body.id]);
            res.writeHead(302, { Location: "/admin" });
            res.end();
        }
        catch (e) {
            res.writeHead(500);
            res.end("DB error");
        }
        return;
    }
    // --- MODIFY ---
    if (path === "/admin/modify" && method === "POST") {
        const body = await parseBody(req);
        try {
            await pool.query("UPDATE accidents SET description = $1, date = $2 WHERE id = $3", [body.description, body.date, body.id]);
            res.writeHead(302, { Location: "/admin" });
            res.end();
        }
        catch (e) {
            res.writeHead(500);
            res.end("DB error");
        }
        return;
    }
    // --- 404 ---
    res.writeHead(404);
    res.end("Not found");
});
server.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}/admin`);
});
// --- END ---
// Replace your_pg_user, your_db, your_pg_password with your actual PostgreSQL credentials.
