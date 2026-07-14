import { test, expect } from "@playwright/test";

// regression: a tab containing a sublayout popped out to a window and then docked back is adopted
// into the main document during effects; the document-scoped resize observer previously stayed
// bound to the (closed) popout window, leaving the sublayout blind to later container resizes
test("sublayout tracks container resizes after popout and dock back", async ({ page, context }) => {
    await page.goto("/demo?layout=sub");
    await page.waitForSelector(".flexlayout__tabset");
    await page.waitForTimeout(500);

    // popout the Tabbed Pane
    const popoutPromise = context.waitForEvent("page");
    await page.locator('[data-layout-path="/ts0/button/popout"]').click();
    await popoutPromise;
    await page.waitForTimeout(1200);
    const popout = context.pages().filter((p) => p !== page && !p.isClosed())[0];
    await popout.waitForSelector('[role="tab"]');
    await popout.waitForTimeout(300);

    // drag it back to the top of the main layout
    await popout.evaluate(() => {
        const tab = document.querySelector('[role="tab"]') as HTMLElement;
        const dt = new DataTransfer();
        tab.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: dt, clientX: 50, clientY: 20 }));
    });
    const mainBox = (await page.locator(".flexlayout__layout").first().boundingBox())!;
    await page.evaluate((box) => {
        const root = document.querySelector(".flexlayout__layout") as HTMLElement;
        const dt = new DataTransfer();
        const opts = (x: number, y: number) => ({ bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y });
        const cx = box.x + box.width / 2;
        root.dispatchEvent(new DragEvent("dragenter", opts(cx, box.y + 8)));
        root.dispatchEvent(new DragEvent("dragover", opts(cx, box.y + 8)));
        root.dispatchEvent(new DragEvent("drop", opts(cx, box.y + 8)));
    }, mainBox);
    await page.waitForTimeout(500);

    // now resize the window: the sublayout's container panel resizes imperatively and the
    // sublayout must follow
    await page.setViewportSize({ width: 900, height: 400 });
    await page.waitForTimeout(500);

    const bad = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of Array.from(document.querySelectorAll('[role="tabpanel"]')) as HTMLElement[]) {
            if (el.style.display === "none") continue;
            const r = el.getBoundingClientRect();
            const parentPanel = el.parentElement?.closest('[role="tabpanel"]') as HTMLElement | null;
            if (parentPanel) {
                const p = parentPanel.getBoundingClientRect();
                if (r.bottom > p.bottom + 2 || r.right > p.right + 2) {
                    out.push(`${el.dataset.layoutPath} ${Math.round(r.width)}x${Math.round(r.height)} overflows ${Math.round(p.width)}x${Math.round(p.height)}`);
                }
            }
        }
        return out;
    });
    expect(bad).toEqual([]);
});
