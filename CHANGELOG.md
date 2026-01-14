## 0.8.18 - 2026-01-14

* **Updated:** README.md links to use github.io.

## 0.8.17 - 2025-05-03

* **Fixed:** Issues with tab redraw and scroll when page is scrolled down (corrects fix for [#488])

## 0.8.16 - 2025-04-30

* **Fixed:** [#488](https://github.com/caplin/FlexLayout/issues/488) Wrong tab position on scroll

## 0.8.15 - 2025-04-25

* **Added:** Option to tabset customization to allow the creation of a control to the left of the tabs (see the 'New Features' layout in the demo for an example).
* **Changed:** Only re-render tabs when they are visible.

## 0.8.14 - 2025-04-18

* **Removed:** UMD builds.
* **Changed:** Package type is now 'module'.
* **Changed:** Demo build now uses Vite.
* **Added:** Icons are now exported.
* **Added:** Error boundary now has a retry button.

## 0.8.13 - 2025-04-15 (deprecated)

Published with missing types in module exports

## 0.8.12 - 2025-04-15

* **Updated:** Dependencies.
* **Fixed:** Initial tab flash.
* **Disabled:** Popout of MUI tabs in demo (because Emotion generated styles in production cannot be copied to the popout window).
* **Converted:** Cypress tests to Playwright.
* **Updated:** Demo app to use React hooks.

## 0.8.11 - 2025-04-09 (deprecated)

Published with additional files by mistake.

## 0.8.10 - 2025-04-09

* **Fixed:** [#481](https://github.com/caplin/FlexLayout/issues/481) Numpad Enter doesn't confirm rename.
* **Workaround:** Addressed a `<StrictMode>` issue in React 19 ([https://github.com/facebook/react/issues/29585](https://github.com/facebook/react/issues/29585)) causing tabs to re-mount when moved.

## 0.8.9 - 2025-04-04

* **Fixed:** [#480](https://github.com/caplin/FlexLayout/issues/480) `Actions.selectTab` is called when closing a Tab.
* **Added:** `isVisible()` method to `TabNode`.

## 0.8.8 - 2025-03-22

* **Enabled:** Escape key to close the overflow menu.
* **Prevented:** Initial reposition flash when there are hidden tabs.
* **Removed:** Roboto font from the demo.

## 0.8.7 - 2025-03-17

* **Improved:** Tab scrolling into the visible area.
* **Added:** Sections about tab and tabset customization to the README.

## 0.8.6 - 2025-03-15

* **Restructured:** SCSS files to remove the use of the deprecated `@import` rule.
* **Added:** `combined.css` containing all themes.
* **Updated:** Demo to use `combined.css` for simple theme switching using class names.
* **Added:** Option in the demo to show the layout structure.

## 0.8.5 - 2025-03-08

* **Changed:** The mini scrollbar now only shows when tabs are hovered over.

## 0.8.4 - 2025-03-03

* **Added:** Attribute `'enableTabScrollbar'` to `TabSet` and `Border` nodes. Enabling this attribute will show a mini 'scrollbar' for the tabs to indicate the scroll position. See the Demo app's default layout for an example.

## 0.8.3 - 2025-02-21

* **Prevented:** Sticky buttons from scrolling when there are no tabs.
* **Fixed:** Border `'show'` attribute.
* **Removed:** Code to adjust popout positions when loading.

## 0.8.2 - 2025-02-15

* **Updated:** Dependencies.
* **Enabled:** Use with React 19.
* **Removed:** Strict mode from the demo due to a bug in React 19 ([https://github.com/facebook/react/issues/29585](https://github.com/facebook/react/issues/29585)) causing tabs to re-mount when moved.
* **Used:** CodeSandbox in `README.md` since React 19 doesn't create UMD versions needed by JSFiddle.

## 0.8.1 - 2024-09-24

* **Fixed:** `enableDrag` on tab and tabset nodes.
* **Fixed:** Calculation for min/max tabset height from min/max tab height.
* **Modified:** Stylesheet code in the demo to reduce flash.

## 0.8.0 - 2024-09-12

**New Features:**

* Wrap tabs option.
* Improved popouts, no longer keep a placeholder tab.
* Drag from the overflow menu.
* Improved splitter resizing.
* Now uses HTML drag and drop to allow cross-window dragging.
* Rendering now uses flexbox rather than absolute positions, which should make styling easier.
* Rounded theme.
* Updated dependencies.

**Breaking Changes:**

* The `addTabWithDragAndDrop` signature has changed and must now be called from a drag start handler.
* The `moveTabWithDragAndDrop` signature has changed and must now be called from a drag start handler.
* Removed `addTabWithDragAndDropIndirect`.
* Removed `onTabDrag` (custom internal drag).
* Removed the `font` prop; use CSS variables `--font-size` and `--font-family` instead.
* Removed the `titleFactory` and `iconFactory` props; use `onRenderTab` instead.
* Removed the tabset header option.
* Removed attributes: `for insets`, `tabset header`, `row/tabset width and height`, `legacymenu`, etc.
* Several CSS changes reflect the use of flexbox.

## 0.7.15 - 2023-11-14

* **Added:** Arrow icon to edge indicators.

## 0.7.14 - 2023-11-10

* **Added:** Attribute `tabsetClassName` to tab nodes. This will add the class name to the parent tabset when there is a single stretched tab. Updated the mosaic layout in the demo to use this to color headers.

## 0.7.13 - 2023-10-22

* **New attribute on tabset:** `enableSingleTabStretch` will stretch a single tab to take up all the remaining space and change the style to look like a header. Combined with `enableDrop`, this can be used to create a Mosaic-style layout (headed panels without tabs). See the new Mosaic Style layout in the Demo.
* The layout methods `addTabToTabSet` and `addTabToActiveTabSet` now return the added `TabNode`.
* **Fixed:** [#352](https://github.com/caplin/FlexLayout/issues/352) - `Layout.getDomRect` returning null.

## 0.7.12

* `Action.setActiveTabset` can now take `undefined` to unset the active tabset.
* **Added:** Tab attribute `contentClassName` to add a class to the tab content.

## 0.7.11

* **Added:** `ITabSetRenderValues.overflowPosition` to allow the overflow button position to be specified. If left undefined, the position will be after sticky buttons as before.
* **New model attribute:** `enableRotateBorderIcons`. This allows the tab icons in the left and right borders to rotate with the text or not; the default is `true`.
* **Added:** Additional class names to edge indicators.

## 0.7.10

* **Fixed:** [#399](https://github.com/caplin/FlexLayout/issues/399) - The overflow button in a tabset is now placed after any sticky buttons (additional buttons that stick to the last tab of a tabset) but before any other buttons.
* **Enabled:** Sticky buttons in border tabsets.

## 0.7.9

* **Fixed:** Drag issue found when used in a devtool extension.
* **Fixed:** Double render in popout when in strict mode.

## 0.7.8

* **Fixed:** Popout size of tab with individual border size.
* **Hid:** Edge handles when disabled.
* **Updated:** Version of Cypress.

## 0.7.7

* **Fixed:** [#379](https://github.com/caplin/FlexLayout/issues/379) - `uuid` could only be generated in secure contexts.

## 0.7.6

* **Removed:** Dependency on the `uuid` package.
* **Added:** `action` argument to the `onModelChange` callback.

## 0.7.5

* **Fixed:** [#340](https://github.com/caplin/FlexLayout/issues/340) - Error dragging a tabset into an empty tabset.

## 0.7.4

* **Fixed:** Popout windows when using `<React.StrictMode>`.
* **Output now targets:** ES6.

## 0.7.3

* **Fixed:** Right edge marker location when border `enableAutoHide`.
* Dragging out a selected border tab will now leave the border unselected.

## 0.7.2

* **New Layout JSON tabs:** Added to the demo.
* **Added:** `--color-icon` CSS rootOrientationVertical.

## 0.7.1

* **Fixed:** [#310](https://github.com/caplin/FlexLayout/issues/310) - Added new layout method: `moveTabWithDragAndDrop(node)` to allow tab dragging to be started from custom code.

## 0.7.0

* **Updated:** Dependencies, in particular, changed React peer dependency to React 18.
* **Made changes for:** React 18.

## 0.6.10

* **Fixed:** [#312](https://github.com/caplin/FlexLayout/issues/312), Chrome warning for wheel event listener.

## 0.6.9

* **Fixed:** [#308](https://github.com/caplin/FlexLayout/issues/308), Allow dragging within a maximized tabset.

## 0.6.8

* **Added:** `onTabSetPlaceHolder` prop to render the tabset area when there are no tabs.

## 0.6.7

* **Added:** More CSS variables, Underline theme, and updated dependencies.

## 0.6.6

* **Fixed:** [#296](https://github.com/caplin/FlexLayout/issues/296).

## 0.6.5

* **Fixed:** [#289](https://github.com/caplin/FlexLayout/issues/289), Allow setting attributes to undefined value.

## 0.6.4

* Code tidy.
* Updated dependencies.

## 0.6.3

* **Changed:** To using named rather than default import/exports. This will require changing top-level imports:
    ```javascript
    // from:
    import FlexLayout from 'flexlayout-react';
    // to:
    import * as FlexLayout from 'flexlayout-react';
    ```
* **Added:** Typedoc link to README.

## 0.6.2

* **Extended:** `icons` prop to allow the use of functions to set icons.
* **Added:** `onShowOverflowMenu` callback for handling the display of the tab overflow menu.

## 0.6.1

* **Used:** Portal for the drag rectangle to preserve React context in `onRenderTab`.

## 0.6.0

* **Changed:** Icons to use SVG images, which will now scale with the font size.
* **Improved:** Element spacing, removed most margin/padding spacers.
* The overflow menu and drag rectangle will now show the tab icon and content as rendered in the tab.
* **Added:** `altName` attribute to `TabNode`. This will be used as the name in the overflow menu if there is no `name` attribute (e.g., the tab has just an icon).
* **Changed:** The drag outline colors from red/green to light blue/green.
* **Removed:** `closeIcon` prop from `Layout`; use the `icons` property instead.
* **Changed:** `onRenderDragRect` callback to take a `ReactElement` rather than a string. The content now contains the tab button as rendered.

## 0.5.21

* **Fixed:** Copying stylesheet links for popout windows when `cssRules` throw an exception.
* **Added:** Option `enableUseVisibility` to allow the use of `visibility: hidden` rather than `display: none` for hiding elements.

## 0.5.20

* **Added:** Cypress Tests.
* **Fixed:** Bug with tab icon not showing.

## 0.5.19

* **Added:** `onRenderFloatingTabPlaceholder` callback prop for rendering the floating tab placeholder.
* **Changed:** Style sheets to use CSS custom properties (variables) for several values.
* **Fixed:** Selected index in a single empty tabset.
* **Added:** `onContextMenu` callback prop for handling context menus on tabs and tabsets.
* **Added:** `onAuxMouseClick` callback prop for handling mouse clicks on tabs and tabsets with alt, meta, shift keys, and also handles center mouse clicks.

## 0.5.18

* **Added:** `onRenderDragRect` callback prop for rendering the drag rectangles.
* **New border attribute:** `enableAutoHide`, to hide the border if it has zero tabs.

## 0.5.17

* **New global option:** `splitterExtra`, to allow splitters to have extended hit test areas. This makes it easier to use narrow splitters.
* **Added new TabNode attributes:** `borderWidth` and `borderHeight`. These allow for individual border sizes for certain tabs.
* **Fixed:** [#263](https://github.com/caplin/FlexLayout/issues/263) - Border splitters not taking the minimum size of the center into account.
* **Improved:** Algorithm for finding the drop location.
* **Additional parameter:** `cursor`, for `onTabDrag`.

## 0.5.16

* **Added:** 'New Features' layout to the demo.
* **New tab attribute:** `helpText`, to show a tooltip over tabs.
* **New model action:** `deleteTabset`, to delete a tabset and all its child tabs.
* **New tabset attribute:** `enableClose`, to close the tabset.

## 0.5.15

* **Added new Layout prop:** `onTabDrag` that allows tab dragging to be intercepted.
* **Added example of `onTabDrag`:** In the demo app, the example shows a list where tabs can be dragged into, moved in the list, and dragged back out into the layout.
* Node IDs that are not assigned a value are now auto-generated using a UUID rather than a rolling number (e.g., previous ID: #3, new ID: #0c459064-8dee-444e-8636-eb9ab910fb27).
* **Made:** The `toJson` method of the node public.

## 0.5.14

* **Fixed:** An issue with copying styles for a floating window when using a CSS-in-JS solution.
* **Fixed:** [#227](https://github.com/caplin/FlexLayout/issues/227) - Edge rects are not moved if the window is resized while dragging.

## 0.5.13

* **Added prop:** `realtimeResize` to make tabs resize as their splitters are dragged.
    **Warning:** This can cause resizing to become choppy when tabs are slow to draw.

## 0.5.12

* **New callback on Model:** To allow `TabSet` attributes to be set when a tab is moved in such a way that it creates a new `TabSet`.
* **Added:** Config attributes to `TabSet` and `Border`.
* **Added:** `headerButtons` to `ITabSetRenderValues` to allow a different set of buttons to be applied to headed `TabSets`.

## 0.5.11

* **Added:** `StickyButtons` to `onRenderTabSet` render values to allow for the implementation of a Chrome-style + button.
* **Added:** Example of the + button to the default layout in the demo app.

## 0.5.10

* Adjusted the selected tab when tabs are popped out to an external window.

## 0.5.9

* `TitleFactory` can now return an object with `titleContent` and `name` (name is used for the tab overflow menu).
* Corrected the position of `rootOrientationVertical` in the TypeScript JSON model.

## 0.5.8

* **Fixed:** [#172](https://github.com/caplin/FlexLayout/issues/172) - Added global `rootOrientationVertical` attribute to allow vertical layout for the root 'row'.
* **Added:** Missing exports for the TypeScript JSON model.
* **Moved:** CRA example to a separate repo.

## 0.5.7

* **Added:** TypeScript typings for the model JSON.
* **Fixed:** Drag rectangle showing as a dot before the first position was found (when dragging into the layout).
* **Fixed:** [#191](https://github.com/caplin/FlexLayout/issues/191) - Global Attributes for class names not working.
* **Fixed:** [#212](https://github.com/caplin/FlexLayout/issues/212) - TypeScript issue with `ILayoutState`.

## 0.5.6

* **Added:** External drag and drop into the layout; see the new `onExternalDrag` prop.
* **Updated:** Demo to accept dragged links, HTML, and text.
* Tab scrolling direction changed to match VSCode.
* Improved positioning of a single tab when the overflow menu is shown.
* Some small changes to theme colors.

## 0.5.5

* **Fixed:** [#170](https://github.com/caplin/FlexLayout/issues/170) - Closing the last tab of a maximized tabset crashes the layout.

## 0.5.4

* **Fixed:** Issue running with React 17.0.1.
* Window title now updates when a tab is renamed.

## 0.5.3

* **Changed:** Class name strings to enum values.
* **Replaced:** TSLint with ESLint.
* **Added:** Create-React-App (CRA) example.
* **New theme:** 'light' (lighter and without box shadows, gradients).
* **Renamed:** Existing 'light' theme to 'gray'.

## 0.5.2

* **Fixed:** Issues caused by double touch/mouse events in iOS.
* **Prevented:** iOS scroll during drag in the demo app.
* **Added:** Extra option to `onRenderTab` to allow the name of the item in the overflow menu to be set.
* **New option:** `closeType` for tabs.
* The maximized tabset now sets others to `display: none` rather than using `z-index`.
* **Disabled:** Maximize if only one tabset.
* Splitters will now default to 8px on desktop and 12px on mobile (so they can be tapped more easily).
* Close element is enlarged on mobile.

## 0.5.1

* Various small fixes.

## 0.5.0

* Overflowing tabs now scroll to keep the selected tab in view. They can also be manually scrolled using the mouse wheel.
* Now works on scrolling pages.
* **NOTE:** Several CSS classes with names starting with `flexlayout__tabset_header...` have been renamed to `flexlayout__tabset_tabbar...`.

## 0.4.9

* Keep the selected tab in the tabset/border when another tab is moved out.

## 0.4.8

* **Added:** Minimum size attributes on tabset and border.
* **Added:** Extra CSS classes on elements for border and splitter styling.

## 0.4.7

* **Added:** `font` property.
* Font now defaults to `medium`.
* Tabs now auto-adjust to the current font.
* **Added:** `fontSize` dropdown to the demo.
* **Modified:** CSS for the above font size changes and to remove some fixed sizes.
* **Added:** New attributes to control the auto-selection of tabs.

## 0.4.6

* **Added:** `icons` prop to allow default icons to be replaced.
* **Added:** `tabLocation` attribute to tabsets to allow top and bottom tab placement.
* **Modified:** CSS; the default font is now 14px.

## 0.4.5

* **Fixed:** Use of global objects for use when server-side rendering.
* **Added:** Error boundary around tab contents to prevent tab rendering exceptions from crashing the app.

## 0.4.4

* **Changed:** All components except `Layout` to use React Hooks.
* Popouts now wait for stylesheets to load.
* **Fixed:** Problem rendering popouts in Safari.

## 0.4.3

* **Fixed:** `addTabWithDragAndDrop` not working since 0.4.0.

## 0.4.2

* Use Sass to generate light and dark themes.

## 0.4.1

* Copy styles into popout tabs.

## 0.4.0

* **Added:** Ability to pop out tabs into new browser windows. Press the 'reload from file' button in the demo app to load new layouts with the `popout` attribute.

## 0.3.11

* **Added:** Overflow menu to border tabs.
* **Fixed:** Issues running on IE11.

## 0.3.10

* **Removed:** Deprecated React lifecycle methods. Will now work in React strict mode without warnings (for example, in apps created with Create React App).