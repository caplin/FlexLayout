import { test, expect } from '@playwright/test';

// targeted check: tab panels are positioned correctly inside popout windows
test('popout window positions its tab panel', async ({ page, context }) => {
    await page.goto('/demo?layout=default');
    await expect(page.locator('.flexlayout__tabset').first()).toBeVisible();

    const popoutButton = page.locator('[data-layout-path$="/button/popout"]').first();
    await expect(popoutButton).toBeVisible();

    await popoutButton.click();

    // under react strict mode (dev) the first popout window is closed and reopened,
    // so wait for a popout page that stays open
    await expect.poll(async () => {
        const open = context.pages().filter((p) => p !== page && !p.isClosed());
        return open.length;
    }).toBe(1);
    const popout = context.pages().filter((p) => p !== page && !p.isClosed())[0];
    await popout.waitForLoadState();

    // the popped out tab renders its panel in the new window, sized to the content area
    const panel = popout.locator('[role="tabpanel"]');
    await expect(panel).toHaveCount(1);
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(50);

    // the panel tracks the popout window size
    await popout.setViewportSize({ width: 500, height: 400 });
    await expect.poll(async () => (await panel.boundingBox())!.width).toBeGreaterThan(400);
});
