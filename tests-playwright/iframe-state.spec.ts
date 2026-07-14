import { test, expect, Page, Locator } from "@playwright/test";
import { findPath, drag, Location } from "./helpers";

// FlexLayout renders tab content into a persistent "moveable" panel that is repositioned (never
// re-parented) when a tab moves within the layout, so stateful content such as an <iframe> keeps
// its state across an in-layout move. Moving a tab to a popout window re-hosts its content in
// another document, which reloads the iframe. This test proves both.
//
// The demo `iframe` component's srcDoc stamps a unique id on document.body on every (re)load, so a
// changed id means the iframe reloaded. We also set a live variable on its contentWindow.

const iframeEl = (page: Page) => page.locator('[data-testid="state-iframe"]');

async function readIframeState(frame: Locator) {
    return frame.evaluate((el: HTMLIFrameElement) => ({
        loadId: el.contentDocument?.body?.dataset.loadId,
        live: (el.contentWindow as any)?.__testState,
    }));
}

test("iframe keeps its state when moved within the layout, and reloads when popped out", async ({ page, context }) => {
    await page.goto("/demo?layout=default");
    await expect(page.locator(".flexlayout__tabset").first()).toBeVisible();

    // add an iframe tab to the first tabset and capture its node id
    await findPath(page, "/r1/ts0/tabstrip").click(); // make the tabset active
    const tabId = await page.evaluate(() => (window as any).__flexLayout().addTabToActiveTabSet({ component: "iframe", name: "Frame" }).getId() as string);

    const frame = iframeEl(page);
    await expect(frame).toBeVisible();
    await expect.poll(async () => (await readIframeState(frame)).loadId).toBeTruthy();

    // put live state into the iframe's window
    await frame.evaluate((el: HTMLIFrameElement) => {
        (el.contentWindow as any).__testState = "kept";
    });
    const before = await readIframeState(frame);
    expect(before.live).toBe("kept");

    // --- move the tab to the other tabset: state must be preserved (not reloaded) ---
    const tab = page.locator(".flexlayout__tab_button").filter({ hasText: "Frame" });
    await drag(page, tab, findPath(page, "/r2/ts0/t0"), Location.CENTER);
    await page.waitForTimeout(300);

    const afterMove = await readIframeState(iframeEl(page));
    expect(afterMove.loadId).toBe(before.loadId); // same load -> not reloaded
    expect(afterMove.live).toBe("kept"); // live window state survived

    // --- pop the tab out to a window: content is re-hosted, so the iframe reloads ---
    await page.evaluate((id) => (window as any).__flexDispatch((window as any).__flexActions.popoutTab(id, "window")), tabId);
    await expect.poll(async () => context.pages().filter((p) => p !== page && !p.isClosed()).length).toBe(1);
    const popout = context.pages().filter((p) => p !== page && !p.isClosed())[0];
    await popout.waitForLoadState();

    const popoutFrame = iframeEl(popout);
    await expect(popoutFrame).toBeVisible();
    await expect.poll(async () => (await readIframeState(popoutFrame)).loadId).toBeTruthy();

    const afterPopout = await readIframeState(popoutFrame);
    expect(afterPopout.loadId).not.toBe(before.loadId); // reloaded in the new document
    expect(afterPopout.live).toBeUndefined(); // live state lost
});
