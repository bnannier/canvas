import { readdirSync } from "node:fs";
import { resolve } from "node:path";

// npm's rules for what a package never contains (npm-packlist's defaults, below the
// package root): VCS folders, ignore files, editor and Finder litter, logs and
// credentials. A file npm would never pack is not public surface, so the gate does not
// ask for a classification of a `.DS_Store` that Finder left in styles/.
const NEVER_PACKED_DIRECTORIES = new Set([".git", ".svn", ".hg", "CVS", "node_modules"]);
const NEVER_PACKED_FILES = [/^\.DS_Store$/, /^\._/, /^\..*\.swp$/, /\.orig$/, /^npm-debug\.log$/, /^\.npmrc$/, /^\.npmignore$/, /^\.gitignore$/];
// An ignore file below the root adds rules of its own, which this reader does not
// interpret: it stops rather than list files npm might leave out.
const IGNORE_FILES = new Set([".npmignore", ".gitignore"]);

/** Whether npm packs a file or folder with this name (below the package root, with no nested ignore file). */
export function npmPacks(name: string, directory: boolean): boolean {
  return directory ? !NEVER_PACKED_DIRECTORIES.has(name) : !NEVER_PACKED_FILES.some((pattern) => pattern.test(name));
}

/** The repo-relative files npm packs from a directory of the package, recursively. */
export function packedFiles(root: string, directory: string): string[] {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    if (IGNORE_FILES.has(entry.name)) throw new Error(`${path}: an ignore file below the package root changes what npm packs, and tools/api/packed.ts does not read one`);
    if (!npmPacks(entry.name, entry.isDirectory())) return [];
    return entry.isDirectory() ? packedFiles(root, path) : [path];
  }).sort();
}
