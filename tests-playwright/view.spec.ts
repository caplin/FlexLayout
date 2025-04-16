import { test, expect, Page, Locator } from '@playwright/test';
import { describe } from 'node:test';
import { checkBorderTab, checkTab, drag, dragSplitter, dragToEdge, findAllTabSets, findPath, findTabButton, Location } from './helpers';
import { CLASSES } from '../src/Types';

/*

    Key elements have data-layout-path attributes:

    /ts0 - the first tabset in the root row
    /ts1 - the second tabset in the root row
    /ts1/tabstrip - the second tabsets tabstrip
    /ts1/header - the second tabsets header
    /c2/ts0 - the first tabset in the column at position 2 in the root row
    /s0 - the first splitter in the root row (the one after the first tabset/column)
    /ts1/t2 - the third tab (the tab content) in the second tabset in the root row
    /ts1/tb2 - the third tab button (the tab button in the tabstrip) in the second tabset in the root row
    /border/top/t1
    /border/top/tb1
    ...

*/

const baseURL = 'http://localhost:5173/demo';

test.describe('drag tests two tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_two_tabs');
    await expect(page).toHaveTitle(/FlexLayout Demo/);
    await page.getByRole('button', { name: 'Reload' }).click();

    const tabSets = await findAllTabSets(page);
    expect(await tabSets.count()).toEqual(2);
  });

  test('tab to tab center', async ({ page }) => {
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findPath(page, '/ts1/t0');
    await drag(page, from, to, Location.CENTER); // Drag to the center of the destination tabset

    const tabSets = await findAllTabSets(page);
    expect(await tabSets.count()).toBe(1);

    await checkTab(page, '/ts0', 0, false, 'Two');
    await checkTab(page, '/ts0', 1, true, 'One');
  });

  test('tab to tab top', async ({ page }) => {
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findPath(page, '/ts1/t0');
    await drag(page, from, to, Location.TOP); // Drag to the top of the destination tabset

    const tabSets = await findAllTabSets(page);
    expect(await tabSets.count()).toBe(2);

    await checkTab(page, '/c0/ts0', 0, true, 'One');
    await checkTab(page, '/c0/ts1', 0, true, 'Two');
  });

  test('tab to tab bottom', async ({ page }) => {
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findPath(page, '/ts1/t0');
    await drag(page, from, to, Location.BOTTOM); // Drag to the bottom of the destination tabset

    const tabSets = await findAllTabSets(page);
    expect(await tabSets.count()).toBe(2);

    await checkTab(page, '/c0/ts0', 0, true, 'Two');
    await checkTab(page, '/c0/ts1', 0, true, 'One');
  });

  test('tab to tab left', async ({ page }) => {
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findPath(page, '/ts1/t0');
    await drag(page, from, to, Location.LEFT); // Drag to the left of the destination tabset

    const tabSets = await findAllTabSets(page);
    expect(await tabSets.count()).toBe(2);

    await checkTab(page, '/ts0', 0, true, 'One');
    await checkTab(page, '/ts1', 0, true, 'Two');
  });

  test('tab to tab right', async ({ page }) => {
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findPath(page, '/ts1/t0');
    await drag(page, from, to, Location.RIGHT); // Drag to the right of the destination tabset

    const tabSets = await findAllTabSets(page);
    expect(await tabSets.count()).toBe(2);

    await checkTab(page, '/ts0', 0, true, 'Two');
    await checkTab(page, '/ts1', 0, true, 'One');
  });

  test('tab to edge', async ({ page }) => {
    const from = await findTabButton(page, '/ts0', 0);
    await dragToEdge(page, from, 2); // Drag to the edge at index 2

    await checkTab(page, '/c0/ts0', 0, true, 'Two');
    await checkTab(page, '/c0/ts1', 0, true, 'One');
  });
});

