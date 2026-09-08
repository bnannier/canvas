import { expect, test } from "bun:test";
import { parseAndroidNightMode } from "./appearance.mjs";

test("Android shell appearance preserves every supported write token, including custom subtype", () => {
  for (const token of ["yes", "no", "auto", "custom_schedule", "custom_bedtime"]) {
    expect(parseAndroidNightMode(`Night mode: ${token}`)).toBe(token);
  }
});

test("unknown and ambiguous custom modes cannot authorize appearance mutation", () => {
  for (const token of ["custom", "unknown", "light", "dark", "bedtime", "YES", "", "-1", "3"]) {
    expect(() => parseAndroidNightMode(`Night mode: ${token}`)).toThrow("Cannot safely restore Android appearance");
  }
});

test("appearance output must be one complete exact line without malformed prefix or trailing output", () => {
  for (const output of ["yes", "night mode: yes", "Night mode:yes", "Night mode:  yes", " Night mode: yes",
    "Night mode: yes ", "Night mode: yes\n", "Night mode: yes\r", "Night mode: yes\r\n",
    "Night mode: yes\nNight mode: no", "warning\nNight mode: yes", "Night mode: yes; no",
    "Night mode: custom_schedule extra", "Night mode: custom_bedtime\0", "Night mode: cus\ntom_schedule"]) {
    expect(() => parseAndroidNightMode(output)).toThrow("unrecognized night-mode output");
  }
});

test("appearance parser rejects non-string command results", () => {
  for (const output of [null, undefined, true, 1, ["Night mode: yes"], { toString: () => "Night mode: yes" }]) {
    expect(() => parseAndroidNightMode(output)).toThrow("unrecognized night-mode output");
  }
});
