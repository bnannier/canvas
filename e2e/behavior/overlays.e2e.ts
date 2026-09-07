/**
 * Opening and closing every overlay, with trusted input.
 *
 * The happy-dom suites already cover focus trapping, Escape and the aria-* aliases,
 * and they are faster. What they cannot cover is the input itself: react-native-web
 * routes a Pressable through its own responder system, so a synthetic DOM click often
 * never fires onPress at all. Playwright's input goes through the browser, which is
 * the only way to know that the control a person clicks is the control that opens.
 *
 * Counts are compared before and after rather than asserted absolutely, because a
 * component page is full of the same roles already: the Dialog page carries nine
 * `dialog` nodes in its Do/Don't examples before anything is clicked. What matters is
 * that clicking the trigger adds exactly one panel and that closing takes it away.
 */
import { OVERLAYS, TOAST } from "../support/overlays";
import { gotoDocs, stage } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const recipe of OVERLAYS) {
  test(`${recipe.slug} opens, closes on Escape`, async ({ page }) => {
    await gotoDocs(page, `/components/${recipe.slug}`, { scheme: "dark" });
    await expect(stage(page)).toBeVisible();

    const panel = recipe.panel(page);
    const trigger = recipe.trigger(page);
    const closed = await panel.count();
    if (recipe.expands) await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await recipe.open(page);
    await expect(panel).toHaveCount(closed + recipe.adds);
    await expect(panel.last()).toBeVisible();
    if (recipe.expands) await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(closed);
    if (recipe.expands) await expect(trigger).toHaveAttribute("aria-expanded", "false");

    if (recipe.restoresFocus) {
      // Closing must put the keyboard back where it came from, or a keyboard user is
      // dropped at the top of the document with no way back to what they just left.
      await expect(trigger).toBeFocused();
    }
  });
}

test("a toast announces itself and then leaves", async ({ page }) => {
  await gotoDocs(page, "/components/toast", { scheme: "dark" });
  // The Toast page carries several live regions: one standing empty for the demo's
  // own toasts, and a few holding the static examples in the Do/Don't cards. So this
  // counts the ones that are SAYING something, before and after.
  const speaking = TOAST.region(page).filter({ hasText: /\S/ });
  await expect(TOAST.region(page).first()).toBeAttached();
  const resting = await speaking.count();

  await TOAST.open(page);
  // A region that is mounted at the same moment as its message is announced
  // inconsistently, so the kit keeps one standing and writes into it.
  await expect(speaking).toHaveCount(resting + 1);
  // It dismisses itself; nothing has to close it.
  await expect(speaking).toHaveCount(resting, { timeout: 15_000 });
});
