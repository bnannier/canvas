import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

/**
 * Mirrors the kit's build output into every locally linked consumer.
 *
 * Consumers register themselves by overlaying `node_modules/@nannier/canvas`
 * with a copy of this checkout's build output, stamped with an `.origin` file
 * naming the checkout (their postinstall does this). The overlay is a real
 * directory rather than a symlink because Next 16 Turbopack refuses to
 * resolve node_modules symlinks that leave the consumer's repo (and the
 * `turbopack.root` workaround breaks server actions). Real directories in
 * node_modules ARE live-watched by Turbopack, Metro, and (with two
 * conditional webpack overrides in DarkFactory) webpack, so this watcher
 * copying into the overlay is all live reload needs.
 *
 * Change detection is a 1s mtime/size scan of dist/ and styles/, NOT
 * fs.watch: recursive fs.watch under Bun on macOS did not deliver events for
 * nested files (only top-level ones), which silently broke syncing for
 * everything below dist/'s first level. The scan is a few hundred stats per
 * tick; latency and cost are negligible next to the tsc watch itself.
 *
 * Run through `bun run dev`, which pairs this with the tsc watch that
 * rebuilds `dist/`.
 */

const ROOT = join(import.meta.dir, "..");
const SYNC_DIRS = ["dist", "styles"];
const SCAN_INTERVAL_MS = 1000;

interface Consumer {
	name: string;
	target: string;
}

/** Directories that may hold consumers: siblings of this repo, and the Ionize workspace. */
function candidateDirs(): string[] {
	const parents = [resolve(ROOT, ".."), resolve(ROOT, "..", "ionize")];
	const out: string[] = [];
	for (const parent of parents) {
		if (!existsSync(parent)) continue;
		for (const entry of readdirSync(parent, { withFileTypes: true })) {
			if (entry.isDirectory()) out.push(join(parent, entry.name));
		}
	}
	return out;
}

function findConsumers(): Consumer[] {
	const consumers: Consumer[] = [];
	for (const dir of candidateDirs()) {
		const overlay = join(dir, "node_modules", "@nannier", "canvas");
		try {
			if (lstatSync(overlay).isSymbolicLink()) continue;
			// `.origin` names the checkout the overlay was built from; only sync
			// overlays that came from THIS checkout (a registry install has no
			// .origin and is never written to).
			const origin = readFileSync(join(overlay, ".origin"), "utf8").trim();
			if (realpathSync(origin) !== realpathSync(ROOT)) continue;
			consumers.push({ name: dir.split("/").pop() ?? dir, target: overlay });
		} catch {
			// No overlay (or no readable .origin): not a consumer right now.
		}
	}
	return consumers;
}

/** rel path -> `${mtimeMs}:${size}` for every file under dist/ and styles/. */
function scan(): Map<string, string> {
	const state = new Map<string, string>();
	const walk = (rel: string): void => {
		const abs = join(ROOT, rel);
		for (const entry of readdirSync(abs, { withFileTypes: true })) {
			const childRel = join(rel, entry.name);
			if (entry.isDirectory()) {
				walk(childRel);
			} else if (entry.isFile()) {
				const s = statSync(join(ROOT, childRel));
				state.set(childRel, `${s.mtimeMs}:${s.size}`);
			}
		}
	};
	for (const dir of SYNC_DIRS) {
		if (existsSync(join(ROOT, dir))) walk(dir);
	}
	return state;
}

/** Copy dist/ and styles/ wholesale into a consumer's overlay. */
async function fullSync(consumer: Consumer): Promise<void> {
	for (const dir of SYNC_DIRS) {
		const src = join(ROOT, dir);
		if (!existsSync(src)) continue;
		await cp(src, join(consumer.target, dir), { recursive: true });
	}
}

async function syncChanges(changed: string[], deleted: string[]): Promise<void> {
	const consumers = findConsumers();
	if (consumers.length === 0) return;
	for (const consumer of consumers) {
		for (const rel of changed) {
			try {
				const dst = join(consumer.target, rel);
				await mkdir(dirname(dst), { recursive: true });
				await copyFile(join(ROOT, rel), dst);
			} catch (err) {
				console.error(`[canvas-sync] failed to sync ${rel} -> ${consumer.name}: ${err}`);
			}
		}
		for (const rel of deleted) {
			await rm(join(consumer.target, rel), { force: true, recursive: true });
		}
	}
	const what = [changed.length && `${changed.length} changed`, deleted.length && `${deleted.length} deleted`]
		.filter(Boolean)
		.join(", ");
	console.log(`[canvas-sync] ${what} -> ${consumers.map((c) => c.name).join(", ")}`);
}

const startup = findConsumers();
if (startup.length === 0) {
	console.log("[canvas-sync] no linked consumers found yet; scanning anyway");
} else {
	for (const consumer of startup) await fullSync(consumer);
	console.log(`[canvas-sync] initial sync -> ${startup.map((c) => c.name).join(", ")}`);
}

let previous = scan();
setInterval(async () => {
	const current = scan();
	const changed: string[] = [];
	const deleted: string[] = [];
	for (const [rel, sig] of current) {
		if (previous.get(rel) !== sig) changed.push(rel);
	}
	for (const rel of previous.keys()) {
		if (!current.has(rel)) deleted.push(rel);
	}
	previous = current;
	if (changed.length || deleted.length) await syncChanges(changed, deleted);
}, SCAN_INTERVAL_MS);
