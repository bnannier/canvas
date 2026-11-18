import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

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
