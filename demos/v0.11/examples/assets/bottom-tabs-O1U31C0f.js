import{_ as e,f as t,n,o as r,t as i}from"./Header-DaenXOHN.js";var a=e(),o=`import { createRoot } from "react-dom/client";
import { IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./BottomTabs.tsx?raw";

// tabLocation and enableSingleTabStretch are inherited attributes (global tabSetTabLocation /
// tabSetEnableSingleTabStretch) but can also be overridden per tabset, as done below.
const json: IJsonModel = {
    global: {},
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                weight: 40,
                children: [
                    { type: "tab", id: "t0", name: "One", component: "panel" },
                    { type: "tab", id: "t1", name: "Two", component: "panel" },
                    { type: "tab", id: "t2", name: "Three", component: "panel" },
                ],
            },
            {
                type: "tabset",
                id: "ts1",
                weight: 30,
                tabLocation: "bottom",
                children: [
                    { type: "tab", id: "t3", name: "Four", component: "panel" },
                    { type: "tab", id: "t4", name: "Five", component: "panel" },
                    { type: "tab", id: "t5", name: "Six", component: "panel" },
                ],
            },
            {
                type: "tabset",
                id: "ts2",
                weight: 30,
                enableSingleTabStretch: true,
                children: [{ type: "tab", id: "t6", name: "Solo (stretched)", component: "panel" }],
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

function BottomTabs() {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Bottom Tabs" path="examples/bottom-tabs/BottomTabs.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>
                    Three tabsets: a normal top tabstrip, one with tabLocation &quot;bottom&quot;, and a single-tab tabset with enableSingleTabStretch so the tab fills its area and renders as a
                    header.
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
    createRoot(container).render(<BottomTabs />);
}
`,s=r(),c=t.fromJson({global:{},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,weight:40,children:[{type:`tab`,id:`t0`,name:`One`,component:`panel`},{type:`tab`,id:`t1`,name:`Two`,component:`panel`},{type:`tab`,id:`t2`,name:`Three`,component:`panel`}]},{type:`tabset`,id:`ts1`,weight:30,tabLocation:`bottom`,children:[{type:`tab`,id:`t3`,name:`Four`,component:`panel`},{type:`tab`,id:`t4`,name:`Five`,component:`panel`},{type:`tab`,id:`t5`,name:`Six`,component:`panel`}]},{type:`tabset`,id:`ts2`,weight:30,enableSingleTabStretch:!0,children:[{type:`tab`,id:`t6`,name:`Solo (stretched)`,component:`panel`}]}]}}),l=e=>{if(e.getComponent()===`panel`)return(0,s.jsx)(`div`,{style:{padding:20},children:(0,s.jsx)(`h2`,{children:e.getName()})})};function u(){return(0,s.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,s.jsx)(i,{title:`Bottom Tabs`,path:`examples/bottom-tabs/BottomTabs.tsx`,source:o}),(0,s.jsx)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:(0,s.jsx)(`span`,{style:{color:`gray`},children:`Three tabsets: a normal top tabstrip, one with tabLocation "bottom", and a single-tab tabset with enableSingleTabStretch so the tab fills its area and renders as a header.`})}),(0,s.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,s.jsx)(n,{model:c,factory:l})})]})}var d=document.getElementById(`container`);d&&(0,a.createRoot)(d).render((0,s.jsx)(u,{}));