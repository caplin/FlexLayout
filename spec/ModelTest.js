import Model from "../src/model/Model.js";
import RowNode from "../src/model/RowNode.js";
import TabSetNode from "../src/model/TabSetNode.js";
import TabNode from "../src/model/TabNode.js";
import Actions from "../src/model/Actions.js";
import DockLocation from "../src/DockLocation.js";

function formatAttributes(node, attrs)
{
	var extra = "";
	if (attrs != undefined)
	{
		var found = 0;
		for (var i=0; i<attrs.length; i++)
		{
			var methodName = "get" + attrs[i];
			if (node[methodName] != undefined)
			{
				if (found == 0)
				{
					extra += "(";
					found++;
				}
				else
				{
					extra += ",";
				}
				extra += attrs[i] + ":" + node[methodName]();
			}
		}
		if (found > 0)
		{
			extra += ")";
		}
	}
	return extra;
}

function checkNodePath(node, expectedPath, attrs)
{
	var path = [];
	while (node.getParent() != null)
	{
		var parent = node.getParent();
		var pos = parent.getChildren().indexOf(node);
		var type = (parent._type == "row")?"R":"S";
		var extra = formatAttributes(parent, attrs);
		path.unshift(type+pos+ extra);
		node = parent;
	}

	var p = path.join("/");
	expect(p).toEqual(expectedPath);
}

function checkChildren(node, expectedChildren, attrs)
{
	var s = "";
	for (var i=0; i<node.getChildren().length; i++)
	{
		if (i > 0)
		{
			s += ",";
		}
		s += formatAttributes(node.getChildren()[i], attrs);
	}

	return s;
}

describe("Model", function()
{
	it("constructor sets up initial row and tabset", function()
	{
		var m = new Model({});
		expect(m.getRoot() instanceof RowNode).toBeTruthy();
		expect(m.getRoot().getChildren().length).toEqual(1);
		expect(m.getRoot().getChildren()[0] instanceof TabSetNode).toBeTruthy();
	})

	it("load json", function()
	{
		var m = Model.fromJson({
			global:{},
			layout:{
				type:"row",
				children: [
					{
						type:"tabset",
						id:2,
						children:[

						]
					}
				]
			}
		});
		expect(m.getRoot() instanceof RowNode).toBeTruthy();
		expect(m.getRoot().getChildren().length).toEqual(1);
		expect(m.getNodeById(2) instanceof TabSetNode).toBeTruthy();
	})

	it("add tab to center of tabset using add action", function()
	{
		var m = Model.fromJson({
			global:{},
			layout:{
				type:"row",
				id:0,
				children: [
					{
						type:"tabset",
						name:"one",
						id:1,
						children:[

						]
					}
				]
			}
		});

		var tabset = m.getNodeById(1);

		var tab = new TabNode(m, {name:"newtab1", component:"grid"});
		m.doAction(Actions.addNode(tab, tabset, DockLocation.CENTER, -1));
		checkNodePath(tab, "R0(Id:0)/S0(Id:1)", ["Id"]);
		checkChildren(tabset, "(Name:newtab1)", ["Name"]);

		tab = new TabNode(m, {name:"newtab2", component:"grid"});
		m.doAction(Actions.addNode(tab, tabset, DockLocation.CENTER, -1));
		checkNodePath(tab, "R0(Id:0)/S1(Id:1)", ["Id"]);
		checkChildren(tabset, "(Name:newtab1),(Name:newtab2)", ["Name"]);

		tab = new TabNode(m, {name:"newtab3", component:"grid"});
		m.doAction(Actions.addNode(tab, tabset, DockLocation.CENTER, 0));
		checkNodePath(tab, "R0(Id:0)/S0(Id:1)", ["Id"]);
		checkChildren(tabset, "(Name:newtab3),(Name:newtab1),(Name:newtab2)", ["Name"]);

		tab = new TabNode(m, {name:"newtab4", component:"grid"});
		m.doAction(Actions.addNode(tab, tabset, DockLocation.CENTER, 1));
		checkNodePath(tab, "R0(Id:0)/S1(Id:1)", ["Id"]);
		checkChildren(tabset, "(Name:newtab3),(Name:newtab4),(Name:newtab1),(Name:newtab2)", ["Name"]);

		console.log(m.toString());
	})
})

