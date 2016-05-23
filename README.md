# FlexLayout

FlexLayout is a layout manager that arranges React components in multiple tab sets, these can be
resized and moved.

![FlexLayout Demo Screenshot](/../screenshots/github_images/v0.01/tab_overflow_menu.png?raw=true "FlexLayout Demo Screenshot")

Try it now using [JSFiddle](https://jsfiddle.net/ndanger61/rmf3hzmf/) or [Plunker](http://plnkr.co/edit/uk8nT3?p=preview)

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
*	touch events - works on mobile devices (iPad, Android)
*   esc cancels drag
*   add tabs using drag, indirect drag, add to active tabset, add to named tabset
*   preferred pixel size tabsets
*   headed tabsets
*	tab and tabset attributes: enableHeader, enableTabStrip, enableDock, enableDrop...
*	customizable tabs and tabset header rendering


todo:
*	full set of jasmine tests
*	less styling
*	test in browsers/versions
*	layout designer gui, drag and drop + set properties to design initial layout
*	border dock layer (could be used for minimize to edge)

## Installation

FlexLayout is in the npm repository. Simply install React and FlexLayout from npm:

```
npm install react --save
npm install react-dom --save
npm install flexlayout-react --save
```

Import React and FlexLayout in your modules:

```
import React from "react";
import ReactDOM from "react-dom";
import FlexLayout from "flexlayout-react";
```

Include the light or dark style in your html:

```
<link rel="stylesheet" href="node_modules/flexLayout-react/style/dark.css" />
```

##Usage

A single component `<Layout>` contains the tabsets and splitters. The `<Layout>` component takes the following props:


| Prop       | Required/Optional           | Description  |
| ------------- |:-------------:| -----|
| model    | required | the layout model (a Model object) or a json object |
| factory      | required | a factory function for creating React components |
| onAction | optional     |  function called whenever the layout generates an action to update the model |
| onTabRender | optional     |  function called when rendering a tab, allows leading (icon) and content sections to be customized |
| onTabSetRender | optional     |  function called when rendering a tabset, allows header and buttons to be customized |

The model is tree of Node objects that define the structure of the layout.

The factory is a function that takes a Node object and returns a React component that should be hosted by a tab in the layout.

### Using a Model object in the model prop
The model can be created using the Model.fromJson(jsonObject) static method, and can be saved using the model.toJson() method.

If the onAction prop is not specified then the layout will send the layout change action directly to the model.

```javascript
this.state = {model: Model.fromJson(json)};

render() {
	<Layout model={this.state.model} factory={factory}/>
}
```

### Using a JSON object in the model prop

Alternatively you can pass json in the model prop, in this case you must also add an onAction callback to
handle changes by calling Model.apply(json, action) to create a new json object.

```javascript
onAction(action) {
    this.setState(json: FlexLayout.Model.apply(action, this.state.json));
}

render() {
	return <FlexLayout.Layout model={this.state.json} factory={factory} onAction={onAction}/>;
}
```

This variation works well with Redux where you can use Model.apply(action, layoutState) in your reducer to return a new layout json object.
See the Redux example for more details.

## Example Configuration:

```javascript
var json = {
	global: {},
	layout:{
		"type": "row",
		"id":1,
		"weight": 100,
		"children": [
			{
				"type": "tabset",
				"id":2,
				"weight": 50,
				"selected": 0,
				"children": [
					{
						"type": "tab",
						"id":3,
						"name": "FX",
						"component":"grid",
					}
				]
			},
			{
				"type": "tabset",
				"id":4,
				"weight": 50,
				"selected": 0,
				"children": [
					{
						"type": "tab",
						"id":5,
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
import React from "react";
import ReactDOM from "react-dom";
import FlexLayout from "flexlayout-react";

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {model: FlexLayout.Model.fromJson(json)};
    }

    factory(node) {
        var component = node.getComponent();
        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
    }

    render() {
        return (
            <FlexLayout.Layout model={this.state.model} factory={this.factory.bind(this)}/>
        )
    }
}

ReactDOM.render(<Main/>, document.getElementById("container"));
```		
(See the examples for full source code)

The above code would render two tabsets horizontally each containing a single tab that hosts a button component. The tabs could be moved and resized by dragging and dropping. Additional grids could be added to the layout by sending actions to the model.

Try it now using [JSFiddle](https://jsfiddle.net/ndanger61/rmf3hzmf/) or [Plunker](http://plnkr.co/edit/uk8nT3?p=preview)


The JSON model is built up using 3 types of 'node':

* row - rows contains a list of tabsets and child rows, the top level row will render horizontally, child rows will render in the opposite orientation to their parent.

* tabset - tabsets contain a list of tabs and the index of the selected tab

* tab - tabs specify the name of the component that they should host (that will be loaded via the factory) and the text of the actual tab.

Weights on rows and tabsets specify the relative weight of these nodes within the parent row, the actual values do not matter just their relative values (ie two tabsets of weights 30,70 would render the same if they had weights of 3,7).

By changing global or node attributes you can change the layout appearance and functionallity, for example:

Setting tabSetEnableTabStrip:false in the global options would change the layout into a multi-splitter (without
tabs or drag and drop).

```
 global: {tabSetEnableTabStrip:false},
```

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
        model.doAction(Actions.updateModelAttributes({
            splitterSize:40,
            tabSetHeaderHeight:40,
            tabSetTabStripHeight:40
        }));
```

The above example would increase the size of the splitters, tabset headers and tabs, this could be used to make
adjusting the layout easier on a small device.


| Action Creator | Description  |
| ------------- | -----|
|	Actions.addNode(newNodeJson, toNodeId, location, index) | add a new tab node to the given tabset node  |
|	Actions.moveNode(fromNodeId, toNodeId, location, index) | move a tab node from its current location to the new node and location |
|	Actions.deleteTab(tabNodeId) | delete the given node |
|	Actions.selectTab(tabNodeId) | select the given tab |
|	Actions.setActiveTabset(tabsetNodeId) | set the tabset as the active tabset |
|	Actions.adjustSplit(splitterNodeId, value) | adjust the size of the given splitter |
|	Actions.maximizeToggle(tabsetNodeId) | toggles whether the given tabset node is maximized |
|	Actions.updateModelAttributes(attributes) | updates the global attributes |
|	Actions.updateNodeAttributes(nodeId, attributes) | updates the attributes of the given node |

for example:

```
model.doAction(Actions.addNode({component:"grid", name:"grid", id:"5"}, "1", DropLocation.CENTER, 0));
```
This would add a new grid component to the center of tabset with id "1" and at the 0'th tab position (use value -1 to add to the end of the tabs).
Note: you can get the id of a node using the method node.getId(), if an id wasn't assigned when the node was created then one will be created for you of the form #<next available id> (e.g. #1, #2 ...).


##Layout Component Methods to Create New Tabs

Methods on the Layout Component for adding tabs, the tabs are specified by their layout json.

Example:

```
this.refs.layout.addTabToTabSet("NAVIGATION", {component:"grid", name:"grid"});
```
This would add a new grid component to the tabset with id "NAVIGATION".


| Layout Method | Description  |
| ------------- | -----|
| addTabToTabSet(tabsetId, json) | adds a new tab to the tabset with the given Id |
| addTabToActiveTabSet(json) | adds a new tab to the active tabset |
| addTabWithDragAndDrop(dragText, json, onDrop) | adds a new tab by dragging a marker to the required location, the drag starts immediately |
| addTabWithDragAndDropIndirect(dragText, json, onDrop) | adds a new tab by dragging a marker to the required location, the marker is shown and must be clicked on to start dragging |