test.describe('three tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_three_tabs');
    await expect(page).toHaveTitle(/FlexLayout Demo/);
    await expect(findAllTabSets(page)).toHaveCount(3);
    // store "from" locator
    // page.locator('.flexlayout__tab_button_content', { hasText: 'One' }).as('from'); 
  });

  test('tab to tabset', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts1/tabstrip');

    await drag(page, from, to, Location.CENTER);
    await expect(findAllTabSets(page)).toHaveCount(2);

    await checkTab(page, '/ts0', 0, false, 'Two');
    await checkTab(page, '/ts0', 1, true, 'One');
    await checkTab(page, '/ts1', 0, true, 'Three');
  });

  test('tab to tab center', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts1/t0');

    await drag(page, from, to, Location.CENTER);
    await expect(findAllTabSets(page)).toHaveCount(2);

    await checkTab(page, '/ts0', 0, false, 'Two');
    await checkTab(page, '/ts0', 1, true, 'One');
    await checkTab(page, '/ts1', 0, true, 'Three');
  });

  test('tab to tab top', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts1/t0');

    await drag(page, from, to, Location.TOP);
    await expect(findAllTabSets(page)).toHaveCount(3);

    await checkTab(page, '/c0/ts0', 0, true, 'One');
    await checkTab(page, '/c0/ts1', 0, true, 'Two');
    await checkTab(page, '/ts1', 0, true, 'Three');
  });

  test('tab to tab bottom', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts1/t0');

    await drag(page, from, to, Location.BOTTOM);
    await expect(findAllTabSets(page)).toHaveCount(3);

    await checkTab(page, '/c0/r0/ts0', 0, true, 'Two');
    await checkTab(page, '/c0/r0/ts1', 0, true, 'Three');
    await checkTab(page, '/c0/ts1', 0, true, 'One');
  });

  test('tab to tab left', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts1/t0');

    await drag(page, from, to, Location.LEFT);
    await expect(findAllTabSets(page)).toHaveCount(3);

    await checkTab(page, '/ts0', 0, true, 'One');
    await checkTab(page, '/ts1', 0, true, 'Two');
    await checkTab(page, '/ts2', 0, true, 'Three');
  });

  test('tab to tab right', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts1/t0');
    await drag(page, from, to, Location.RIGHT);

    const tabsets = findAllTabSets(page);
    await expect(tabsets).toHaveCount(3);

    await checkTab(page, '/ts0', 0, true, 'Two');
    await checkTab(page, '/ts1', 0, true, 'One');
    await checkTab(page, '/ts2', 0, true, 'Three');
  });

  test('tab to edge top', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    await dragToEdge(page, from, 0);

    await checkTab(page, '/c0/ts0', 0, true, 'One');
    await checkTab(page, '/c0/r1/ts0', 0, true, 'Two');
    await checkTab(page, '/c0/r1/ts1', 0, true, 'Three');
  });

  test('tab to edge left', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    await dragToEdge(page, from, 1);

    await checkTab(page, '/ts0', 0, true, 'One');
    await checkTab(page, '/ts1', 0, true, 'Two');
    await checkTab(page, '/ts2', 0, true, 'Three');
  });

  test('tab to edge bottom', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    await dragToEdge(page, from, 2);

    await checkTab(page, '/c0/r0/ts0', 0, true, 'Two');
    await checkTab(page, '/c0/r0/ts1', 0, true, 'Three');
    await checkTab(page, '/c0/ts1', 0, true, 'One');
  });

  test('tab to edge right', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    await dragToEdge(page, from, 3);

    await checkTab(page, '/ts0', 0, true, 'Two');
    await checkTab(page, '/ts1', 0, true, 'Three');
    await checkTab(page, '/ts2', 0, true, 'One');
  });

  test('row to column', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts2/t0');
    await drag(page, from, to, Location.BOTTOM);

    const rowFrom = findTabButton(page, '/ts0', 0);
    const rowTo = findPath(page, '/c1/ts0/t0');
    await drag(page, rowFrom, rowTo, Location.BOTTOM);

    const tabsets = findAllTabSets(page);
    await expect(tabsets).toHaveCount(3);

    await checkTab(page, '/c0/ts0', 0, true, 'Three');
    await checkTab(page, '/c0/ts1', 0, true, 'Two');
    await checkTab(page, '/c0/ts2', 0, true, 'One');
  });

  test('row to single tabset', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts2/t0');
    await drag(page, from, to, Location.CENTER);

    const rowFrom = findTabButton(page, '/ts0', 0);
    const rowTo = findPath(page, '/ts1/t1');
    await drag(page, rowFrom, rowTo, Location.CENTER);

    const tabsets = findAllTabSets(page);
    await expect(tabsets).toHaveCount(1);

    await checkTab(page, '/ts0', 0, false, 'Three');
    await checkTab(page, '/ts0', 1, false, 'One');
    await checkTab(page, '/ts0', 2, true, 'Two');
  });

  test('move tab in tabstrip', async ({ page }) => {
    const from = findTabButton(page, '/ts0', 0);
    const to = findPath(page, '/ts2/t0');
    await drag(page, from, to, Location.CENTER);

    const rowFrom = findTabButton(page, '/ts0', 0);
    const rowTo = findPath(page, '/ts1/t1');
    await drag(page, rowFrom, rowTo, Location.CENTER);

    await checkTab(page, '/ts0', 0, false, 'Three');
    await checkTab(page, '/ts0', 1, false, 'One');
    await checkTab(page, '/ts0', 2, true, 'Two');

    const leftFrom = findTabButton(page, '/ts0', 2);
    const leftTo = findTabButton(page, '/ts0', 0);
    await drag(page, leftFrom, leftTo, Location.LEFT);

    await checkTab(page, '/ts0', 0, true, 'Two');
    await checkTab(page, '/ts0', 1, false, 'Three');
    await checkTab(page, '/ts0', 2, false, 'One');
  });

  test('move tabstrip', async ({ page }) => {
    const from = findPath(page, '/ts2/tabstrip');
    const to = findPath(page, '/ts0/t0');
    await drag(page, from, to, Location.CENTER);

    await checkTab(page, '/ts0', 0, true, 'One');
    await checkTab(page, '/ts0', 1, false, 'Three');
    await checkTab(page, '/ts1', 0, true, 'Two');

    const stripFrom = findPath(page, '/ts0/tabstrip');
    const stripTo = findPath(page, '/ts1/tabstrip');
    await drag(page, stripFrom, stripTo, Location.CENTER);

    await checkTab(page, '/ts0', 0, true, 'Two');
    await checkTab(page, '/ts0', 1, false, 'One');
    await checkTab(page, '/ts0', 2, false, 'Three');
  });

});

