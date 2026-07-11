import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { findPath, findTabButton } from "./helpers";

const baseURL = "/demo";

// scans the rendered page with axe-core (the engine behind Lighthouse and most a11y CI checks)
// against the WCAG 2.1 A/AA rule sets, which include the ARIA specification rules (valid
// attributes and values, id references, required role structure, accessible names)
const checkA11y = async (page: Page, exclude: string[] = []) => {
    let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
    for (const selector of exclude) {
        builder = builder.exclude(selector);
    }
    const results = await builder.analyze();
    // a readable summary so a failure names the rule and the offending elements
    const violations = results.violations.map((v) => ({
        rule: v.id,
        impact: v.impact,
        help: v.help,
        targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
    }));
    expect(violations).toEqual([]);
};

// the demo tab contents are not part of the library: exclude third party widgets that the
// library cannot fix (the flexlayout tab panel elements themselves are still scanned)
const thirdParty = [".ag-root-wrapper", ".monaco-editor", ".xterm", "canvas", ".ol-viewport"];

// the scans run against the aria theme, the accessibility reference theme whose colors are
// kept WCAG AA compliant (see aria_theme in style/_themes.scss)
const gotoDemo = async (page: Page, layout: string) => {
    await page.goto(baseURL + "?layout=" + layout);
    await page.locator('select[aria-label="Theme"]').selectOption("aria");
};

test.describe("axe accessibility scan", () => {

    test("simple layout", async ({ page }) => {
        await gotoDemo(page, "test_two_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(2);
        await checkA11y(page);
    });

    test("default demo layout", async ({ page }) => {
        await gotoDemo(page, "default");
        await expect(page.locator(".flexlayout__tabset").first()).toBeVisible();
        await checkA11y(page, thirdParty);
    });

    test("open border panels", async ({ page }) => {
        await gotoDemo(page, "test_with_borders");
        await expect(page.locator(".flexlayout__tabset").first()).toBeVisible();
        await findTabButton(page, "/border/top", 0).click();
        await findTabButton(page, "/border/left", 0).click();
        await findTabButton(page, "/border/bottom", 0).click();
        await expect(findPath(page, "/border/bottom/t0")).toBeVisible();
        await checkA11y(page);
    });

    test("open overlay border panel", async ({ page }) => {
        await gotoDemo(page, "test_overlay");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(3);
        await findTabButton(page, "/border/left", 0).click();
        await expect(findPath(page, "/border/left/t0")).toBeVisible();
        await checkA11y(page);
    });

    test("maximized tabset", async ({ page }) => {
        await gotoDemo(page, "test_two_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(2);
        await findPath(page, "/ts0/button/max").click();
        await expect(findPath(page, "/ts0/button/max")).toHaveAttribute("aria-pressed", "true");
        await checkA11y(page);
    });

    test("open popup menu", async ({ page }) => {
        await gotoDemo(page, "test_pinned");
        await expect(page.locator(".flexlayout__tabset").first()).toBeVisible();
        await findTabButton(page, "/ts0", 0).click({ button: "right" });
        await expect(page.locator(".flexlayout__popup_menu")).toBeVisible();
        await checkA11y(page);
    });

    test("tab rename edit active", async ({ page }) => {
        await gotoDemo(page, "test_two_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(2);
        await findTabButton(page, "/ts0", 0).dblclick();
        await expect(findPath(page, "/ts0/tb0/textbox")).toBeVisible();
        await checkA11y(page);
    });
});
