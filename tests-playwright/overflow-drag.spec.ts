import { test, expect } from "@playwright/test";
import { findPath, dragSplitter, waitForBox } from "./helpers";

// Regression for #528: dragging a tab out of the overflow menu and releasing it outside the layout
// used to unmount the drag source mid-drag, so its dragend never cleared the static drag state and
// the next non-FlexLayout drag (e.g. native text selection) was treated as that tab's drag.
test("overflow menu drag released outside the layout does not hijack the next drag", async ({ page }) => {
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
    const item = findPath(page, "/popup-menu/tb0");
    await expect(item).toBeVisible();

    const modelBefore = await page.evaluate(() => JSON.stringify((window as any).__flexModel().toJson()));

    // drag the item out of the menu and release it over the toolbar, which is outside the layout
    const from = await waitForBox(item, "overflow item");
    const toolbar = await waitForBox(page.locator(".toolbar"), "toolbar");
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10);
    await page.mouse.move(from.x + from.width / 2 + 11, from.y + from.height / 2 + 11);
    await page.mouse.move(toolbar.x + 5, toolbar.y + 5, { steps: 10 });
    await page.waitForTimeout(50);
    await page.mouse.up();

    // the menu is closed and no drag state is left behind
    await expect(page.locator(".flexlayout__popup_menu_container")).toHaveCount(0);
    await page.waitForTimeout(100); // drain any deferred state updates

    // now perform a drag that is not a FlexLayout draggable: synthetic events with an empty
    // dataTransfer (the demo's onExternalDrag ignores it). A leaked drag state makes this drop count
    // as the overflow tab's drag and move the tab.
    const layout = page.locator(".flexlayout__layout").first();
    const layoutBox = await waitForBox(layout, "layout");
    await layout.evaluate(
        (el, { x, y }: { x: number; y: number }) => {
            const dt = new DataTransfer();
            const opts = (xx: number, yy: number) => ({ bubbles: true, cancelable: true, dataTransfer: dt, clientX: xx, clientY: yy });
            el.dispatchEvent(new DragEvent("dragenter", opts(x, y)));
            el.dispatchEvent(new DragEvent("dragover", opts(x, y)));
            el.dispatchEvent(new DragEvent("drop", opts(x, y)));
            el.dispatchEvent(new DragEvent("dragend", opts(x, y)));
        },
        { x: layoutBox.x + layoutBox.width / 2, y: layoutBox.y + layoutBox.height / 2 },
    );

    // the next drag must not have moved the overflow tab
    const modelAfter = await page.evaluate(() => JSON.stringify((window as any).__flexModel().toJson()));
    expect(modelAfter).toEqual(modelBefore);
});
