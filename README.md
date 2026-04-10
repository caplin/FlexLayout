# FlexLayout

[![GitHub](https://img.shields.io/github/license/Caplin/FlexLayout)](https://github.com/caplin/FlexLayout/blob/master/LICENSE)
![npm](https://img.shields.io/npm/dw/flexlayout-react)
[![npm](https://img.shields.io/npm/v/flexlayout-react)](https://www.npmjs.com/package/flexlayout-react)

FlexLayout is a layout manager for React that arranges components in multiple tabsets. Tabs can be resized, moved, and organized into complex layouts.

![FlexLayout Demo Screenshot](screenshots/Screenshot_v0.9.png?raw=true "FlexLayout Demo Screenshot")

[Run the Demo](https://caplin.github.io/FlexLayout/demos/v0.9/demo/index.html)

Try it now using [CodeSandbox](https://codesandbox.io/p/sandbox/yvjzqf)

[API Doc](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/index.html)

FlexLayout's only dependency is React.

Features:
* Splitters for resizing
* Tabs (scrolling or wrapped)
* Tab dragging and ordering
* Tabset dragging (move all tabs in a tabset in one operation)
* Docking to tabsets or edges of the frame
* Maximizing tabsets (double-click tabset header or use icon)
* Tab overflow (menu for hidden tabs, mouse wheel scrolling)
* Border tabsets
* Popout tabs into floating panels or new browser windows
* Submodels (layouts inside layouts)
* Tab renaming (double-click tab text)
* Theming (light, dark, underline, etc., and combined)
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

NOTE: The easiest way to create your initial layout JSON is to use the [demo](https://caplin.github.io/FlexLayout/demos/v0.9/demo/index.html) app. Modify an existing layout by dragging, dropping, and adding nodes, then press the 'print' button to print the JSON to the browser's developer console.

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

<img src="screenshots/Screenshot_customize_tab.png?raw=true"
     alt="FlexLayout Tab structure"
     title="Tab structure"/>

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

<img src="screenshots/Screenshot_customize_tabset.png?raw=true"
     alt="FlexLayout Tab structure"
     title="Tabset structure" />

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
                model.doAction(Actions.addNode({
                    component: "placeholder",
                    name: "Added " + nextAddIndex.current++
                }, node.getId(), DockLocation.CENTER, -1, true));
            }}
        ><AddIcon/></button>);

    renderValues.buttons.push(<img key="menu" style={{width:"1em", height:"1em"}} src="images/menu.svg"/>);
}
```

## Model Actions

Once the model JSON has been loaded, all changes are applied through actions. In the Demo app, you can view these actions in the 'Action Log':

<img src="screenshots/Screenshot_action_log.png?raw=true"
     alt="Action Log"
     title="Action Log" />

Apply actions using the `model.doAction()` method. This method takes a single argument created by one of the action generators (accessible via `FlexLayout.Actions.<actionName>`):

[Actions Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/classes/Actions.html)

### Example

```js
model.doAction(FlexLayout.Actions.addNode(
    {type:"tab", component:"grid", name:"a grid", id:"5"},
    "1", FlexLayout.DockLocation.CENTER, 0));
```

This example adds a new grid component to the center of the tabset with ID "1" at the first position (0). Use `-1` to add to the end of the tabs.

Note: You can retrieve the ID of a node (e.g., the node returned by the `addNode` action) using `node.getId()`. If an ID wasn't assigned when the node was created, one will be generated for you in the form `#<uuid>` (e.g., `#0c459064-8dee-444e-8636-eb9ab910fb27`).

Note: You can intercept actions resulting from GUI changes before they are applied by implementing the `onAction` callback property of the `Layout`.

## Optional Layout Props

Many optional properties can be applied to the layout:

[Layout Properties Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/interfaces/ILayoutProps.html)


## JSON Model Definition

The JSON model is defined as a set of TypeScript interfaces. See the documentation for details on allowed attributes:

[Model Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/interfaces/IJsonModel.html)

[Global Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/interfaces/IGlobalAttributes.html)

[Row Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/interfaces/IJsonRowNode.html)

[Tabset Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/interfaces/IJsonTabSetNode.html)

Note: Tabsets are dynamically created as tabs are moved and deleted when their last tab is removed (unless `enableDeleteWhenEmpty` is set to `false`).

[Tab Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/interfaces/IJsonTabNode.html)

[Border Attributes Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/interfaces/IJsonBorderNode.html)




## Layout API Methods to Create New Tabs

The Layout Ref provides methods for adding tabs:

[Layout Methods Documentation](https://caplin.github.io/FlexLayout/demos/v0.9/typedoc/interfaces/ILayoutApi.html)

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
| resize     | `{rect}`   | Called when the tab is resized during layout, before it is rendered with the new size. |
| close      | None       | Called when the tab is closed. |
| visibility | `{visible}`| Called when the tab's visibility changes. |
| save       | None       | Called before a `TabNode` is serialized to JSON. Use this to save node configuration by adding data to the object returned by `node.getConfig()`. |

## Popout Windows

Tabs can be rendered into external browser windows (useful for multi-monitor setups) by using the `enablePopout` attribute. When enabled, a popout icon appears in the tab header.

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

Once the demo is running, you can execute the Playwright tests in a separate terminal window:

```bash
pnpm playwright
```

<img src="screenshots/PlaywrightUI.png?raw=true" alt="PlaywrightUI" title="PlaywrightUI screenshot"/>

To build the npm distribution, run `pnpm build`.

## Alternative Layout Managers

| Name | Repository |
| ------------- |:-------------|
| rc-dock | https://github.com/ticlo/rc-dock |
| Dockview | https://dockview.dev/ |
| lumino | https://github.com/jupyterlab/lumino |
| golden-layout | https://github.com/golden-layout/golden-layout |
| react-mosaic | https://github.com/nomcopter/react-mosaic |
