import { describe, it, expect } from "bun:test";
import { shadow } from "../src/style/shadow.ts";

describe("shadow", () => {
  it("defaults to the standard elevation", () => {
    expect(shadow()).toEqual(shadow("DEFAULT"));
  });

  it("scales elevation with the level", () => {
    expect(shadow("none").elevation).toBe(0);
    expect(shadow("sm").elevation).toBe(1);
    expect(shadow("md").elevation).toBe(4);
    expect(shadow("lg").elevation).toBe(8);
    expect(shadow("xl").elevation).toBe(12);
  });

  it("flattens shadow opacity at the none level", () => {
    expect(shadow("none").shadowOpacity).toBe(0);
  });

  it("carries both iOS shadow props and Android elevation", () => {
    const md = shadow("md");
    expect(md.shadowRadius).toBe(6);
    expect(md.shadowOffset).toEqual({ width: 0, height: 4 });
    expect(md.shadowColor).toBe("#000000");
    expect(md.elevation).toBe(4);
  });
});