test.describe('borders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_with_borders');
    await expect(findAllTabSets(page)).toHaveCount(3);
  });

  const borderToTabTest = async (page, border: string, tabtext: string, index: number) => {
    const from = await findTabButton(page, border, 0);
    const to = await findPath(page, '/ts0/t0');
    await drag(page, from, to, Location.CENTER);
    await expect(findAllTabSets(page)).toHaveCount(3);
    await checkTab(page, '/ts0', 0, false, 'One');
    await checkTab(page, '/ts0', index, true, tabtext);
  };

  test('border top to tab', async ({ page }) => {
    await borderToTabTest(page, '/border/top', 'top1', 1);
  });

  test('border bottom to tab', async ({ page }) => {
    await borderToTabTest(page, '/border/bottom', 'bottom1', 1);
  });

  test('border left to tab', async ({ page }) => {
    await borderToTabTest(page, '/border/left', 'left1', 1);
  });

  test('border right to tab', async ({ page }) => {
    await borderToTabTest(page, '/border/right', 'right1', 1);
  });

  const tabToBorderTest = async (page, border: string, tabtext: string, index: number) => {
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findTabButton(page, border, 0);
    await drag(page, from, to, Location.CENTER);
    await expect(findAllTabSets(page)).toHaveCount(2);
    await checkBorderTab(page, border, 0, false, tabtext);
    await checkBorderTab(page, border, index, false, 'One');
  };

  test('tab to border top', async ({ page }) => {
    await tabToBorderTest(page, '/border/top', 'One', 0);
  });

  test('tab to border bottom', async ({ page }) => {
    await tabToBorderTest(page, '/border/bottom', 'One', 0);
  });

  test('tab to border left', async ({ page }) => {
    await tabToBorderTest(page, '/border/left', 'One', 0);
  });

  test('tab to border right', async ({ page }) => {
    await tabToBorderTest(page, '/border/right', 'One', 0);
  });

  const openTabTest = async (page, border: string, tabtext: string, index: number) => {
    await (await findTabButton(page, border, 0)).click();
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findPath(page, border);
    await drag(page, from, to, Location.CENTER);
    await expect(findAllTabSets(page)).toHaveCount(2);
    await checkBorderTab(page, border, 0, false, tabtext);
    await checkBorderTab(page, border, index, true, 'One');
  };

  test('tab to open border top', async ({ page }) => {
    await openTabTest(page, '/border/top', 'top1', 1);
  });

  test('tab to open border bottom', async ({ page }) => {
    await openTabTest(page, '/border/bottom', 'bottom1', 1);
  });

  test('tab to open border left', async ({ page }) => {
    await openTabTest(page, '/border/left', 'left1', 1);
  });

  test('tab to open border right', async ({ page }) => {
    await openTabTest(page, '/border/right', 'right1', 1);
  });

  const openTabCenterTest = async (page, border: string, tabtext: string, index: number) => {
    await (await findTabButton(page, border, 0)).click();
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findPath(page, `${border}/t0`);
    await drag(page, from, to, Location.CENTER);
    await expect(findAllTabSets(page)).toHaveCount(2);
    await checkBorderTab(page, border, 0, false, tabtext);
    await checkBorderTab(page, border, index, true, 'One');
  };

  test('tab to open border top center', async ({ page }) => {
    await openTabCenterTest(page, '/border/top', 'top1', 1);
  });

  test('tab to open border bottom center', async ({ page }) => {
    await openTabCenterTest(page, '/border/bottom', 'bottom1', 1);
  });

  test('tab to open border left center', async ({ page }) => {
    await openTabCenterTest(page, '/border/left', 'left1', 1);
  });

  test('tab to open border right center', async ({ page }) => {
    await openTabCenterTest(page, '/border/right', 'right1', 1);
  });

  const inBorderTabMoveTest = async (page, border: string, tabtext: string, index: number) => {
    const from = await findTabButton(page, '/ts0', 0);
    const to = await findPath(page, border);
    await drag(page, from, to, Location.CENTER);
    await expect(findAllTabSets(page)).toHaveCount(2);
    // await checkBorderTab(page, border, 0, false, tabtext);
    await checkBorderTab(page, border, index, false, tabtext);

    const from2 = await findTabButton(page, border, 0);
    // const to2 = await findTabButton(page, border, index);
    await drag(page, from2, to, Location.CENTER);
    await checkBorderTab(page, border, 0, false, tabtext);
  };

  test('move tab in border top', async ({ page }) => {
    await inBorderTabMoveTest(page, '/border/top', 'One', 1);
  });

  test('move tab in border bottom', async ({ page }) => {
    await inBorderTabMoveTest(page, '/border/bottom', 'One', 1);
  });

  test('move tab in border left', async ({ page }) => {
    await inBorderTabMoveTest(page, '/border/left', 'One', 1);
  });

  test('move tab in border right', async ({ page }) => {
    await inBorderTabMoveTest(page, '/border/right', 'One', 1);
  });
});

