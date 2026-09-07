import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const omitted = (process.env.npm_config_omit ?? "").split(/[\s,]+/);

async function installHooks() {
  // Package consumers and archive installs do not own this checkout's hooks.
  // CI and production installs need no development-only Git configuration.
  if (
    process.env.HUSKY === "0" ||
    (process.env.CI && process.env.CI !== "false" && process.env.CI !== "0") ||
    process.env.NODE_ENV === "production" ||
    process.env.npm_config_production === "true" ||
    omitted.includes("dev") ||
    !existsSync(new URL("../.git", import.meta.url))
  ) return;

  let huskyEntry;
  try {
    huskyEntry = createRequire(import.meta.url).resolve("husky");
  } catch (error) {
    // `bun install --production` can omit development dependencies without
    // setting NODE_ENV. Only a missing Husky dependency is an expected skip;
    // errors loading or running an installed dependency must fail prepare.
    if (error.code === "MODULE_NOT_FOUND" && error.message.startsWith("Cannot find module 'husky'")) return;
    throw error;
  }

  process.chdir(root);
  const { default: install } = await import(pathToFileURL(huskyEntry).href);
  // Husky writes a relative path, so moves and linked Git worktrees resolve
  // their own .husky directory instead of retaining an old absolute path.
  const error = install(".husky");
  if (error) throw new Error(`Cannot install Canvas Git hooks: ${error}`);
}

await installHooks();
