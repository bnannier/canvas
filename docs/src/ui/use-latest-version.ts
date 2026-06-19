import { useEffect, useState } from "react";
import canvasPkg from "../../../package.json";

// The version pill shows the latest PUBLISHED release of @olympusoss/canvas. A
// deployed docs build bakes in whatever version it was compiled against, which can
// trail npm (CI bumps the version on release, and a static export may outlive
// several releases), so we fetch the latest dist-tag at runtime and fall back to
// the build-time version until (and unless) it resolves. Cross-platform: a plain
// fetch works on iOS, Android, and web (the npm registry sends permissive CORS
// headers for the browser case); on failure the pill keeps the build-time value.
const FALLBACK = `v${canvasPkg.version}`;
const LATEST_URL = "https://registry.npmjs.org/@olympusoss/canvas/latest";

// Resolve once per session; the latest release does not change while the app runs.
let cached: string | null = null;

export function useLatestVersion(): string {
  const [version, setVersion] = useState(cached ?? FALLBACK);
  useEffect(() => {
    if (cached) return;
    let active = true;
    fetch(LATEST_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { version?: string } | null) => {
        if (!active || typeof data?.version !== "string") return;
        cached = `v${data.version}`;
        setVersion(cached);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return version;
}
