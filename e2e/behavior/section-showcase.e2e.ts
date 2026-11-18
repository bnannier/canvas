import { SHOWCASE } from "../../docs/src/data/showcase";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [320, 820, 1440]) {
  test(`overlay component links stay inside the card footer and remain actionable (${width})`, async ({ page }) => {
    await gotoDocs(page, "/overlays", { viewport: { width, height: 900 } });

    for (const { id, links } of SHOWCASE.overlays.cards) {
      const card = page.getByTestId(`showcase-${id}`);
      for (const slug of links) {
        const link = card.getByRole("link").and(card.locator(`[href$="/components/${slug}"]`));
        await link.click({ trial: true });
        const [frame, chip] = await Promise.all([card.boundingBox(), link.boundingBox()]);
        if (!frame || !chip) throw new Error(`Missing bounds for ${slug} in ${id}`);
        expect(chip.y).toBeGreaterThan(frame.y + frame.height / 2);
        expect(chip.y + chip.height).toBeLessThan(frame.y + frame.height);
        expect(chip.x).toBeGreaterThan(frame.x);
        expect(chip.x + chip.width).toBeLessThan(frame.x + frame.width);
      }
    }

    const dialogLink = page.getByTestId("showcase-c-dialog").getByRole("link", { name: "Dialog", exact: true });
    await dialogLink.focus();
    await dialogLink.press("Enter");
    await expect(page).toHaveURL(/\/components\/dialog(?:[?#]|$)/);
  });
}

test("the Skins button keeps a valid corner radius as it springs back to the web shape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoDocs(page, "/skins");
  const button = page.getByTestId("section-hero").locator("rect[filter]");
  await expect(button).toHaveAttribute("width", "168", { timeout: 12_000 });
  // Sample on each frame since the corner only reaches zero during the return spring.
  await page.waitForFunction(rect => rect.getAttribute("rx") === "0", await button.elementHandle(), { timeout: 12_000 });
  await expect(button).toHaveAttribute("rx", "10");
});

test("Section demos reset for Reduced Motion and preserve reader edits after keyboard takeover", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoDocs(page, "/inputs");
  const workspace = page.getByTestId("section-demo-workspace-name");
  await workspace.scrollIntoViewIfNeeded();
  await expect(workspace).toHaveValue("Riskora");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(workspace).toHaveValue("");
  await page.waitForTimeout(2300);
  await expect(workspace).toHaveValue("");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(workspace).toHaveValue("Riskora");
  await workspace.focus();
  await workspace.press("ControlOrMeta+a");
  await page.keyboard.insertText("My workspace");
  await expect(workspace).toHaveValue("My workspace");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(workspace).toHaveValue("My workspace");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(2800);
  await expect(workspace).toHaveValue("My workspace");
});

test.describe("Section demos with a touch viewport", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("A swipe scrolls and resumes the example, while a tap takes over", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Uses a Chromium touch sequence");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoDocs(page, "/controls");
    const toggle = page.getByTestId("section-demo-glass-switch");
    await toggle.scrollIntoViewIfNeeded();
    const before = await toggle.boundingBox();
    expect(before).not.toBeNull();
    const { x, y, height } = before!;
    const touchX = x + 20;
    const touchY = y + height / 2;
    const session = await page.context().newCDPSession(page);

    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: touchX, y: touchY }] });
    for (let distance = 20; distance <= 120; distance += 20) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: touchX, y: touchY - distance }] });
      await page.waitForTimeout(65);
    }
    // Let the drag settle so the release cannot fling the entire card offscreen.
    await page.waitForTimeout(150);
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await session.detach();
    await expect.poll(async () => Math.abs(((await toggle.boundingBox())?.y ?? y) - y)).toBeGreaterThan(15);
    await expect(toggle).toBeInViewport();

    const afterSwipe = await toggle.getAttribute("aria-checked");
    expect(afterSwipe).toMatch(/^(true|false)$/);
    await expect(toggle).not.toHaveAttribute("aria-checked", afterSwipe!);
    await toggle.tap();
    await expect(toggle).toHaveAttribute("aria-checked", afterSwipe!);
    await page.waitForTimeout(2800);
    await expect(toggle).toHaveAttribute("aria-checked", afterSwipe!);
  });
});
