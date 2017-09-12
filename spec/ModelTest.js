import Model from "../src/model/Model.js";
import Actions from "../src/model/Actions.js";
import DockLocation from "../src/DockLocation.js";

describe("Tree", function()
{
	it("adds a tab to center of empty tabset using add action", function()
	{
        const model = Model.fromJson(
            {
                global: {},
                borders: [],
                layout: {
                    type: "row",
                    id: 0,
                    children: [
                        {
                            type: "tabset",
                            enableDeleteWhenEmpty:false,
                            name: "one",
                            id: 1,
                            children: []
                        }
                    ]
                }
            }
        );
        console.log(JSON.stringify(model.toJson(), null, "\t"));
        model.doAction(Actions.addNode({id:2, name: "newtab1", component: "grid"}, 1, DockLocation.CENTER, -1));

		let expected = {
			"global": {},
            "borders": [ ],
			"layout": {
				"type": "row",
				"id": 0,
				"children": [
					{
						"type": "tabset",
                        "enableDeleteWhenEmpty":false,
						"name": "one",
						"id": 1,
                        "active":true,
						"children": [
							{
								"type": "tab",
								"id":2,
								"name": "newtab1",
								"component": "grid"
							}
						]
					}
				]
			}
		};

        const json = model.toJson();

        expect(json).toEqual(expected);

		console.log(JSON.stringify(json, null, "\t"));
	})

	// todo:

	// adding into tabset with position: 0, middle, end
	// adding into rows (ie splitting a tabset)

	// auto assignment of ids

	// dividers moving
	// moving tabs and tidying tree
	// removing tabs and tidying tree
	// setting attributes



});

