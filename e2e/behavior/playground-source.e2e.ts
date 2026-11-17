import { COMPONENTS } from "../../docs/src/core/data/components";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

const normalized = (source: string) => source.replace(/\s+/g, " ").trim();

// The compiler/model tests verify source transformations against rendered props.
// This sweep checks their integration on every actual component route, including
// generated data, the selected platform scope, the stage and the displayed source.
for (const width of [1440, 390]) {
  for (const component of COMPONENTS) {
    test(`${component.name} playground renders its displayed example source at ${width}px`, async ({ page }) => {
      await gotoDocs(page, `/components/${component.slug}`, { viewport: { width, height: 1000 } });
      const playground = page.locator('[data-detail-section="pg"]');
      const stage = playground.locator('[data-playground-source]');
      await expect(stage).toHaveCount(1);
      await expect(stage).toHaveAttribute("data-playground-component", /\S+/);
      await expect(stage).toHaveAttribute("data-playground-example", /\S+/);
      await expect(playground.getByText("Example failed to render", { exact: true })).toHaveCount(0);
      const source = (await stage.getAttribute("data-playground-source"))!;
      const name = (await stage.getAttribute("data-playground-component"))!;
      expect(source, "the effective source contains the documented component").toMatch(new RegExp(`<${name}(?:[\\s/>])`));
      const displayed = normalized(await playground.getByTestId("playground-code").innerText());
      expect(displayed.endsWith(normalized(source)), "the complete effective source reaches the displayed code block").toBe(true);
      await expect.poll(() => stage.evaluate((node) => {
        const box = node.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && node.childElementCount > 0;
      }), { message: "the example has rendered content in a measurable stage" }).toBe(true);
      if (width === 390) {
        await expect.poll(() => stage.evaluate((node) => node.scrollWidth - node.clientWidth), {
          message: "the phone example stays inside its stage; nested scrollports may scroll",
        }).toBeLessThanOrEqual(1);
      }
    });
  }
}

test("DashboardGrid source includes real widgets and unlocked keyboard editing", async ({ page }) => {
  await gotoDocs(page, "/components/dashboard-grid", { viewport: { width: 1440, height: 1000 } });
  const playground = page.locator('[data-detail-section="pg"]');
  const stage = playground.locator('[data-playground-source]');
  await expect(stage.getByText("Monthly revenue", { exact: true })).toBeVisible();
  await expect(stage.getByText("Active customers", { exact: true })).toBeVisible();
  await expect(stage.getByText("Revenue by month", { exact: true })).toBeVisible();
  await expect(stage).toHaveAttribute("data-playground-source", /items=\{/);
  await expect(stage).toHaveAttribute("data-playground-source", /<Stats compact/);
  await playground.getByRole("switch", { name: "unlocked", exact: true }).click();
  await expect(playground.getByRole("switch", { name: "unlocked", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(stage).toHaveAttribute("data-playground-source", /\bunlocked\b/);
  const grips = stage.getByRole("button", { name: /^Reorder / });
  await expect(grips).toHaveCount(5);
  const order = () => grips.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label")));
  const before = await order();
  await grips.first().focus();
  await page.keyboard.press("Space");
  await expect(grips.first()).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect.poll(order).not.toEqual(before);
  await playground.getByRole("switch", { name: "unlocked", exact: true }).click();
  await expect(grips).toHaveCount(0);
});

test("DashboardGrid stacks its real dashboard widgets on a phone without page overflow", async ({ page }) => {
  await gotoDocs(page, "/components/dashboard-grid", { viewport: { width: 390, height: 844 } });
  const stage = page.locator('[data-detail-section="pg"] [data-playground-source]');
  const revenue = stage.getByText("Monthly revenue", { exact: true });
  const customers = stage.getByText("Active customers", { exact: true });
  const conversion = stage.getByText("Conversion rate", { exact: true });
  await expect(revenue).toBeVisible();
  await expect.poll(async () => {
    const boxes = await Promise.all([revenue, customers, conversion].map((item) => item.boundingBox()));
    return boxes.every((box) => box != null) && boxes[1]!.y > boxes[0]!.y && boxes[2]!.y > boxes[1]!.y;
  }, { message: "phone-sized dashboard metrics stack vertically" }).toBe(true);
  await expect(stage.getByText("Revenue by month", { exact: true })).toBeAttached();
  await expect(stage.getByText("Customer acquisition", { exact: true })).toBeAttached();
  await expect.poll(() => page.evaluate(() => {
    const scroller = document.querySelector("[data-page-scroll]");
    return Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, scroller ? scroller.scrollWidth - scroller.clientWidth : 0);
  }), { message: "dashboard and source code stay inside the phone page" }).toBeLessThanOrEqual(1);
});

for (const [slug, endpoint] of [["scatter-plot", "800"], ["depth-chart", "193"], ["histogram", "80"], ["range-area-chart", "Sun"]]) {
  test(`${slug} keeps its endpoint label readable on a phone`, async ({ page }) => {
    await gotoDocs(page, `/components/${slug}`, { viewport: { width: 390, height: 1000 } });
    const label = page.locator('[data-detail-section="pg"] [data-playground-source]').getByText(endpoint, { exact: true });
    await expect(label).toBeVisible();
    await expect.poll(() => label.evaluate((node) => node.clientWidth > 0 && node.scrollWidth <= node.clientWidth + 1), {
      message: "the bounded endpoint label retains enough room for all its text",
    }).toBe(true);
    await expect.poll(() => label.evaluate((node) => {
      const own = node.getBoundingClientRect();
      const peers = Array.from(node.parentElement!.children)
        .filter((peer) => peer.childElementCount === 0 && Math.abs(peer.getBoundingClientRect().top - own.top) < 1)
        .map((peer) => {
          const text = document.createRange();
          text.selectNodeContents(peer);
          return text.getBoundingClientRect();
        })
        .sort((a, b) => a.left - b.left);
      return peers.every((box, index) => index === 0 || box.left >= peers[index - 1].right + 1);
    }), { message: "endpoint labels retain readable space from neighboring tick labels" }).toBe(true);
  });
}