test.describe('Overflow menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_with_borders');

    await findPath(page, '/ts0/tabstrip').click();
    await page.locator('[data-id=add-active]').click();
    await page.locator('[data-id=add-active]').click();
  });

  test('show menu', async ({ page }) => {
    await expect(findPath(page, '/ts0/button/overflow')).not.toBeVisible();

    const from = findPath(page, '/s0');

    // Drag the splitter to left edge
    await dragSplitter(page, from, false, -1000);

    // Then drag it back 150px
    await dragSplitter(page, from, false, 150);

    await checkTab(page, '/ts0', 2, true, 'Text2');
    await expect(findPath(page, '/ts0/t0')).not.toBeVisible(); // tab 0 should not be visible

    await expect(findPath(page, '/ts0/button/overflow')).toBeVisible();
    await findPath(page, '/ts0/button/overflow').click();
    await expect(findPath(page, '/popup-menu')).toBeVisible();

    await findPath(page, '/popup-menu/tb0').click();

    await expect(findPath(page, '/ts0/t2')).not.toBeVisible(); // tab 2 should now not be visible
    await checkTab(page, '/ts0', 0, true, 'One');

    // expand the tabset so overflow disappears
    await dragSplitter(page, from, false, 300);
    await expect(findPath(page, '/ts0/button/overflow')).not.toBeVisible();
  });
});

