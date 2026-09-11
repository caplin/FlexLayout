import{_ as e,f as t,n,o as r,t as i}from"./Header-CKq7r1qR.js";var a=e(),o=`import { createRoot } from "react-dom/client";
import { IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./Sublayout.tsx?raw";

// A sublayout is a full FlexLayout model nested inside a tab. The main layout json declares it in
// the subLayouts section (type "tab" = lives inside the main layout), and the tab references it
// via subLayoutId.
const json: IJsonModel = {
    global: {},
    subLayouts: {
        sub1: {
            type: "tab",
            layout: {
                type: "row",
                children: [
                    {
                        type: "tabset",
                        id: "sub-ts0",
                        weight: 60,
                        children: [
                            { type: "tab", id: "st0", name: "Inner One", component: "panel" },
                            { type: "tab", id: "st1", name: "Inner Two", component: "panel" },
                        ],
                    },
                    {
                        type: "tabset",
                        id: "sub-ts1",
                        weight: 40,
                        children: [{ type: "tab", id: "st2", name: "Inner Three", component: "panel" }],
                    },
                ],
            },
        },
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: [
                    { type: "tab", id: "t0", name: "Embedded Layout", subLayoutId: "sub1" },
                    { type: "tab", id: "t1", name: "Plain", component: "panel" },
                ],
            },
        ],
    },
};

const model = Model.fromJson(json);

const factory = (node: TabNode) => {
    if (node.getComponent() === "panel") {
        return (
            <div style={{ padding: 20 }}>
                <h2>{node.getName()}</h2>
            </div>
        );
    }
    return undefined;
};

function Sublayout() {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Internal Sublayout" path="examples/sublayout/Sublayout.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>
                    The &quot;Embedded Layout&quot; tab hosts a whole nested layout (two inner tabsets, three tabs) defined in the subLayouts section of the model json. Drag tabs between the inner
                    tabsets, or dock outer tabs into it.
                </span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<Sublayout />);
}
`,s=r(),c=t.fromJson({global:{},subLayouts:{sub1:{type:`tab`,layout:{type:`row`,children:[{type:`tabset`,id:`sub-ts0`,weight:60,children:[{type:`tab`,id:`st0`,name:`Inner One`,component:`panel`},{type:`tab`,id:`st1`,name:`Inner Two`,component:`panel`}]},{type:`tabset`,id:`sub-ts1`,weight:40,children:[{type:`tab`,id:`st2`,name:`Inner Three`,component:`panel`}]}]}}},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`Embedded Layout`,subLayoutId:`sub1`},{type:`tab`,id:`t1`,name:`Plain`,component:`panel`}]}]}}),l=e=>{if(e.getComponent()===`panel`)return(0,s.jsx)(`div`,{style:{padding:20},children:(0,s.jsx)(`h2`,{children:e.getName()})})};function u(){return(0,s.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,s.jsx)(i,{title:`Internal Sublayout`,path:`examples/sublayout/Sublayout.tsx`,source:o}),(0,s.jsx)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:(0,s.jsx)(`span`,{style:{color:`gray`},children:`The "Embedded Layout" tab hosts a whole nested layout (two inner tabsets, three tabs) defined in the subLayouts section of the model json. Drag tabs between the inner tabsets, or dock outer tabs into it.`})}),(0,s.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,s.jsx)(n,{model:c,factory:l})})]})}var d=document.getElementById(`container`);d&&(0,a.createRoot)(d).render((0,s.jsx)(u,{}));