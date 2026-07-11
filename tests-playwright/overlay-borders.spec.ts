import { test, expect, Page } from "@playwright/test";
import { checkBorderTab, drag, dragSplitter, findAllTabSets, findPath, findTabButton, Location } from "./helpers";

// layout test_overlay: left border is borderType overlay (tab left1), top/bottom/right are
// default borders; main layout has tabsets One, Two, Three

const baseURL = "/demo";

// titles of the demo's border type toggle button (see demo App.tsx onRenderTabSet)
const SPLIT_TITLE = "Split border (toggle to overlay)";
const OVERLAY_TITLE = "Overlay border (toggle to split)";

const mainBox = async (page: Page) => {
    const box = await findPath(page, "/ts0").boundingBox();
    if (!box) throw new Error("no bounding box for /ts0");
    return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
};

test.describe("overlay borders", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + "?layout=test_overlay");
        await expect(page).toHaveTitle(/FlexLayout Demo/);
        await expect(findAllTabSets(page)).toHaveCount(3);
    });

    test("border toolbar toggle button only shows while the border panel is showing", async ({ page }) => {
        // both borders start closed: no toggle buttons
        await expect(findPath(page, "/border/left").getByTitle(OVERLAY_TITLE)).toHaveCount(0);
        await expect(findPath(page, "/border/bottom").getByTitle(SPLIT_TITLE)).toHaveCount(0);

        // open them: the buttons appear, showing the current type
        await findTabButton(page, "/border/left", 0).click();
        await expect(findPath(page, "/border/left").getByTitle(OVERLAY_TITLE)).toBeVisible();
        await findTabButton(page, "/border/bottom", 0).click();
        await expect(findPath(page, "/border/bottom").getByTitle(SPLIT_TITLE)).toBeVisible();

        // close the bottom border again (toggle its tab): the button goes away
        await findTabButton(page, "/border/bottom", 0).click();
        await expect(findPath(page, "/border/bottom").getByTitle(SPLIT_TITLE)).toHaveCount(0);
    });

    test("border toolbar button toggles the border type", async ({ page }) => {
        const bottom = findPath(page, "/border/bottom");

        // open the (split) bottom border: it splits the main layout
        const before = await mainBox(page);
        await findTabButton(page, "/border/bottom", 0).click();
        await expect(findPath(page, "/border/bottom/t0")).toBeVisible();
        const withSplit = await mainBox(page);
        expect(withSplit.height).toBeLessThan(before.height);

        // toggle to overlay: the open panel switches to overlaying the main layout live
        await bottom.getByTitle(SPLIT_TITLE).click();
        await expect(bottom.getByTitle(OVERLAY_TITLE)).toBeVisible();
        expect(await mainBox(page)).toEqual(before);

        // the splitter must sit above the panel and still resize it (regression: after a runtime
        // toggle the border content was re-measured from a stale element, covering the splitter)
        const panel = findPath(page, "/border/bottom/t0");
        const beforeResize = await panel.boundingBox();
        await dragSplitter(page, findPath(page, "/border/bottom/s-1"), true, -100);
        const afterResize = await panel.boundingBox();
        expect(Math.round(afterResize!.height - beforeResize!.height)).toBeGreaterThan(50);

        // toggling back to split while the panel is open splits the layout live
        await bottom.getByTitle(OVERLAY_TITLE).click();
        await expect(bottom.getByTitle(SPLIT_TITLE)).toBeVisible();
        expect((await mainBox(page)).height).toBeLessThan(before.height);
    });

    test("overlay panel overlays the main layout without insetting it", async ({ page }) => {
        const before = await mainBox(page);

        await findTabButton(page, "/border/left", 0).click();
        await expect(findPath(page, "/border/left/t0")).toBeVisible();
        expect(await mainBox(page)).toEqual(before); // main layout not inset

        // control case: a default border insets the main layout
        await findTabButton(page, "/border/bottom", 0).click();
        await expect(findPath(page, "/border/bottom/t0")).toBeVisible();
        const withBottom = await mainBox(page);
        expect(withBottom.height).toBeLessThan(before.height);
    });

    test("pointer down in the main layout closes the overlay panel", async ({ page }) => {
        await findTabButton(page, "/border/left", 0).click();
        await expect(findPath(page, "/border/left/t0")).toBeVisible();

        // click main tab content beyond the panel (the panel overlays the left of /ts0)
        await findPath(page, "/ts1/t0").click();
        await expect(findPath(page, "/border/left/t0")).not.toBeVisible();
        await checkBorderTab(page, "/border/left", 0, false, "left1");
    });

    test("pointer down on a main splitter or toolbar button closes the overlay panel", async ({ page }) => {
        // splitters and toolbar buttons stop propagation on pointer down, so this exercises the
        // capture phase dismissal path
        await findTabButton(page, "/border/left", 0).click();
        await expect(findPath(page, "/border/left/t0")).toBeVisible();
        await dragSplitter(page, findPath(page, "/s0"), false, 20);
        await expect(findPath(page, "/border/left/t0")).not.toBeVisible();

        await findTabButton(page, "/border/left", 0).click();
        await expect(findPath(page, "/border/left/t0")).toBeVisible();
        await findPath(page, "/ts1/button/max").click();
        await expect(findPath(page, "/border/left/t0")).not.toBeVisible();
        await findPath(page, "/ts1/button/max").click(); // restore the maximized tabset
    });

    test("Escape closes the overlay panel and restores focus", async ({ page }) => {
        // focus on the border tab button: Escape closes, focus stays on the button
        await findTabButton(page, "/border/left", 0).click();
        const panel = findPath(page, "/border/left/t0");
        await expect(panel).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(panel).not.toBeVisible();
        await expect(findTabButton(page, "/border/left", 0)).toBeFocused();

        // focus inside the panel: Escape closes and returns focus to the border tab button
        await findTabButton(page, "/border/left", 0).click();
        await expect(panel).toBeVisible();
        await panel.click(); // focuses the panel (tabindex -1)
        await page.keyboard.press("Escape");
        await expect(panel).not.toBeVisible();
        await expect(findTabButton(page, "/border/left", 0)).toBeFocused();
    });

    test("pointer down inside the panel keeps it open", async ({ page }) => {
        await findTabButton(page, "/border/left", 0).click();
        const panel = findPath(page, "/border/left/t0");
        await expect(panel).toBeVisible();
        await panel.click();
        await expect(panel).toBeVisible();
    });

    test("splitter resizes the overlay panel and the size persists", async ({ page }) => {
        await findTabButton(page, "/border/left", 0).click();
        const panel = findPath(page, "/border/left/t0");
        await expect(panel).toBeVisible();
        const before = await panel.boundingBox();

        await dragSplitter(page, findPath(page, "/border/left/s-1"), false, 100);
        const after = await panel.boundingBox();
        expect(Math.round(after!.width - before!.width)).toBeGreaterThan(50);

        // close via outside click, reopen: the size persists
        await findPath(page, "/ts1/t0").click();
        await expect(panel).not.toBeVisible();
        await findTabButton(page, "/border/left", 0).click();
        await expect(panel).toBeVisible();
        const reopened = await panel.boundingBox();
        expect(Math.round(reopened!.width)).toEqual(Math.round(after!.width));
    });

    test("overlay mode works for all four border locations", async ({ page }) => {
        for (const location of ["top", "bottom", "left", "right"]) {
            // set overlay mode via the model action (demo e2e hook)
            await page.evaluate((loc) => {
                const w = window as any;
                w.__flexDispatch(w.__flexActions.setBorderType("border_" + loc, "overlay"));
            }, location);

            const before = await mainBox(page);
            await findTabButton(page, `/border/${location}`, 0).click();
            await expect(findPath(page, `/border/${location}/t0`)).toBeVisible();
            await expect(findPath(page, `/border/${location}`).getByTitle(OVERLAY_TITLE)).toBeVisible();
            expect(await mainBox(page)).toEqual(before); // overlays, does not inset

            // outside pointer-down closes it
            await findPath(page, "/ts1/t0").click();
            await expect(findPath(page, `/border/${location}/t0`)).not.toBeVisible();
        }
    });

    test("tabs can be moved within a sublayout hosted in a overlay panel", async ({ page }) => {
        // regression: the drag targeted the border (dock to border) instead of the sublayout,
        // because the main drag overlay sat above the overlay panel and its sublayout overlay
        await findTabButton(page, "/border/left", 1).click(); // left2 hosts sublayout sub1
        const panel = findPath(page, "/border/left/t1");
        await expect(panel).toBeVisible();

        // the sublayout has two tabsets, SubA and SubB
        const subTabsets = panel.locator(".flexlayout__tabset");
        await expect(subTabsets).toHaveCount(2);

        // drag the SubA tab onto the center of the SubB tabset: they merge into one tabset
        const from = panel.locator(".flexlayout__tab_button", { hasText: "SubA" });
        const to = panel.locator("[role=\"tabpanel\"]", { hasText: "SubB" });
        await drag(page, from, to, Location.CENTER);

        await expect(subTabsets).toHaveCount(1);
        await expect(panel.locator(".flexlayout__tab_button")).toHaveCount(2);
        await expect(panel).toBeVisible(); // and the overlay stayed open
    });

    test("vertical overlay panel is truncated by an open horizontal overlay panel", async ({ page }) => {
        // make the bottom border a overlay as well
        await page.evaluate(() => {
            const w = window as any;
            w.__flexDispatch(w.__flexActions.setBorderType("border_bottom", "overlay"));
        });
        // open both (border strip clicks are outside the main area so don't close the other)
        await findTabButton(page, "/border/bottom", 0).click();
        await findTabButton(page, "/border/left", 0).click();

        const leftPanel = await findPath(page, "/border/left/t0").boundingBox();
        const bottomPanel = await findPath(page, "/border/bottom/t0").boundingBox();

        // same geometry as default borders: the bottom panel spans the full width and the left
        // panel (and its splitter) stops above it
        expect(bottomPanel!.x).toBeLessThanOrEqual(leftPanel!.x);
        expect(Math.round(leftPanel!.y + leftPanel!.height)).toBeLessThanOrEqual(Math.round(bottomPanel!.y) + 1);

        const leftSplitter = await findPath(page, "/border/left/s-1").boundingBox();
        expect(Math.round(leftSplitter!.height)).toEqual(Math.round(leftPanel!.height));
    });

    test("border strip and border tabs have no context menu (the toolbar button toggles the type)", async ({ page }) => {
        // right click an empty part of the strip itself: no menu
        const strip = findPath(page, "/border/bottom");
        const stripBox = await strip.boundingBox();
        await strip.click({ button: "right", position: { x: stripBox!.width / 2, y: stripBox!.height / 2 } });
        await expect(page.locator(".flexlayout__popup_menu")).toHaveCount(0);

        // right click a border tab: tab menu without any border type item
        await findTabButton(page, "/border/bottom", 0).click({ button: "right" });
        await expect(page.locator(".flexlayout__popup_menu")).toBeVisible();
        await expect(page.getByRole("menuitem", { name: "Overlay Border", exact: true })).toHaveCount(0);
        await expect(page.getByRole("menuitem", { name: "Rename", exact: true })).toBeVisible();
    });
});