test.describe('Add methods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_with_borders');
    await expect(await findAllTabSets(page)).toHaveCount(3);
  });

  test('drag to tabset', async ({ page }) => {
    const from = page.locator('[data-id=add-drag]');
    const to = await findPath(page, '/ts1/tabstrip');
    await drag(page, from, to, Location.CENTER);
    await expect(await findAllTabSets(page)).toHaveCount(3);
    await checkTab(page, '/ts1', 0, false, 'Two');
    await checkTab(page, '/ts1', 1, true, 'Text1');
  });

  test('drag to border', async ({ page }) => {
    const from = page.locator('[data-id=add-drag]');
    const to = await findPath(page, '/border/right');
    await drag(page, from, to, Location.CENTER);
    await expect(await findAllTabSets(page)).toHaveCount(3);
    await checkBorderTab(page, '/border/right', 0, false, 'right1');
    await checkBorderTab(page, '/border/right', 1, false, 'Text1');
  });

  // test('add to tabset with id #1', async ({ page }) => {
  //   await page.locator('[data-id=add-byId]').click();
  //   await expect(await findAllTabSets(page)).toHaveCount(3);
  //   await checkTab(page, '/ts1', 0, false, 'Two');
  //   await checkTab(page, '/ts1', 1, true, 'Text1');
  // });

  test('add to active tabset', async ({ page }) => {
    const tabstrip = await findPath(page, '/ts1/tabstrip');
    await tabstrip.click();
    await page.locator('[data-id=add-active]').click();
    await expect(await findAllTabSets(page)).toHaveCount(3);
    await checkTab(page, '/ts1', 0, false, 'Two');
    await checkTab(page, '/ts1', 1, true, 'Text1');
  });
});

test.describe('Delete methods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_with_borders');
    await expect(await findAllTabSets(page)).toHaveCount(3);
  });

  test('delete tab', async ({ page }) => {
    const closeButton = await findPath(page, '/ts1/tb0/button/close');
    await closeButton.click();
    await expect(await findAllTabSets(page)).toHaveCount(2);
    await checkTab(page, '/ts0', 0, true, 'One');
    await checkTab(page, '/ts1', 0, true, 'Three');
  });

  test('delete all tabs', async ({ page }) => {
    await (await findPath(page, '/ts1/tb0/button/close')).click();
    await (await findPath(page, '/ts1/tb0/button/close')).click();
    await (await findPath(page, '/ts0/tb0/button/close')).click();
    await expect(await findAllTabSets(page)).toHaveCount(1);
    const tab = await findPath(page, '/ts1/tb0');
    await expect(tab).not.toBeVisible();
  });

  // test('delete tab in border', async ({ page }) => {
  //   await checkBorderTab(page, '/border/bottom', 0, false, 'bottom1');
  //   const closeButton = await findPath(page, '/border/bottom/tb0/button/close');
  //   await closeButton.click({ force: true });
  //   await checkBorderTab(page, '/border/bottom', 0, false, 'bottom2');
  // });
});

