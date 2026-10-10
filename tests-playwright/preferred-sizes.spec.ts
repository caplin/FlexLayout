import { test, expect, Page } from "@playwright/test";
import type { IJsonModel, IJsonTabSetNode } from "../src";
import { waitForBox } from "./helpers";

const panel = (id: string, attributes: Partial<IJsonTabSetNode> = {}): IJsonTabSetNode => ({
    type: "tabset",
    id,
    children: [{ type: "tab", id: id + "-tab", name: id, component: "testing" }],
    ...attributes,
});

const initialLayout = (): IJsonModel => ({
    layout: {
        type: "row",
        id: "root",
        children: [panel("left", { preferredWidth: 240, minWidth: 100 }), panel("center", { minWidth: 180 }), panel("right", { preferredWidth: 280, minWidth: 100 })],
    },
});

async function load(page: Page, json = initialLayout()) {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.addInitScript((json) => {
        if (localStorage.getItem("test_preferred") === null) {
            localStorage.setItem("test_preferred", JSON.stringify(json));
        }
    }, json);
    await page.goto("/demo?layout=test_preferred");
    await waitForBox(page.locator(".flexlayout__tabset").first(), "preferred layout");
}

async function extent(page: Page, id: string, axis: "width" | "height" = "width") {
    const path = await page.evaluate((id) => (window as any).__flexModel().getNodeById(id).getPath(), id);
    const box = await page.locator(`.flexlayout__tabset[data-layout-path="${path}"]`).locator("..").boundingBox();
    return box?.[axis] ?? 0;
}

async function expectExtent(page: Page, id: string, size: number, axis: "width" | "height" = "width") {
    await expect.poll(() => extent(page, id, axis)).toBeCloseTo(size, 0);
}

async function dragBy(page: Page, path: string, dx: number, dy = 0) {
    const box = await waitForBox(page.locator(`[data-layout-path="${path}"]`), path);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 8 });
    await page.mouse.up();
}

async function recordRedraws(page: Page) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        const w = window as any;
        const controller = w.__flexModel().getRootRow().getLayout().getController();
        const redraw = controller.redrawLayout.bind(controller);
        w.__preferredRedraws = 0;
        controller.redrawLayout = () => {
            w.__preferredRedraws++;
            redraw();
        };
    });
}

test("live preferred splitter resizing updates geometry before pointerup without requesting a layout redraw", async ({ page }) => {
    await load(page);
    await expectExtent(page, "left", 240);
    const box = await waitForBox(page.locator('[data-layout-path="/s0"]'), "live preferred splitter");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await recordRedraws(page);
    await page.mouse.move(x + 60, y, { steps: 8 });
    await expectExtent(page, "left", 300);
    await expectExtent(page, "right", 280);
    expect(await page.evaluate(() => (window as any).__preferredRedraws)).toBe(0);
    await page.mouse.up();
    await expect.poll(() => page.evaluate(() => (window as any).__preferredRedraws)).toBeGreaterThan(0);
});

test("live preference updates refresh a derived ancestor's geometry and can make it flexible", async ({ page }) => {
    const json = initialLayout();
    json.layout.children = [{ type: "row", id: "column", children: [panel("left", { preferredWidth: 240 }), panel("bottom", { preferredWidth: 240 })] }, panel("center")];
    await load(page, json);
    await expectExtent(page, "left", 240);
    const before = await extent(page, "center");
    await recordRedraws(page);
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.group([w.__flexActions.adjustWeights("column", [50, 50]), w.__flexActions.updateNodeAttributes("left", { preferredWidth: 320 })]).setAdjusting(true));
    });
    await expectExtent(page, "left", 320);
    await expectExtent(page, "bottom", 320);
    await expectExtent(page, "center", before - 80);
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.group([w.__flexActions.adjustWeights("column", [50, 50]), w.__flexActions.updateNodeAttributes("left", { preferredWidth: undefined })]).setAdjusting(true));
    });
    await expect.poll(async () => (await extent(page, "left")) / (await extent(page, "center"))).toBeCloseTo(1, 1);
    expect(await page.evaluate(() => (window as any).__preferredRedraws)).toBe(0);
});

