/**
 * The Action creator class for FlexLayout model actions
 */
class Actions
{
	static addNode(newNode, toNode, location, index)
	{
		return {name: Actions.ADD_NODE, fromNode: newNode, toNode: toNode, location:location, index:index};
	}

	static moveNode(fromNode, toNode, location, index)
	{
		return {name: Actions.MOVE_NODE, fromNode: fromNode, toNode: toNode, location:location, index:index};
	}

	static deleteTab(tabNode)
	{
		return {name: Actions.DELETE_TAB, node:tabNode};
	}

	static renameTab(tabNode, text)
	{
		return {name: Actions.RENAME_TAB, node:tabNode, text: text};
	}

	static selectTab(tabNode)
	{
		return {name: Actions.SELECT_TAB, tabNode:tabNode};
	}

	static setActiveTabset(tabsetNode)
	{
		return {name: Actions.SET_ACTIVE_TABSET, tabsetNode:tabsetNode};
	}

	static setRect(rect)
	{
		return {name: Actions.SET_RECT, rect: rect};
	}

	static adjustSplit(splitterNode, value)
	{
		return {name: Actions.ADJUST_SPLIT, node: splitterNode, value:value};
	}

	static maximizeToggle(node)
	{
		return {name: Actions.MAXIMIZE_TOGGLE, node: node};
	}

	static updateModelAttributes(attributes)
	{
		return {name: Actions.UPDATE_MODEL_ATTRIBUTES, json:attributes};
	}

	static updateNodeAttributes(node, attributes)
	{
		return {name: Actions.UPDATE_NODE_ATTRIBUTES, node: node, json:attributes};
	}
}

Actions.ADD_NODE = "addNode";
Actions.MOVE_NODE = "moveNode";
Actions.DELETE_TAB = "deleteTab";
Actions.RENAME_TAB = "renameTab";
Actions.SELECT_TAB = "selectTab";
Actions.SET_ACTIVE_TABSET = "setActiveTabset";
Actions.SET_RECT = "setRect";
Actions.ADJUST_SPLIT = "adjustSplit";
Actions.MAXIMIZE_TOGGLE = "maximizeToggle";
Actions.UPDATE_MODEL_ATTRIBUTES = "updateModelAttributes";
Actions.UPDATE_NODE_ATTRIBUTES = "updateNodeAttributes";

export default Actions;