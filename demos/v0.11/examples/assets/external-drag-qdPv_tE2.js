import{_ as e,f as t,l as n,m as r,n as i,o as a,t as o,v as s,y as c}from"./Header-DaenXOHN.js";var l=c(s(),1),u=e(),d=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { Actions, ILayoutApi, IJsonModel, Layout, Model, Node, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./ExternalDrag.tsx?raw";

const json: IJsonModel = {
    global: {},
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: [{ type: "tab", id: "t0", name: "Welcome", component: "panel" }],
            },
        ],
    },
};

let nextIndex = 1;
const model = Model.fromJson(json);

const factory = (node: TabNode) => {
    const component = node.getComponent();
    if (component === "panel") {
        return <div style={{ padding: 20 }}>{node.getName()}</div>;
    }
    if (component === "text") {
        const config = node.getConfig() as { text: string } | undefined;
        return <div style={{ padding: 20 }}>Dropped text: {config?.text}</div>;
    }
    return undefined;
};

function ExternalDrag() {
    const layoutRef = React.useRef<ILayoutApi | null>(null);

    // dragging one of the source "component" chips into the layout adds it as a new tab
    const onSourceDragStart = (event: React.DragEvent<HTMLElement>) => {
        const name = "Dropped " + nextIndex++;
        layoutRef.current?.setDragComponent(event.nativeEvent, name, 10, 10);
        layoutRef.current?.addTabWithDragAndDrop(event.nativeEvent, { name, component: "panel" });
    };

    // alternatively the layout itself can accept arbitrary external drag payloads (e.g. links)
    const onExternalDrag = (event: React.DragEvent<HTMLElement>) => {
        if (!event.dataTransfer.types.includes("text/plain")) {
            return undefined;
        }
        event.dataTransfer.dropEffect = "link";
        return {
            json: { type: "tab", component: "text", name: "Dropped text" },
            onDrop: (node?: Node, dropEvent?: React.DragEvent<HTMLElement>) => {
                const text = dropEvent?.dataTransfer?.getData("text/plain");
                if (node instanceof TabNode && text) {
                    model.doAction(Actions.updateNodeAttributes(node.getId(), { config: { text } }));
                }
            },
        };
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="External Drag" path="examples/external-drag/ExternalDrag.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "gray" }}>Drag a chip into the layout, or drop some text from elsewhere:</span>
                <span draggable onDragStart={onSourceDragStart} style={{ cursor: "grab", padding: "4px 10px", background: "#3b7de7", color: "white", borderRadius: 4 }}>
                    New component
                </span>
                <input
                    defaultValue="selected text"
                    style={{ width: 120 }}
                    onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", "hello from input");
                    }}
                    draggable
                />
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout ref={layoutRef} model={model} factory={factory} onExternalDrag={onExternalDrag} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<ExternalDrag />);
}
`,f=a(),p={global:{},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`Welcome`,component:`panel`}]}]}},m=1,h=t.fromJson(p),g=e=>{let t=e.getComponent();if(t===`panel`)return(0,f.jsx)(`div`,{style:{padding:20},children:e.getName()});if(t===`text`){let t=e.getConfig();return(0,f.jsxs)(`div`,{style:{padding:20},children:[`Dropped text: `,t?.text]})}};function _(){let e=l.useRef(null);return(0,f.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,f.jsx)(o,{title:`External Drag`,path:`examples/external-drag/ExternalDrag.tsx`,source:d}),(0,f.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:8,alignItems:`center`},children:[(0,f.jsx)(`span`,{style:{color:`gray`},children:`Drag a chip into the layout, or drop some text from elsewhere:`}),(0,f.jsx)(`span`,{draggable:!0,onDragStart:t=>{let n=`Dropped `+m++;e.current?.setDragComponent(t.nativeEvent,n,10,10),e.current?.addTabWithDragAndDrop(t.nativeEvent,{name:n,component:`panel`})},style:{cursor:`grab`,padding:`4px 10px`,background:`#3b7de7`,color:`white`,borderRadius:4},children:`New component`}),(0,f.jsx)(`input`,{defaultValue:`selected text`,style:{width:120},onDragStart:e=>{e.dataTransfer.setData(`text/plain`,`hello from input`)},draggable:!0})]}),(0,f.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,f.jsx)(i,{ref:e,model:h,factory:g,onExternalDrag:e=>{if(e.dataTransfer.types.includes(`text/plain`))return e.dataTransfer.dropEffect=`link`,{json:{type:`tab`,component:`text`,name:`Dropped text`},onDrop:(e,t)=>{let i=t?.dataTransfer?.getData(`text/plain`);e instanceof n&&i&&h.doAction(r.updateNodeAttributes(e.getId(),{config:{text:i}}))}}}})})]})}var v=document.getElementById(`container`);v&&(0,u.createRoot)(v).render((0,f.jsx)(_,{}));