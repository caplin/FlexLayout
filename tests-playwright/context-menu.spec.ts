import { test, expect } from '@playwright/test';

// The demo wires its context menu (onContextMenu) to the library's reusable showPopupMenu control
// for the "newfeatures" layout. These tests exercise the generic control: it appears on right
// click, is an accessible menu, and is fully keyboard operable.
test.describe('reusable popup menu (demo context menu)', () => {

    const openMenu = async (page: import('@playwright/test').Page) => {
        await page.goto('/demo?layout=newfeatures');
        const tab = page.locator('.flexlayout__tab_button').first();
        await expect(tab).toBeVisible();
        await tab.click({ button: 'right' });
        await expect(page.locator('.flexlayout__popup_menu')).toBeVisible();
        return tab;
    };

    test('right click opens an accessible menu with the given items', async ({ page }) => {
        await openMenu(page);
        const menu = page.locator('.flexlayout__popup_menu');
        await expect(menu).toHaveAttribute('role', 'menu');
        await expect(page.locator('[role="menuitem"]')).toHaveCount(3);
        await expect(page.locator('[role="menuitem"]').first()).toHaveText('Rename');
        // first item is focused on open
        await expect(page.locator('[role="menuitem"]').first()).toBeFocused();
    });

    test('renders a divider that keyboard navigation skips', async ({ page }) => {
        await openMenu(page);
        // the divider is a separator, not a menuitem, so it is not counted among the 3 items
        await expect(page.locator('.flexlayout__popup_menu [role="separator"]')).toHaveCount(1);
        await expect(page.locator('[role="menuitem"]')).toHaveCount(3);
        // ArrowDown twice from the first item: the second press skips the divider (after "Pin") and
        // lands on the next item; Enter still selects (via the focused-element click path)
        await expect(page.locator('[role="menuitem"]').first()).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(page.locator('[role="menuitem"]').nth(1)).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await expect(page.locator('[role="menuitem"]').nth(2)).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('.flexlayout__popup_menu')).toHaveCount(0);
        // Enter selected the focused item ("Close"), not the skipped divider
        expect(await page.evaluate(() => (window as any).__lastContextSelect)).toBe('close');
    });

    test('arrow keys move focus, Enter selects and closes', async ({ page }) => {
        await openMenu(page);
        await page.keyboard.press('ArrowDown');
        await expect(page.locator('[role="menuitem"]').nth(1)).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('.flexlayout__popup_menu')).toHaveCount(0);
    });

    test('Home and End jump to the first and last item', async ({ page }) => {
        await openMenu(page);
        await page.keyboard.press('End');
        await expect(page.locator('[role="menuitem"]').nth(2)).toBeFocused();
        await page.keyboard.press('Home');
        await expect(page.locator('[role="menuitem"]').first()).toBeFocused();
    });

    test('type-ahead focuses the item matching the typed letter', async ({ page }) => {
        await openMenu(page);
        await page.keyboard.press('c'); // -> "Close"
        await expect(page.locator('[role="menuitem"]').nth(2)).toBeFocused();
        await page.waitForTimeout(600); // let the type-ahead buffer reset
        await page.keyboard.press('p'); // -> "Pin"
        await expect(page.locator('[role="menuitem"]').nth(1)).toBeFocused();
    });

    test('Rename opens the inline edit, Close removes the tab', async ({ page }) => {
        const tab = await openMenu(page);
        await page.getByRole('menuitem', { name: 'Rename', exact: true }).click();
        const textbox = page.locator('.flexlayout__tab_button_textbox');
        await expect(textbox).toBeVisible();
        await textbox.fill('Renamed');
        await textbox.press('Enter');
        await expect(tab).toContainText('Renamed');

        await tab.click({ button: 'right' });
        await page.getByRole('menuitem', { name: 'Close', exact: true }).click();
        await expect(page.locator('.flexlayout__tab_button', { hasText: 'Renamed' })).toHaveCount(0);
    });

    test('Escape and outside click both close the menu', async ({ page }) => {
        const tab = await openMenu(page);
        await page.keyboard.press('Escape');
        await expect(page.locator('.flexlayout__popup_menu')).toHaveCount(0);

        // outside click
        await tab.click({ button: 'right' });
        await expect(page.locator('.flexlayout__popup_menu')).toBeVisible();
        await page.mouse.click(5, 5);
        await expect(page.locator('.flexlayout__popup_menu')).toHaveCount(0);
    });
});
