import { test, expect } from "@playwright/test";
import { dragSplitter, findPath } from "./helpers";

const layoutJson = {
    global: {},
    borders: [],
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    { type: "tab", name: "Tab0", component: "text" },
                    { type: "tab", name: "Tab1", component: "text" },
                    { type: "tab", name: "Tab2", component: "text" },
                    { type: "tab", name: "Tab3", component: "text" },
                    { type: "tab", name: "Tab4", component: "text" },
                    { type: "tab", name: "Tab5", component: "text" },
                    { type: "tab", name: "Tab6", component: "text" },
                    { type: "tab", name: "Tab7", component: "text" },
                    { type: "tab", name: "Tab8", component: "text" },
                    { type: "tab", name: "Tab9", component: "text" },
                ],
            },
            {
                type: "tabset",
                weight: 50,
                children: [{ type: "tab", name: "Right", component: "text" }],
            },
        ],
    },
};

async function isSelectedTabVisible(page: import("@playwright/test").Page, tabsetPath: string) {
    return page.evaluate((path) => {
        const outer = document.querySelector(`[data-layout-path="${path}/tabstrip"]`) as HTMLElement | null;
        if (!outer) return false;
        const inner = outer.querySelector('[class*="tabbar_inner"]') as HTMLElement | null;
        const container = inner ?? outer;
        const stripRect = container.getBoundingClientRect();
        const selected = document.querySelector(`[data-layout-path="${path}"] [role="tab"][aria-selected="true"]`) as HTMLElement | null;
        if (!selected) return false;
        const selRect = selected.getBoundingClientRect();
        return selRect.left >= stripRect.left - 2 && selRect.right <= stripRect.right + 2;
    }, tabsetPath);
}

test.describe("splitter keeps selected tab visible", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript((json) => localStorage.setItem("test_splitter_selected", json), JSON.stringify(layoutJson));
        await page.goto("/demo?layout=test_splitter_selected");
        await expect(page).toHaveTitle(/FlexLayout Demo/);
        await expect(findPath(page, "/ts0")).toBeVisible();
        await expect(findPath(page, "/ts1")).toBeVisible();
    });

    test("dragging splitter keeps selected tab in view after user scrolled away", async ({ page }) => {
        // select the last tab (Tab9) – it should initially be visible due to scrollIntoView
        await findPath(page, "/ts0/tb9").click();
        await expect.poll(async () => isSelectedTabVisible(page, "/ts0")).toBe(true);

        // user scrolls away from the selected tab (hide it on the right)
        await page.evaluate(() => {
            const outer = document.querySelector('[data-layout-path="/ts0/tabstrip"]') as HTMLElement;
            const inner = outer.querySelector('[class*="tabbar_inner"]') as HTMLElement;
            inner.scrollLeft = 0;
            inner.dispatchEvent(new Event("scroll", { bubbles: true }));
        });
        // selected tab is now hidden (userControlledPosition = true)
        await expect.poll(async () => isSelectedTabVisible(page, "/ts0")).toBe(false);

        // drag the splitter to shrink the left panel – this resizes the strip
        // previously this did NOT bring the selected tab back into view (regression since v0.10.5)
        const splitter = findPath(page, "/s0");
        await dragSplitter(page, splitter, false, -80);

        // selected tab must be visible again
        await expect.poll(async () => isSelectedTabVisible(page, "/ts0")).toBe(true);
    });

    test("keyboard splitter move keeps selected tab in view", async ({ page }) => {
        await findPath(page, "/ts0/tb9").click();
        await expect.poll(async () => isSelectedTabVisible(page, "/ts0")).toBe(true);

        await page.evaluate(() => {
            const outer = document.querySelector('[data-layout-path="/ts0/tabstrip"]') as HTMLElement;
            const inner = outer.querySelector('[class*="tabbar_inner"]') as HTMLElement;
            inner.scrollLeft = 0;
            inner.dispatchEvent(new Event("scroll", { bubbles: true }));
        });
        await expect.poll(async () => isSelectedTabVisible(page, "/ts0")).toBe(false);

        // move splitter via keyboard (ArrowLeft shrinks left panel)
        const splitter = findPath(page, "/s0");
        await splitter.focus();
        await page.keyboard.press("ArrowLeft");

        await expect.poll(async () => isSelectedTabVisible(page, "/ts0")).toBe(true);
    });
});
