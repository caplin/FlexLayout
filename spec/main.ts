
import Model from "../src/model/Model";
import Actions from "../src/model/Actions";
import DockLocation from "../src/DockLocation";

describe("Tree", function()
{
	it("adds a tab to center of empty tabset using add action", function()
	{
        const model = Model.fromJson(
            {
                global: {},
                layout: {
                    type: "row",
                    id: "0",
                    children: [
                        {
                            type: "tabset",
                            name: "one",
                            id: "1",
                            enableDeleteWhenEmpty: false,
                            children: []
                        }
                    ]
                }
            }
        );
        model.doAction(Actions.addNode({id:"2", name: "newtab1", component: "grid"}, "1", DockLocation.CENTER, -1));

		let expected :any= {
            "global": {},
            
			"layout": {
				"type": "row",
				"id": "0",
				"children": [
					{
						"type": "tabset",
                        "name": "one",
                        "enableDeleteWhenEmpty": false,
                        "active": true,
						"id": "1",
						"children": [
							{
								"type": "tab",
								"id":"2",
								"name": "newtab1",
								"component": "grid"
							}
						]
					}
				]
            },
            "borders": []
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


