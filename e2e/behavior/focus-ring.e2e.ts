import { expect, test } from "@playwright/test";
import { ALL_SIDES, rgb, ringShows } from "../support/focus-ring";

// Isolated browser paints exercise the evidence reader, including negative cases;
// these are test fixtures, not replacement Canvas controls or shipping UI.
for (const background of ["#ffffff", "#101019"]) {
  test(`focus pixel evidence composites translucent ink over ${background}`, async ({ page }) => {
    await page.setContent(`<body style="margin:0;background:${background}"><button style="position:absolute;left:80px;top:80px;width:200px;height:80px;border:0;background:${background};outline:2px solid rgba(120, 70, 220, 0.28);outline-offset:2px">Focus</button></body>`);
    const frame = page.getByRole("button");
    const original = await frame.getAttribute("style");
    expect(await ringShows(page, frame, "rgba(120, 70, 220, 0.28)")).toEqual(ALL_SIDES);
    expect(await frame.getAttribute("style")).toBe(original);
    // An opaque paint with the same RGB must not stand in for authored alpha.
    await frame.evaluate(node => { node.style.outlineColor = "rgb(120, 70, 220)"; });
    expect(await ringShows(page, frame, "rgba(120, 70, 220, 0.28)")).not.toEqual(ALL_SIDES);
    await frame.evaluate(node => { node.style.outline = "none"; });
    expect(await ringShows(page, frame, "rgba(120, 70, 220, 0.28)")).toEqual({ top: false, right: false, bottom: false, left: false });
  });
}

test("focus pixel evidence detects clipping and retains opaque ring support", async ({ page }) => {
  await page.setContent('<body style="margin:0;background:white"><div style="position:absolute;left:80px;top:80px;overflow:hidden"><button style="width:200px;height:80px;border:0;background:white;outline:2px solid #783cdc;outline-offset:2px">Focus</button></div></body>');
  const frame = page.getByRole("button");
  expect(await ringShows(page, frame, rgb("#783cdc"))).toEqual({ top: false, right: false, bottom: false, left: false });
  await page.locator("div").evaluate(node => { node.style.overflow = "visible"; });
  expect(await ringShows(page, frame, rgb("#783cdc"))).toEqual(ALL_SIDES);
});

test("computed ring normalization preserves source alpha", () => {
  expect(rgb("#783cdc")).toBe("rgb(120, 60, 220)");
  expect(rgb("rgba(120, 60, 220, 0.28)")).toBe("rgba(120, 60, 220, 0.28)");
  expect(rgb("#abcd")).toBe(`rgba(170, 187, 204, ${221 / 255})`);
});

for (const paint of ["border:2px solid rgba(120, 70, 220, 0.28)", "border:0;box-shadow:0 0 0 2px rgba(120, 70, 220, 0.28)"]) {
  test(`focus pixel evidence reads ${paint.includes("box-shadow") ? "shadow" : "border"} paint`, async ({ page }) => {
    await page.setContent(`<body style="background:white"><button style="position:absolute;left:80px;top:80px;width:200px;height:80px;background:white;${paint}">Focus</button></body>`);
    expect(await ringShows(page, page.getByRole("button"), "rgba(120, 70, 220, 0.28)")).toEqual(ALL_SIDES);
  });
}
