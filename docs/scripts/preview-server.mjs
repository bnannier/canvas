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
//   /android  adb shell "am start -a android.intent.action.VIEW -d 'canvas:///<route>'"
//
// The appearance axes the docs read from a launch URL (docs/src/theme/theme-links.ts)
// ride along: `scheme` (light | dark), `surface` (solid | glass) and `palette`
// (blush | mint) are each validated on their own and appended to the deep link and
// the web redirect. An absent axis leaves the app's current choice alone; a value
// outside its set is refused, so a mistyped palette never opens blush quietly.
//
// Safety: the route is validated to [a-z0-9/-], the axes to their closed sets, and
// both reach the device as execFile arguments, never through a shell on this machine;
// the one shell on the way, the device's own behind `adb shell`, gets every word
// quoted (preview-links.mjs). The server binds to 127.0.0.1 only.

import http from "node:http";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { APPEARANCE_AXES, adbPath, appearanceQuery, deepLink, openCommand, sanitizeRoute } from "./preview-links.mjs";

const WEB_PORT = Number(process.env.EXPO_WEB_PORT ?? 8081);
const PREVIEW_PORT = Number(process.env.PREVIEW_PORT ?? 8790);
const HOST = "127.0.0.1";

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

function openDeepLink(run, adb, platform, route, appearance, res) {
  const url = deepLink(route, appearance);
  const { cmd, args, manual } = openCommand(platform, url, adb);
  const label = platform === "ios" ? "iOS simulator" : "Android emulator";
  run(cmd, args, { timeout: 15000 }, (err, _stdout, stderr) => {
    if (err) {
      html(
        res,
        502,
        `<h2>Could not open on the ${label}</h2>` +
          `<p>Deep link: <code>${escapeHtml(url)}</code></p>` +
          `<p>Make sure an ${label} is booted with the Canvas docs dev app ` +
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
        `<p><code>${escapeHtml(route + appearance)}</code> should now be on your ${label}. ` +
        `You can close this tab.</p>`,
    );
  });
}

/**
 * The opener's HTTP server, not yet listening. `run` is how a deep link is launched,
 * execFile's signature; the tests pass a recorder in its place, so they can read the
 * exact argv without a simulator or an emulator.
 */
export function createPreviewServer({ webPort = WEB_PORT, run = execFile, adb = adbPath(process.env, existsSync) } = {}) {
  return http.createServer((req, res) => {
    const { pathname, searchParams } = new URL(req.url, `http://${HOST}`);

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
          `</ul>` +
          `<p>Add an appearance with any of ` +
          Object.entries(APPEARANCE_AXES)
            .map(([axis, values]) => `<code>${axis}=${values.join("|")}</code>`)
            .join(", ") +
          `, e.g. <code>/web?route=components/button&amp;scheme=light&amp;palette=mint</code>.</p>`,
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
      const appearance = appearanceQuery(searchParams);
      if (appearance.invalid) {
        const { axis, values } = appearance.invalid;
        return html(
          res,
          400,
          `<h2>Invalid <code>${escapeHtml(axis)}</code></h2>` +
            `<p>It takes one of ${values.map((value) => `<code>${escapeHtml(value)}</code>`).join(", ")}, ` +
            `or leave it out to keep the app's current choice.</p>`,
        );
      }
      if (pathname === "/web") {
        res.writeHead(302, { location: `http://localhost:${webPort}/${route}${appearance.suffix}` });
        return res.end();
      }
      return openDeepLink(run, adb, pathname.slice(1), route, appearance.suffix, res);
    }

    html(res, 404, "<h2>Not found</h2>");
  });
}

export function startPreviewServer({ port = PREVIEW_PORT } = {}) {
  const server = createPreviewServer();
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
