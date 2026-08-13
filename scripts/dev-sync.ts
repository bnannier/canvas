import { existsSync, lstatSync, readdirSync, realpathSync, watch } from "node:fs";
import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

/**
 * Mirrors the kit's build output into every locally linked consumer.
 *
 * Consumers register themselves by carrying a git-ignored `.canvas` symlink
 * that resolves to this checkout (their postinstall creates it) next to a
 * REAL `node_modules/@nannier/canvas` directory. The copy is what makes live
 * reload work under Next 16 Turbopack: it refuses to resolve a node_modules
 * symlink whose realpath is outside the consumer's repo, and the historical
 * `turbopack.root` workaround breaks server actions, so consumers overlay a
 * real directory and this watcher keeps it fresh while you edit the kit.
 *
 * Run through `bun run dev`, which pairs this with the tsc watch that
 * rebuilds `dist/`.
 */

const ROOT = join(import.meta.dir, "..");
const WATCH_DIRS = ["dist", "styles"];
const DEBOUNCE_MS = 150;

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
		const marker = join(dir, ".canvas");
		try {
			if (!lstatSync(marker).isSymbolicLink()) continue;
			if (realpathSync(marker) !== realpathSync(ROOT)) continue;
			const target = join(dir, "node_modules", "@nannier", "canvas");
			// The overlay must be a real directory; a symlink here means the
			// consumer is in a state this watcher should not write through.
			if (!existsSync(target) || lstatSync(target).isSymbolicLink()) continue;
			consumers.push({ name: dir.split("/").pop() ?? dir, target });
		} catch {
			// No marker (or it dangles): not a consumer right now.
		}
	}
	return consumers;
}

/** Copy dist/ and styles/ wholesale into a consumer's overlay. */
async function fullSync(consumer: Consumer): Promise<void> {
	for (const dir of WATCH_DIRS) {
		const src = join(ROOT, dir);
		if (!existsSync(src)) continue;
		await cp(src, join(consumer.target, dir), { recursive: true });
	}
}

const pending = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;

async function flush(): Promise<void> {
	const changed = [...pending];
	pending.clear();
	const consumers = findConsumers();
	if (consumers.length === 0) return;
	for (const consumer of consumers) {
		for (const rel of changed) {
			const src = join(ROOT, rel);
			const dst = join(consumer.target, rel);
			if (existsSync(src)) {
				await mkdir(dirname(dst), { recursive: true });
				await copyFile(src, dst);
			} else {
				await rm(dst, { force: true, recursive: true });
			}
		}
	}
	const names = consumers.map((c) => c.name).join(", ");
	console.log(`[canvas-sync] ${changed.length} file(s) -> ${names}`);
}

function schedule(rel: string): void {
	pending.add(rel);
	clearTimeout(timer);
	timer = setTimeout(() => void flush(), DEBOUNCE_MS);
}

async function watchDir(dir: string): Promise<void> {
	const abs = join(ROOT, dir);
	// dist/ may not exist yet on a fresh checkout; wait for the tsc watch to
	// produce it rather than crashing.
	while (!existsSync(abs)) await new Promise((r) => setTimeout(r, 2000));
	watch(abs, { recursive: true }, (_event, filename) => {
		// A null filename means the platform could not attribute the event;
		// resync the whole directory on the next flush.
		schedule(filename ? join(dir, filename.toString()) : dir);
	});
}

const startup = findConsumers();
if (startup.length === 0) {
	console.log("[canvas-sync] no linked consumers found yet; watching anyway");
} else {
	for (const consumer of startup) await fullSync(consumer);
	console.log(`[canvas-sync] initial sync -> ${startup.map((c) => c.name).join(", ")}`);
}
for (const dir of WATCH_DIRS) void watchDir(dir);
