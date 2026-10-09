import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AuditPlatform } from "../../../docs/src/audit/protocol.ts";
import {
  DEV_APP_ID,
  PROJECT_STAMP,
  isAuditProject,
  projectAppId,
  projectPaths,
  readStamp,
  recoverProjects,
  restoreDocsProject,
  setDocsProjectAside,
  whyNotReuse,
} from "./build.ts";
import { AUDIT_APP_ID } from "./devices.ts";

// The audit build's project handling, on a scratch checkout with stand-in projects: the
// docs app's own project must be exactly where it was after an audit build, however that
// build ended, so the docs' `expo run:<platform>` never builds the audit app.

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function checkout() {
  const root = mkdtempSync(join(tmpdir(), "canvas-audit-build-"));
  roots.push(root);
  mkdirSync(join(root, "docs"));
  return root;
}

/** A generated project as far as the build reads one: its app id, and a marker to tell copies apart. */
function project(dir: string, platform: AuditPlatform, appId: string, marker: string) {
  if (platform === "ios") {
    const name = appId === AUDIT_APP_ID ? "CanvasAudit" : "Canvas";
    mkdirSync(join(dir, `${name}.xcodeproj`), { recursive: true });
    writeFileSync(join(dir, `${name}.xcodeproj`, "project.pbxproj"), `\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ${appId};\n`);
  } else {
    mkdirSync(join(dir, "app"), { recursive: true });
    writeFileSync(join(dir, "app", "build.gradle"), `android {\n    defaultConfig {\n        applicationId '${appId}'\n    }\n}\n`);
  }
  writeFileSync(join(dir, "marker"), marker);
}

const marker = (dir: string) => readFileSync(join(dir, "marker"), "utf8");

describe("the audit build's native projects", () => {
  for (const platform of ["ios", "android"] as const) {
    test(`${platform}: reads which app a project builds`, () => {
      const root = checkout();
      const paths = projectPaths(platform, root);
      expect(projectAppId(paths.docs, platform)).toBeNull();
      project(paths.docs, platform, DEV_APP_ID, "docs");
      expect(projectAppId(paths.docs, platform)).toBe(DEV_APP_ID);
      expect(isAuditProject(paths.docs, platform)).toBe(false);
      project(paths.parked, platform, AUDIT_APP_ID, "audit");
      expect(isAuditProject(paths.parked, platform)).toBe(true);
    });

    test(`${platform}: the docs app's project is set aside for the build and put back untouched`, async () => {
      const root = checkout();
      const paths = projectPaths(platform, root);
      project(paths.docs, platform, DEV_APP_ID, "the docs project");
      expect(await recoverProjects(paths, platform, root)).toEqual([]);
      expect(await setDocsProjectAside(paths)).toBe(true);
      expect(existsSync(paths.docs)).toBe(false);
      // What `expo prebuild` generates in its place.
      project(paths.docs, platform, AUDIT_APP_ID, "the audit project");
      await restoreDocsProject(paths, true);
      expect(projectAppId(paths.docs, platform)).toBe(DEV_APP_ID);
      expect(marker(paths.docs)).toBe("the docs project");
      expect(existsSync(paths.aside)).toBe(false);
      expect(marker(paths.parked)).toBe("the audit project");
    });

    test(`${platform}: with no docs project, the build leaves docs/${platform} empty`, async () => {
      const root = checkout();
      const paths = projectPaths(platform, root);
      expect(await setDocsProjectAside(paths)).toBe(false);
      project(paths.docs, platform, AUDIT_APP_ID, "the audit project");
      await restoreDocsProject(paths, false);
      expect(existsSync(paths.docs)).toBe(false);
      expect(isAuditProject(paths.parked, platform)).toBe(true);
    });

    test(`${platform}: a build killed outright is put right by the next one`, async () => {
      const root = checkout();
      const paths = projectPaths(platform, root);
      project(paths.aside, platform, DEV_APP_ID, "the docs project");
      project(paths.docs, platform, AUDIT_APP_ID, "the audit project");
      const notes = await recoverProjects(paths, platform, root);
      expect(notes).toHaveLength(2);
      expect(marker(paths.docs)).toBe("the docs project");
      expect(marker(paths.parked)).toBe("the audit project");
      expect(existsSync(paths.aside)).toBe(false);
    });

    test(`${platform}: an audit project an earlier build left in docs/${platform} is parked`, async () => {
      const root = checkout();
      const paths = projectPaths(platform, root);
      project(paths.docs, platform, AUDIT_APP_ID, "left behind");
      expect(await recoverProjects(paths, platform, root)).toEqual([`moved the audit project out of docs/${platform} to .audit/native/${platform}`]);
      expect(existsSync(paths.docs)).toBe(false);
      expect(marker(paths.parked)).toBe("left behind");
    });

    test(`${platform}: refuses to guess between two docs projects`, async () => {
      const root = checkout();
      const paths = projectPaths(platform, root);
      project(paths.aside, platform, DEV_APP_ID, "set aside");
      project(paths.docs, platform, DEV_APP_ID, "generated since");
      await expect(recoverProjects(paths, platform, root)).rejects.toThrow("keep the one you want");
      expect(marker(paths.aside)).toBe("set aside");
      expect(marker(paths.docs)).toBe("generated since");
    });
  }

  test("reuses a parked project only while the native inputs are the ones it was generated from", () => {
    const root = checkout();
    const paths = projectPaths("ios", root);
    const native = "a".repeat(64);
    expect(whyNotReuse(paths, "ios", native)).toBe("there is no parked audit project");
    project(paths.parked, "ios", DEV_APP_ID, "not ours");
    expect(whyNotReuse(paths, "ios", native)).toBe("the parked project is not the audit app's");
    rmSync(paths.parked, { recursive: true });
    project(paths.parked, "ios", AUDIT_APP_ID, "audit");
    expect(whyNotReuse(paths, "ios", native)).toContain(`has no ${PROJECT_STAMP}`);
    writeFileSync(join(paths.parked, PROJECT_STAMP), JSON.stringify({ schema: 1, platform: "ios", appId: AUDIT_APP_ID, nativeFingerprint: "b".repeat(64), generated: "2026-10-09T00:00:00.000Z" }));
    expect(whyNotReuse(paths, "ios", native)).toContain("the native inputs changed since the parked project was generated (bbbbbbbbbbbb, now aaaaaaaaaaaa)");
    writeFileSync(join(paths.parked, PROJECT_STAMP), JSON.stringify({ schema: 1, platform: "ios", appId: AUDIT_APP_ID, nativeFingerprint: native, generated: "2026-10-09T00:00:00.000Z" }));
    expect(readStamp(paths.parked)?.nativeFingerprint).toBe(native);
    expect(whyNotReuse(paths, "ios", native)).toBeNull();
  });
});