test.describe('Splitters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_two_tabs');
    await expect(page).toHaveTitle(/FlexLayout Demo/);
  });

  test('vsplitter', async ({ page }) => {
    const from = findPath(page, '/s0');
    await dragSplitter(page, from, false, 100); // right 100px

    const e1 = findPath(page, '/ts1');
    const e2 = findPath(page, '/ts0');

    const w1 = (await e1.boundingBox())?.width ?? 0;
    const w2 = (await e2.boundingBox())?.width ?? 0;

    expect(w2 - w1).toBeGreaterThan(99);
  });

  test('vsplitter to edge', async ({ page }) => {
    const from = findPath(page, '/s0');
    await dragSplitter(page, from, false, 1000); // to right edge
    await dragSplitter(page, from, false, -100); // 100px back

    const e1 = findPath(page, '/ts1');
    const w1 = (await e1.boundingBox())?.width ?? 0;

    expect(Math.abs(w1 - 100)).toBeLessThan(2);
  });

  test('vsplitter to edge left', async ({ page }) => {
    const from = findPath(page, '/s0');
    await dragSplitter(page, from, false, -1000); // to left edge
    await dragSplitter(page, from, false, 100); // 100px back

    const e1 = findPath(page, '/ts0');
    const w1 = (await e1.boundingBox())?.width ?? 0;

    expect(Math.abs(w1 - 100)).toBeLessThan(2);
  });

  test.describe('horizontal', () => {
    test.beforeEach(async ({ page }) => {
      // Setting up the initial state before each test
      const from = findTabButton(page, '/ts0', 0);
      const to = findPath(page, '/ts1/t0');
      await drag(page, from, to, Location.BOTTOM);
      const tabsets = findAllTabSets(page);
      await expect(tabsets).toHaveCount(2);
  
      await checkTab(page, '/c0/ts0', 0, true, 'Two');
      await checkTab(page, '/c0/ts1', 0, true, 'One');
    });
  
    test('resizes with hsplitter', async ({ page }) => {
      const from = findPath(page, '/c0/s0');
      await dragSplitter(page, from, true, 100); // down 100px
  
      const e1 = findPath(page, '/c0/ts1');
      const e2 = findPath(page, '/c0/ts0');
  
      const h1 = (await e1.boundingBox())?.height ?? 0;
      const h2 = (await e2.boundingBox())?.height ?? 0;
  
      expect(h2 - h1).toBeGreaterThan(99);
    });
  
    test('moves hsplitter to bottom edge and back', async ({ page }) => {
      const from = findPath(page, '/c0/s0');
      await dragSplitter(page, from, true, 1000); // to bottom edge
      await dragSplitter(page, from, true, -100); // 100px back
  
      const e1 = findPath(page, '/c0/ts1');
      const h1 = (await e1.boundingBox())?.height ?? 0;
  
      expect(Math.abs(h1 - 130)).toBeLessThan(10);
    });
  
    test('moves hsplitter to top edge and back', async ({ page }) => {
      const from = findPath(page, '/c0/s0');
      await dragSplitter(page, from, true, -1000); // to top edge
      await dragSplitter(page, from, true, 100); // 100px back
  
      const e1 = findPath(page, '/c0/ts0');
      const h1 = (await e1.boundingBox())?.height ?? 0;
  
      expect(Math.abs(h1 - 130)).toBeLessThan(10);
    });
  });
});


test.describe('Maximize methods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_with_borders');
    await expect(await findAllTabSets(page)).toHaveCount(3);
  });

  test('maximize tabset using max button', async ({ page }) => {
    await findPath(page, '/ts1/button/max').click();
    await expect(findPath(page, '/ts0')).toBeHidden();
    await expect(findPath(page, '/ts1')).toBeVisible();
    await expect(findPath(page, '/ts2')).toBeHidden();

    await findPath(page, '/ts1/button/max').click();
    await expect(findPath(page, '/ts0')).toBeVisible();
    await expect(findPath(page, '/ts1')).toBeVisible();
    await expect(findPath(page, '/ts2')).toBeVisible();
  });

  test('maximize tabset using double click', async ({ page }) => {
    await findPath(page, '/ts1/tabstrip').dblclick();
    await expect(findPath(page, '/ts0')).toBeHidden();
    await expect(findPath(page, '/ts1')).toBeVisible();
    await expect(findPath(page, '/ts2')).toBeHidden();

    await findPath(page, '/ts1/button/max').click();
    await expect(findPath(page, '/ts0')).toBeVisible();
    await expect(findPath(page, '/ts1')).toBeVisible();
    await expect(findPath(page, '/ts2')).toBeVisible();
  });
});

