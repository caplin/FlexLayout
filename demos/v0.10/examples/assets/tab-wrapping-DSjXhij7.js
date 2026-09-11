import{_ as e,f as t,n,o as r,t as i}from"./Header-CKq7r1qR.js";var a=e(),o=`import { createRoot } from "react-dom/client";
import { IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./TabWrapping.tsx?raw";

// tabSetEnableTabWrap lets the tabstrip wrap onto multiple lines instead of scrolling
const json: IJsonModel = {
    global: {
        tabSetEnableTabWrap: true,
    },
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
                    { type: "tab", id: "t3", name: "Four", component: "panel" },
                    { type: "tab", id: "t4", name: "Five", component: "panel" },
                    { type: "tab", id: "t5", name: "Six", component: "panel" },
                    { type: "tab", id: "t6", name: "Seven", component: "panel" },
                    { type: "tab", id: "t7", name: "Eight", component: "panel" },
                ],
            },
            {
                type: "tabset",
                id: "ts1",
                weight: 30,
                children: [
                    { type: "tab", id: "t8", name: "Nine", component: "panel" },
                    { type: "tab", id: "t9", name: "Ten", component: "panel" },
                    { type: "tab", id: "t10", name: "Eleven", component: "panel" },
                    { type: "tab", id: "t11", name: "Twelve", component: "panel" },
                    { type: "tab", id: "t12", name: "Thirteen", component: "panel" },
                    { type: "tab", id: "t13", name: "Fourteen", component: "panel" },
                ],
            },
            {
                type: "tabset",
                id: "ts2",
                weight: 30,
                children: [
                    { type: "tab", id: "t14", name: "Fifteen", component: "panel" },
                    { type: "tab", id: "t15", name: "Sixteen", component: "panel" },
                    { type: "tab", id: "t16", name: "Seventeen", component: "panel" },
                    { type: "tab", id: "t17", name: "Eighteen", component: "panel" },
                ],
            },
        ],
    },
};

const model = Model.fromJson(json);

const factory = (node: TabNode) => {
    if (node.getComponent() === "panel") {
        return <div style={{ padding: 20 }}>{node.getName()}</div>;
    }
    return undefined;
};

function TabWrapping() {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Tab Wrapping" path="examples/tab-wrapping/TabWrapping.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>
                    tabSetEnableTabWrap makes the tabstrip wrap onto multiple lines instead of scrolling. The three tabsets in the row are narrow enough that their tabs wrap. Drag the splitters to
                    widen or narrow a tabset and watch its tabs wrap onto more or fewer lines.
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
    createRoot(container).render(<TabWrapping />);
}
`,s=r(),c=t.fromJson({global:{tabSetEnableTabWrap:!0},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,weight:40,children:[{type:`tab`,id:`t0`,name:`One`,component:`panel`},{type:`tab`,id:`t1`,name:`Two`,component:`panel`},{type:`tab`,id:`t2`,name:`Three`,component:`panel`},{type:`tab`,id:`t3`,name:`Four`,component:`panel`},{type:`tab`,id:`t4`,name:`Five`,component:`panel`},{type:`tab`,id:`t5`,name:`Six`,component:`panel`},{type:`tab`,id:`t6`,name:`Seven`,component:`panel`},{type:`tab`,id:`t7`,name:`Eight`,component:`panel`}]},{type:`tabset`,id:`ts1`,weight:30,children:[{type:`tab`,id:`t8`,name:`Nine`,component:`panel`},{type:`tab`,id:`t9`,name:`Ten`,component:`panel`},{type:`tab`,id:`t10`,name:`Eleven`,component:`panel`},{type:`tab`,id:`t11`,name:`Twelve`,component:`panel`},{type:`tab`,id:`t12`,name:`Thirteen`,component:`panel`},{type:`tab`,id:`t13`,name:`Fourteen`,component:`panel`}]},{type:`tabset`,id:`ts2`,weight:30,children:[{type:`tab`,id:`t14`,name:`Fifteen`,component:`panel`},{type:`tab`,id:`t15`,name:`Sixteen`,component:`panel`},{type:`tab`,id:`t16`,name:`Seventeen`,component:`panel`},{type:`tab`,id:`t17`,name:`Eighteen`,component:`panel`}]}]}}),l=e=>{if(e.getComponent()===`panel`)return(0,s.jsx)(`div`,{style:{padding:20},children:e.getName()})};function u(){return(0,s.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,s.jsx)(i,{title:`Tab Wrapping`,path:`examples/tab-wrapping/TabWrapping.tsx`,source:o}),(0,s.jsx)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:(0,s.jsx)(`span`,{style:{color:`gray`},children:`tabSetEnableTabWrap makes the tabstrip wrap onto multiple lines instead of scrolling. The three tabsets in the row are narrow enough that their tabs wrap. Drag the splitters to widen or narrow a tabset and watch its tabs wrap onto more or fewer lines.`})}),(0,s.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,s.jsx)(n,{model:c,factory:l})})]})}var d=document.getElementById(`container`);d&&(0,a.createRoot)(d).render((0,s.jsx)(u,{}));