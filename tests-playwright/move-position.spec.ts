import { test, expect } from "@playwright/test";
import { findPath, findTabButton, drag, Location } from "./helpers";

// regression: moving the selected tab to another tabset mounts a fresh panel for the newly
// selected tab in the source tabset; panels must stay out of flow so the measure pass sees
// correct geometry (previously the fresh in-flow panel squeezed the layout during the commit)
test("panels positioned correctly after moving a tab to another tabset center", async ({ page }) => {
    await page.goto("/demo?layout=default");
    await page.waitForSelector(".flexlayout__tabset");
    await page.waitForTimeout(500);

    // note: uses /r2/ts0 (Wikipedia/MUI) because tab 0 of /r1/ts0 (ChartJS) is now pinned and
    // pinned tabs cannot be dragged out of their tabset
    await drag(page, findTabButton(page, "/r2/ts0", 0), findPath(page, "/r1/ts1/t0"), Location.CENTER);
    await page.waitForTimeout(300);

    // every visible panel must line up with its own tabset's content area
    const mismatches = await page.evaluate(() => {
        const bad: string[] = [];
        for (const el of Array.from(document.querySelectorAll('[role="tabpanel"]')) as HTMLElement[]) {
            if (el.style.display === "none") continue;
            const panel = el.getBoundingClientRect();
            const content = el.closest(".flexlayout__layout")!.querySelectorAll(".flexlayout__tabset_content");
            const matched = Array.from(content).some((c) => {
                const r = (c as HTMLElement).getBoundingClientRect();
                return Math.abs(r.x - panel.x) < 2 && Math.abs(r.y - panel.y) < 2 && Math.abs(r.width - panel.width) < 2 && Math.abs(r.height - panel.height) < 2;
            });
            if (!matched) bad.push(el.dataset.layoutPath + " " + JSON.stringify(panel));
        }
        return bad;
    });
    expect(mismatches).toEqual([]);
});