test.describe('Others', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(baseURL + '?layout=test_with_borders');
      await expect(await findAllTabSets(page)).toHaveCount(3);
    });

  test('rename tab', async ({ page }) => {
    await findPath(page, "/ts1/tb0").dblclick();
    const textbox = await findPath(page, "/ts1/tb0/textbox");
    await expect(textbox).toBeVisible();
    await expect(textbox).toHaveValue('Two');
    await textbox.type('Renamed');
    await textbox.press('Enter');
    await checkTab(page, "/ts1", 0, true, "Renamed");
  });

  test('rename tab cancelled with esc', async ({ page }) => {
    await findPath(page, "/ts1/tb0").dblclick();
    const textbox = await findPath(page, "/ts1/tb0/textbox");
    await expect(textbox).toBeVisible();
    await textbox.type('Renamed');
    await textbox.press('Escape');
    await checkTab(page, "/ts1", 0, true, "Two");
  });

  test('click on tab contents causes tabset activate', async ({ page }) => {
    await findPath(page, "/ts1/t0").click();
    await expect(findPath(page, "/ts0/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));

    await findPath(page, "/ts0/t0").click();
    await expect(findPath(page, "/ts0/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));

    await findPath(page, "/ts2/t0").click();
    await expect(findPath(page, "/ts0/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
  });

  test('click on tab button causes tabset activate', async ({ page }) => {
    await findPath(page, "/ts1/tb0").click();
    await expect(findPath(page, "/ts0/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));

    await findPath(page, "/ts0/tb0").click();
    await expect(findPath(page, "/ts0/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));

    await findPath(page, "/ts2/tb0").click();
    await expect(findPath(page, "/ts0/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
  });

  test('click on tabstrip causes tabset activate', async ({ page }) => {
    await findPath(page, "/ts1/tabstrip").click();
    await expect(findPath(page, "/ts0/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));

    await findPath(page, "/ts0/tabstrip").click();
    await expect(findPath(page, "/ts0/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));

    await findPath(page, "/ts2/tabstrip").click();
    await expect(findPath(page, "/ts0/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts1/tabstrip")).not.toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
    await expect(findPath(page, "/ts2/tabstrip")).toHaveClass(new RegExp(CLASSES.FLEXLAYOUT__TABSET_SELECTED));
  });

});


test('tab can have icon', async ({ page }) => {
  await page.goto(baseURL + '?layout=test_with_onRenderTab');
  await expect(await findAllTabSets(page)).toHaveCount(3);
  const tabButtonLeading = await findPath(page, "/ts1/tb0").locator(`.${CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING} img`);
  await expect(tabButtonLeading).toHaveAttribute('src', 'images/settings.svg');
});

test.describe('Extended App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_with_onRenderTab');
    await expect(await findAllTabSets(page)).toHaveCount(3);
  });

  test('onRenderTab', async ({ page }) => {
    const tabButton = findPath(page, '/ts1/tb0')
      .locator(`.${CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING}`)
      .locator('img');

    await expect(tabButton).toHaveAttribute('src', 'images/settings.svg');

    const secondImg = findPath(page, '/ts1/tb0').locator('img').nth(1);
    await expect(secondImg).toHaveAttribute('src', 'images/folder.svg');
  });

  test('onRenderTab in border', async ({ page }) => {
    const borderButton = findPath(page, '/border/top/tb0')
      .locator(`.${CLASSES.FLEXLAYOUT__BORDER_BUTTON_LEADING}`)
      .locator('img');

    await expect(borderButton).toHaveAttribute('src', 'images/settings.svg');

    const secondImg = findPath(page, '/ts1/tb0').locator('img').nth(1);
    await expect(secondImg).toHaveAttribute('src', 'images/folder.svg');
  });

  test('onRenderTabSet', async ({ page }) => {
    const toolbar = findPath(page, '/ts1/tabstrip')
      .locator(`.${CLASSES.FLEXLAYOUT__TAB_TOOLBAR}`);

    await expect(toolbar.locator('img').nth(0)).toHaveAttribute('src', 'images/folder.svg');
    await expect(toolbar.locator('img').nth(1)).toHaveAttribute('src', 'images/settings.svg');
  });

  test('onRenderTabSet sticky buttons', async ({ page }) => {
    const stickyToolbar = findPath(page, '/ts2/tabstrip')
      .locator(`.${CLASSES.FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER}`);

    await expect(stickyToolbar.locator('img').nth(0)).toHaveAttribute('src', 'images/add.svg');
  });

  test('onRenderTabSet for border', async ({ page }) => {
    const borderToolbar = findPath(page, '/border/top')
      .locator(`.${CLASSES.FLEXLAYOUT__BORDER_TOOLBAR}`);

    await expect(borderToolbar.locator('img').nth(0)).toHaveAttribute('src', 'images/folder.svg');
    await expect(borderToolbar.locator('img').nth(1)).toHaveAttribute('src', 'images/settings.svg');
  });
});



test.describe('Extended layout2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL + '?layout=test_with_min_size');
    await expect(await findAllTabSets(page)).toHaveCount(4);
  });

  test('check tabset min size', async ({ page }) => {
    let from = findPath(page, '/s0');
    await dragSplitter(page, from, false, -1000);
    let ts0 = findPath(page, '/ts0');
    const w1 = await ts0.boundingBox();
    expect(Math.abs(w1!.width - 100)).toBeLessThan(2);

    from = findPath(page, '/s1');
    await dragSplitter(page, from, false, 1000);
    const ts0c2 = findPath(page, '/c2/ts0');
    const w2 = await ts0c2.boundingBox();
    expect(Math.abs(w2!.width - 100)).toBeLessThan(2);

    from = findPath(page, '/c2/s0');
    await dragSplitter(page, from, true, -1000);
    const ts0c2height = findPath(page, '/c2/ts0');
    const h1 = await ts0c2height.boundingBox();
    expect(Math.abs(h1!.height - 130)).toBeLessThan(10);

    from = findPath(page, '/c2/s0');
    await dragSplitter(page, from, true, 1000);
    const ts1 = findPath(page, '/c2/ts1');
    const h2 = await ts1.boundingBox();
    expect(Math.abs(h2!.height - 130)).toBeLessThan(10);
  });

  test('check border top min size', async ({ page }) => {
    await findPath(page, '/border/top/tb0').click();
    const from = findPath(page, '/border/top/s-1');
    await dragSplitter(page, from, true, -1000);
    const t0 = findPath(page, '/border/top/t0');
    const h1 = await t0.boundingBox();
    expect(Math.abs(h1!.height - 100)).toBeLessThan(2);
  });

  test('check border bottom min size', async ({ page }) => {
    await findPath(page, '/border/bottom/tb0').click();
    const from = findPath(page, '/border/bottom/s-1');
    await dragSplitter(page, from, true, 1000);
    const t0 = findPath(page, '/border/bottom/t0');
    const h1 = await t0.boundingBox();
    expect(Math.abs(h1!.height - 100)).toBeLessThan(2);
  });

  test('check border left min size', async ({ page }) => {
    await findPath(page, '/border/left/tb0').click();
    const from = findPath(page, '/border/left/s-1');
    await dragSplitter(page, from, false, -1000);
    const t0 = findPath(page, '/border/left/t0');
    const w1 = await t0.boundingBox();
    expect(Math.abs(w1!.width - 100)).toBeLessThan(2);
  });

  test('check border right min size', async ({ page }) => {
    await findPath(page, '/border/right/tb0').click();
    const from = findPath(page, '/border/right/s-1');
    await dragSplitter(page, from, false, 1000);
    const t0 = findPath(page, '/border/right/t0');
    const w1 = await t0.boundingBox();
    expect(Math.abs(w1!.width - 100)).toBeLessThan(2);
  });

  test('tabset close', async ({ page }) => {
    await expect(findPath(page, '/ts0')).toBeVisible();
    await expect(findPath(page, '/ts1')).toBeVisible();
    await expect(findPath(page, '/ts2')).not.toBeVisible();

    await findPath(page, '/c2/ts0/button/close').click();

    await expect(findPath(page, '/c2/ts0')).not.toBeVisible();
    await expect(findPath(page, '/ts0')).toBeVisible();
    await expect(findPath(page, '/ts1')).toBeVisible();
    await expect(findPath(page, '/ts2')).toBeVisible();
  });

  test('borders autohide top', async ({ page }) => {
    await findPath(page, '/border/top/tb0').hover();
    await findPath(page, '/border/top/tb0/button/close').click();
    await expect(findPath(page, '/border/top')).not.toBeVisible();

    const from = findTabButton(page, '/ts0', 0);
    const to = findTabButton(page, '/ts0', 0);
    await drag(page, from, to, Location.TOP);
    await expect(findPath(page, '/border/top')).toBeVisible();
  });

  test('borders autohide left', async ({ page }) => {
    await findPath(page, '/border/left/tb0').hover();
    await findPath(page, '/border/left/tb0/button/close').click();
    await expect(findPath(page, '/border/left')).not.toBeVisible();

    const from = findTabButton(page, '/ts0', 0);
    const to = findTabButton(page, '/ts0', 0);
    await drag(page, from, to, Location.LEFTEDGE);
    await expect(findPath(page, '/border/left')).toBeVisible();
  });
});
