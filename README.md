# FlexLayout

FlexLayout is a layout manager that arranges React components in multiple tab sets, these can be
resized and moved.

![FlexLayout Demo Screenshot](/../screenshots/github_images/v0.01/tab_overflow_menu.png?raw=true "FlexLayout Demo Screenshot")

[Demo](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.07/demo/index.html)

Try it now using [JSFiddle](https://jsfiddle.net/ndanger61/rmf3hzmf/6/)

FlexLayout's only dependency is React.

Features:
*	splitters
*	tabs
*	tab dragging and ordering
*	tabset dragging (move all the tabs in a tabset in one operation)
*	dock to tabset or edge of frame
*	maximize tabset (double click tabset header or use icon)
*	tab overflow (show menu when tabs overflow)
*	submodels, allow layouts inside layouts
*	tab renaming (double click tab text to rename)
*	themeing - light and dark
*	touch events - works on mobile devices (iPad, Android)
*   add tabs using drag, indirect drag, add to active tabset, add to tabset by id
*   preferred pixel size tabsets
*   headed tabsets
*	tab and tabset attributes: enableHeader, enableTabStrip, enableDock, enableDrop...
*	customizable tabs and tabset header rendering
*   esc cancels drag


todo:
*	minimize to edge
*	layout designer gui, drag and drop + set properties to design initial layout

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

The `<Layout>` component renders the tabsets and splitters, it takes the following props:


| Prop       | Required/Optional           | Description  |
| ------------- |:-------------:| -----|
| model    | required | the layout model  |
| factory      | required | a factory function for creating React components |
| onAction | optional     |  function called whenever the layout generates an action to update the model (allows for intercepting actions before they are dispatched to the model, for example, asking the user to confirm a tab close) |
| onTabRender | optional     |  function called when rendering a tab, allows leading (icon) and content sections to be customized |
| onTabSetRender | optional     |  function called when rendering a tabset, allows header and buttons to be customized |

The model is tree of Node objects that define the structure of the layout.

The factory is a function that takes a Node object and returns a React component that should be hosted by a tab in the layout.

The model can be created using the Model.fromJson(jsonObject) static method, and can be saved using the model.toJson() method.

```javascript
this.state = {model: FlexLayout.Model.fromJson(json)};

render() {
	<Layout model={this.state.model} factory={factory}/>
}
```

## Example Configuration:

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

Try it now using [JSFiddle](https://jsfiddle.net/ndanger61/rmf3hzmf/6/) 


The model is built up using 3 types of 'node':

* row - rows contains a list of tabsets and child rows, the top level row will render horizontally, child 'rows' will render in the opposite orientation to their parent.

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
| width | null | preferred pixel width |
| height | null | preferred pixel height |
| children | *required* | a list of row and tabset nodes |

## Tab Attributes

Attributes allowed in nodes of type 'tab'.

Inherited defaults will take their value from the associated global attributes (see above).


| Attribute | Default | Description  |
| ------------- |:-------------:| -----|
| type | tab | |
| name | *required* | |
| component | *required* | |
| config | null | a place to hold json config for the hosted component |
| id | auto generated | |
| enableClose | *inherited* | |
| enableDrag | *inherited* | |
| enableRename | *inherited* | |
| className | *inherited* | |
| icon | *inherited* | |

Tab nodes have a getExtraData() method that initially returns an empty object, this is the place to 
add extra data to a tab node that will not be saved.


## TabSet Attributes

Attributes allowed in nodes of type 'tabset'.

Inherited defaults will take their value from the associated global attributes (see above).

Note: tabsets can be dynamically created as tabs are moved and deleted when all their tabs are removed (unless enableClose is false).

| Attribute | Default | Description  |
| ------------- |:-------------:| -----|
| type | tabset | |
| weight | 100 | |
| width | null | preferred pixel width |
| height | null | preferred pixel height |
| name | null | named tabsets will show a header bar above the tabs |
| selected | 0 | |
| maximized | false | |
| id | auto generated | |
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
|	Actions.deleteTab(tabNodeId) | delete the given tab |
|	Actions.selectTab(tabNodeId) | select the given tab |
|	Actions.setActiveTabset(tabsetNodeId) | set the tabset as the active tabset |
|	Actions.adjustSplit(splitterNodeId, value) | adjust the size of the given splitter |
|	Actions.maximizeToggle(tabsetNodeId) | toggles whether the given tabset node is maximized |
|	Actions.updateModelAttributes(attributes) | updates the global attributes |
|	Actions.updateNodeAttributes(nodeId, attributes) | updates the attributes of the given node |

for example:

```
model.doAction(Actions.addNode({type:"tab", component:"grid", name:"a grid", id:"5"}, "1", DropLocation.CENTER, 0));
```
This would add a new grid component to the center of tabset with id "1" and at the 0'th tab position (use value -1 to add to the end of the tabs).
Note: you can get the id of a node using the method node.getId(), if an id wasn't assigned when the node was created then one will be created for you of the form #<next available id> (e.g. #1, #2 ...).


##Layout Component Methods to Create New Tabs

Methods on the Layout Component for adding tabs, the tabs are specified by their layout json.

Example:

```
this.refs.layout.addTabToTabSet("NAVIGATION", {type:"tab", component:"grid", name:"a grid"});
```
This would add a new grid component to the tabset with id "NAVIGATION".


| Layout Method | Description  |
| ------------- | -----|
| addTabToTabSet(tabsetId, json) | adds a new tab to the tabset with the given Id |
| addTabToActiveTabSet(json) | adds a new tab to the active tabset |
| addTabWithDragAndDrop(dragText, json, onDrop) | adds a new tab by dragging a marker to the required location, the drag starts immediately |
| addTabWithDragAndDropIndirect(dragText, json, onDrop) | adds a new tab by dragging a marker to the required location, the marker is shown and must be clicked on to start dragging |

## Tab Node Events

You can handle events on nodes by adding a listener, this would typically be done lazily in the 
factory method when the node is first used.

Example:
```
    factory(node) {
        var component = node.getComponent();
        ...
        else if (component === "sub") {
            var model = node.getExtraData().model;
            if (model == null) { // lazy loading of sub layout and attachment of save listener
            
                // convert JSON layout stored in config to a layout model and save it in the extra data
                node.getExtraData().model = FlexLayout.Model.fromJson(node.getConfig().model);
                model = node.getExtraData().model;
                
                // save submodel back to JSON on save event
                node.setEventListener("save", function(p) {
                        node.getConfig().model = node.getExtraData().model.toJson();
                    }
                );
            }
        ...    
         }
});
```

| Event        | parameters          | Description  |
| ------------- |:-------------:| -----|
| resize |      |  called when tab is resized during layout, called before it is rendered with the new size|
| close |      |  called when a tab is closed |
| visibility |      | called when the visibility of a tab changes |
| save |      | called before a tabnode is serialized to json, use to save node config by adding data to the object returned by node.getConfig()|
