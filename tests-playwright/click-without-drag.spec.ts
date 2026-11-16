import { test, expect, Page } from "@playwright/test";
import { findPath, waitForBox } from "./helpers";

// Pressing and releasing a splitter, float window header or float window resize edge without
// dragging (or with a wobble below the drag threshold) must not change the model: no action is
// dispatched, so no undo step is recorded and no weights/sizes are rewritten.

const ts = (name: string) => ({ type: "tabset", weight: 1, children: [{ type: "tab", name, component: "text" }] });

const rowLayout = {
    global: {},
    borders: [{ type: "border", location: "left", selected: 0, size: 200, children: [{ type: "tab", name: "Left", component: "text" }] }],
    layout: { type: "row", children: [ts("A"), ts("B")] },
};

const floatLayout = {
    global: {},
    borders: [],
    layout: { type: "row", children: [ts("A"), ts("B")] },
    subLayouts: {
        float1: { type: "float", name: "Float", layout: { type: "row", children: [ts("F1")] }, rect: { x: 300, y: 150, width: 400, height: 300 } },
    },
};

const gotoLayout = async (page: Page, name: string, json: unknown) => {
    await page.addInitScript(({ name, json }) => localStorage.setItem(name, JSON.stringify(json)), { name, json });
    await page.goto("/demo?layout=" + name);
    await page.waitForSelector(".flexlayout__tabset");
    await waitForBox(page.locator(".flexlayout__layout").first(), "main layout");
};

const undoCount = async (page: Page) => {
    const title = await page.locator('button[title^="undo ("]').getAttribute("title");
    return Number(/\d+/.exec(title!)![0]);
};

const flexGrows = (page: Page) => page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".flexlayout__row, .flexlayout__tabset_container")].map((el) => getComputedStyle(el).flexGrow));

const pressAt = async (page: Page, x: number, y: number, dx: number, dy: number) => {
    await page.mouse.move(x, y);
    await page.mouse.down();
    if (dx !== 0 || dy !== 0) {
        await page.mouse.move(x + dx, y + dy);
    }
    await page.mouse.up();
};

const center = async (page: Page, path: string) => {
    const box = await waitForBox(findPath(page, path), path);
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

for (const realtime of [true, false]) {
    test.describe(`row splitter with realtime resize ${realtime ? "on" : "off"}`, () => {
        test.beforeEach(async ({ page }) => {
            await gotoLayout(page, "click_row", rowLayout);
            await page.locator('input[name="realtimeResize"]').setChecked(realtime);
        });

        test("clicking does not change the layout", async ({ page }) => {
            const before = { undo: await undoCount(page), grows: await flexGrows(page) };
            const c = await center(page, "/s0");
            await pressAt(page, c.x, c.y, 0, 0);
            expect(await undoCount(page)).toBe(before.undo);
            expect(await flexGrows(page)).toEqual(before.grows);
        });

        test("a wobble below the drag threshold does not change the layout", async ({ page }) => {
            const before = { undo: await undoCount(page), grows: await flexGrows(page) };
            const c = await center(page, "/s0");
            await pressAt(page, c.x, c.y, 2, 1);
            expect(await undoCount(page)).toBe(before.undo);
            expect(await flexGrows(page)).toEqual(before.grows);
        });

        test("dragging past the threshold resizes", async ({ page }) => {
            const before = { undo: await undoCount(page), grows: await flexGrows(page) };
            const c = await center(page, "/s0");
            await pressAt(page, c.x, c.y, 40, 0);
            await expect.poll(() => undoCount(page)).toBe(before.undo + 1);
            expect(await flexGrows(page)).not.toEqual(before.grows);
        });
    });
}

test("clicking a border splitter does not change the layout", async ({ page }) => {
    await gotoLayout(page, "click_border", rowLayout);
    const panel = findPath(page, "/border/left/t0");
    const beforeBox = await waitForBox(panel, "border panel");
    const beforeUndo = await undoCount(page);

    const c = await center(page, "/border/left/s-1");
    await pressAt(page, c.x, c.y, 0, 0);

    expect(await undoCount(page)).toBe(beforeUndo);
    expect((await waitForBox(panel, "border panel")).width).toBe(beforeBox.width);
});

test.describe("float window", () => {
    test.beforeEach(async ({ page }) => {
        await gotoLayout(page, "click_float", floatLayout);
        await waitForBox(page.locator(".flexlayout__float_window"), "float window");
    });

    test("clicking the header does not change the layout", async ({ page }) => {
        const beforeUndo = await undoCount(page);
        const c = await center(page, "/floatwindow/title");
        await pressAt(page, c.x, c.y, 0, 0);
        expect(await undoCount(page)).toBe(beforeUndo);
    });

    test("clicking a resize edge does not change the layout", async ({ page }) => {
        const beforeUndo = await undoCount(page);
        // the west edge is the second ew-resize handle (n, s, e, w order)
        const edge = await waitForBox(page.locator('.flexlayout__float_window > div[style*="ew-resize"]').nth(1), "west edge");
        await pressAt(page, edge.x + edge.width / 2, edge.y + edge.height / 2, 0, 0);
        expect(await undoCount(page)).toBe(beforeUndo);
    });

    test("dragging the header past the threshold moves the window", async ({ page }) => {
        const beforeUndo = await undoCount(page);
        const beforeBox = await waitForBox(page.locator(".flexlayout__float_window"), "float window");
        const c = await center(page, "/floatwindow/title");
        await pressAt(page, c.x, c.y, 30, 20);
        await expect.poll(() => undoCount(page)).toBe(beforeUndo + 1);
        expect((await waitForBox(page.locator(".flexlayout__float_window"), "float window")).x).not.toBe(beforeBox.x);
    });
});
