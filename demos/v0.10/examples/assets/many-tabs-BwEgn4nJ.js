import{_ as e,f as t,n,o as r,t as i}from"./Header-CKq7r1qR.js";var a=e(),o=`import { createRoot } from "react-dom/client";
import { IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./ManyTabs.tsx?raw";

// tabSetEnableTabScrollbar shows a mini scrollbar in the tabstrip; a single tabset holds many tabs
const json: IJsonModel = {
    global: {
        tabSetEnableTabScrollbar: true,
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: Array.from({ length: 40 }, (_, i) => ({
                    type: "tab" as const,
                    id: "t" + i,
                    name: "Tab " + (i + 1),
                    component: "panel",
                })),
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
                <p>
                    The tabstrip scrolls when it runs out of room. Use your mouse wheel or trackpad over the tabs — scrolling up/down or left/right both move the strip. When tabs are hidden, the
                    overflow menu (») at the end of the strip lists them.
                </p>
            </div>
        );
    }
    return undefined;
};

function ManyTabs() {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Many Tabs" path="examples/many-tabs/ManyTabs.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>
                    Scroll the tabstrip with your mouse wheel or trackpad (up/down or left/right both work). If tabs are hidden, the overflow menu (») at the end of the strip lists them.
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
    createRoot(container).render(<ManyTabs />);
}
`,s=r(),c={global:{tabSetEnableTabScrollbar:!0},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:Array.from({length:40},(e,t)=>({type:`tab`,id:`t`+t,name:`Tab `+(t+1),component:`panel`}))}]}},l=t.fromJson(c),u=e=>{if(e.getComponent()===`panel`)return(0,s.jsxs)(`div`,{style:{padding:20},children:[(0,s.jsx)(`h2`,{children:e.getName()}),(0,s.jsx)(`p`,{children:`The tabstrip scrolls when it runs out of room. Use your mouse wheel or trackpad over the tabs — scrolling up/down or left/right both move the strip. When tabs are hidden, the overflow menu (») at the end of the strip lists them.`})]})};function d(){return(0,s.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,s.jsx)(i,{title:`Many Tabs`,path:`examples/many-tabs/ManyTabs.tsx`,source:o}),(0,s.jsx)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:(0,s.jsx)(`span`,{style:{color:`gray`},children:`Scroll the tabstrip with your mouse wheel or trackpad (up/down or left/right both work). If tabs are hidden, the overflow menu (») at the end of the strip lists them.`})}),(0,s.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,s.jsx)(n,{model:l,factory:u})})]})}var f=document.getElementById(`container`);f&&(0,a.createRoot)(f).render((0,s.jsx)(d,{}));