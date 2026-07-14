import { test } from "@playwright/test";

// performance harness: not part of the regular suite, run with PERF=1
// PERF=1 npx playwright test --project=chromium perf-harness
test.skip(!process.env.PERF, "perf harness, run with PERF=1");

function bigLayout(rows: number, tabsetsPerRow: number, tabsPerTabset: number) {
    let n = 0;
    return {
        global: {},
        borders: [],
        layout: {
            type: "row",
            children: Array.from({ length: rows }, () => ({
                type: "row",
                weight: 1,
                children: Array.from({ length: tabsetsPerRow }, () => ({
                    type: "tabset",
                    weight: 1,
                    children: Array.from({ length: tabsPerTabset }, () => ({
                        type: "tab",
                        name: "T" + n++,
                        component: "text",
                        config: { text: "content " + n },
                    })),
                })),
            })),
        },
    };
}

test("measure select and splitter drag", async ({ page }) => {
    const layout = bigLayout(6, 5, 3); // 30 tabsets, 90 tabs
    await page.addInitScript((json) => {
        localStorage.setItem("perf_big", json);
    }, JSON.stringify(layout));
    await page.goto("/demo?layout=perf_big");
    await page.waitForSelector(".flexlayout__tabset");
    await page.waitForTimeout(500); // settle

    const results = await page.evaluate(async () => {
        const raf2 = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        const median = (a: number[]) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

        // --- tab select latency ---
        const buttons = Array.from(document.querySelectorAll('[data-layout-path="/r0/ts0/tb0"], [data-layout-path="/r0/ts0/tb1"]')) as HTMLElement[];
        const selectTimes: number[] = [];
        for (let i = 0; i < 30; i++) {
            const el = buttons[i % 2];
            const t0 = performance.now();
            el.click(); // react discrete events flush synchronously
            selectTimes.push(performance.now() - t0);
            await raf2();
        }

        // --- realtime splitter drag ---
        const splitter = document.querySelector('[data-layout-path="/s0"]') as HTMLElement;
        const sr = splitter.getBoundingClientRect();
        const cx = sr.x + sr.width / 2;
        const cy = sr.y + sr.height / 2;
        const opts = (x: number, y: number) => ({ bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1 });
        const moveTimes: number[] = [];
        splitter.dispatchEvent(new PointerEvent("pointerdown", opts(cx, cy)));
        for (let i = 0; i < 40; i++) {
            const y = cy + ((i % 20) - 10) * 4;
            const t0 = performance.now();
            document.dispatchEvent(new PointerEvent("pointermove", opts(cx, y)));
            moveTimes.push(performance.now() - t0);
            await raf2();
        }
        document.dispatchEvent(new PointerEvent("pointerup", opts(cx, cy)));

        return {
            selectMedianMs: median(selectTimes),
            dragMoveMedianMs: median(moveTimes),
        };
    });

    console.log("PERF", JSON.stringify(results));
});