test("window resizing preserves auxiliary widths and gives the center the difference", async ({ page }) => {
    await load(page);
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
    const before = await extent(page, "center");
    await page.setViewportSize({ width: 1400, height: 800 });
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
    await expectExtent(page, "center", before + 200);
    await page.setViewportSize({ width: 1000, height: 800 });
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
    await expectExtent(page, "center", before - 200);
});

test("weight-only layouts retain CSS sizing overrides before and after live resizing", async ({ page }) => {
    const json = initialLayout();
    json.layout.children = [panel("left"), panel("right")];
    await load(page, json);
    await page.addStyleTag({ content: ".flexlayout__row, .flexlayout__tabset_container { flex-basis: 200px; flex-shrink: 0; }" });
    const left = page.locator('.flexlayout__tabset[data-layout-path="/ts0"]').locator("..");
    await expect(left).toHaveCSS("flex-basis", "200px");
    await expect(left).toHaveCSS("flex-shrink", "0");
    await dragBy(page, "/s0", 30);
    await expect(left).toHaveCSS("flex-basis", "200px");
    await expect(left).toHaveCSS("flex-shrink", "0");
    for (const preferredWidth of [300, undefined]) {
        await page.evaluate((preferredWidth) => {
            const w = window as any;
            const update = w.__flexActions.updateNodeAttributes("left", { preferredWidth });
            w.__flexDispatch(preferredWidth === undefined ? w.__flexActions.group([w.__flexActions.adjustWeights("root", [50, 50]), update]).setAdjusting(true) : update);
        }, preferredWidth);
        await expect(left).toHaveCSS("flex-basis", preferredWidth === undefined ? "200px" : "300px");
        await expect(left).toHaveCSS("flex-shrink", preferredWidth === undefined ? "0" : "1");
    }
});

test("nested preferences account for child minimum and maximum sizes", async ({ page }) => {
    const json = initialLayout();
    json.layout.children = [
        {
            type: "row",
            id: "column",
            children: [
                { type: "row", id: "split", children: [panel("left", { preferredWidth: 100, minWidth: 300 }), panel("right", { preferredWidth: 200 })] },
                panel("bottom", { preferredWidth: 200 }),
            ],
        },
        panel("center"),
    ];
    await load(page, json);
    await expectExtent(page, "left", 300);
    await expectExtent(page, "right", 200);
    const center = await extent(page, "center");
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.updateNodeAttributes("left", { preferredWidth: 400, minWidth: 0, maxWidth: 300 }));
    });
    await expectExtent(page, "left", 300);
    await expectExtent(page, "right", 200);
    await expectExtent(page, "center", center);
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.updateNodeAttributes("left", { maxWidth: 500 }));
    });
    await expectExtent(page, "left", 400);
    await expectExtent(page, "right", 200);
    await expectExtent(page, "center", center - 100);
});

for (const operation of ["close", "float", "merge"] as const) {
    test(`${operation} releases the right allocation to the center and retains the left width`, async ({ page }) => {
        await load(page);
        const before = await extent(page, "center");
        const splitterWidth = (await page.locator('[data-layout-path="/s1"]').boundingBox())!.width;
        await page.evaluate((operation) => {
            const w = window as any;
            const a = w.__flexActions;
            w.__flexDispatch(operation === "close" ? a.deleteTabset("right") : operation === "float" ? a.popoutTabset("right", "float") : a.moveNode("right", "left", { getName: () => "center" }, -1));
        }, operation);
        await expectExtent(page, "left", 240);
        await expectExtent(page, "center", before + 280 + splitterWidth);
        if (operation === "float") {
            await expect(page.locator(".flexlayout__float_window")).toHaveCount(1);
            const grip = page.locator('.flexlayout__float_window > div[style*="cursor: ew-resize"]').last();
            const box = await waitForBox(grip, "float resize grip");
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 8 });
            await page.mouse.up();
            await expect.poll(() => extent(page, "right")).toBeGreaterThan(350);
            await expect.poll(() => page.evaluate(() => (window as any).__flexModel().getNodeById("right").getPreferredWidth())).toBe(280);
        }
    });
}

