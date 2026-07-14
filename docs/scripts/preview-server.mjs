// Local "preview opener" for the Canvas docs.
//
// A terminal can only click links the OS URL handler knows: http(s) and
// registered schemes. A raw `canvas://` deep link clicked in a terminal never
// reaches a simulator. This tiny localhost server bridges the gap: it exposes
// clickable http:// links that, when opened, run the deep link on a booted iOS
// simulator or Android emulator. So a finished feature can be opened on any
// platform straight from a chat/terminal link.
//
// Endpoints (all GET, query param `route`, e.g. route=components/button):
//   /web      302 -> http://localhost:8081/<route>              (opens the browser)
//   /ios      xcrun simctl openurl booted canvas:///<route>     (booted iOS sim)
//   /android  adb shell am start -a android.intent.action.VIEW -d canvas:///<route>
//
// Safety: the route is validated to [a-z0-9/-] and passed as execFile arguments
// (never shell-interpolated), and the server binds to 127.0.0.1 only.

import http from "node:http";
import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";

const SCHEME = "canvas";
const WEB_PORT = Number(process.env.EXPO_WEB_PORT ?? 8081);
const PREVIEW_PORT = Number(process.env.PREVIEW_PORT ?? 8790);
const HOST = "127.0.0.1";

function sanitizeRoute(raw) {
  if (!raw) return null;
  const route = raw.replace(/^\/+/, "").replace(/\/+$/, "");
  return /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/i.test(route) ? route : null;
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

function html(res, code, body) {
  res.writeHead(code, { "content-type": "text/html; charset=utf-8" });
  res.end(
    `<!doctype html><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<body style="font:15px/1.5 system-ui,sans-serif;margin:3rem;max-width:40rem">${body}</body>`,
  );
}

function openDeepLink(platform, route, res) {
  const url = `${SCHEME}:///${route}`;
  const [cmd, args] =
    platform === "ios"
      ? ["xcrun", ["simctl", "openurl", "booted", url]]
      : ["adb", ["shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", url]];
  const label = platform === "ios" ? "iOS simulator" : "Android emulator";
  const manual = `${cmd} ${args.join(" ")}`;
  execFile(cmd, args, { timeout: 15000 }, (err, _stdout, stderr) => {
    if (err) {
      html(
        res,
        502,
        `<h2>Could not open on the ${label}</h2>` +
          `<p>Deep link: <code>${escapeHtml(url)}</code></p>` +
          `<p>Make sure a ${label.toLowerCase()} is booted with the Canvas docs dev app ` +
          `installed, then run it by hand:</p>` +
          `<pre><code>${escapeHtml(manual)}</code></pre>` +
          `<p style="color:#b00">${escapeHtml(String(stderr || err.message).trim())}</p>`,
      );
      return;
    }
    html(
      res,
      200,
      `<h2>Opening on the ${label}…</h2>` +
        `<p><code>${escapeHtml(route)}</code> should now be on your ${label}. ` +
        `You can close this tab.</p>`,
    );
  });
}

export function startPreviewServer({ port = PREVIEW_PORT } = {}) {
  const server = http.createServer((req, res) => {
    const { pathname, searchParams } = new URL(req.url, `http://${HOST}:${port}`);

    if (pathname === "/health") return html(res, 200, "ok");

    if (pathname === "/") {
      return html(
        res,
        200,
        `<h1>Canvas docs preview opener</h1>` +
          `<p>Open a route on a platform:</p><ul>` +
          `<li><code>/web?route=components/button</code> - browser</li>` +
          `<li><code>/ios?route=components/button</code> - booted iOS simulator</li>` +
          `<li><code>/android?route=components/button</code> - booted Android emulator</li>` +
          `</ul>`,
      );
    }

    if (pathname === "/web" || pathname === "/ios" || pathname === "/android") {
      const route = sanitizeRoute(searchParams.get("route"));
      if (!route) {
        return html(
          res,
          400,
          `<h2>Invalid or missing <code>route</code></h2>` +
            `<p>Example: <code>?route=components/button</code></p>`,
        );
      }
      if (pathname === "/web") {
        res.writeHead(302, { location: `http://localhost:${WEB_PORT}/${route}` });
        return res.end();
      }
      return openDeepLink(pathname.slice(1), route, res);
    }

    html(res, 404, "<h2>Not found</h2>");
  });

  server.listen(port, HOST, () => {
    console.log(
      `\n  Preview opener ready: http://localhost:${port}  (clickable ios/android/web opens)\n`,
    );
  });
  return server;
}

// Run standalone: `node scripts/preview-server.mjs`
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) startPreviewServer();
