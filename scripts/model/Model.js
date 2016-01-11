import RowNode from "./RowNode.js";
import Actions from "./Actions.js";
import TabNode from "./TabNode.js";

class Model
{
	constructor()
	{
		this._nodeMap = {};
		this._idMap = {};
		this._root = new RowNode(this);
		this._listeners = [];
		this._rect = null;

		this._addNode(this._root);
	}

	getRoot()
	{
		return this._root;
	}

	getRect()
	{
		return this._rect;
	}

	_addNode(node)
	{
		this._nodeMap[node._key] = node;
		if (node._id != null)
		{
			this._idMap[node._id] = node;
		}
	}

	getNodeById(id)
	{
		return this._idMap[id];
	}

	doAction(action)
	{
		console.log(action);
		switch (action.name)
		{
			case Actions.SET_RECT:
			{
				this._rect = action.rect;
				break;
			}
			case Actions.ADJUST_SPLIT:
			{
				let splitterNode = this._nodeMap[action.nodeKey];
				splitterNode.getParent()._adjustSplit(splitterNode, action.value);
				break;
			}
			case Actions.MOVE_NODE:
			{
				let toNode =  this._nodeMap[action.toNode];
				let fromNode =  this._nodeMap[action.fromNode];
				toNode._drop(fromNode, action.location, action.index);
				break;
			}
			case Actions.SELECT_TAB:
			{
				let tabNode =  this._nodeMap[action.tabset];
				tabNode._setSelected(action.index);
				break;
			}
			case Actions.MAXIMIZE_TOGGLE:
			{
				let node =  this._nodeMap[action.node];
				node._setMaximized(!node.isMaximized());
				node._fireEvent("maximize", {maximized: node.isMaximized()});

				break;
			}
			case Actions.RENAME_TAB:
			{
				let node =  this._nodeMap[action.node];
				node._setName(action.text);
				break;
			}
			case Actions.DELETE_TAB:
			{
				let node =  this._nodeMap[action.node];
				node._delete();
				break;
			}
			case Actions.ADD_TAB:
			{
				let tabsetNode =  this._nodeMap[action.tabsetNode];
				var newNode =  this._nodeMap[action.tabNode];
				var pos = tabsetNode._addChild(newNode);
				tabsetNode._setSelected(pos);

				break;
			}
		}
		this._layout(this._rect);
		this._fireChange();
	}

	toJson()
	{
		this._root._forEachNode((node)=>{node._fireEvent("save", null);});
		return this._root._toJson();
	}

	static fromJson(json)
	{
		var model = new Model();
		model._root = RowNode._fromJson(json, model);
		model._addNode(model._root);
		return model;
	}

	addListener(listener)
	{
		this._listeners.push(listener);
	}

	removeListener(listener)
	{
		var index = this._listeners.indexOf(listener);
		if (index != -1)
		{
			this._listeners.splice(index, 1);
		}
	}

	_fireChange()
	{
		this._listeners.forEach((listener) => {listener.onLayoutChange(this)});
	}

	_layout(rect)
	{
		var start = Date.now();
		this._root._layout(rect);
		console.log("layout time: " + (Date.now() - start));
	}

	_tidy()
	{
		//console.log("before _tidy", this.toString());
		this._root._tidy();
		//console.log("after _tidy", this.toString());
	}

	toString()
	{
		var lines = [];
		this._root.toString(lines, "");
		return lines.join("\n");
	}
}

export default Model;