import { fitStageForScreenshot, gotoDocs, settledBox, stage } from "../support/docs";
import { expect, test } from "../support/fixtures";
import { OVERLAYS } from "../support/overlays";

const dialog = OVERLAYS.find((recipe) => recipe.slug === "dialog")!;

test("an open dialog and its draft survive narrow and desktop layouts", async ({ page }) => {
  await gotoDocs(page, "/components/dialog", { scheme: "light" });
  await dialog.open(page);
  const panel = dialog.panel(page);
  await expect(panel).toBeVisible();
  const draft = panel.getByRole("textbox").last();
  await draft.fill("Keep this refund draft");
  const originalStage = await stage(page).elementHandle();
  const originalDialog = await panel.elementHandle();

  // At 1024 the navigation changes; at 1023 the Playground rail moves. Exercise
  // both boundaries separately so neither ancestor can silently remount the form.
  for (const width of [1024, 1023, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    // The actual shell and rail must reach their new layout before checking state.
    await expect(page.getByRole("tab", { name: "Components", exact: true })).toHaveCount(width <= 1024 ? 1 : 0);
    await settledBox(stage(page));
    expect(await originalStage!.evaluate((node) => node.isConnected), "resize remounted the preview stage").toBe(true);
    expect(await originalDialog!.evaluate((node) => node.isConnected), "resize remounted the open dialog").toBe(true);
    await expect(panel).toBeVisible();
    await expect(draft).toHaveValue("Keep this refund draft");
  }

  await originalStage!.dispose();
  await originalDialog!.dispose();
});

test("an open stage screenshot does not resize the browser viewport", async ({ page }, testInfo) => {
  await gotoDocs(page, "/components/dialog", { scheme: "light" });
  await dialog.open(page);
  const panel = dialog.panel(page);
  await expect(panel).toBeVisible();
  await fitStageForScreenshot(page);

  const viewportChanges = await page.evaluateHandle(() => {
    const sizes: number[][] = [];
    const record = () => sizes.push([innerWidth, innerHeight, visualViewport?.width ?? 0, visualViewport?.height ?? 0]);
    window.addEventListener("resize", record);
    visualViewport?.addEventListener("resize", record);
    return {
      sizes,
      stop: () => {
        window.removeEventListener("resize", record);
        visualViewport?.removeEventListener("resize", record);
      },
    };
  });

  try {
    const screenshot = await stage(page).screenshot({ animations: "disabled" });
    await testInfo.attach("open dialog stage", { body: screenshot, contentType: "image/png" });
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    expect(await viewportChanges.evaluate((audit) => audit.sizes), "capturing the stage changed the responsive viewport").toEqual([]);
    await expect(panel).toBeVisible();
  } finally {
    await viewportChanges.evaluate((audit) => audit.stop());
    await viewportChanges.dispose();
  }
});
