import { createRoot } from "react-dom/client";
import { Actions, DockLocation, IJsonModel, Layout, Model, TabNode, useUndo } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./PreferredSizes.tsx?raw";

const json: IJsonModel = {
    global: { tabEnableFloat: true },
    layout: {
        type: "row",
        id: "root",
        children: [
            {
                type: "tabset",
                id: "explorer",
                preferredWidth: 240,
                minWidth: 140,
                children: [{ type: "tab", id: "explorer-tab", name: "Explorer", component: "explorer" }],
            },
            {
                type: "row",
                children: [
                    {
                        type: "tabset",
                        id: "workspace",
                        minWidth: 120,
                        minHeight: 80,
                        children: [{ type: "tab", id: "workspace-tab", name: "Workspace", component: "workspace" }],
                    },
                    {
                        type: "tabset",
                        id: "console",
                        preferredHeight: 180,
                        minHeight: 80,
                        children: [{ type: "tab", id: "console-tab", name: "Console", component: "console" }],
                    },
                ],
            },
            {
                type: "tabset",
                id: "inspector",
                preferredWidth: 280,
                minWidth: 160,
                children: [{ type: "tab", id: "inspector-tab", name: "Inspector", component: "inspector" }],
            },
        ],
    },
};

const factory = (node: TabNode) => {
    const descriptions: Record<string, string> = {
        explorer: "Starts at 240px wide. Its width stays the same when the inspector closes, floats, or joins the workspace.",
        workspace: "Takes the remaining width and height. Resize the window or remove an auxiliary panel to see it grow.",
        console: "Starts at 180px high. Drag its splitter to choose a new height, then resize the window.",
        inspector: "Starts at 280px wide. Use the buttons above to close it, float it, or move its tab into the workspace.",
    };
    const description = descriptions[node.getComponent() ?? ""];
    return description ? (
        <div style={{ padding: 16 }}>
            <h2>{node.getName()}</h2>
            <p>{description}</p>
        </div>
    ) : undefined;
};

function PreferredSizes() {
    const { model, setModel, undo, redo, canUndo, canRedo } = useUndo(() => Model.fromJson(json));
    if (!model) {
        return null;
    }
    const inspectorIsDocked = model.getNodeById("inspector")?.getParent()?.getId() === "root";
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Preferred Sizes" path="examples/preferred-sizes/PreferredSizes.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => model.doAction(Actions.deleteTabset("inspector"))} disabled={!inspectorIsDocked}>
                    Close inspector
                </button>
                <button onClick={() => model.doAction(Actions.popoutTabset("inspector", "float"))} disabled={!inspectorIsDocked}>
                    Float inspector
                </button>
                <button onClick={() => model.doAction(Actions.moveNode("inspector", "workspace", DockLocation.CENTER, -1))} disabled={!inspectorIsDocked || !model.getNodeById("workspace")}>
                    Join workspace
                </button>
                <button onClick={undo} disabled={!canUndo}>
                    Undo
                </button>
                <button onClick={redo} disabled={!canRedo}>
                    Redo
                </button>
                <button onClick={() => setModel(Model.fromJson(json))}>Reset</button>
            </div>
            <div style={{ padding: "0 8px 8px" }}>Drag the splitters to choose panel sizes. Those choices are retained when the window or layout changes.</div>
            <div style={{ position: "relative", flexGrow: 1, minHeight: 0, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<PreferredSizes />);
}
