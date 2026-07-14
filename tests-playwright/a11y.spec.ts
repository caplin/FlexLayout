import { test, expect } from "@playwright/test";
import { findPath, findTabButton, drag, dragSplitter, checkTab, Location } from "./helpers";

const baseURL = "/demo";

// aria semantics added for accessibility (tabs pattern, window splitter, menu button)
test.describe("aria semantics", () => {
    test("tabs have roles and selection state", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_two_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(2);

        await expect(page.locator('[role="tablist"]')).toHaveCount(2);
        await expect(page.locator('[role="tab"]')).toHaveCount(2);
        await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveCount(2);
        await expect(page.locator('[role="separator"]')).toHaveCount(1);
    });

    test("accessible names, toggle states and hidden helpers", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_two_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(2);

        // the offscreen drag stamps duplicate every tab name and must be hidden from AT
        await expect(page.locator(".flexlayout__layout_tab_stamps")).toHaveAttribute("aria-hidden", "true");

        // tabs carry an explicit accessible name (not polluted by the close/pin adornments)
        await expect(findTabButton(page, "/ts0", 0)).toHaveAttribute("aria-label", "One");
        // the close affordance inside the tab is hidden from AT (close is Ctrl+Delete)
        await expect(findPath(page, "/ts0/tb0/button/close")).toHaveAttribute("aria-hidden", "true");
        // the close shortcut is advertised
        await expect(findTabButton(page, "/ts0", 0)).toHaveAttribute("aria-keyshortcuts", /Control\+Delete/);

        // the maximize button exposes its toggle state
        const max = findPath(page, "/ts1/button/max");
        await expect(max).toHaveAttribute("aria-pressed", "false");
        await max.click();
        await expect(max).toHaveAttribute("aria-pressed", "true");
        await max.click();
        await expect(max).toHaveAttribute("aria-pressed", "false");
    });

    test("tab panels are labelled by their tab buttons", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_two_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(2);

        const tab = page.locator('[role="tab"]').first();
        const controls = await tab.getAttribute("aria-controls");
        const id = await tab.getAttribute("id");
        expect(controls).toBeTruthy();
        const panel = page.locator(`[id="${controls}"]`);
        await expect(panel).toHaveAttribute("role", "tabpanel");
        await expect(panel).toHaveAttribute("aria-labelledby", id!);
    });

    test("selecting a tab updates aria-selected", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_with_borders");
        const borderTab = page.locator('[data-layout-path="/border/top/tb0"]');
        await expect(borderTab).toHaveAttribute("aria-selected", "false");
        await borderTab.click();
        await expect(borderTab).toHaveAttribute("aria-selected", "true");
    });
});