for (const realtime of [true, false]) {
    test(`splitters retain chosen sizes and undo the entire drag (realtime=${realtime})`, async ({ page }) => {
        await load(page);
        await page.locator('input[name="realtimeResize"]').setChecked(realtime);
        await dragBy(page, "/s0", 60);
        await expectExtent(page, "left", 300);
        await expectExtent(page, "right", 280);
        await page.setViewportSize({ width: 1400, height: 800 });
        await expectExtent(page, "left", 300);
        await expectExtent(page, "right", 280);
        await page.locator('button[title^="undo"]').click();
        await expectExtent(page, "left", 240);
        await expect(page.locator('button[title^="undo"]')).toBeDisabled();
        await page.locator('button[title^="redo"]').click();
        await expectExtent(page, "left", 300);
        await page.locator('[data-layout-path="/s1"]').focus();
        await page.keyboard.press("ArrowLeft");
        await expectExtent(page, "right", 290);
        await page.reload();
        await expectExtent(page, "left", 300);
        await expectExtent(page, "right", 290);
    });
}

test("constrained preferences recover after shrinking and save without replacing the preference", async ({ page }) => {
    await load(page);
    await page.setViewportSize({ width: 600, height: 800 });
    await expect.poll(() => extent(page, "left")).toBeLessThan(240);
    await expect.poll(() => extent(page, "right")).toBeLessThan(280);
    await expect.poll(() => extent(page, "center")).toBeGreaterThanOrEqual(180);
    await page.evaluate(() => {
        const w = window as any;
        localStorage.setItem("test_preferred", JSON.stringify(w.__flexModel().toJson()));
    });
    await page.reload();
    await page.setViewportSize({ width: 1200, height: 800 });
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
});

for (const realtime of [true, false]) {
    test(`dragging a compressed panel adjusts its preference without replacing its sibling's preference (realtime=${realtime})`, async ({ page }) => {
        await load(page);
        await page.locator('input[name="realtimeResize"]').setChecked(realtime);
        await page.setViewportSize({ width: 600, height: 800 });
        await expect.poll(() => extent(page, "left")).toBeLessThan(240);
        await waitForBox(page.locator('[data-layout-path="/s0"]'), "compressed splitter");
        const before = await extent(page, "left");
        await dragBy(page, "/s0", -30);
        await expect.poll(() => extent(page, "left")).toBeLessThan(before);
        await expect.poll(() => page.evaluate(() => (window as any).__flexModel().getNodeById("left").getPreferredWidth())).toBeCloseTo(210, 0);
        await page.setViewportSize({ width: 1200, height: 800 });
        await expectExtent(page, "left", 210);
        await expectExtent(page, "right", 280);
    });
}

test("nested auxiliary heights stay retained while the center absorbs both axes", async ({ page }) => {
    const json = initialLayout();
    json.layout.children![1] = { type: "row", id: "middle", children: [panel("center"), panel("bottom", { preferredHeight: 180 })] };
    await load(page, json);
    await expectExtent(page, "bottom", 180, "height");
    const before = await extent(page, "center", "height");
    await page.setViewportSize({ width: 1200, height: 1000 });
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
    await expectExtent(page, "bottom", 180, "height");
    await expectExtent(page, "center", before + 200, "height");
    await dragBy(page, "/r1/s0", 0, -30);
    await expectExtent(page, "bottom", 210, "height");
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.deleteTabset("right"));
    });
    await expectExtent(page, "left", 240);
    await expectExtent(page, "bottom", 210, "height");
});

