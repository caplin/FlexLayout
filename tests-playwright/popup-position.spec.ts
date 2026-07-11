import { test, expect, Page } from '@playwright/test';

// Regression: inside a popout window the overflow menu must open over its trigger button, not at
// the window origin (0,0). The bug was cross-realm type checks + measuring the trigger during a
// deferred render; the menu now snapshots the trigger rect when it opens.
test('overflow menu in a popout window is positioned over its trigger', async ({ page, context }) => {
    await page.goto('/demo?layout=default');
    await expect(page.locator('.flexlayout__tabset').first()).toBeVisible();

    // pop the first tab out into its own window
    await page.locator('[data-layout-path$="/button/popout"]').first().click();
    await expect.poll(async () => context.pages().filter((p) => p !== page && !p.isClosed()).length).toBe(1);
    const popout: Page = context.pages().filter((p) => p !== page && !p.isClosed())[0];
    await popout.waitForLoadState();

    // add enough tabs to the popped-out tabset (via the shared model) that its tab strip overflows
    await page.evaluate(() => {
        const w = window as any;
        const model = w.__flexModel();
        const api = w.__flexLayout();
        let tabsetId: string | undefined;
        for (const [id, layout] of model.getLayouts()) {
            if (!layout.isMainLayout()) {
                tabsetId = model.getFirstTabSet(model.getRootRow(id))?.getId();
            }
        }
        for (let i = 0; i < 10; i++) {
            api.addTabToTabSet(tabsetId, { name: "Extra " + i, component: "text" });
        }
    });

    await popout.setViewportSize({ width: 500, height: 400 });

    const overflow = popout.locator('[data-layout-path$="/button/overflow"]').first();
    await expect(overflow).toBeVisible();
    const btn = (await overflow.boundingBox())!;

    await overflow.click();
    const menu = popout.locator('.flexlayout__popup_menu_container');
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;

    // the trigger is towards the right of the strip, well away from the origin
    expect(btn.x).toBeGreaterThan(150);
    // the menu opens next to the trigger, not at (0,0)
    const distance = Math.hypot(box.x - btn.x, box.y - btn.y);
    expect(distance).toBeLessThan(250);
});
