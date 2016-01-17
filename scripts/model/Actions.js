/**
 * The Action creator class for FlexLayout model actions
 */
class Actions
{
	static addNode(newNode, toNode, location, index)
	{
		return {name: Actions.ADD_NODE, fromNode: newNode.getKey(), toNode: toNode.getKey(), location:location, index:index};
	}

	static moveNode(fromNode, toNode, location, index)
	{
		return {name: Actions.MOVE_NODE, fromNode: fromNode.getKey(), toNode: toNode.getKey(), location:location, index:index};
	}

	static deleteTab(node)
	{
		return {name: Actions.DELETE_TAB, node:node.getKey()};
	}

	static renameTab(node, text)
	{
		return {name: Actions.RENAME_TAB, node:node.getKey(), text: text};
	}

	static selectTab(tabSetNode, index)
	{
		return {name: Actions.SELECT_TAB, tabset:tabSetNode.getKey(), index: index};
	}

	static setActiveTabset(tabsetNode)
	{
		return {name: Actions.SET_ACTIVE_TABSET, tabsetNode:tabsetNode.getKey()};
	}

	static setRect(rect)
	{
		return {name: Actions.SET_RECT, rect: rect};
	}

	static adjustSplit(node, value)
	{
		return {name: Actions.ADJUST_SPLIT, node: node.getKey(), value:value};
	}

	static maximizeToggle(node)
	{
		return {name: Actions.MAXIMIZE_TOGGLE, node: node.getKey()};
	}

	static updateModelAttributes(attributes)
	{
		return {name: Actions.UPDATE_MODEL_ATTRIBUTES, json:attributes};
	}

	static updateNodeAttributes(node, attributes)
	{
		return {name: Actions.UPDATE_NODE_ATTRIBUTES, node: node.getKey(), json:attributes};
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