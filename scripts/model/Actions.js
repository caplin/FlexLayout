class Actions
{
	static setRect(rect)
	{
		return {name: Actions.SET_RECT, rect: rect};
	}

	static adjustSplit(node, value)
	{
		return {name: Actions.ADJUST_SPLIT, nodeKey: node.getKey(), value:value};
	}

	static moveNode(fromNode, toNode, location, index)
	{
		return {name: Actions.MOVE_NODE, fromNode: fromNode.getKey(), toNode: toNode.getKey(), location:location, index:index};
	}

	static selectTab(tabSetNode, index)
	{
		return {name: Actions.SELECT_TAB, tabset:tabSetNode.getKey(), index: index};
	}

	static maximizeToggle(node)
	{
		return {name: Actions.MAXIMIZE_TOGGLE, node: node.getKey()};
	}

	static renameTab(node, text)
	{
		return {name: Actions.RENAME_TAB, node:node.getKey(), text: text};
	}

	static deleteTab(node)
	{
		return {name: Actions.DELETE_TAB, node:node.getKey()};
	}

	static addTab(tabsetNode, tabNode)
	{
		return {name: Actions.ADD_TAB, tabsetNode:tabsetNode.getKey(), tabNode:tabNode.getKey()};
	}

	static setActiveTabset(tabsetNode)
	{
		return {name: Actions.SET_ACTIVE_TABSET, tabsetNode:tabsetNode.getKey()};
	}
}

Actions.SET_RECT = "setRect";
Actions.ADJUST_SPLIT = "adjustSplit";
Actions.MOVE_NODE = "moveNode";
Actions.SELECT_TAB = "selectTab";
Actions.MAXIMIZE_TOGGLE = "maximizeToggle";
Actions.RENAME_TAB = "renameTab";
Actions.DELETE_TAB = "deleteTab";
Actions.ADD_TAB = "addTab";
Actions.SET_ACTIVE_TABSET = "setActiveTabset";

export default Actions;