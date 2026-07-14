import { test, expect } from "@playwright/test";
import { findPath, dragSplitter } from "./helpers";

// A tabset removed by an external action (app code calling doAction) while its overflow menu is
// open must not leak: showPopup's document pointerdown listener, its portal/container and the drag
// overlay are torn down because the owning tabset calls the popup's hide handle on unmount.
// Without that unmount cleanup the popup menu container stays in the DOM and the overlay stays on.
test("overflow menu is cleaned up when its tabset is removed externally", async ({ page }) => {
    await page.goto("/demo?layout=test_with_borders");
    await findPath(page, "/ts0/tabstrip").click();
    await page.locator("[data-id=add-active]").click();
    await page.locator("[data-id=add-active]").click();

    // shrink the first tabset until the overflow button appears (same pattern as a11y.spec)
    await dragSplitter(page, findPath(page, "/s0"), false, -1000);
    await dragSplitter(page, findPath(page, "/s0"), false, 150);

    const overflow = findPath(page, "/ts0/button/overflow");
    await expect(overflow).toBeVisible();
    await overflow.click();
    await expect(page.locator(".flexlayout__popup_menu_container")).toHaveCount(1);

    // remove the tabset that owns the open menu via an external doAction - no pointer interaction,
    // so the menu's own outside-click handler does not get a chance to close it first
    await page.evaluate(() => {
        const w = window as any;
        const ts = w.__flexModel().getFirstTabSet();
        w.__flexDispatch(w.__flexActions.deleteTabset(ts.getId()));
    });

    // the menu portal/container is gone and the drag overlay is not stuck on
    await expect(page.locator(".flexlayout__popup_menu_container")).toHaveCount(0);
    const overlayShown = await page
        .locator(".flexlayout__layout_overlay")
        .first()
        .evaluate((el) => getComputedStyle(el).display !== "none");
    expect(overlayShown).toBe(false);
});
