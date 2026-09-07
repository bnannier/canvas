/**
 * The static server the end-to-end suite runs against.
 *
 * The docs app ships as a single-page web export (docs/app.json sets
 * `web.output: "single"`), so every deep route has to be answered with the same
 * index.html and resolved client-side by expo-router. On Cloudflare that is
 * docs/public/_redirects (`/*  /index.html  200`); here it is the fallback below.
 *
 * Two deliberate differences from Cloudflare's rule:
 *
 *   1. The fallback fires ONLY for extension-less paths. Cloudflare answers a
 *      missing font or script with a 200 and an HTML body, which is exactly the
 *      blank-site failure docs/public/_headers documents. Here a missing asset
 *      stays a 404, so the smoke suite's failed-request gate sees it.
 *   2. `--headers` replays the `/*` block of docs/public/_headers onto every
 *      response, so the strict Content-Security-Policy (script-src 'self', no
 *      unsafe-eval, require-trusted-types-for 'script') is enforced in the
 *      browser during the run. That turns the route sweep _headers asks for
 *      "whenever a dependency that touches the DOM is added or upgraded" into a
 *      thing CI does on every push.
 *
 * It is plain node:http with no dependencies, so both bun (the webServer
 * command) and node (anything Playwright's own loader runs) execute it.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

// Content types for everything the docs export ships. Anything unlisted is served
// as a byte stream, which is correct for a download and wrong for nothing we have.
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

export interface ServerOptions {
  /** Directory served at the base path. */
  root: string;
  /** 0 (the default) lets the OS pick a free port. */
  port?: number;
  /** URL prefix the root is mounted under, e.g. "/canvas" for an EXPO_BASE_URL build. */
  base?: string;
  /** Replay the `/*` block of `<root>/_headers` onto every response. */
  headers?: boolean;
  /** Answer extension-less misses with index.html (the expo-router SPA rewrite). */
  spa?: boolean;
}

export interface RunningServer {
  url: string;
  port: number;
  close: () => Promise<void>;
}

/**
 * Parse the `/*` block of a Cloudflare `_headers` file.
 *
 * Comment lines and `!`-prefixed removals are skipped. So is HSTS: it names an
 * https policy, browsers ignore it over http, and sending it from a loopback
 * origin only risks confusing a future reader.
 */
export function parseBaselineHeaders(headersFile: string): Record<string, string> {
  const out: Record<string, string> = {};
  let inBlock = false;
  for (const raw of headersFile.split("\n")) {
    const line = raw.trim();
    if (line === "") continue;
    // A path pattern is unindented; anything indented belongs to the open block.
    if (!/^\s/.test(raw)) {
      inBlock = line === "/*";
      continue;
    }
    if (!inBlock || line.startsWith("#") || line.startsWith("!")) continue;
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const name = line.slice(0, colon).trim();
    if (name.toLowerCase() === "strict-transport-security") continue;
    out[name] = line.slice(colon + 1).trim();
  }
  return out;
}

/** Strip the query and hash, decode, and refuse anything that climbs out of root. */
function resolveWithin(root: string, pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const full = resolve(root, "." + normalize(decoded));
  if (full !== root && !full.startsWith(root + sep)) return null;
  return full;
}

async function readIfFile(path: string): Promise<Buffer | null> {
  try {
    const info = await stat(path);
    if (!info.isFile()) return null;
    return await readFile(path);
  } catch {
    return null;
  }
}

export async function startStaticServer(options: ServerOptions): Promise<RunningServer> {
  const root = resolve(options.root);
  const base = (options.base ?? "").replace(/\/+$/, "");
  const spa = options.spa !== false;

  const baseline = options.headers
    ? parseBaselineHeaders((await readIfFile(join(root, "_headers")))?.toString("utf8") ?? "")
    : {};

  const send = (res: ServerResponse, status: number, body: Buffer | string, type: string) => {
    res.writeHead(status, { ...baseline, "Content-Type": type, "Content-Length": Buffer.byteLength(body) });
    res.end(body);
  };

  const server: Server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    let pathname = url.pathname;

    if (base) {
      if (pathname === base || pathname === "/") {
        res.writeHead(302, { Location: `${base}/` });
        res.end();
        return;
      }
      if (!pathname.startsWith(base + "/")) {
        send(res, 404, "Not found", "text/plain; charset=utf-8");
        return;
      }
      pathname = pathname.slice(base.length);
    }

    const target = resolveWithin(root, pathname);
    if (target === null) {
      send(res, 400, "Bad path", "text/plain; charset=utf-8");
      return;
    }

    // A real file wins, then a directory's index.html (that is how the baked
    // /privacy page shadows the expo-router route in production too).
    const direct = await readIfFile(target);
    if (direct) {
      send(res, 200, direct, MIME[extname(target)] ?? "application/octet-stream");
      return;
    }
    const asIndex = await readIfFile(join(target, "index.html"));
    if (asIndex) {
      send(res, 200, asIndex, MIME[".html"]);
      return;
    }

    // The SPA rewrite, for route paths only. A miss that names a file extension
    // is a genuine 404 and must read as one.
    if (spa && extname(pathname) === "") {
      const shell = await readIfFile(join(root, "index.html"));
      if (shell) {
        send(res, 200, shell, MIME[".html"]);
        return;
      }
    }

    send(res, 404, "Not found", "text/plain; charset=utf-8");
  });

  await new Promise<void>((ok, fail) => {
    server.once("error", fail);
    server.listen(options.port ?? 0, "127.0.0.1", ok);
  });

  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("static server did not bind a port");

  return {
    port: address.port,
    url: `http://127.0.0.1:${address.port}${base}`,
    close: () =>
      new Promise<void>((ok, fail) => {
        server.close((err) => (err ? fail(err) : ok()));
      }),
  };
}
