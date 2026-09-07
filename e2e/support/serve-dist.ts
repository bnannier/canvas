#!/usr/bin/env bun
/**
 * The command Playwright's `webServer` runs: serve a directory over the shared
 * static server and keep running until it is killed.
 *
 * Usage:
 *   bun e2e/support/serve-dist.ts --root docs/dist --port 4173 --headers
 *   bun e2e/support/serve-dist.ts --root . --port 4174            # the tokens fixture
 *   bun e2e/support/serve-dist.ts --root docs/dist --base /canvas # a subpath export
 */
import { startStaticServer } from "./static-server";

const flag = (name: string): string | undefined => {
  const argv = process.argv;
  const inline = argv.find((a) => a.startsWith(`--${name}=`));
  if (inline) return inline.slice(name.length + 3);
  const at = argv.indexOf(`--${name}`);
  if (at === -1) return undefined;
  const next = argv[at + 1];
  return next && !next.startsWith("--") ? next : "";
};

const has = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const root = flag("root") ?? "docs/dist";
  const port = Number(flag("port") ?? 0);
  const base = flag("base") ?? "";
  const spa = !has("no-spa");

  const server = await startStaticServer({ root, port, base, headers: has("headers"), spa });

  // A stale or missing export is the single most likely reason a run fails
  // mysteriously, so say so here rather than letting every test time out.
  if (spa) {
    const probe = await fetch(`${server.url}/`);
    if (!probe.ok) {
      console.error(
        `No index.html under ${root}. Build the docs export first:\n` +
          `  cd docs && bun run build:web\n` +
          `or point the suite at a running Metro:\n` +
          `  E2E_BASE_URL=http://localhost:8081 bun run e2e`,
      );
      process.exit(1);
    }
  }

  console.log(`serving ${root} at ${server.url}`);
  const stop = () => {
    void server.close().then(() => process.exit(0));
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

void main();
