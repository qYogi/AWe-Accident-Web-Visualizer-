import { readFile } from "fs/promises";
import { join } from "path";

export function parseCookies(cookieHeader?: string) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(";")) {
    const [key, ...v] = pair.trim().split("=");
    cookies[key] = decodeURIComponent(v.join("="));
  }
  return cookies;
}

export function parseForm(body: string) {
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

export async function getHtmlWithPartials(
  TEMPLATE_PATH: string,
  PARTIALS_DIR: string
) {
  let template = await readFile(TEMPLATE_PATH, "utf-8");
  const partials = ["advanced-filter", "table", "charts"];
  for (const name of partials) {
    const content = await readFile(join(PARTIALS_DIR, `${name}.html`), "utf-8");
    template = template.replace(`{{partial ${name}}}`, content);
  }
  return template;
}

export async function servePartial(
  res: any,
  partial: string,
  PARTIALS_DIR: string
) {
  const html = await readFile(join(PARTIALS_DIR, partial), "utf-8");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
}
