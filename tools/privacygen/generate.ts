/*
 * Privacy policy page generator. Bakes docs/src/data/privacy-policy.ts (the same words the
 * in-app /privacy screen renders) into a STATIC page:
 *
 *   docs/public/privacy/index.html
 *
 * Run: bun run privacy:gen
 *
 * Why a static page exists alongside the in-app route: the docs web export is a single page
 * app, and GitHub Pages answers unknown paths with its 404 fallback, so every deep route
 * resolves with an HTTP 404 status even though the browser renders it fine. Google Play and
 * Apple both fetch the privacy policy URL filed with the listing, and a 404 there is a real
 * submission risk. Anything under docs/public is copied verbatim into the export, so this
 * file is served by Pages with a genuine 200 at /canvas/privacy/.
 *
 * The page is deliberately self contained (no bundle, no fonts to fetch, no JavaScript): it
 * has to render for a store reviewer on any device, including one blocking third parties.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  PRIVACY_TITLE,
  PRIVACY_INTRO,
  PRIVACY_SUMMARY,
  PRIVACY_NOT_DONE,
  PRIVACY_NETWORK_COLUMNS,
  PRIVACY_NETWORK_ROWS,
  PRIVACY_NETWORK_INTRO,
  PRIVACY_NETWORK_OUTRO,
  PRIVACY_SECTIONS,
  PRIVACY_ISSUES_URL,
  PRIVACY_EFFECTIVE,
} from "../../docs/src/data/privacy-policy.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");

// Escaped because the policy text is data: an apostrophe or ampersand in it must not be
// able to break the markup.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const card = (t: string, d: string) =>
  `<section class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></section>`;

const html =
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(PRIVACY_TITLE)} | Canvas</title>
<meta name="description" content="${esc(PRIVACY_INTRO)}">
<meta name="robots" content="index,follow">
<style>
  :root{color-scheme:dark light}
  *{box-sizing:border-box}
  body{margin:0;background:#0B0B0F;color:#FAFAFA;
    font:16px/1.65 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    padding:56px 24px 96px}
  main{max-width:760px;margin:0 auto}
  h1{font-size:2.25rem;line-height:1.15;letter-spacing:-.02em;margin:0 0 12px}
  h2{font-size:1.3rem;letter-spacing:-.01em;margin:44px 0 12px}
  h3{font-size:1rem;margin:0 0 6px}
  p{color:#A1A1AA;margin:0 0 14px}
  .lead{font-size:1.05rem}
  .card{background:#141419;border:1px solid #26262C;border-radius:12px;padding:16px;margin:0 0 12px}
  .card p{margin:0}
  table{width:100%;border-collapse:collapse;margin:8px 0 14px;font-size:.94rem}
  th,td{text-align:left;vertical-align:top;padding:11px 12px;border-bottom:1px solid #26262C}
  th{color:#FAFAFA;font-weight:600}
  td{color:#A1A1AA}
  td:first-child{color:#FAFAFA;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}
  a{color:#7C6BFF}
  .wrap{overflow-x:auto}
  footer{margin-top:44px;border-top:1px solid #26262C;padding-top:20px;color:#71717A;font-size:.9rem}
  @media (prefers-color-scheme:light){
    body{background:#fff;color:#0B0B0F}
    p,td{color:#52525B}
    .card{background:#FAFAFA;border-color:#E4E4E7}
    th,td{border-bottom-color:#E4E4E7}
    footer{border-top-color:#E4E4E7;color:#71717A}
  }
</style>
</head>
<body>
<main>
  <h1>${esc(PRIVACY_TITLE)}</h1>
  <p class="lead">${esc(PRIVACY_INTRO)}</p>

  <h2>Summary</h2>
  <p>${esc(PRIVACY_SUMMARY)}</p>

  <h2>What Canvas does not do</h2>
  ${PRIVACY_NOT_DONE.map((n) => card(n.title, n.description)).join("\n  ")}

  <h2>Network connections</h2>
  <p>${esc(PRIVACY_NETWORK_INTRO)}</p>
  <div class="wrap"><table>
    <thead><tr>${PRIVACY_NETWORK_COLUMNS.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${PRIVACY_NETWORK_ROWS.map(
      (r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`,
    ).join("")}</tbody>
  </table></div>
  <p>${esc(PRIVACY_NETWORK_OUTRO)}</p>

  ${PRIVACY_SECTIONS.map((s) => `<h2>${esc(s.title)}</h2>\n  <p>${esc(s.description)}</p>`).join("\n\n  ")}

  <footer>
    Effective ${esc(PRIVACY_EFFECTIVE)}. Canvas is free and open source under the MIT license.
    Questions and privacy requests: <a href="${PRIVACY_ISSUES_URL}">${PRIVACY_ISSUES_URL}</a>
  </footer>
</main>
</body>
</html>
`;

const out = resolve(repo, "docs/public/privacy/index.html");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`wrote docs/public/privacy/index.html (${(html.length / 1024).toFixed(1)} KB, no JS, no external requests)`);