test("orthogonal docking and row collapse preserve the retained side column", async ({ page }) => {
    await load(page);
    const movedTabsetId = await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.moveNode("right-tab", "left", { getName: () => "bottom" }, -1));
        return w.__flexModel().getNodeById("right-tab").getParent().getId();
    });
    await expectExtent(page, "left", 240);
    await expectExtent(page, movedTabsetId, 240);
    await page.setViewportSize({ width: 1400, height: 800 });
    await expectExtent(page, "left", 240);
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.deleteTab("right-tab"));
    });
    await expectExtent(page, "left", 240);
    await page.reload();
    await expectExtent(page, "left", 240);
});

test("maximizing and restoring leaves preferred sizes intact", async ({ page }) => {
    await load(page);
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.maximizeToggle("left"));
    });
    await expect.poll(() => extent(page, "left")).toBeGreaterThan(1000);
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.maximizeToggle("left"));
    });
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
});

test("multiple flexible panels share remaining space by weight", async ({ page }) => {
    const json = initialLayout();
    json.layout.children = [panel("left", { preferredWidth: 240 }), panel("center", { weight: 1 }), panel("second", { weight: 2 }), panel("right", { preferredWidth: 280 })];
    await load(page, json);
    await expect.poll(async () => (await extent(page, "second")) / (await extent(page, "center"))).toBeCloseTo(2, 1);
    await page.setViewportSize({ width: 1400, height: 800 });
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
    await expect.poll(async () => (await extent(page, "second")) / (await extent(page, "center"))).toBeCloseTo(2, 1);
});

test("splitters preserve unrelated panels while flexible siblings reach their minimums", async ({ page }) => {
    const json = initialLayout();
    json.layout.children = [panel("left", { preferredWidth: 240 }), panel("center", { weight: 1 }), panel("second", { weight: 2 }), panel("right", { preferredWidth: 280 })];
    await load(page, json);
    const center = await extent(page, "center");
    const second = await extent(page, "second");
    await dragBy(page, "/s1", 40);
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
    await expectExtent(page, "center", center + 40);
    await expectExtent(page, "second", second - 40);
    await dragBy(page, "/s0", 30);
    await expectExtent(page, "left", 270);
    await expectExtent(page, "center", center + 10);
    await expectExtent(page, "second", second - 40);
    await page.evaluate((minWidth) => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.updateNodeAttributes("center", { minWidth }));
    }, center + 10);
    await dragBy(page, "/s0", 30);
    await expectExtent(page, "left", 300);
    await expectExtent(page, "right", 280);
    await expectExtent(page, "center", center + 10);
    await expectExtent(page, "second", second - 70);
});

test("maximum sizes clamp allocations while preserving preferences", async ({ page }) => {
    const json = initialLayout();
    Object.assign(json.layout.children![0], { preferredWidth: 400, maxWidth: 300 });
    await load(page, json);
    await expectExtent(page, "left", 300);
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.updateNodeAttributes("left", { maxWidth: 500 }));
    });
    await expectExtent(page, "left", 400);
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.adjustWeights("root", [1, 98, 1]).setAdjusting(true));
    });
    await expectExtent(page, "left", 400);
    await expectExtent(page, "right", 280);
});

test("all retained siblings leave free space, but a sole remaining panel fills the layout", async ({ page }) => {
    const json = initialLayout();
    json.layout.children = [panel("left", { preferredWidth: 240 }), panel("right", { preferredWidth: 280 })];
    await load(page, json);
    await expectExtent(page, "left", 240);
    await expectExtent(page, "right", 280);
    await page.evaluate(() => {
        const w = window as any;
        w.__flexDispatch(w.__flexActions.deleteTabset("right"));
    });
    await expect.poll(() => extent(page, "left")).toBeGreaterThan(1000);
});
