import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";
import { parseCookies, getHtmlWithPartials } from "./utils/serverUtils.js";
import { handleApiRoutes } from "./routes/apiRoutes.js";
import { handleAdminRoutes } from "./routes/adminRoutes.js";
const PORT = process.env.PORT || 3000;
// const __dirname = fileURLToPath(new URL(".", import.meta.url));
// const ROOT = resolve(__dirname, "..");
const ROOT = process.cwd();
const PARTIALS_DIR = join(ROOT, "partials");
const TEMPLATE_PATH = join(ROOT, "templates/index.template.html");
const STATIC_DIR = join(ROOT, "public");
createServer(async (req, res) => {
    try {
        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const cookies = parseCookies(req.headers.cookie);
        if (pathname.startsWith("/api/")) {
            await handleApiRoutes(req, res, pathname, searchParams);
            return;
        }
        if (pathname.startsWith("/admin")) {
            await handleAdminRoutes(req, res, pathname, cookies, searchParams);
            return;
        }
        if (pathname === "/" || pathname === "/index.template.html") {
            const html = await getHtmlWithPartials(TEMPLATE_PATH, PARTIALS_DIR);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
            return;
        }
        // Static file serving
        const filePath = join(STATIC_DIR, pathname);
        try {
            const content = await readFile(filePath);
            const ext = extname(filePath);
            const mime = {
                ".js": "text/javascript",
                ".css": "text/css",
                ".json": "application/json",
            }[ext] || "application/octet-stream";
            res.writeHead(200, { "Content-Type": mime });
            res.end(content);
        }
        catch {
            res.writeHead(404);
            res.end("Not Found");
        }
    }
    catch (error) {
        console.error(error);
        res.writeHead(500);
        res.end("Server error");
    }
}).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
