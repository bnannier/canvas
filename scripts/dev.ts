import { join } from "node:path";

/**
 * Local kit dev: runs the tsc watch that rebuilds `dist/` and the dev-sync
 * watcher that mirrors dist/ and styles/ into linked sibling consumers.
 * Either process dying takes the other down so a half-running dev session
 * cannot silently stop syncing.
 */

const procs = [
	Bun.spawn(["bunx", "tsc", "-p", "tsconfig.build.json", "--watch", "--preserveWatchOutput"], {
		stdout: "inherit",
		stderr: "inherit",
	}),
	Bun.spawn(["bun", join(import.meta.dir, "dev-sync.ts")], {
		stdout: "inherit",
		stderr: "inherit",
	}),
];

let shuttingDown = false;
function shutdown(): void {
	if (shuttingDown) return;
	shuttingDown = true;
	for (const proc of procs) proc.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const code = await Promise.race(procs.map((proc) => proc.exited));
shutdown();
await Promise.all(procs.map((proc) => proc.exited));
process.exit(code);
