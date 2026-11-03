// Uses the repository's existing Playwright dependency. No screenshots or traces are retained.
import { chromium, expect } from "@playwright/test";
import { serveExport } from "./serve.mjs";

// Reuse the same flow checks against the combined docs artifact and its strict CSP.
const server = process.env.CANVAS_RECIPES_TEST_URL
  ? { url: process.env.CANVAS_RECIPES_TEST_URL, close: async () => {} }
  : await serveExport();
let browser;
const results = [];
try {
  browser = await chromium.launch();
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultTimeout(10000);
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
    await page.addInitScript(() => {
      globalThis.recipeCspViolations = [];
      document.addEventListener("securitypolicyviolation", (event) => globalThis.recipeCspViolations.push(`${event.effectiveDirective}: ${event.blockedURI}`));
    });
    const response = await page.goto(server.url);
    if (process.env.CANVAS_RECIPES_TEST_URL) {
      const policy = response.headers()["content-security-policy"];
      expect(policy).toContain("require-trusted-types-for 'script'");
      expect(policy).not.toContain("'unsafe-eval'");
      expect(policy.match(/script-src[^;]*/)[0]).not.toContain("'unsafe-inline'");
    }
    const navigate = async (name) => {
      const link = page.getByRole("link", { name, exact: true });
      await link.focus(); await page.keyboard.press("Enter");
    };
    const noOverflow = async () => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      // Also reject cards/fields escaping the viewport while allowing navbar's intentional scrolling row.
      const bounds = await page.getByRole("main").evaluate((main) => [...main.querySelectorAll("input, [role='progressbar'], [role='radiogroup']")].map((node) => {
        const rect = node.getBoundingClientRect(); return { left: rect.left, right: rect.right };
      }));
      for (const box of bounds) { expect(box.left).toBeGreaterThanOrEqual(-1); expect(box.right).toBeLessThanOrEqual(width + 1); }
    };
    await expect(page.getByText("Make it yours.", { exact: true })).toBeVisible();
    await noOverflow();
    const name = page.getByRole("textbox", { name: "Full name" });
    const email = page.getByRole("textbox", { name: "Email address" });
    await name.fill("A"); await email.fill("invalid");
    await page.getByRole("button", { name: "Save settings", exact: true }).click();
    await expect(page.getByText("Enter a name with at least two characters.", { exact: true })).toBeVisible();
    await expect(page.getByText("Enter a valid email address.", { exact: true })).toBeVisible();
    await expect(name).toBeFocused();
    await page.getByRole("button", { name: "Cancel changes", exact: true }).click();
    await expect(name).toHaveValue("Alex Morgan"); await expect(email).toHaveValue("alex@example.com");
    await name.fill("Jamie Rivera"); await email.fill("jamie@example.com");
    const digest = page.getByRole("switch", { name: "Weekly digest", exact: true });
    await digest.focus(); await page.keyboard.press("Space");
    await expect(digest).toHaveAttribute("aria-checked", "true");
    await email.focus(); await page.keyboard.press("Enter");
    await expect(page.getByText("Settings saved for this session.", { exact: true })).toBeVisible();
    await expect(page.getByText("Jamie Rivera", { exact: true })).toBeVisible();
    await expect(page.getByText("jamie@example.com", { exact: true })).toBeVisible();
    await name.fill("Discard me"); await page.getByRole("button", { name: "Cancel changes", exact: true }).click();
    await expect(name).toHaveValue("Jamie Rivera");
    // All navigation is keyboard operable, using the kit's roving nav items.
    await navigate("Dashboard");
    await expect(page.getByText("A clearer workday.", { exact: true })).toBeVisible();
    await expect(page.getByText("4 matching items", { exact: true })).toBeVisible();
    const totalUnits = page.getByText("86", { exact: true });
    await expect(totalUnits).toBeVisible();
    expect((await totalUnits.boundingBox()).height).toBeLessThan(65);
    await noOverflow();
    const search = page.getByRole("textbox", { name: "Search work" });
    await search.fill("Maya");
    await expect(page.getByText("2 matching items", { exact: true })).toBeVisible();
    await expect(page.getByText("56", { exact: true })).toBeVisible();
    await expect(page.getByText("67%", { exact: true })).toBeVisible();
    await expect(page.getByText("Review November shipments", { exact: true })).toHaveCount(0);
    await search.fill("no matches");
    await expect(page.getByText("No matching work", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reset filters", exact: true }).click();
    const status = page.getByRole("button", { name: "Status", exact: true });
    await status.click();
    await page.getByRole("option", { name: "Needs attention", exact: true }).click();
    await expect(page.getByText("1 matching items", { exact: true })).toBeVisible();
    await expect(page.getByText("Review November shipments", { exact: true })).toBeVisible();
    // Escape from an open select restores the trigger and leaves the selected filter alone.
    await status.click(); await page.keyboard.press("Escape");
    await expect(status).toHaveAttribute("aria-expanded", "false");
    await page.getByRole("button", { name: "Clear filters", exact: true }).click();
    await page.getByRole("button", { name: "Refresh sample data", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Studio launch progress updated to 79%.", { exact: true })).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Prepare studio launch progress", exact: true })).toHaveAttribute("aria-valuenow", "79");
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Refresh sample data", exact: true }).click();
    await expect(page.getByRole("progressbar", { name: "Prepare studio launch progress", exact: true })).toHaveAttribute("aria-valuenow", "100");
    await status.click(); await page.getByRole("option", { name: "Ready", exact: true }).click();
    await expect(page.getByText("2 matching items", { exact: true })).toBeVisible();
    await navigate("Booking");
    await expect(page.getByText("Make space to create.", { exact: true })).toBeVisible();
    await noOverflow();
    const confirm = page.getByRole("button", { name: "Confirm booking", exact: true });
    await confirm.click();
    await expect(page.getByText("Choose a service.", { exact: true })).toBeVisible();
    await expect(page.getByText("Choose an appointment date.", { exact: true })).toBeVisible();
    const service = page.getByRole("button", { name: "Service, required", exact: true });
    await service.click(); await page.getByRole("option", { name: "Design consultation · 30 min", exact: true }).click();
    await page.getByRole("button", { name: "Appointment date, required", exact: true }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("radio", { name: "9:00 AM", exact: true }).click();
    await expect(page.getByRole("radio", { name: "9:00 AM", exact: true })).toHaveAttribute("aria-checked", "true");
    // Changing the service invalidates the old slot, rather than carrying an unavailable time forward.
    await service.click(); await page.getByRole("option", { name: "Creative workshop · 60 min", exact: true }).click();
    await expect(page.getByRole("radio", { name: "9:00 AM", exact: true })).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "10:00 AM", exact: true })).toHaveAttribute("aria-checked", "false");
    await page.getByRole("radio", { name: "10:00 AM", exact: true }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("radio", { name: "10:00 AM", exact: true })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("textbox", { name: "Booking name" }).fill("Jamie Rivera");
    await page.getByRole("textbox", { name: "Contact email" }).fill("invalid");
    await confirm.click();
    await expect(page.getByText("Enter a valid contact email.", { exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: "Contact email" }).fill("jamie@example.com");
    await page.getByRole("textbox", { name: "Contact email" }).press("Enter");
    await expect(page.getByText("Sample reservation confirmed", { exact: true })).toBeVisible();
    await expect(page.getByText("10:00 AM (device local time)", { exact: true })).toBeVisible();
    await navigate("Settings");
    await expect(page.getByRole("textbox", { name: "Full name" })).toHaveValue("Jamie Rivera");
    await page.getByRole("switch", { name: "Dark mode", exact: true }).click();
    await expect(page.getByRole("switch", { name: "Dark mode", exact: true })).toHaveAttribute("aria-checked", "true");
    await noOverflow();
    await navigate("Booking");
    await expect(page.getByText("Sample reservation confirmed", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel sample reservation", exact: true }).click();
    await expect(page.getByText("Sample reservation cancelled. Choose another time to book again.", { exact: true })).toBeVisible();
    await expect(page.getByText("Sample reservation confirmed", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Clear draft", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Booking name" })).toHaveValue("");
    await noOverflow();
    await page.reload(); await expect(page.getByRole("textbox", { name: "Full name" })).toHaveValue("Alex Morgan");
    expect(failures).toEqual([]);
    expect(await page.evaluate(() => globalThis.recipeCspViolations)).toEqual([]);
    results.push({ viewport: `${width}×900`, settings: "pass", dashboard: "pass", booking: "pass", keyboard: "pass", overflow: "pass", consoleErrors: failures.length });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally { await browser?.close(); await server.close(); }