test.describe("keyboard operation", () => {
    test("enter selects a focused tab", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_with_borders");
        const borderTab = page.locator('[data-layout-path="/border/top/tb0"]');
        await borderTab.focus();
        await page.keyboard.press("Enter");
        await expect(borderTab).toHaveAttribute("aria-selected", "true");
        await page.keyboard.press("Enter");
        await expect(borderTab).toHaveAttribute("aria-selected", "false"); // border tabs toggle
    });

    test("arrow keys move focus between tabs, ctrl+delete closes", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_three_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(3);

        // merge Two into the first tabset to get a multi tab tabset
        await drag(page, findTabButton(page, "/ts1", 0), findPath(page, "/ts0/t0"), Location.CENTER);
        await checkTab(page, "/ts0", 1, true, "Two");

        const tb0 = findTabButton(page, "/ts0", 0);
        const tb1 = findTabButton(page, "/ts0", 1);

        await tb1.focus();
        await page.keyboard.press("ArrowLeft");
        await expect(tb0).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(tb1).toBeFocused();

        // select the first tab with space
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press(" ");
        await checkTab(page, "/ts0", 0, true, "One");

        // plain delete does nothing (close is ctrl+delete)
        await page.keyboard.press("Delete");
        await checkTab(page, "/ts0", 0, true, "One");

        // ctrl+delete closes the focused tab; focus moves to the neighbour
        await page.keyboard.press("Control+Delete");
        await checkTab(page, "/ts0", 0, true, "Two");
        await expect(findTabButton(page, "/ts0", 0)).toBeFocused();
    });

    test("arrow keys resize a focused splitter", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_two_tabs");
        const splitter = findPath(page, "/s0");
        const before = (await findPath(page, "/ts0").boundingBox())!;

        await splitter.focus();
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press("ArrowLeft");
        }
        const after = (await findPath(page, "/ts0").boundingBox())!;
        expect(after.width).toBeLessThan(before.width - 30);
    });

    test("keyboard focus is visible on tabs, splitters and toolbar buttons", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_two_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(2);

        // tab through the page recording the focus outline of each kind of layout element
        const seen: Record<string, string> = {};
        for (let i = 0; i < 50 && Object.keys(seen).length < 3; i++) {
            await page.keyboard.press("Tab");
            const info = await page.evaluate(() => {
                const el = document.activeElement as HTMLElement;
                const role = el?.getAttribute("role");
                const cls = typeof el?.className === "string" ? el.className : "";
                let kind: string | null = null;
                if (role === "tab") kind = "tab";
                else if (role === "separator") kind = "separator";
                else if (cls.includes("toolbar_button")) kind = "toolbarButton";
                return kind ? { kind, outline: getComputedStyle(el).outlineStyle } : null;
            });
            if (info) {
                seen[info.kind] = info.outline;
            }
        }
        expect(seen["tab"]).toBe("solid");
        expect(seen["separator"]).toBe("solid");
        expect(seen["toolbarButton"]).toBe("solid");
    });

    test("configured key toggles focus between tab and its content", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_two_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(2);

        const tab = page.locator('[data-layout-path="/ts0/tb0"]');
        // advertised to assistive tech, along with the close/rename shortcuts
        await expect(tab).toHaveAttribute("aria-keyshortcuts", "F6 Control+Delete F2");

        await tab.focus();
        await page.keyboard.press("F6");
        const inPanel = await page.evaluate(() => document.activeElement?.closest('[role="tabpanel"]') !== null);
        expect(inPanel).toBe(true);

        await page.keyboard.press("F6");
        await expect(tab).toBeFocused();

        // enter on an already selected tab also enters the content
        await page.keyboard.press("Enter");
        const inPanel2 = await page.evaluate(() => document.activeElement?.closest('[role="tabpanel"]') !== null);
        expect(inPanel2).toBe(true);
    });

    test("configured keys cycle focus between tabsets", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_three_tabs");
        await expect(page.locator(".flexlayout__tabset")).toHaveCount(3);

        // the cycling shortcuts are advertised on the tablists
        await expect(page.locator('[role="tablist"]').first()).toHaveAttribute("aria-keyshortcuts", "Control+] Control+[");

        const tb0 = findTabButton(page, "/ts0", 0);
        const tb1 = findTabButton(page, "/ts1", 0);
        const tb2 = findTabButton(page, "/ts2", 0);

        await tb0.focus();
        await page.keyboard.press("Control+]");
        await expect(tb1).toBeFocused();
        await page.keyboard.press("Control+]");
        await expect(tb2).toBeFocused();
        await page.keyboard.press("Control+]"); // wraps to the first tabset
        await expect(tb0).toBeFocused();
        await page.keyboard.press("Control+["); // and wraps backwards
        await expect(tb2).toBeFocused();

        // the target tabset becomes the active tabset
        await expect(findPath(page, "/ts2/tabstrip")).toHaveClass(/selected/);

        // also works with focus inside the tab content (F6 moves into the panel)
        await page.keyboard.press("F6");
        const inPanel = await page.evaluate(() => document.activeElement?.closest('[role="tabpanel"]') !== null);
        expect(inPanel).toBe(true);
        await page.keyboard.press("Control+]");
        await expect(tb0).toBeFocused();

        // no-op while a tabset is maximized (the other tabsets are not visible)
        await findPath(page, "/ts0/button/max").click();
        await tb0.focus();
        await page.keyboard.press("Control+]");
        await expect(tb0).toBeFocused();
    });

    test("overflow menu is keyboard operable and returns focus", async ({ page }) => {
        await page.goto(baseURL + "?layout=test_with_borders");
        await findPath(page, "/ts0/tabstrip").click();
        await page.locator("[data-id=add-active]").click();
        await page.locator("[data-id=add-active]").click();

        // shrink the first tabset until the overflow button appears
        await dragSplitter(page, findPath(page, "/s0"), false, -1000);
        await dragSplitter(page, findPath(page, "/s0"), false, 150);
        const overflow = findPath(page, "/ts0/button/overflow");
        await expect(overflow).toBeVisible();

        await overflow.click();
        const menu = findPath(page, "/popup-menu");
        await expect(menu).toBeVisible();

        // first item focused on open; escape closes and returns focus
        await expect(page.locator('[role="menuitem"]').first()).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(menu).not.toBeVisible();
        await expect(overflow).toBeFocused();

        // reopen and select an item with the keyboard
        await overflow.click();
        await page.keyboard.press("Enter");
        await expect(findPath(page, "/popup-menu")).not.toBeVisible();
    });
});
