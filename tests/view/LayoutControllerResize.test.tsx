// @vitest-environment jsdom
import { Action, Actions, IJsonModel, Model, RowNode, TabSetNode } from "../../src";
import { createController } from "./testUtils";

const panel = (id: string, preferredWidth?: number) => ({ type: "tabset" as const, id, preferredWidth, children: [{ type: "tab" as const, id: id + "-tab", name: id }] });
const initialJson = (): IJsonModel => ({ layout: { type: "row", id: "root", children: [panel("left", 240), panel("center"), panel("right", 280)] } });

function setup(json = initialJson()) {
    const model = Model.fromJson(json);
    const onAction = vi.fn((action: Action): Action | undefined => action);
    const onModelChange = vi.fn();
    const controller = createController(model, { onAction, onModelChange });
    model.addChangeListener(controller.onModelChange);
    const redraw = vi.spyOn(controller, "redrawLayout");
    const measure = vi.spyOn(controller, "syncLayoutMetrics").mockReturnValue(false);
    const position = vi.spyOn(controller, "positionTabPanels").mockImplementation(() => {});
    const elements = new Map<string, HTMLElement>();
    model.visitLayoutNodes(Model.MAIN_LAYOUT_ID, (node) => {
        if (node instanceof RowNode || node instanceof TabSetNode) {
            const element = document.createElement("div");
            element.style.flexBasis = "1px";
            document.body.appendChild(element);
            controller.registerMeasurable(node, node instanceof RowNode ? "row" : "tabset", element);
            elements.set(node.getId(), element);
        }
    });
    return { model, controller, onAction, onModelChange, redraw, measure, position, elements };
}

const resize = () =>
    Actions.group([Actions.adjustWeights("root", [30, 42, 28]), Actions.updateNodeAttributes("left", { preferredWidth: 300 }), Actions.updateNodeAttributes("right", { preferredWidth: 280 })]);

afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
});

describe("preferred-size live resizing", () => {
    it("updates styles and measures once without redrawing, then redraws on completion", () => {
        const { controller, onAction, onModelChange, redraw, measure, position, elements } = setup();
        const action = resize().setAdjusting(true);
        controller.doAction(action);
        expect(onAction).toHaveBeenCalledExactlyOnceWith(action);
        expect(onModelChange).toHaveBeenCalledExactlyOnceWith(controller.getModel(), action);
        expect(elements.get("left")!.style.flexBasis).toBe("300px");
        expect(elements.get("left")!.style.flexGrow).toBe("0");
        expect(elements.get("right")!.style.flexBasis).toBe("280px");
        expect(Number(elements.get("center")!.style.flexGrow)).toBeGreaterThan(0);
        expect(measure).toHaveBeenCalledTimes(1);
        expect(position).toHaveBeenCalledTimes(1);
        expect(redraw).not.toHaveBeenCalled();
        controller.doAction(resize());
        expect(redraw).toHaveBeenCalledTimes(1);
    });

    it("lets onAction cancel the entire resize before any model or style updates", () => {
        const { model, controller, onAction, onModelChange, elements } = setup();
        onAction.mockReturnValue(undefined);
        controller.doAction(resize().setAdjusting(true));
        expect((model.getNodeById("left") as TabSetNode).getPreferredWidth()).toBe(240);
        expect(onModelChange).not.toHaveBeenCalled();
        expect(elements.get("left")!.style.flexBasis).toBe("1px");
    });

    it("refreshes preferences even when a child's weight entry is missing", () => {
        const { controller, elements, redraw } = setup();
        controller.doAction(Actions.group([Actions.adjustWeights("root", [30]), Actions.updateNodeAttributes("right", { preferredWidth: 320 })]).setAdjusting(true));
        expect(elements.get("right")!.style.flexBasis).toBe("320px");
        expect(redraw).not.toHaveBeenCalled();
    });

    it("refreshes derived ancestors and makes them flexible when a child's preference is cleared", () => {
        const { controller, elements, redraw } = setup({
            layout: { type: "row", id: "root", children: [{ type: "row", id: "column", children: [panel("top", 240), panel("bottom", 240)] }, panel("center")] },
        });
        controller.doAction(Actions.group([Actions.adjustWeights("column", [50, 50]), Actions.updateNodeAttributes("top", { preferredWidth: 320 })]).setAdjusting(true));
        expect(elements.get("column")!.style.flexBasis).toBe("320px");
        expect(elements.get("column")!.style.flexGrow).toBe("0");
        controller.doAction(Actions.group([Actions.adjustWeights("column", [50, 50]), Actions.updateNodeAttributes("top", { preferredWidth: undefined })]).setAdjusting(true));
        expect(elements.get("column")!.style.flexBasis).toBe("0px");
        expect(Number(elements.get("column")!.style.flexGrow)).toBeGreaterThan(0);
        expect(redraw).not.toHaveBeenCalled();
    });

    it.each([
        ["other attributes", () => Actions.updateNodeAttributes("left", { preferredWidth: 300, minWidth: 200 })],
        ["other nodes", () => Actions.updateNodeAttributes("root", { preferredWidth: 300 })],
        ["structural actions", () => Actions.deleteTabset("right")],
        ["nested groups", () => Actions.group([Actions.updateNodeAttributes("left", { preferredWidth: 300 })])],
    ])("redraws groups containing %s", (_description, extra) => {
        const { controller, redraw, measure, elements } = setup();
        controller.doAction(Actions.group([Actions.adjustWeights("root", [30, 42, 28]), extra()]).setAdjusting(true));
        expect(redraw).toHaveBeenCalledTimes(1);
        expect(measure).not.toHaveBeenCalled();
        expect(elements.get("left")!.style.flexBasis).toBe("1px");
    });

    it.each(["missing", "disconnected"])("falls back before writing any styles when a registration is %s", (kind) => {
        const { model, controller, redraw, measure, elements } = setup();
        if (kind === "missing") {
            controller.registerMeasurable(model.getNodeById("right")!, "tabset", null);
        } else {
            elements.get("right")!.remove();
        }
        controller.doAction(resize().setAdjusting(true));
        expect(redraw).toHaveBeenCalledTimes(1);
        expect(measure).not.toHaveBeenCalled();
        expect(elements.get("left")!.style.flexBasis).toBe("1px");
    });
});
