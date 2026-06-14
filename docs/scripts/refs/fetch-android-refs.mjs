#!/usr/bin/env node
// Fetch canonical Material 3 / Jetpack Compose doc image crops for the /compare
// Android reference column. Reads android-assets.json (key "slug/rowKey-stateKey" ->
// developer.android.com/static asset URL) and writes the bytes to
// docs/public/refs/android/<key>-light.png. Re-runnable; overwrites in place.
// These are the official doc images (rendered on white), used in place of ad-hoc
// screenshots so the Android reference column is the authoritative, tight crop.
//
//   node docs/scripts/refs/fetch-android-refs.mjs
//
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const refsRoot = resolve(here, "../../public/refs/android");
const map = JSON.parse(await readFile(resolve(here, "android-assets.json"), "utf8"));

let ok = 0, fail = 0;
for (const [key, url] of Object.entries(map)) {
  if (key.startsWith("_")) continue;
  const dest = resolve(refsRoot, `${key}-light.png`);
  try {
    if (url.endsWith(".svg")) throw new Error("SVG asset; rasterize manually (qlmanage -t) and map to a .png instead");
    const res = await fetch(url, { headers: { "user-agent": "canvas-refs-fetch" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 200) throw new Error(`suspiciously small (${buf.length}b)`);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    console.log(`ok    ${key}  (${(buf.length / 1024).toFixed(1)}kb)`);
    ok++;
  } catch (e) {
    console.error(`FAIL  ${key}  ${url}  -> ${e.message}`);
    fail++;
  }
}
console.log(`\n${ok} downloaded, ${fail} failed -> docs/public/refs/android/ (light only)`);
if (fail) process.exitCode = 1;
