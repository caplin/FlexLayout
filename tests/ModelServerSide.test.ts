// @vitest-environment node
// the model layer must work without a DOM (e.g. server side rendering)
import { Actions, DockLocation, Model } from "../src";

describe("Model without a DOM", () => {

    it("loads, modifies and serializes a model", function () {
        expect(typeof document).equal("undefined");

        const model = Model.fromJson({
            global: {},
            borders: [
                { type: "border", location: "top", children: [{ type: "tab", name: "top1" }] }
            ],
            layout: {
                type: "row",
                children: [
                    { type: "tabset", id: "A", children: [{ type: "tab", id: "t1", name: "One" }] }
                ]
            }
        });

        model.doAction(Actions.addTab({ id: "t2", name: "Two", component: "grid" }, "A", DockLocation.CENTER, -1));
        model.doAction(Actions.moveNode("t1", "A", DockLocation.RIGHT, -1));

        const json = model.toJson();
        expect(JSON.stringify(json)).toContain("Two");

        // round trip
        const model2 = Model.fromJson(json);
        expect(model2.getNodeById("t2")).toBeDefined();
    });
});
