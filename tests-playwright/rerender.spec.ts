import { test, expect } from '@playwright/test';

// Model.fromJson with a previous model: replacing the model with a round tripped copy keeps the
// tab contents mounted (no flash, no loss of dom/component state)
test('rerender via fromJson with previous model keeps tab contents mounted', async ({ page }) => {
    await page.goto('/demo?layout=test_two_tabs');
    await page.waitForSelector('.flexlayout__tabset');
    await page.waitForTimeout(300);

    await page.evaluate(() => {
        const panel = document.querySelector('[role="tabpanel"]') as any;
        panel.__marker = true;
        const moveable = panel.firstElementChild as any;
        moveable.__marker = true;
        (moveable.firstElementChild as any).__marker = true; // rendered factory content
    });

    await page.locator('[data-id="rerender"]').click();
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
        const panel = document.querySelector('[role="tabpanel"]') as any;
        const moveable = panel?.firstElementChild as any;
        return {
            panelSurvived: panel?.__marker === true,
            moveableSurvived: moveable?.__marker === true,
            contentSurvived: (moveable?.firstElementChild as any)?.__marker === true,
            panelVisible: panel ? getComputedStyle(panel).display !== "none" : false,
        };
    });
    expect(result.panelSurvived).toBe(true);
    expect(result.moveableSurvived).toBe(true);
    expect(result.contentSurvived).toBe(true);
    expect(result.panelVisible).toBe(true);

    // the layout still works after the swap: select the other tabset's tab
    const tab = page.locator('[data-layout-path="/ts1/tb0"]');
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
});
