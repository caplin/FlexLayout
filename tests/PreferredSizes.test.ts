// @vitest-environment node
import { Actions, DockLocation, Model, Orientation, Rect, RowNode, TabSetNode } from "../src";
import { getPreferredSize } from "../src/model/Sizing";

const tabset = (id: string, preferredWidth?: number) => ({
    type: "tabset" as const,
    id,
    preferredWidth,
    children: [{ type: "tab" as const, id: id + "-tab", name: id }],
});

const createModel = () => Model.fromJson({ layout: { type: "row", children: [tabset("left", 240), tabset("center"), tabset("right", 280)] } });
const getTabset = (model: Model, id: string) => model.getNodeById(id) as TabSetNode;

function measure(model: Model, sizes: number[]) {
    let x = 0;
    for (let i = 0; i < sizes.length; i++) {
        (model.getRootRow()!.getChildren()[i] as TabSetNode).setRect(new Rect(x, 0, sizes[i], 500));
        x += sizes[i] + model.getSplitterSize()!;
    }
    model.getRootRow()!.calcMinMaxSize();
}

describe("preferred panel sizes", () => {
    it("persists physical dimensions and clears them through actions", () => {
        const model = createModel();
        model.doAction(Actions.updateNodeAttributes("left", { preferredHeight: 160 }));
        const restored = Model.fromJson(model.toJson());
        expect(getTabset(restored, "left").getPreferredWidth()).toBe(240);
        expect(getTabset(restored, "left").getPreferredHeight()).toBe(160);
        restored.doAction(Actions.updateNodeAttributes("left", { preferredWidth: undefined }));
        expect(getTabset(restored, "left").getPreferredWidth()).toBeUndefined();
        expect(getTabset(restored, "left").toJson()).not.toHaveProperty("preferredWidth");
    });

    it.each([-1, NaN, Infinity])("ignores invalid preferred size %s", (value) => {
        const model = createModel();
        model.doAction(Actions.updateNodeAttributes("left", { preferredWidth: value }));
        expect(getTabset(model, "left").getPreferredWidth()).toBeUndefined();
    });

    it("updates a dragged preference without replacing a compressed untouched preference", () => {
        const model = createModel();
        measure(model, [180, 200, 220]);
        const row = model.getRootRow()!;
        const initials = row.getSplitterInitials(1);
        model.doAction(row.calculateSplitAction(1, initials.startPosition + 30, initials));
        expect(getTabset(model, "left").getPreferredWidth()).toBeCloseTo(270);
        expect(getTabset(model, "right").getPreferredWidth()).toBe(280);
        model.doAction(row.calculateSplitAction(1, initials.startPosition, initials));
        expect(getTabset(model, "left").getPreferredWidth()).toBe(240);
    });

    it("leaves weight-only splitter actions unchanged", () => {
        const model = Model.fromJson({ layout: { type: "row", children: [tabset("a"), tabset("b")] } });
        measure(model, [300, 300]);
        const row = model.getRootRow()!;
        const initials = row.getSplitterInitials(1);
        expect(row.calculateSplitAction(1, initials.startPosition + 20, initials).type).toBe(Actions.ADJUST_WEIGHTS);
    });

    it.each([0, 0.05])("preserves an untouched subpixel preference of %s when another splitter moves", (size) => {
        const model = createModel();
        model.doAction(Actions.updateNodeAttributes("left", { preferredWidth: size, minWidth: 0 }));
        model.doAction(Actions.updateNodeAttributes("left-tab", { minWidth: 0 }));
        measure(model, [size, 300, 300]);
        const row = model.getRootRow()!;
        const initials = row.getSplitterInitials(2);
        model.doAction(row.calculateSplitAction(2, initials.startPosition + 30, initials));
        expect(getTabset(model, "left").getPreferredWidth()).toBe(size);
    });

    it("derives stacked widths and split heights without persisting derived values", () => {
        const model = Model.fromJson({
            layout: {
                type: "row",
                children: [
                    {
                        type: "row",
                        id: "column",
                        children: [
                            { ...tabset("a", 240), preferredHeight: 100 },
                            { ...tabset("b", 260), preferredHeight: 150 },
                        ],
                    },
                    tabset("center"),
                ],
            },
        });
        model.getRootRow()!.calcMinMaxSize();
        const column = model.getNodeById("column") as RowNode;
        expect(getPreferredSize(column, Orientation.HORZ)).toBe(260);
        expect(getPreferredSize(column, Orientation.VERT)).toBe(250 + model.getSplitterSize()!);
        expect(column.toJson()).not.toHaveProperty("preferredWidth");
        model.doAction(Actions.updateNodeAttributes("b", { preferredWidth: undefined }));
        expect(getPreferredSize(column, Orientation.HORZ)).toBeUndefined();
    });

    it("preserves a preferred group and its orientation through normalization and loading", () => {
        const model = Model.fromJson({
            layout: { type: "row", children: [{ type: "row", id: "column", preferredWidth: 300, children: [{ type: "row", id: "split", children: [tabset("a"), tabset("b")] }] }, tabset("center")] },
        });
        expect(model.getNodeById("split")!.getOrientation()).toBe(Orientation.HORZ);
        const restored = Model.fromJson(model.toJson());
        expect((restored.getNodeById("column") as RowNode).getPreferredWidth()).toBe(300);
        expect(restored.getNodeById("split")!.getParent()!.getId()).toBe("column");
        expect(restored.getNodeById("split")!.getOrientation()).toBe(Orientation.HORZ);
    });

    it("keeps the target column preference when a tab docks below it and the row later collapses", () => {
        const model = createModel();
        model.doAction(Actions.moveNode("right-tab", "left", DockLocation.BOTTOM, -1));
        const column = getTabset(model, "left").getParent() as RowNode;
        expect(column.getPreferredWidth()).toBe(240);
        expect(getTabset(model, "left").getPreferredWidth()).toBe(240);
        model.doAction(Actions.updateNodeAttributes(column.getId(), { preferredWidth: 300 }));
        model.doAction(Actions.deleteTab("right-tab"));
        const restored = Model.fromJson(model.toJson());
        expect(getPreferredSize(getTabset(restored, "left").getParent() as RowNode, Orientation.HORZ)).toBe(300);
        expect(getTabset(restored, "left").getPreferredWidth()).toBe(240);
    });

    it("keeps destination preferences when tabsets merge", () => {
        const model = createModel();
        model.doAction(Actions.moveNode("right", "left", DockLocation.CENTER, -1));
        expect(getTabset(model, "left").getPreferredWidth()).toBe(240);
        expect(getTabset(model, "left").getTabNodes()).toHaveLength(2);
        expect(model.getRootRow()!.getChildren()).toHaveLength(2);
    });

    it("keeps a preferred floated row as a group when docking would otherwise flatten it", () => {
        const model = Model.fromJson({ layout: { type: "row", children: [{ type: "row", children: [tabset("a"), tabset("b")] }] } });
        const layoutId = model.doAction(
            Actions.createSubLayout({ type: "row", id: "group", preferredWidth: 320, children: [tabset("first"), tabset("second")] }, { x: 20, y: 20, width: 400, height: 300 }, "float"),
        ) as string;
        model.doAction(Actions.dockFloatToLayout(layoutId, "a", DockLocation.LEFT, -1));
        const restored = Model.fromJson(model.toJson());
        const group = restored.getNodeById("group") as RowNode;
        expect(group.getPreferredWidth()).toBe(320);
        expect(group.getOrientation()).toBe(Orientation.HORZ);
        expect(group.getChildren().map((child) => child.getId())).toEqual(["first", "second"]);
        expect(getPreferredSize(group.getParent() as RowNode, Orientation.HORZ)).toBe(320);
    });

    it("carries whole-tabset preferences into floats while keeping frame geometry separate", () => {
        const model = createModel();
        measure(model, [240, 480, 280]);
        model.doAction(Actions.popoutTabset("right", "float"));
        const right = getTabset(model, "right");
        expect(right.getPreferredWidth()).toBe(280);
        const layoutId = right.getLayoutId();
        model.doAction(Actions.moveFloat(layoutId, new Rect(20, 20, 400, 300)));
        expect(getTabset(Model.fromJson(model.toJson()), "right").getPreferredWidth()).toBe(280);
    });
});
