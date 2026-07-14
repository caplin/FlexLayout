// @vitest-environment node
import { Actions, IJsonModel, Model } from "../src";
import { BorderNode } from "../src/model/BorderNode";

const borderJson: IJsonModel = {
    global: {},
    borders: [
        {
            type: "border",
            location: "left",
            children: [
                { type: "tab", id: "bl0", name: "left1" },
                { type: "tab", id: "bl1", name: "left2" },
            ],
        },
        {
            type: "border",
            location: "bottom",
            borderType: "overlay",
            children: [{ type: "tab", id: "bb0", name: "bottom1" }],
        },
    ],
    layout: {
        type: "row",
        children: [{ type: "tabset", id: "ts0", children: [{ type: "tab", id: "t0", name: "One" }] }],
    },
};

let model: Model;

const border = (id: string) => model.getNodeById(id) as BorderNode;

beforeEach(() => {
    model = Model.fromJson(borderJson);
});

describe("setBorderType action", () => {
    it("defaults to the 'default' border type", () => {
        expect(border("border_left").getBorderType()).equal("split");
        expect(border("border_left").isOverlay()).equal(false);
    });

    it("loads borderType from the json", () => {
        expect(border("border_bottom").getBorderType()).equal("overlay");
        expect(border("border_bottom").isOverlay()).equal(true);
    });

    it("sets and clears overlay mode", () => {
        model.doAction(Actions.setBorderType("border_left", "overlay"));
        expect(border("border_left").isOverlay()).equal(true);
        model.doAction(Actions.setBorderType("border_left", "split"));
        expect(border("border_left").isOverlay()).equal(false);
    });

    it("preserves the selected tab across a toggle", () => {
        model.doAction(Actions.selectTab("bl1"));
        expect(border("border_left").getSelected()).equal(1);
        model.doAction(Actions.setBorderType("border_left", "overlay"));
        expect(border("border_left").getSelected()).equal(1);
        model.doAction(Actions.setBorderType("border_left", "split"));
        expect(border("border_left").getSelected()).equal(1);
    });

    it("ignores invalid border types", () => {
        model.doAction(Actions.setBorderType("border_left", "banana" as any));
        expect(border("border_left").getBorderType()).equal("split");
    });

    it("is a no-op for unknown and non-border node ids", () => {
        model.doAction(Actions.setBorderType("nope", "overlay"));
        model.doAction(Actions.setBorderType("t0", "overlay"));
        expect(border("border_left").isOverlay()).equal(false);
    });

    it("is independent of enableAutoHide", () => {
        expect(border("border_bottom").isAutoHide()).equal(false);
        // note: updateNodeAttributes is not typed for border attributes, hence the cast
        model.doAction(Actions.updateNodeAttributes("border_left", { enableAutoHide: true } as any));
        expect(border("border_left").isAutoHide()).equal(true);
        expect(border("border_left").isOverlay()).equal(false);
    });
});

describe("serialization", () => {
    it("round-trips the borderType attribute", () => {
        model.doAction(Actions.setBorderType("border_left", "overlay"));
        const json = model.toJson();
        const left = json.borders!.find((b) => b.location === "left")!;
        const bottom = json.borders!.find((b) => b.location === "bottom")!;
        expect(left.borderType).equal("overlay");
        expect(bottom.borderType).equal("overlay");

        model.doAction(Actions.setBorderType("border_bottom", "split"));
        const json2 = model.toJson();
        expect(json2.borders!.find((b) => b.location === "bottom")!.borderType).equal(undefined); // default not written

        const model2 = Model.fromJson(json);
        expect((model2.getNodeById("border_left") as BorderNode).isOverlay()).equal(true);
    });
});
