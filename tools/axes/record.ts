// Writes the axis characterization (test/fixtures/axes.json) from the resolvers as they
// are now: `bun run axes:record`. Run it only for a change meant to move a precedence
// (the owner's normalization, a new member), in the commit that makes the change, so the
// fixture's diff is the list of call-site results that change. A migration to the axis
// tables never runs it: test/axes.test.ts holds the migrated resolvers to the record as
// it stands.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { characterizeAll, FIXTURE } from "./characterize.ts";
import { SUBJECTS } from "./registry.ts";

const record = characterizeAll(SUBJECTS);
writeFileSync(join(fileURLToPath(new URL("../..", import.meta.url)), FIXTURE), `${JSON.stringify(record, null, 2)}\n`);
console.log(`Wrote ${FIXTURE}: ${Object.keys(record).length} resolvers.`);
