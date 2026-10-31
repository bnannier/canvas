/** Local-only visual comparison of every Charts room card against the vendored hand-off.
 * Run with the docs server up: bun tools/v4/verify-charts.ts
 * Writes fresh paired PNGs, difference images and measurements; sends no images to a service.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium, type Locator } from "playwright";
import sharp from "sharp";

const ROOT = resolve(import.meta.dir, "handoff");
const OUT = resolve(import.meta.dir, "../../.v4-reference/charts-verification");
const appURL = process.env.CHARTS_URL ?? "http://localhost:8081";
const server = Bun.serve({ port: 0, hostname: "127.0.0.1", async fetch(req) {
  const file = Bun.file(join(ROOT, decodeURIComponent(new URL(req.url).pathname)));
  return await file.exists() ? new Response(file) : new Response("Not found", { status: 404 });
} });
const browser = await chromium.launch({ args: ["--disable-frame-rate-limit"] });
const scenarios = [
  { name: "desktop-dark", width: 1440, height: 1000, scheme: "dark" },
  { name: "phone-dark", width: 390, height: 844, scheme: "dark" },
  { name: "desktop-light", width: 1440, height: 1000, scheme: "light" },
] as const;

async function photograph(element: Locator, path: string) {
  await element.scrollIntoViewIfNeeded();
  const original = await element.evaluate(node => {
    const box = node.getBoundingClientRect(), el = node as HTMLElement;
    const previous = el.style.transform;
    el.style.transform = `translate(${Math.round(box.x) - box.x}px, ${Math.round(box.y) - box.y}px)`;
    return previous;
  });
  await element.screenshot({ path, animations: "disabled" });
  await element.evaluate((node, previous) => { (node as HTMLElement).style.transform = previous; }, original);
}

try {
  for (const scenario of scenarios) {
    const dir = join(OUT, scenario.name);
    for (const kind of ["reference", "actual", "diff"]) mkdirSync(join(dir, kind), { recursive: true });
    const context = await browser.newContext({ viewport: { width: scenario.width, height: scenario.height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const reference = await context.newPage(), actual = await context.newPage();
    const errors: string[] = [];
    actual.on("pageerror", error => errors.push(error.message));
    actual.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await reference.goto(`http://127.0.0.1:${server.port}/Canvas%20v4.0.0%20Charts.dc.html`);
    await reference.locator("#c-chart").waitFor();
    await reference.evaluate(() => document.fonts.ready);
    if (scenario.scheme === "light") await reference.getByText("Light", { exact: true }).first().click();
    await actual.goto(`${appURL}/charts?scheme=${scenario.scheme}&surface=glass`);
    await actual.getByTestId("showcase-c-chart").waitFor();
    await actual.evaluate(() => document.fonts.ready);
    await actual.waitForTimeout(1200);
    await reference.screenshot({ path: join(dir, "reference-fold.png") });
    await actual.screenshot({ path: join(dir, "actual-fold.png") });
    const ids = await reference.locator('[id^="c-"]').evaluateAll(nodes => nodes.map(node => node.id));
    const cards = [];
    for (const id of ids) {
      const ref = reference.locator(`#${id}`), app = actual.getByTestId(`showcase-${id}`);
      const refPath = join(dir, "reference", `${id}.png`), appPath = join(dir, "actual", `${id}.png`);
      const refBox = await ref.boundingBox(), appBox = await app.boundingBox();
      await photograph(ref, refPath); await photograph(app, appPath);
      const a = await sharp(refPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const b = await sharp(appPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      // Compare the common crop without resizing either image, preserving genuine geometry errors.
      const width = Math.min(a.info.width, b.info.width), height = Math.min(a.info.height, b.info.height);
      const delta = Buffer.alloc(width * height * 3);
      let total = 0, changed = 0;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        let peak = 0;
        for (let channel = 0; channel < 3; channel++) {
          const d = Math.abs(a.data[(y * a.info.width + x) * 3 + channel]! - b.data[(y * b.info.width + x) * 3 + channel]!);
          delta[(y * width + x) * 3 + channel] = d; total += d; peak = Math.max(peak, d);
        }
        if (peak > 16) changed++;
      }
      await sharp(delta, { raw: { width, height, channels: 3 } }).png().toFile(join(dir, "diff", `${id}.png`));
      cards.push({ id, reference: refBox, actual: appBox, meanChannelError: total / (width * height * 3), changedPixelPercent: 100 * changed / (width * height) });
    }
    const report = { scenario, cards, browserErrors: errors };
    writeFileSync(join(dir, "report.json"), JSON.stringify(report, null, 2));
    console.log(`${scenario.name}: ${cards.length} paired cards; ${errors.length} browser errors`);
    if (errors.length) process.exitCode = 1;
    await context.close();
  }
} finally { await browser.close(); server.stop(); }
