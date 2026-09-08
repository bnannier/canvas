import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../support/fixtures";
import { gotoDocs } from "../support/docs";

async function withDrawerFocusDiagnostics(page: Page, testInfo: TestInfo, run: () => Promise<void>) {
  await page.addInitScript(() => {
    const events: Record<string, unknown>[] = [];
    const describe = (node: EventTarget | null) => node instanceof Element ? {
      tag: node.tagName,
      role: node.getAttribute("role"),
      label: node.getAttribute("aria-label"),
      text: node.textContent?.trim().slice(0, 100),
      testID: node.getAttribute("data-testid"),
      tabIndex: node.getAttribute("tabindex"),
      connected: node.isConnected,
      inMenu: !!node.closest('[role="menu"]'),
      inDialog: !!node.closest('[role="dialog"]'),
    } : null;
    const record = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      events.push({
        time: performance.now(), type: event.type,
        key: event instanceof KeyboardEvent ? event.key : undefined,
        target: describe(event.target), activeElement: describe(document.activeElement),
        documentHasFocus: document.hasFocus(), defaultPrevented: event.defaultPrevented,
      });
      if (events.length > 60) events.shift();
    };
    for (const type of ["focusin", "focusout", "keydown", "keyup"]) document.addEventListener(type, record, true);
    for (const type of ["focus", "blur"]) window.addEventListener(type, record);
    Object.assign(window, { __canvasDrawerFocusSnapshot: () => ({
      activeElement: describe(document.activeElement), documentHasFocus: document.hasFocus(), events,
    }) });
  });
  try {
    await run();
  } catch (error) {
    const focus = await page.evaluate(() => {
      const snapshot = (window as unknown as { __canvasDrawerFocusSnapshot?: () => unknown }).__canvasDrawerFocusSnapshot;
      return snapshot?.() ?? { unavailable: "The fixture did not initialize" };
    }).catch((captureError) => ({ unavailable: String(captureError) }));
    await testInfo.attach("drawer-focus-failure", {
      body: JSON.stringify(focus, null, 2), contentType: "application/json",
    });
    throw error;
  }
}

async function checkDrawerMenuClose(page: Page, scheme: "light" | "dark", waitForRowFocus: boolean) {
  await gotoDocs(page, "/testing/escape-layers?scenario=drawer", { scheme });
  await page.getByRole("button", { name: "Open drawer" }).click();
  const dialog = page.getByRole("dialog");
  const trigger = dialog.getByRole("button", { name: "Open menu" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  if (waitForRowFocus) {
    await expect(dialog.getByRole("menu")).toBeVisible();
    await expect(dialog.getByRole("menuitem", { name: "Rename", exact: true })).toBeFocused();
  } else {
    // Wait only for the open state, then close without waiting for card layout
    // or the first row's focus effect. This preserves the rapid-Escape contract.
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId("child-close-count")).toHaveText("1");
  await expect(page.getByTestId("parent-close-count")).toHaveText("0");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("parent-close-count")).toHaveText("1");
  await expect(page.getByTestId("child-close-count")).toHaveText("1");
}

for (const scheme of ["light", "dark"] as const) {
  test(`autocomplete selects before submitting in ${scheme}`, { tag: "@interaction:autocomplete-form-keyboard" }, async ({ page }) => {
    await gotoDocs(page, "/testing/form-autocomplete", { scheme });
    const input = page.getByRole("combobox", { name: "Fruit", exact: true });
    await input.fill("Ap");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Apricot");
    await expect(input).toBeFocused();
    await expect(page.getByTestId("selection-count")).toHaveText("1");
    await expect(page.getByTestId("submit-count")).toHaveText("0");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("submit-count")).toHaveText("1");
  });

  test(`listbox has one tab stop and toggles once in ${scheme}`, { tag: "@interaction:listbox-keyboard" }, async ({ page }) => {
    await gotoDocs(page, "/testing/listbox", { scheme });
    const group = page.getByRole("group", { name: "Project teams" });
    const first = group.getByRole("checkbox", { name: "Backend", exact: true });
    const second = group.getByRole("checkbox", { name: "Frontend, Web applications" });
    await page.getByRole("button", { name: "Before teams" }).focus();
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(second).toBeFocused();
    await page.keyboard.press("Space");
    await expect(second).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("multi-change-count")).toHaveText("Changes: 1");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "After teams" })).toBeFocused();
    await expect(group.locator('[tabindex="0"]')).toHaveCount(1);
  });

  test(`drawer owns its hosted menu and closes one layer in ${scheme}`, { tag: "@interaction:drawer-nested-keyboard" }, async ({ page }, testInfo) => {
    await withDrawerFocusDiagnostics(page, testInfo, () => checkDrawerMenuClose(page, scheme, true));
  });

  test(`drawer handles Escape immediately after opening its menu in ${scheme}`, async ({ page }, testInfo) => {
    await withDrawerFocusDiagnostics(page, testInfo, () => checkDrawerMenuClose(page, scheme, false));
  });
}
