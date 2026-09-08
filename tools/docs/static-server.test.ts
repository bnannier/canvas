import { expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { get } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startStaticServer } from "../../e2e/support/static-server";

test("the export server serves real HTTPS with the unchanged production upgrade policy", async () => {
  const root = await mkdtemp(join(tmpdir(), "canvas-https-export-"));
  await writeFile(join(root, "index.html"), '<script src="/entry.js"></script>');
  await writeFile(join(root, "entry.js"), "globalThis.canvasLoaded = true;");
  await writeFile(join(root, "_headers"), "/*\n  Content-Security-Policy: script-src 'self'; upgrade-insecure-requests\n");
  const server = await startStaticServer({ root, https: true, headers: true });
  const request = (path: string) => new Promise<{ body: string; policy: string | undefined; status: number | undefined }>((resolve, reject) => {
    get(server.url + path, { ca: server.certificate }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ body, policy: response.headers["content-security-policy"] as string | undefined, status: response.statusCode }));
    }).on("error", reject);
  });
  try {
    expect(server.url).toStartWith("https://127.0.0.1:");
    const page = await request("/testing/listbox");
    expect(page.status).toBe(200);
    expect(page.policy).toBe("script-src 'self'; upgrade-insecure-requests");
    expect(page.body).toContain('/entry.js');
    expect((await request("/entry.js")).body).toBe("globalThis.canvasLoaded = true;");
    expect((await request("/missing.js")).status).toBe(404);
  } finally {
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
});
