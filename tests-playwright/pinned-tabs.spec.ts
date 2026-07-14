import { test, expect } from "@playwright/test";
import { checkTabButton, drag, dragToEdge, findAllTabSets, findPath, findTabButton, Location } from "./helpers";

// layout test_pinned: ts0 = PinOne (pinned), PinTwo (pinned), Three, Four; ts1 = Five

const baseURL = "/demo";

const checkOrder = async (page: import("@playwright/test").Page, path: string, names: string[]) => {
    for (let i = 0; i < names.length; i++) {
        await expect(findTabButton(page, path, i).locator(".flexlayout__tab_button_content")).toContainText(names[i]);
    }
};

test.describe("pinned tabs", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + "?layout=test_pinned");
        await expect(page).toHaveTitle(/FlexLayout Demo/);
        // note: no 'Reload' click here - the context is fresh so the layout comes straight from the
        // file, and Reload's async model swap can swallow the first click/drag of a test

        await expect(findAllTabSets(page)).toHaveCount(2);
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Three", "Four"]);
    });

    test("pinned state is conveyed in the tab's accessible name", async ({ page }) => {
        await expect(findTabButton(page, "/ts0", 0)).toHaveAttribute("aria-label", "PinOne (Pinned)");
        await expect(findTabButton(page, "/ts0", 2)).toHaveAttribute("aria-label", "Three");
    });

    test("pinned tab shows pin indicator and no close button", async ({ page }) => {
        await expect(findPath(page, "/ts0/tb0/button/pin")).toBeVisible();
        await expect(findPath(page, "/ts0/tb0/button/close")).toHaveCount(0);
        // unpinned tab has a close button and no pin indicator
        await expect(findPath(page, "/ts0/tb2/button/pin")).toHaveCount(0);
        await expect(findPath(page, "/ts0/tb2/button/close")).toHaveCount(1);
        await expect(findTabButton(page, "/ts0", 0)).toHaveClass(/flexlayout__tab_button--pinned/);
    });

    test("unpinned tab cannot be dragged before pinned tabs", async ({ page }) => {
        const from = findTabButton(page, "/ts0", 3); // Four
        const to = findTabButton(page, "/ts0", 0); // PinOne
        await drag(page, from, to, Location.LEFT);

        // drop index clamps to the end of the pinned group
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Four", "Three"]);
    });

    test("pinned tabs can be reordered within the pinned group", async ({ page }) => {
        const from = findTabButton(page, "/ts0", 1); // PinTwo
        const to = findTabButton(page, "/ts0", 0); // PinOne
        await drag(page, from, to, Location.LEFT);

        await checkOrder(page, "/ts0", ["PinTwo", "PinOne", "Three", "Four"]);
    });

    test("pinned tab cannot be dragged past unpinned tabs", async ({ page }) => {
        const from = findTabButton(page, "/ts0", 0); // PinOne
        const to = findTabButton(page, "/ts0", 3); // Four
        await drag(page, from, to, Location.RIGHT);

        // drop index clamps back to the end of the pinned group
        await checkOrder(page, "/ts0", ["PinTwo", "PinOne", "Three", "Four"]);
    });

    test("pinned tab cannot be dragged out of its tabset", async ({ page }) => {
        // to another tabset
        await drag(page, findTabButton(page, "/ts0", 0), findPath(page, "/ts1/t0"), Location.CENTER);
        await expect(findAllTabSets(page)).toHaveCount(2);
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Three", "Four"]);
        await checkOrder(page, "/ts1", ["Five"]);

        // splitting its own tabset
        await drag(page, findTabButton(page, "/ts0", 0), findPath(page, "/ts0/t0"), Location.BOTTOM);
        await expect(findAllTabSets(page)).toHaveCount(2);
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Three", "Four"]);

        // to a layout edge
        await dragToEdge(page, findTabButton(page, "/ts0", 0), 0);
        await expect(findAllTabSets(page)).toHaveCount(2);
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Three", "Four"]);
    });

    test("Ctrl+Delete does not close a pinned tab", async ({ page }) => {
        const tab = findTabButton(page, "/ts0", 0);
        await tab.click();
        await checkTabButton(page, "/ts0", 0, true, "PinOne");
        await tab.press("Control+Delete");
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Three", "Four"]);

        // plain Delete closes nothing (close is Ctrl+Delete)
        const unpinned = findTabButton(page, "/ts0", 3);
        await unpinned.click();
        await unpinned.press("Delete");
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Three", "Four"]);

        // sanity check: Ctrl+Delete closes an unpinned tab
        await unpinned.press("Control+Delete");
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Three"]);
        await expect(findTabButton(page, "/ts0", 3)).toHaveCount(0);
    });

    test("context menu pins and unpins tabs", async ({ page }) => {
        // pin Three via the context menu
        await findTabButton(page, "/ts0", 2).click({ button: "right" });
        await expect(page.locator(".flexlayout__popup_menu")).toBeVisible();
        await page.getByRole("menuitem", { name: "Pin", exact: true }).click();
        await checkOrder(page, "/ts0", ["PinOne", "PinTwo", "Three", "Four"]);
        await expect(findPath(page, "/ts0/tb2/button/pin")).toBeVisible();
        await expect(findPath(page, "/ts0/tb2/button/close")).toHaveCount(0);

        // unpin PinOne: it moves to the start of the unpinned group
        await findTabButton(page, "/ts0", 0).click({ button: "right" });
        await expect(page.locator(".flexlayout__popup_menu")).toBeVisible();
        // a pinned tab is not closeable, so its menu has no Close item (or divider)
        await expect(page.getByRole("menuitem", { name: "Close", exact: true })).toHaveCount(0);
        await expect(page.locator('.flexlayout__popup_menu [role="separator"]')).toHaveCount(0);
        await page.getByRole("menuitem", { name: "Unpin", exact: true }).click();
        await checkOrder(page, "/ts0", ["PinTwo", "Three", "PinOne", "Four"]);
        await expect(findPath(page, "/ts0/tb2/button/pin")).toHaveCount(0);
        await expect(findPath(page, "/ts0/tb2/button/close")).toHaveCount(1);
    });

    test("popout icons are hidden while a pinned tab is selected", async ({ page }) => {
        // PinOne is selected initially (pinned)
        await checkTabButton(page, "/ts0", 0, true, "PinOne");
        await expect(findPath(page, "/ts0/button/popout")).toHaveCount(0);

        // selecting an unpinned tab brings the popout icon back
        await findTabButton(page, "/ts0", 2).click();
        await expect(findPath(page, "/ts0/button/popout")).toHaveCount(1);
    });
});
