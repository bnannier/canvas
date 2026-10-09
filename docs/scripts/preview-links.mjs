// The pure half of the docs preview opener (preview-server.mjs): which route and
// appearance a request names, the deep link they make, and the command that opens
// that link on a booted iOS simulator or Android emulator. Nothing here listens,
// spawns or reads the environment, so tools/docs/preview-server.test.ts pins it all.

import { join } from "node:path";

export const SCHEME = "canvas";

/** Each appearance axis a link may carry, with the values the docs accept for it. */
export const APPEARANCE_AXES = {
  scheme: ["light", "dark"],
  surface: ["solid", "glass"],
  palette: ["blush", "mint"],
};

/** A docs route without its outer slashes, or null when it is not one. */
export function sanitizeRoute(raw) {
  if (!raw) return null;
  const route = raw.replace(/^\/+/, "").replace(/\/+$/, "");
  return /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/i.test(route) ? route : null;
}

// The appearance query to append, built only from the axes present and valid, in
// APPEARANCE_AXES order. The first value of a repeated axis counts, as the app reads
// it (docs/src/theme/theme-links.ts). An invalid axis is reported by name, with the
// values it takes, instead of being dropped.
export function appearanceQuery(searchParams) {
  const query = new URLSearchParams();
  for (const [axis, values] of Object.entries(APPEARANCE_AXES)) {
    const raw = searchParams.get(axis);
    if (raw === null) continue;
    if (!values.includes(raw)) return { invalid: { axis, values } };
    query.set(axis, raw);
  }
  const text = query.toString();
  return { suffix: text ? `?${text}` : "" };
}

/** The deep link the docs dev app opens: `canvas:///<route>` plus the appearance suffix. */
export function deepLink(route, suffix) {
  return `${SCHEME}:///${route}${suffix}`;
}

// The characters a word may hold and still pass through a POSIX shell (sh, bash, zsh,
// Android's mksh) as itself. Deliberately narrow: no glob (`?`, `*`, `[`), no control
// operator (`&`, `;`, `|`), and nothing zsh expands at the start of a word (`=`, `~`).
const BARE = /^[A-Za-z0-9_.,:/@+-]+$/;
// What a double-quoted word still expands: parameters, commands, escapes, and `!`,
// which interactive bash and zsh read as history expansion.
const DOUBLE_QUOTE_ACTIVE = /[$`\\"!]/;

/**
 * One word quoted for a POSIX shell, so the shell hands it on unchanged. A plain word
 * stays bare; anything else is single-quoted, where nothing is special. A word holding
 * a single quote of its own is double-quoted when nothing in it is active there (the
 * readable form of an already quoted remote command), and otherwise each of its single
 * quotes closes the quoting, is escaped, and reopens it (`'\''`).
 */
export function shellQuote(word) {
  if (BARE.test(word)) return word;
  if (!word.includes("'")) return `'${word}'`;
  if (!DOUBLE_QUOTE_ACTIVE.test(word)) return `"${word}"`;
  return `'${word.replace(/'/g, "'\\''")}'`;
}

/** A command line a POSIX shell splits back into exactly `words`. */
export function shellCommand(words) {
  return words.map(shellQuote).join(" ");
}

/**
 * The command that opens `url` on a platform: the program and its argv for execFile,
 * and the same command as a line a person can paste into their own shell.
 *
 * simctl is handed its argv as is, with no shell in between. `adb shell` is not: like
 * ssh(1), it joins its words with spaces and the device's sh parses that line again,
 * so an unquoted `&` in the link sends `am start` to the background and the device
 * never sees an axis after the first. The remote command is therefore built here as
 * one line with each word quoted for the device's shell, and passed as one argument.
 */
export function openCommand(platform, url, adb = "adb") {
  const [cmd, args] =
    platform === "ios"
      ? ["xcrun", ["simctl", "openurl", "booted", url]]
      : [adb, ["shell", shellCommand(["am", "start", "-a", "android.intent.action.VIEW", "-d", url])]];
  return { cmd, args, manual: shellCommand([cmd, ...args]) };
}

/**
 * The adb to run, found the way Expo CLI finds the SDK: `$ANDROID_HOME`, then
 * `$ANDROID_SDK_ROOT`, then the default SDK location, each with platform-tools/adb.
 * Bare `adb` (a PATH lookup) is the last resort, since a dev server started from an
 * editor or a login item often has no platform-tools on its PATH. The caller hands in
 * the environment and the file check, so this module still reads neither.
 */
export function adbPath(env, exists) {
  const roots = [env.ANDROID_HOME, env.ANDROID_SDK_ROOT, env.HOME && join(env.HOME, "Library", "Android", "sdk")];
  for (const root of roots) {
    if (!root) continue;
    const adb = join(root, "platform-tools", "adb");
    if (exists(adb)) return adb;
  }
  return "adb";
}
