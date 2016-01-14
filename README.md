# FlexLayout

FlexLayout is a React layout manager that arranges panels in multiple tab sets, these can be
resized and moved, much like the windowing system found in many IDE's.

![FlexLayout Demo Screenshot](/../screenshots/github_images/v0.01/tab_overflow_menu.png?raw=true "FlexLayout Demo Screenshot")

[More screenshots](https://rawgit.com/caplin/FlexLayout/screenshots/github_images/v0.01/images.html)

[Demo (light theme)](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.02/index.html?layout=trader)

[Demo (dark theme)](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.02/index_dark.html?layout=trader)

Note: this demo does not run in safari when hosted on github (for some reason!)

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
	config: {},
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
var model = Model.fromJson(JSON.parse(json));

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
	<Layout model={model} factory={factory.bind(this)}/> 
}
```		


The above code would render two tabsets horizontally each containing a single tab that hosts a grid component. The tabs could be moved and resized by dragging and dropping. Additional grids could be added to the layout by sending actions to the model.

The JSON model is built up using 3 types of 'node':

* row - rows contains a list of tabsets and child rows, the top level row will render horizontally, child rows will render in the opposite orientation to their parent.

* tabset - tabsets contain a list of tabs and the index of the selected tab

* tab - tabs specify the name of the component that they should host (that will be loaded via the factory) and the text of the actual tab.

Weights on rows and tabsets specify the relative weight of these nodes within the parent row, the actual values do not matter just their relative values (ie two tabsets of weights 30,70 would render the same if they had weights of 3,7).


## Global Config attributes

Attributes allowed in the global 'config' element


| Attribute | Default | Description  |
| ------------- |:-------------:| -----|
| splitterSize | 5 | |
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

## Tab Attributes

Attributes allowed in nodes of type 'tab'.

Inherited defaults will take their value from the associated global attributes (see above).


| Attribute | Default | Description  |
| ------------- |:-------------:| -----|
| type | tab | |
| name | null | |
| component | null | |
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

