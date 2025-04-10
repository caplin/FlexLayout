# FlexLayout

[![GitHub](https://img.shields.io/github/license/Caplin/FlexLayout)](https://github.com/caplin/FlexLayout/blob/master/LICENSE)
![npm](https://img.shields.io/npm/dw/flexlayout-react)
[![npm](https://img.shields.io/npm/v/flexlayout-react)](https://www.npmjs.com/package/flexlayout-react)

FlexLayout is a layout manager that arranges React components in multiple tabsets, tabs can be resized and moved.

![FlexLayout Demo Screenshot](screenshots/Screenshot_light.png?raw=true "FlexLayout Demo Screenshot")

[Run the Demo](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/demo/index.html)

Try it now using [CodeSandbox](https://codesandbox.io/p/sandbox/yvjzqf)

[API Doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/index.html)

[Screenshot of Caplin Liberator Explorer using FlexLayout](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.20/images/LiberatorExplorerV3_3.PNG)

FlexLayout's only dependency is React.

Features:
*	splitters
*	tabs (scrolling or wrapped)
*	tab dragging and ordering
*	tabset dragging (move all the tabs in a tabset in one operation)
*	dock to tabset or edge of frame
*	maximize tabset (double click tabset header or use icon)
*	tab overflow (show menu when tabs overflow, scroll tabs using mouse wheel)
*   border tabsets
*   popout tabs into new browser windows
*	submodels, allow layouts inside layouts
*	tab renaming (double click tab text to rename)
*	theming - light, dark, underline, gray, rounded and combined
*	works on mobile devices (iPad, Android)
*   add tabs using drag, add to active tabset, add to tabset by id
*	tab and tabset attributes: enableTabStrip, enableDock, enableDrop...
*	customizable tabs and tabset rendering
*   component state is preserved when tabs are moved
*   Playwright tests
*	typescript type declarations

## Installation

FlexLayout is in the npm repository. install using:

```
npm install flexlayout-react
```

Import FlexLayout in your modules:

```
import {Layout, Model} from 'flexlayout-react';
```

Include the light, dark, underline, gray, rounded or combined theme by either:

Adding an additional import:

```
import 'flexlayout-react/style/light.css';  
```

or by adding the css to your html:

```
<link rel="stylesheet" href="node_modules/flexlayout-react/style/light.css" />
```

[How to change the theme dynamically in code](#dynamically-changing-the-theme)


## Usage

The `<Layout>` component renders the tabsets and splitters, it takes the following props:


#### Required props:


| Prop            | Description       |
| --------------- | ----------------- |
| model           | the layout model  |
| factory         | a factory function for creating React components |

Additional [optional props](#optional-layout-props)

The model is tree of Node objects that define the structure of the layout.

The factory is a function that takes a Node object and returns a React component that should be hosted by a tab in the layout.

The model can be created using the Model.fromJson(jsonObject) static method, and can be saved using the model.toJson() method.

## Example Configuration:

```javascript
var json = {
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
    var component = node.getComponent();

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

The above code would render two tabsets horizontally each containing a single tab that hosts a div component (returned from the factory). The tabs could be moved and resized by dragging and dropping. Additional tabs could be added to the layout by sending actions to the model.

<img src="screenshots/Screenshot_two_tabs.png?raw=true" alt="Simple layout" title="Generated Layout"/>


Try it now using [CodeSandbox](https://codesandbox.io/p/sandbox/yvjzqf)

A simple Typescript example can be found here:

https://github.com/nealus/flexlayout-vite-example

The model json contains 4 top level elements:

* global - (optional) where global options are defined
* layout - where the main row/tabset/tabs layout hierarchy is defined
* borders - (optional) where up to 4 borders are defined ("top", "bottom", "left", "right").
* popouts - (optional) where the popout windows are defined

The layout element is built up using 3 types of 'node':

* row - rows contains a list of tabsets and child rows, the top level 'row' will render horizontally (unless the global attribute rootOrientationVertical is set)
, child 'rows' will render in the opposite orientation to their parent row.

* tabset - tabsets contain a list of tabs and the index of the selected tab

* tab - tabs specify the name of the component that they should host (that will be loaded via the factory) and the text of the actual tab.

The layout structure is defined with rows within rows that contain tabsets that themselves contain tabs.

Within the demo app you can show the layout structure by ticking the 'Show layout' checkbox, rows are shown in blue, tabsets in orange.

![FlexLayout Demo Showing Layout](screenshots/Screenshot_layout.png?raw=true "Demo showing layout")

The optional borders element is made up of border nodes

* border - borders contain a list of tabs and the index of the selected tab, they can only be used in the borders
top level element.

The tree structure for the JSON model is well defined as Typescript interfaces, see  [JSON Model](#json-model-definition)

Each type of node has a defined set of requires/optional attributes.

Weights on rows and tabsets specify the relative weight of these nodes within the parent row, the actual values do not matter just their relative values (ie two tabsets of weights 30,70 would render the same if they had weights of 3,7).

NOTE: the easiest way to create your initial layout JSON is to use the [demo](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/demo/index.html) app, modify one of the
existing layouts by dragging/dropping and adding nodes then press the 'Show Layout JSON in console' button to print the JSON to the browser developer console.

By changing global or node attributes you can change the layout appearance and functionality, for example:

Setting tabSetEnableTabStrip:false in the global options would change the layout into a multi-splitter (without
tabs or drag and drop).

```
 global: {tabSetEnableTabStrip:false},
```

## Dynamically Changing the Theme

The 'combined.css' theme contains all the other themes and can be used for theme switching.

When using combined.css, add a className (of the form "flexlayout__theme_[theme name]") to the div containing the `<Layout>` to select the applied theme.

For example: 
```
    <div ref={containerRef} className="flexlayout__theme_light">
        <Layout model={model} factory={factory} />
    </div>
```

Change the theme in code by changing the className on the containing div.

For example:
```
    containerRef.current!.className = "flexlayout__theme_dark"
```

## Customizing Tabs

You can use the `<Layout>` prop onRenderTab to customize the tab rendering:


<img src="screenshots/Screenshot_customize_tab.png?raw=true"
     alt="FlexLayout Tab structure"
     title="Tab structure"/>

Update the renderValues parameter as needed:

renderValues.leading : the red block

renderValues.content : the green block

renderValues.buttons : the yellow block

For example:

```
onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
    // renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
    // renderValues.content += " *";
    renderValues.buttons.push(<img key="menu" style={{width:"1em", height:"1em"}} src="images/menu.svg"/>);
}
```

## Customizing Tabsets

You can use the `<Layout>` prop onRenderTabSet to customize the tabset rendering:


<img src="screenshots/Screenshot_customize_tabset.png?raw=true"
     alt="FlexLayout Tab structure"
     title="Tabset structure" />

Update the renderValues parameter as needed:

renderValues.stickyButtons : the red block

renderValues.buttons : the green block


For example:

```
onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
    renderValues.stickyButtons.push(<img key="add" style={{width:"1em", height:"1em"}} src="images/add.svg"/>);

    renderValues.buttons.push(<img key="menu" style={{width:"1em", height:"1em"}} src="images/menu.svg"/>);
}
```

## Model Actions

Once the model json has been loaded all changes to the model are applied through actions.

You apply actions using the `Model.doAction()` method.

This method takes a single argument, created by one of the action
generators (accessed as `FlexLayout.Actions.<actionName>`):

[Actions doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/classes/Actions.html)

### Examples

```js
model.doAction(FlexLayout.Actions.addNode(
    {type:"tab", component:"grid", name:"a grid", id:"5"},
    "1", FlexLayout.DockLocation.CENTER, 0));
```

This example adds a new grid component to the center of tabset with id "1" and at the 0'th tab position (use value -1 to add to the end of the tabs).


```js
model.doAction(FlexLayout.Actions.updateModelAttributes({
    splitterSize:40
}));
```

The above example would increase the size of the splitters, this could be used to make
adjusting the layout easier on a small device.

Note: you can get the id of a node (e.g., the node returned by the `addNode`
action) using the method `node.getId()`.
If an id wasn't assigned when the node was created, then one will be created for you of the form `#<uuid>` (e.g. `#0c459064-8dee-444e-8636-eb9ab910fb27`).

Note: You can intercept actions resulting from GUI changes before they are applied by
implementing the `onAction` callback property of the `Layout`.

## Optional Layout Props

There are many optional properties that can be applied to the layout:

[Layout Properties doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/ILayoutProps.html)


## JSON Model Definition

The JSON model is well defined as a set of TypeScript interfaces, see the doc for details of all the attributes allowed:

## Model Config Attributes

[Model Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonModel.html)

## Global Config Attributes

[Global Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IGlobalAttributes.html)

## Row Config Attributes

[Row Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonRowNode.html)

## TabSet Config Attributes

[Tabset Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonTabSetNode.html)

Note: tabsets will be dynamically created as tabs are moved, and deleted when all their tabs are removed (unless enableDeleteWhenEmpty is false).

## Tab Config attributes

[Tab Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonTabNode.html)

## Border Config attributes

[Border Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonBorderNode.html)





## Layout Component Methods to Create New Tabs

There are methods on the Layout Component for adding tabs:

[Layout Methods doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/classes/Layout.html)

Example:

```
layoutRef.current.addTabToTabSet("NAVIGATION", {type:"tab", component:"grid", name:"a grid"});
```
This would add a new grid component to the tabset with id "NAVIGATION" (where layoutRef is a ref to the Layout element, see https://reactjs.org/docs/refs-and-the-dom.html ).



## Tab Node Events

You can handle events on nodes by adding a listener, this would typically be done
when the component is mounted in a useEffect method:

Example:
```
    function MyComponent({node}) {

      useEffect(() => {
        // save subject in flexlayout node tree
        node.setEventListener("save", () => {
             node.getConfig().subject = subject;
           };
        }, []);
    }

```

| Event        | parameters          | Description  |
| ------------- |:-------------:| -----|
| resize |  {rect}    |  called when tab is resized during layout, called before it is rendered with the new size|
| close |   none   |  called when a tab is closed |
| visibility |  {visible}    | called when the visibility of a tab changes |
| save |   none   | called before a tabnode is serialized to json, use to save node config by adding data to the object returned by node.getConfig()|

## Popout Windows

Tabs can be rendered into external browser windows (for use in multi-monitor setups)
by configuring them with the enablePopout attribute. When this attribute is present
an additional icon is shown in the tab header bar allowing the tab to be popped out
into an external window.

For popouts to work there needs to be an additional html page 'popout.html' hosted
at the same location as the main page (copy the one from examples/demo). The popout.html is the host page for the
popped out tab, the styles from the main page will be copied into it at runtime.

Because popouts are rendering into a different document to the main layout any code in the popped out
tab that uses the global document or window objects for event listeners will not work correctly (for example custom popup menus where the code uses document.addEventListener(...)),
they need to instead use the document/window of the popout. To get the document/window of the popout use the
following method on one of the elements rendered in the popout (for example a ref or target in an event handler):

```
    const currentDocument = selfRef.current.ownerDocument;
    const currentWindow = currentDocument.defaultView!;
```

In the above code selfRef is a React ref to the toplevel element in the tab being rendered.

Note: libraries may support popout windows by allowing you to specify the document to use,
for example see the getDocument() callback in agGrid at https://www.ag-grid.com/javascript-grid-callbacks/

### Limitations of Popouts
* FlexLayout uses React Portals to draw the popout window content,
    this means all the code runs in the main Window's JS context, so effectively the popout windows are just extensions of the area on which the main window can render panels.

* Your code must use the popout window/document in popout windows when adding event listeners (e.g popoutDocument.addEventListener(...)).

* Timers throttle when main window is in the background
    you could implement a webworker timer replacement if needed (which will not throttle)
* Many third party controls will use the global document for some event listeners,
    these will not work correctly without modification
* Some third party controls will suspend when the global document is hidden
    you can use the tab overlay attribute to 'gray out' these tabs when the main window is hidden
* Resize observers may be throttled (or stay attached to the main window), so you may need to use some other way to resize the component when in a popout (see aggrid component in demo).
* Popouts will not size and position correctly when the browser is zoomed (ie set to 50% zoom)
* Popouts cannot reload in maximized or minimized states
* by default flexlayout will maintain react state when moving tabs between windows, but you can use the 
enableWindowReMount tab attribute to force the component to re-mount.

See this article about using React portals in this way: https://dev.to/noriste/the-challenges-of-rendering-an-openlayers-map-in-a-popup-through-react-2elh

## Running the Examples and Building the Project

First install dependencies:

```
pnpm install
```

Compile the project and run the examples:

```
pnpm start
```

Open your browser at http://localhost:8080/examples/ to show the examples directory, click on the examples to run them.

The 'pnpm start' command will watch for changes to flexlayout and example source, so you can make changes to the code and then refresh the browser to see the result.

Once the demo is running you can run the Playwright tests by running (in another terminal window)

```
pnpm playwright
```

<img src="screenshots/PlaywrightUI.png?raw=true" alt="PlaywrightUI" title="PlaywrightUI screenshot"/>

To build the npm distribution run 'pnpm build', this will create the artifacts in the dist dir.

## Alternative Layout Managers

| Name | Repository |
| ------------- |:-------------|
| rc-dock | https://github.com/ticlo/rc-dock |
| Dockview | https://dockview.dev/ |
| lumino | https://github.com/jupyterlab/lumino |
| golden-layout | https://github.com/golden-layout/golden-layout |
| react-mosaic | https://github.com/nomcopter/react-mosaic |
