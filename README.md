# FlexLayout

[![GitHub](https://img.shields.io/github/license/Caplin/FlexLayout)](https://github.com/caplin/FlexLayout/blob/master/LICENSE)
![npm](https://img.shields.io/npm/dw/flexlayout-react)
[![npm](https://img.shields.io/npm/v/flexlayout-react)](https://www.npmjs.com/package/flexlayout-react)

FlexLayout is a layout manager for React that arranges components in multiple tabsets. Tabs can be resized, moved, and organized into complex layouts.

![FlexLayout Demo Screenshot](screenshots/Screenshot_v0.10.png?raw=true "FlexLayout Demo Screenshot")

[Run the Demo](https://caplin.github.io/FlexLayout/demos/v0.10/demo/index.html)

Try it now using [CodeSandbox](https://codesandbox.io/p/sandbox/yvjzqf)

[API Doc](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/index.html)

FlexLayout's only dependency is React.

Features:
* Splitters for resizing
* Tabs (scrolling or wrapped)
* Tab dragging and ordering
* Pinnable tabs (kept at the start of the tabstrip, via `Actions.setTabPinned`)
* Tabset dragging (move all tabs in a tabset in one operation)
* Docking to tabsets or edges of the frame
* Maximizing tabsets (double-click tabset header or use icon)
* Tab overflow (menu for hidden tabs, mouse wheel scrolling)
* Border tabsets
* Overlay borders (border panels overlay the main layout, via `Actions.setBorderType`)
* Popout tabs into floating panels or new browser windows
* Submodels (layouts inside layouts)
* Tab renaming (double-click tab text)
* Theming (light, dark, underline, etc., and combined)
* Accessibility (ARIA roles, keyboard operation with a configurable keymap, visible focus) — see [Accessibility](#accessibility)
* Mobile support (iPad, Android)
* Multiple ways to add tabs (drag, active tabset, by ID)
* Comprehensive tab and tabset attributes (`enableTabStrip`, `enableDock`, `enableDrop`, etc.)
* Customizable tab and tabset rendering
* Preservation of component state when tabs are moved
* Playwright tests
* TypeScript type declarations

## Example Interaction
![FlexLayout Animation](screenshots/Animation.gif?raw=true "FlexLayout Animation")

## Installation

FlexLayout is available on npm. Install it using:

```bash
npm install flexlayout-react
```

Import FlexLayout and its model in your modules:

```javascript
import { Layout, Model } from 'flexlayout-react';
```

Include a theme. Choose from `alpha_light`, `alpha_dark`, `alpha_rounded`, `light`, `dark`, `underline`, `gray`, `rounded`, or `combined` (see the demo for examples):

```css
import 'flexlayout-react/style/alpha_light.css';  
```

[Learn how to change the theme dynamically in code](#dynamically-changing-the-theme)


## Usage

The `<Layout>` component renders the tabsets and splitters. It takes the following props:

#### Required props:

| Prop    | Description                                      |
| ------- | ------------------------------------------------ |
| `model` | The layout model                                 |
| `factory` | A factory function for creating React components |

Additional [optional props](#optional-layout-props)

The model is a tree of `Node` objects that define the structure of the layout.

The factory is a function that takes a `Node` object and returns a React component to be hosted within a tab.

Models can be created using the `Model.fromJson(jsonObject)` static method and saved using the `model.toJson()` method.

## Example Configuration:

```javascript
const json = {
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "placeholder",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Two",
                        component: "placeholder",
                    }
                ]
            }
        ]
    }
};
```

## Example Code

```javascript
const model = Model.fromJson(json);

function App() {

  const factory = (node) => {
    const component = node.getComponent();

    if (component === "placeholder") {
      return <div>{node.getName()}</div>;
    }
  }

  return (
    <Layout
      model={model}
      factory={factory} />
  );
}
```

The above code renders two tabsets horizontally, each containing a single tab that hosts a `div` component (returned from the factory). Tabs can be moved and resized by dragging and dropping. Additional tabs can be added to the layout by sending actions to the model.

<img src="screenshots/Screenshot_two_tabs.png?raw=true" alt="Simple layout" title="Generated Layout"/>

Note: The `<Layout>` component must be hosted in a container element (with CSS `position: absolute` or `relative`). The layout will fill the containing element.


Try it now using [CodeSandbox](https://codesandbox.io/p/sandbox/yvjzqf)

A simple TypeScript example can be found here:

https://github.com/nealus/flexlayout-vite-example

The model JSON contains four top-level elements:

* `global` - (optional) Global options.
* `layout` - The main row/tabset/tabs layout hierarchy.
* `borders` - (optional) Up to four borders ("top", "bottom", "left", "right").
* `subLayouts` - (optional) Where sub layouts for popout windows, floating panels and tabs are defined.

The `layout` element is built using three types of nodes:

* `row` - Rows contain a list of tabsets and child rows. The top-level `row` renders horizontally by default (unless the global attribute `rootOrientationVertical` is set). Child rows render in the opposite orientation to their parent row.
* `tabset` - Tabsets contain a list of tabs and the index of the selected tab.
* `tab` - Tabs specify the component to host (loaded via the factory) and the tab's display text.

The layout structure is defined with rows within rows that contain tabsets that themselves contain tabs.

Within the demo app, you can view the layout structure by checking the 'Show layout' box. Rows are shown in blue, and tabsets in orange.

![FlexLayout Demo Showing Layout](screenshots/Screenshot_layout.png?raw=true "Demo showing layout")

The optional `borders` element is made up of border nodes:

* `border` - Borders contain a list of tabs and the index of the selected tab. They can only be used within the `borders` top-level element.

The JSON model tree structure is defined as TypeScript interfaces; see [JSON Model](#json-model-definition).

Each node type has a defined set of required and optional attributes.

Weights on rows and tabsets specify their relative size within the parent row. The absolute values do not matter, only their proportions (e.g., two tabsets with weights 30 and 70 would render the same as if they had weights 3 and 7).

NOTE: The easiest way to create your initial layout JSON is to use the [demo](https://caplin.github.io/FlexLayout/demos/v0.10/demo/index.html) app. Modify an existing layout by dragging, dropping, and adding nodes, then press the 'print' button to print the JSON to the browser's developer console.

By changing global or node attributes, you can modify the layout's appearance and functionality. For example, setting `tabSetEnableTabStrip: false` in the global options would change the layout into a multi-splitter (without tabs or drag-and-drop):

```
 global: {tabSetEnableTabStrip:false},
```

## Dynamically Changing the Theme

The `combined.css` theme includes all other themes and supports dynamic theme switching.

When using `combined.css`, add a `className` (in the form `flexlayout__theme_[theme-name]`) to the `div` containing the `<Layout>` to select the desired theme.

For example: 
```
    <div ref={containerRef} className="flexlayout__theme_alpha_light">
        <Layout model={model} factory={factory} />
    </div>
```

Change the theme in code by changing the className on the containing div.

For example:
```
    containerRef.current!.className = "flexlayout__theme_alpha_dark"
```

## Customizing Tabs

You can use the `<Layout>` prop `onRenderTab` to customize tab rendering:

<img src="screenshots/Screenshot_customize_tab.png?raw=true" alt="FlexLayout Tab structure" title="Tab structure"/>

Update the `renderValues` parameter as needed:

`renderValues.leading`: The area shown in red.

`renderValues.content`: The area shown in green.

`renderValues.buttons`: The area shown in yellow.

For example:

```
onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
    // renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
    // renderValues.content += " *";
    renderValues.buttons.push(<img key="menu" style={{width:"1em", height:"1em"}} src="images/menu.svg"/>);
}
```

## Customizing Tabsets

You can use the `<Layout>` prop `onRenderTabSet` to customize tabset rendering:

<img src="screenshots/Screenshot_customize_tabset.png?raw=true" alt="FlexLayout Tab structure" title="Tabset structure" />

Update the `renderValues` parameter as needed:

`renderValues.leading`: The area shown in blue.

`renderValues.stickyButtons`: The area shown in red.

`renderValues.buttons`: The area shown in green.


For example:

```
onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
    renderValues.stickyButtons.push(
        <button
            key="Add"
            title="Add"
            className="flexlayout__tab_toolbar_button"
            onClick={() => {
                model.doAction(Actions.addTab({
                    component: "placeholder",
                    name: "Added " + nextAddIndex.current++
                }, node.getId(), DockLocation.CENTER, -1, true));
            }}
        ><AddIcon/></button>);

    renderValues.buttons.push(<img key="menu" style={{width:"1em", height:"1em"}} src="images/menu.svg"/>);
}
```

## Customizing Icons

The built-in icons (close, pin, maximize/restore, popout, float, overflow, etc.) can be replaced via the `icons` layout prop. Each entry of the `IIcons` object is either a React node or a function receiving the relevant node and returning one:

```tsx
<Layout
    model={model}
    factory={factory}
    icons={{
        close: <MyCloseIcon />,
        // functions receive the node, so the icon can depend on its state;
        // 'more' also receives the hidden tabs, e.g. to show a count
        more: (node, hiddenTabs) => <div>{hiddenTabs.length}</div>,
    }}
/>
```

The default icons are also exported (`CloseIcon`, `PinIcon`, `MaximizeIcon`, ...) for reuse in your own toolbars and menus. Icons are decorative to assistive technology (the buttons carry their own accessible names), so custom icons do not need alt text.

## Localization

All built-in text (button tooltips and the labels announced to assistive technology) is routed through the `i18nMapper` layout prop. It receives an `I18nLabel` enum value and returns the translated string, or `undefined` to use the default English text (the enum values are the defaults):

```tsx
import { I18nLabel } from "flexlayout-react";

<Layout
    model={model}
    factory={factory}
    i18nMapper={(id, param) => {
        switch (id) {
            case I18nLabel.Close_Tab: return "Schließen";
            case I18nLabel.Move_Tabs: return "? Tabs verschieben"; // "?" is replaced with the tab count
            default: return undefined; // use the default text
        }
    }}
/>
```

Tab names, help text and menu items are application content and are localized by the application. The `lang` and `dir` attributes of the page are copied to popout window documents automatically.

## Model Actions

Once the model JSON has been loaded, all changes are applied through actions. In the Demo app, you can view these actions in the 'Action Log':

<img src="screenshots/Screenshot_action_log.png?raw=true" alt="Action Log" title="Action Log" />

Apply actions using the `model.doAction()` method. This method takes a single argument created by one of the action generators (accessible via `FlexLayout.Actions.<actionName>`):

[Actions Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/classes/Actions.html)

### Example

```js
model.doAction(FlexLayout.Actions.addTab(
    {type:"tab", component:"grid", name:"a grid", id:"5"},
    "1", FlexLayout.DockLocation.CENTER, 0));
```

This example adds a new grid component to the center of the tabset with ID "1" at the first position (0). Use `-1` to add to the end of the tabs.

Note: You can retrieve the ID of a node (e.g., the node returned by the `addTab` action) using `node.getId()`. If an ID wasn't assigned when the node was created, one will be generated for you in the form `#<uuid>` (e.g., `#0c459064-8dee-444e-8636-eb9ab910fb27`).

Note: You can intercept actions resulting from GUI changes before they are applied by implementing the `onAction` callback property of the `Layout`.

## Optional Layout Props

Many optional properties can be applied to the layout:

[Layout Properties Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/interfaces/ILayoutProps.html)


## JSON Model Definition

The JSON model is defined as a set of TypeScript interfaces. See the documentation for details on allowed attributes:

[Model Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/interfaces/IJsonModel.html)

[Global Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/interfaces/IGlobalAttributes.html)

[Row Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/interfaces/IJsonRowNode.html)

[Tabset Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/interfaces/IJsonTabSetNode.html)

Note: Tabsets are dynamically created as tabs are moved and deleted when their last tab is removed (unless `enableDeleteWhenEmpty` is set to `false`).

[Tab Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/interfaces/ITabAttributes.html)

[Border Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/interfaces/IJsonBorderNode.html)




## Layout API Methods to Create New Tabs

The Layout Ref provides methods for adding tabs:

[Layout Methods Documentation](https://caplin.github.io/FlexLayout/demos/v0.10/typedoc/interfaces/ILayoutApi.html)

Example:

```javascript
layoutRef.current.addTabToTabSet("NAVIGATION", { type: "tab", component: "grid", name: "a grid" });
```
This adds a new grid component to the tabset with ID "NAVIGATION". (where `layoutRef` is a React ref to the `Layout` element; see [React Refs](https://reactjs.org/docs/refs-and-the-dom.html)).


## Tab Node Events

You can handle node events by adding a listener, typically within a component's `useEffect` hook:

Example:
```javascript
function MyComponent({ node }) {
  useEffect(() => {
    const listenerId = node.setEventListener("save", () => {
      node.getConfig().subject = subject;
    });
    return () => node.removeEventListener(listenerId);
  }, [subject]);
}
```

| Event      | Parameters | Description |
| ---------- | ---------- | ----------- |
| resize     | `{rect}`   | Called during layout when the tab's size changes, after its panel has been positioned to the new `rect` and before the browser paints. Geometry is applied imperatively, so a resize does not re-render the tab content — listen for this event if a component needs to react to size changes. |
| close      | None       | Called when the tab is closed. |
| visibility | `{visible}`| Called when the tab's visibility changes (during layout, before paint). |
| save       | None       | Called before a `TabNode` is serialized to JSON. Use this to save node configuration by adding data to the object returned by `node.getConfig()`. |

## Popout Windows

Tabs can be rendered into external browser windows (useful for multi-monitor setups) by using the `enablePopout` and `enablePopoutIcon` attributes. When enabled, a popout icon appears in the tab header.

Popout windows require an additional HTML page, `popout.html`, hosted at the same location as the main page (you can copy this from the demo app). The `popout.html` acts as the host for the popped-out tab, and the main page's styles are copied into it at runtime.

Because popout windows render into a different document, any code using global `document` or `window` objects (e.g., for event listeners) will not function correctly. Instead, you must use the `document` or `window` of the popout. To obtain these, use the following methods on an element rendered within the popout (such as a ref):

```javascript
const currentDocument = selfRef.current.ownerDocument;
const currentWindow = currentDocument.defaultView!;
```
In this example, `selfRef` is a React ref to the top-level element in the tab being rendered.

Note: Libraries may support popout windows by allowing you to specify the document to use; for example, see the `getDocument()` callback in ag-Grid at https://www.ag-grid.com/javascript-grid-callbacks/

### Limitations of Popout Windows

Note this section only applies to window based popouts, not floating panels.

* **React Portals**: FlexLayout uses React Portals for popout content. Code runs in the main window's JS context, effectively extending the rendering area.
* **Event Listeners**: You must use the popout's window/document when adding listeners (e.g., `popoutDocument.addEventListener(...)`).
* **Timer Throttling**: Timers may throttle when the main window is in the background. Use web workers for high-precision timing if needed.
* **Third-Party Libraries**: Controls that rely on the global `document` for event listeners or visibility tracking may require modification.
* **Resize Observers**: May stay attached to the main window; alternative resize handling might be necessary.
* **Browser Zoom**: Popouts may not size or position correctly when the browser is zoomed (e.g., at 50% zoom).
* **States**: Popouts cannot reload in maximized or minimized states.
* **State Preservation**: While FlexLayout maintains React state when moving tabs between windows, you can use the `enableWindowReMount` attribute to force a component to re-mount.

See this article about using React portals in this way: https://dev.to/noriste/the-challenges-of-rendering-an-openlayers-map-in-a-popup-through-react-2elh

### Popout Windows in Secure Environments

Deployments with strict security headers need the following for popout windows to work:

* **Same origin**: `popout.html` must be served from the same origin as the main page. The popout document runs no scripts of its own; it is driven entirely by the main window's JavaScript, which requires script access to the popout document.
* **Content Security Policy (style-src)**: the main page's stylesheets are copied into the popout document at runtime. `<link rel="stylesheet">` elements work provided their URLs are allowed by the `style-src` of the response serving `popout.html`. Inline `<style>` elements (as injected by CSS-in-JS libraries such as Emotion or styled-components, or by Vite in dev mode) are blocked by a nonce/hash based `style-src`, since the copied elements cannot carry a valid nonce for the popout document — prefer real CSS files for anything rendered in popouts.
* **Cross-origin isolation (COOP/COEP)**: if the main page is served with `Cross-Origin-Opener-Policy`/`Cross-Origin-Embedder-Policy` headers (e.g. for `SharedArrayBuffer`), `popout.html` must be served with compatible headers, otherwise the browser severs the connection between the windows and popouts cannot function. Set the `supportsPopout` prop to `false` to disable popouts explicitly where they cannot be supported.
* **Popup blockers and sandboxed frames**: if `window.open` is blocked (popup blocker, or a sandboxed iframe without `allow-popups`) the popout degrades gracefully to a floating panel. Note that when a saved layout containing popouts is restored on page load, the `window.open` happens without a user gesture and is typically blocked — the popouts become floating panels unless the user has allowed popups for the site.
* **Trusted Types**: the library uses no HTML string injection sinks and is compatible with `require-trusted-types-for 'script'`.
* **Multi-monitor placement**: without the Window Management permission, browsers clamp popup window coordinates to the display of the main window, so a popout saved on a second monitor will restore on the main window's display. Popout positions are saved in the main window's CSS pixels and will scale if the browser zoom changes between sessions.

## Accessibility

FlexLayout has keyboard operability, ARIA semantics and visible focus styling built in.

### ARIA roles

* Tabs follow the [WAI-ARIA Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): the tab strip is a `tablist`, each tab button is a `tab` with `aria-selected`, and each tab's content area is a `tabpanel` labelled by its tab (`aria-labelledby`).
* Splitters are exposed as `separator` elements with `aria-orientation` and `aria-valuenow`/`aria-valuemin`/`aria-valuemax`.
* The tab overflow menu (and the reusable popup menu below) use `role="menu"`/`role="menuitem"`; the button that opens the overflow menu advertises `aria-haspopup` and `aria-expanded`.
* Decorative icons are hidden from assistive technology with `aria-hidden`.
* Tabs carry explicit accessible names (including pinned state), advertise their keyboard shortcuts via `aria-keyshortcuts`, and toggle buttons expose their state via `aria-pressed`.

### Keyboard operation

| Context | Keys | Action                                                                         |
| --- | --- |--------------------------------------------------------------------------------|
| Tabs | Arrow keys | Move focus between tabs in a tabset                                            |
| Tabs | Enter / Space | Select the focused tab                                                         |
| Tabs | Ctrl+Delete (default, rebindable) | Close the focused tab (when it is closeable)                                   |
| Tabs | F2 (default, rebindable) | Rename the focused tab (when it is renameable)                                 |
| Tabs | `focusTabToggle` binding (off by default) | Toggle focus between the selected tab button and its content                   |
| Layout | `focusNextTabset` / `focusPreviousTabset` bindings (off by default) | Move focus to the next / previous tabset, mapped to Ctrl+[, Ctrl+] in the demo |
| Splitters | Arrow keys | Resize                                                                         |
| Overlay borders | Escape (default, rebindable) | Close the open overlay panel (focus returns to the border tab)                 |
| Menus | Arrow keys, Home / End, type a letter | Move between items                                                             |
| Menus | Enter / Space | Activate the focused item                                                      |
| Menus | Escape / Tab | Close and return focus to the trigger                                          |

### Configurable shortcuts (the `keyMap` prop)

The command shortcuts above are configured through the `keyMap` layout prop. Bindings are merged over the exported `defaultKeyMap`, and passing an explicit `undefined` for a binding disables that shortcut (WCAG 2.1.4 requires shortcuts to be remappable or off):

```tsx
<Layout
    model={model}
    factory={factory}
    keyMap={{ focusTabToggle: "F6", focusNextTabset: "Ctrl+]", focusPreviousTabset: "Ctrl+[" }}
/>
```

* A binding is a `KeyboardEvent.key` name, optionally prefixed with the modifiers Ctrl, Shift, Alt or Meta joined with `+` — e.g. `"F2"`, `"Escape"`, `"Ctrl+Delete"`, `"Ctrl+]"`. Prefer function keys or modifier combinations: WCAG 2.1.4 requires single printable-character shortcuts to be remappable or off by default.
* The configured bindings are advertised to assistive technology via `aria-keyshortcuts` (on the tab buttons, tab panels and tablists), so the advertised shortcuts always match the configured ones.
* `defaultKeyMap` is exported so an application can display the bindings (e.g. in a keyboard-help dialog) or register them with its own shortcut manager.
* The structural keys of the ARIA widget patterns (arrow keys within a tablist, Enter/Space activation, menu navigation, splitter arrows) are fixed and not remappable — assistive technology announces these from the widget roles themselves.
* Pressing Enter on an already selected tab also moves focus into its content (in addition to the optional `focusTabToggle` binding).

### Focus styling

The bundled themes draw a visible focus outline driven by the `--color-focus` CSS variable. Override it (alongside the other theme CSS variables) to match your design system.

### Reusable menu for application context menus

The accessible menu control used for tab overflow is also exported for your own context menus, so they get the same keyboard and ARIA behaviour. It has no dependency on the layout model and can be used declaratively (`<PopupMenu>`) or imperatively (`showPopupMenu(...)`, e.g. from the `onContextMenu` layout prop).

## Testing Your Layout

Every element the library renders carries a `data-layout-path` attribute describing its position in the layout tree — a stable selector for end-to-end tests (FlexLayout's own Playwright suite is built on it; see `tests-playwright/helpers.ts` for ready-made helper functions):

| Path | Element |
| --- | --- |
| `/r<n>` / `/ts<n>` | Row / tabset (`n` is the index within the parent), nested as in the model, e.g. `/r1/ts0` |
| `/border/<location>` | Border strip (`top`, `bottom`, `left`, `right`) |
| `.../tb<n>` | Tab button `n` within a tabset or border path |
| `.../t<n>` | Tab panel `n` within a tabset or border path |
| `.../tabstrip` | A tabset's tab strip |
| `.../s<n>` | Splitter after child `n` of a row (e.g. `/s0`), or a border's splitter |
| `.../button/<name>` | Toolbar buttons: `max`, `overflow`, `close`, `popout`, `float`, `pin` |
| `.../textbox` | The inline rename textbox |
| `/popup-menu` | The overflow/popup menu |

```ts
// playwright example: select the second tab of the first tabset, check a border panel opened
await page.locator('[data-layout-path="/ts0/tb1"]').click();
await expect(page.locator('[data-layout-path="/border/left/t0"]')).toBeVisible();
```

Note the paths describe the current structure, so indices shift when tabs and tabsets move — target stable states, or use node ids via the model for highly dynamic layouts.

## Running the Demo and Building the Project

First, install the dependencies:

```
pnpm install
```

Run the demo app:

```
pnpm dev
```

The `pnpm dev` command watches for changes in both FlexLayout and the Demo app, allowing you to see updates in your browser immediately.

Run the playwright tests interactively using:

```bash
pnpm playwright
```

<img src="screenshots/PlaywrightUI.png?raw=true" alt="PlaywrightUI" title="PlaywrightUI screenshot"/>

To build the npm distribution, run `pnpm build`.
