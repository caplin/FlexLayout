import { test, expect } from "@playwright/test";
import { findAllTabSets, findPath, findTabButton, waitForBox } from "./helpers";

// Regression for #527: after a non-FlexLayout drag (e.g. selected text) is dropped on the layout,
// the layout's local drag state used to stay active because onDrop returned early and a drop is not
// followed by a dragleave. The next tab drag then never created its outline, overlay or edge markers.
test("a non-layout drop does not suppress the next tab drag's feedback", async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await expect(page).toHaveTitle(/FlexLayout Demo/);
    await page.getByRole("button", { name: "Reload" }).click();
    await expect(findAllTabSets(page)).toHaveCount(2);

    // drop a drag that is not a FlexLayout draggable (empty dataTransfer, ignored by onExternalDrag)
    // on the layout; a drop is not followed by a dragleave, which is what used to leave it active
    const layout = page.locator(".flexlayout__layout").first();
    const layoutBox = await waitForBox(layout, "layout");
    await layout.evaluate(
        (el, { x, y }: { x: number; y: number }) => {
            const dt = new DataTransfer();
            const opts = (xx: number, yy: number) => ({ bubbles: true, cancelable: true, dataTransfer: dt, clientX: xx, clientY: yy });
            el.dispatchEvent(new DragEvent("dragenter", opts(x, y)));
            el.dispatchEvent(new DragEvent("dragover", opts(x, y)));
            el.dispatchEvent(new DragEvent("drop", opts(x, y)));
        },
        { x: layoutBox.x + layoutBox.width * 0.25, y: layoutBox.y + layoutBox.height / 2 },
    );

    // now drag a tab toward the other pane and check the feedback shows while dragging
    const from = await waitForBox(findTabButton(page, "/ts0", 0), "drag source");
    const to = await waitForBox(findPath(page, "/ts1/t0"), "drag target");
    const cf = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
    const ct = { x: to.x + to.width / 2, y: to.y + to.height / 2 };

    await page.mouse.move(cf.x, cf.y);
    await page.mouse.down();
    await page.waitForTimeout(50); // let the native drag start before moving
    await page.mouse.move(cf.x + 10, cf.y + 10);
    await page.mouse.move(cf.x + 11, cf.y + 11);
    await page.mouse.move(ct.x, ct.y, { steps: 10 });
    await page.waitForTimeout(100); // let dragover register

    await expect(page.locator(".flexlayout__layout_overlay")).toBeVisible();
    await expect(page.locator(".flexlayout__outline_rect")).toBeVisible();
    await expect(page.locator(".flexlayout__edge_rect")).toHaveCount(4);

    await page.mouse.up();
    // the drop still lands
    await expect(findAllTabSets(page)).toHaveCount(1);
});
