import RowNode from "./RowNode.js";

class Model
{
	constructor()
	{
		this.root = new RowNode(this);
		this.listeners = [];
	}

	toJson()
	{
		return this.root.toJson();
	}

	static fromJson(json)
	{
		var model = new Model();
		model.root = RowNode.fromJson(json, model);
		return model;
	}

	addListener(listener)
	{
		this.listeners.push(listener);  	
	}

	removeListener(listener)
	{
		var index = this.listeners.indexOf(listener);
		if (index != -1)
		{
			this.listeners.splice(index, 1);
		}
	}

	fireChange()
	{
		this.listeners.forEach((listener) => {listener.onLayoutChange(this)});
	}

	layout(rect)
	{
		var start = Date.now();
		this.root.layout(rect);
		console.log("layout time: " + (Date.now() - start));
	}

	tidy()
	{
		//console.log("before tidy", this.toString());
		this.root.tidy();
		//console.log("after tidy", this.toString());
	}

	toString()
	{
		var lines = [];
		this.root.toString(lines, "");
		return lines.join("\n");
	}
}

export default Model;