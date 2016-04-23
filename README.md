# FlexLayout

FlexLayout is a React layout manager that arranges panels in multiple tab sets, these can be
resized and moved, much like the windowing system found in many IDE's.

![FlexLayout Demo Screenshot](/../screenshots/github_images/v0.01/tab_overflow_menu.png?raw=true "FlexLayout Demo Screenshot")

[More screenshots](https://rawgit.com/caplin/FlexLayout/screenshots/github_images/v0.01/images.html)

[Demo (light theme)](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.03/index.html)

[Demo (dark theme)](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.03/index_dark.html)


Available demo url parameters:

*	reload=true  - reload layout from file, rather than localstorage
*	layout=sub   - load a given layout (from file/localstorage)


Possible layout values:
 
*	simple - a simple layout of 3 tabsets
*	complex - a more complex layout with multiple tabsets
*	preferred - shows tabsets with preferred sizes
*	sub - shows a tab containing a sub layout

Example url with parameters:

https://rawgit.com/caplin/FlexLayout/demos/demos/v0.03/index.html?layout=simple&reload=true

Notes:
 
*	this demo does not run in safari when hosted on github (something to do with loading files via XHR from github!)
*	the demo js file is large because it is unminified.
*	FlexLayout's only dependency is React

Features so far:
*	splitters
*	tabs
*	tab dragging and ordering
*	tabset dragging
*	dock to tabset or edge
*	maximize tabset
*	tab overflow
*	submodels, allow layouts inside layouts
*	tab renaming
*	themeing - light and dark
*	lifecycle events
*	touch events - works on mobile devices (iPad, Android)
*   esc cancels drag
*   add tabs using drag, indirect drag, add to active tabset, add to named tabset
*   preferred pixel size tabsets
*   headed tabsets
*	tab and tabset attributes: enableHeader, enableTabStrip, enableDock, enableDrop...
*	customizable tabs and tabset header rendering


todo:
*	less styling
*	more lifecycle events... beforeclose...
*	full set of jasmine tests
*	test in browsers/versions
*	layout designer gui, drag and drop + set properties to design initial layout
*	border dock layer (could be used for minimize to edge)

## Installation

FlexLayout is in the npm repository. Simply install React and FlexLayout from npm:

```
npm install react --save
npm install react-dom --save
npm install flexlayout --save
```

From there, require React and FlexLayout in your modules:

```
var React = require("react");
var ReactDOM = require("react-dom");
var FlexLayout = require("flexlayout");
var Layout = FlexLayout.Layout;
var Model = FlexLayout.Model;
```

##Usage

A single component `<Layout>` contains the tabsets and splitters. The `<Layout>` component takes the following props:


| Prop       | Required/Optional           | Description  |
| ------------- |:-------------:| -----|
| model    | required | the layout model (a tree of Nodes) |
| factory      | required | a factory function for creating React components |
| onAction | optional     |  function called whenever the layout generates an action to update the model |
| onTabRender | optional     |  function called when rendering a tab, allows leading (icon) and content sections to be customized |
| onTabSetRender | optional     |  function called when rendering a tabset, allows header and buttons to be customized |

The model is tree of Node objects that define the structure of the layout. The model is created using the Model.fromJson(jsonObject) static method, and can be saved using the model.toJson() method.

The factory is a function that takes a Node object and returns a React component that should be hosted by a tab in the layout. 

If the onAction prop is not specified then the layout will send the layout change action directly to the model.

## Example Json Configuration:

```javascript
var json = {
	global: {},
	layout:{ 
		"type": "row",
		"weight": 100,
		"children": [
			{
				"type": "tabset",
				"weight": 50,
				"selected": 0,
				"children": [
					{
						"type": "tab",
						"name": "FX",
						"component":"grid",
					}
				]
			},
			{
				"type": "tabset",
				"weight": 50,
				"selected": 0,
				"children": [
					{
						"type": "tab",
						"name": "FI",
						"component":"grid",
					}
				]
			}
		]
	}
};
```

## Example Code

```
var React = require("react");
var ReactDOM = require("react-dom");
var FlexLayout = require("FlexLayout");
var Layout = FlexLayout.Layout;
var Model = FlexLayout.Model;

var model = Model.fromJson(json);

factory(node)
{
    var component = node.getComponent();
	if (component == "grid")
    {
			return <MyGrid node={node}/>
    }
}

render()
{
	<Layout model={model} factory={factory}/> 
}
```		


The above code would render two tabsets horizontally each containing a single tab that hosts a grid component. The tabs could be moved and resized by dragging and dropping. Additional grids could be added to the layout by sending actions to the model.

The JSON model is built up using 3 types of 'node':

* row - rows contains a list of tabsets and child rows, the top level row will render horizontally, child rows will render in the opposite orientation to their parent.

* tabset - tabsets contain a list of tabs and the index of the selected tab

* tab - tabs specify the name of the component that they should host (that will be loaded via the factory) and the text of the actual tab.

Weights on rows and tabsets specify the relative weight of these nodes within the parent row, the actual values do not matter just their relative values (ie two tabsets of weights 30,70 would render the same if they had weights of 3,7).


## Global Config attributes

Attributes allowed in the 'global' element


| Attribute | Default | Description  |
| ------------- |:-------------:| -----|
| splitterSize | 8 | |
| enableEdgeDock | true | |
| tabEnableClose | true | |
| tabEnableDrag | true | |
| tabEnableRename | true | |
| tabClassName | null | |
| tabIcon | null | |
| tabSetEnableClose | true | |
| tabSetEnableDrop | true | |
| tabSetEnableDrag | true | |
| tabSetEnableDivide | true | |
| tabSetEnableMaximize | true | |
| tabSetClassNameTabStrip | null | |
| tabSetClassNameHeader | null | |
| tabSetEnableTabStrip | true | |
| tabSetHeaderHeight | 20 | |
| tabSetTabStripHeight | 20 | |

## Row Attributes

Attributes allowed in nodes of type 'row'.

| Attribute | Default | Description  |
| ------------- |:-------------:| -----|
| type | row | |
| weight | 100 | |
| width | null | |
| height | null | |
| children | *required* | a list of row and tabset nodes |

## Tab Attributes

Attributes allowed in nodes of type 'tab'.

Inherited defaults will take their value from the associated global attributes (see above).


| Attribute | Default | Description  |
| ------------- |:-------------:| -----|
| type | tab | |
| name | *required* | |
| component | *required* | |
| config | null | |
| id | null | |
| enableClose | *inherited* | |
| enableDrag | *inherited* | |
| enableRename | *inherited* | |
| className | *inherited* | |
| icon | *inherited* | |

## TabSet Attributes

Attributes allowed in nodes of type 'tabset'.

Inherited defaults will take their value from the associated global attributes (see above).

| Attribute | Default | Description  |
| ------------- |:-------------:| -----|
| type | tabset | |
| weight | 100 | |
| width | null | |
| height | null | |
| name | null | |
| selected | 0 | |
| maximized | false | |
| id | null | |
| children | *required* | a list of tab nodes |
| enableClose | *inherited* | |
| enableDrop | *inherited* | |
| enableDrag | *inherited* | |
| enableDivide | *inherited* | |
| enableMaximize | *inherited* | |
| classNameTabStrip | *inherited* | |
| classNameHeader | *inherited* | |
| enableTabStrip | *inherited* | |
| headerHeight | *inherited* | |
| tabStripHeight | *inherited* | |


## Model Actions

The Model accepts a set of actions via its doAction() method.

#Example

```
        this.props.model.doAction(Actions.updateModelAttributes({
            splitterSize:40,
            tabSetHeaderHeight:40,
            tabSetTabStripHeight:400
        }));
```

| Action Creator | Description  |
| ------------- | -----|
|	Actions.addNode(newNode, toNode, location, index) | add a new tab node to the given tabset node  |
|	Actions.moveNode(fromNode, toNode, location, index) | move a tab node from its current location to the new node and location |
|	Actions.deleteTab(tabNode) | delete the given node |
|	Actions.renameTab(tabNode, text) | rename the given tab node |
|	Actions.selectTab(tabNode) | select the given tab |
|	Actions.setActiveTabset(tabsetNode) | set the tabset as the active tabset |
|	Actions.setRect(rect) | update the layout rectangle (causes a relayout in the new rectangle) |
|	Actions.adjustSplit(splitterNode, value) | adjust the size of the given splitter |
|	Actions.maximizeToggle(node) | toggles whether the current node is maximized |
|	Actions.updateModelAttributes(attributes) | updates the global attributes |
|	Actions.updateNodeAttributes(node, attributes) | updates the attributes of the given node |

##Layout Component Methods to Create New Tabs

Methods on the Layout Component for adding tabs, the tabs are specified by their layout json.

Example:

```
this.refs.layout.addTabToTabSet("NAVIGATION", {component:"grid", name:"grid"});
```

| Layout Method | Description  |
| ------------- | -----|
| addTabToTabSet(tabsetId, json) | adds a new tab to the tabset with the given Id |
| addTabToActiveTabSet(json) | adds a new tab to the active tabset |
| addTabWithDragAndDrop(dragText, json, onDrop) | adds a new tab by dragging a marker to the required location, the drag starts immediately |
| addTabWithDragAndDropIndirect(dragText, json, onDrop) | adds a new tab by dragging a marker to the required location, the marker is shown and must be clicked on to start dragging |
