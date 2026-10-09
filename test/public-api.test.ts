// The package entry's surface against its committed snapshot. The snapshot was taken
// from the tree before src/index.ts stopped re-exporting the internal style hub and
// started re-exporting the explicit src/style/public.ts, so equality here is the proof
// that the split published every name with the same binding and nothing more. A
// deliberate API change refreshes it with `bun run check:api --write-snapshot`, in the
// same commit as its tools/api/manifest.ts entry.

import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { discoverPublicApi } from "../tools/api/discover";
import { publicApi } from "../tools/api/manifest";
import { SNAPSHOT_FILE, surfaceOf, type Binding } from "../tools/api/snapshot";

const root = resolve(import.meta.dir, "..");
const snapshot = JSON.parse(readFileSync(resolve(root, SNAPSHOT_FILE), "utf8")) as Record<string, Binding>;
const discovered = discoverPublicApi(root);

test("every resolution of the package entry exports exactly the snapshot, with the same bindings", () => {
  expect(surfaceOf(discovered.web)).toEqual(snapshot);
  expect(surfaceOf(discovered.ios)).toEqual(snapshot);
  expect(surfaceOf(discovered.android)).toEqual(snapshot);
});

test("the manifest classifies exactly the snapshot's names", () => {
  expect(Object.keys(publicApi).sort()).toEqual(Object.keys(snapshot).sort());
});

