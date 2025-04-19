    import { expect, Page, Locator } from '@playwright/test';

    export const findAllTabSets = (page: Page) => {
        return page.locator('.flexlayout__tabset');
    };
    
    export const findPath = (page: Page, path: string) => {
        return page.locator(`[data-layout-path="${path}"]`);
    };
    
    export const findTabButton = (page: Page, path: string, index: number) => {
        return findPath(page, `${path}/tb${index}`);
    };
    
    export const checkTab = async (page: Page, path: string, index: number, selected: boolean, text: string) => {
        const tabButton = findTabButton(page, path, index);
        const tabContent = findPath(page, `${path}/t${index}`);
    
        await expect(tabButton).toBeVisible();
        await expect(tabButton).toHaveClass(new RegExp(selected ? 'flexlayout__tab_button--selected' : 'flexlayout__tab_button--unselected'));
        await expect(tabButton.locator('.flexlayout__tab_button_content')).toContainText(text);
    
        await expect(tabContent).toBeVisible({ visible: selected });
        await expect(tabContent).toContainText(text);
    };
    
    export const checkBorderTab = async (page: Page, path: string, index: number, selected: boolean, text: string) => {
        const tabButton = findTabButton(page, path, index);
        const tabContent = findPath(page, `${path}/t${index}`);
    
        await expect(tabButton).toBeVisible();
        await expect(tabButton).toHaveClass(new RegExp(selected ? 'flexlayout__border_button--selected' : 'flexlayout__border_button--unselected'));
        await expect(tabButton.locator('.flexlayout__border_button_content')).toContainText(text);
    
        if (selected) {
        await expect(tabContent).toBeVisible();
        await expect(tabContent).toContainText(text);
        }
    };
    
    export enum Location {
        CENTER,
        TOP,
        BOTTOM,
        LEFT,
        RIGHT,
        LEFTEDGE
    }
    
    function getLocation(rect: { x: number; y: number; width: number; height: number }, loc: Location) {
        switch (loc) {
        case Location.CENTER:
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        case Location.TOP:
            return { x: rect.x + rect.width / 2, y: rect.y + 5 };
        case Location.BOTTOM:
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height - 5 };
        case Location.LEFT:
            return { x: rect.x + 5, y: rect.y + rect.height / 2 };
        case Location.RIGHT:
            return { x: rect.x + rect.width - 5, y: rect.y + rect.height / 2 };
        case Location.LEFTEDGE:
            return { x: rect.x , y: rect.y + rect.height / 2 };
        default:
            throw new Error(`Unknown location: ${loc}`);
        }
    }
    
    export async function drag(page: Page, from: Locator, to: Locator, loc: Location) {
        const fr = await from.boundingBox();
        const tr = await to.boundingBox();
    
        if (!fr || !tr) throw new Error('Could not get bounding boxes');
    
        const cf = getLocation(fr, Location.CENTER);
        const ct = getLocation(tr, loc);
    
        await page.mouse.move(cf.x, cf.y);
        await page.mouse.down();
        await page.mouse.move(ct.x, ct.y, { steps: 10 });
        await page.mouse.up();
    }
    
    export async function dragToEdge(page: Page, from: Locator, edgeIndex: number) {
    
    
        const fr = await from.boundingBox();
        if (!fr) throw new Error('Could not get bounding box for source');
    
        const cf = { x: fr.x + fr.width / 2, y: fr.y + fr.height / 2 };
    
        await page.mouse.move(cf.x, cf.y);
        await page.mouse.down();
        await page.mouse.move(cf.x + 10, cf.y + 10); // start move to make edges show
        const edgeRects = page.locator('.flexlayout__edge_rect');
        const edge = edgeRects.nth(edgeIndex);
        const tr = await edge.boundingBox();
        if (!tr) throw new Error('Could not get bounding box for edge');
    
        const ct = { x: tr.x + tr.width / 2, y: tr.y + tr.height / 2 };
    
        // await page.mouse.move((cf.x + ct.x) / 2, (cf.y + ct.y) / 2);
        await page.mouse.move(ct.x, ct.y, { steps: 10 });
        await page.mouse.up();
    }
    
    export async function dragSplitter(page: Page, from: Locator, upDown: boolean, distance: number) {
        const fr = await from.boundingBox();
        if (!fr) throw new Error('Could not get bounding box for splitter');
    
        const cf = { x: fr.x + fr.width / 2, y: fr.y + fr.height / 2 };
        const ct = { x: cf.x + (upDown ? 0 : distance), y: cf.y + (upDown ? distance : 0) };
    
        await page.mouse.move(cf.x, cf.y);
        await page.mouse.down();
        // await page.mouse.move(cf.x + 10, cf.y + 10);
        // await page.mouse.move((cf.x + ct.x) / 2, (cf.y + ct.y) / 2);
        await page.mouse.move(ct.x, ct.y, { steps: 10 });
        await page.mouse.up();
    }
    
    
    
    