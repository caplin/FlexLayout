import{_ as e,f as t,i as n,n as r,o as i,t as a,v as o,y as s}from"./Header-CKq7r1qR.js";var c=s(o(),1),l=e(),u=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { ILayoutApi, ITabSetRenderValues, IJsonModel, Layout, Model, TabNode, TabSetNode, BorderNode, MenuIcon } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./TabSetRendering.tsx?raw";

const json: IJsonModel = {
    global: {},
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                active: true,
                children: [
                    { type: "tab", id: "t0", name: "One", component: "panel" },
                    { type: "tab", id: "t1", name: "Two", component: "panel" },
                ],
            },
        ],
    },
};

let nextIndex = 3;
const model = Model.fromJson(json);

const factory = (node: TabNode) => {
    if (node.getComponent() === "panel") {
        return <div style={{ padding: 20 }}>{node.getName()}</div>;
    }
    return undefined;
};

// onRenderTabSet customizes the tabset header. Sticky buttons stay visible at the start of the
// tabstrip (they do not scroll away); regular buttons are appended at the end.
function TabSetRendering() {
    const layoutRef = React.useRef<ILayoutApi | null>(null);

    const onRenderTabSet = (node: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => {
        const addTab = (node: TabSetNode | BorderNode) => {
            layoutRef.current?.addTabToTabSet(node.getId(), { name: "New " + nextIndex++, component: "panel" });
        };
        renderValues.leading = (
            <span key="leading" title="menu" style={{ marginRight: 4, display: "flex", alignItems: "center", padding: "2px 4px", cursor: "pointer" }} onClick={() => alert("menu clicked")}>
                <MenuIcon />
            </span>
        );
        renderValues.stickyButtons.push(
            <button key="add" title="Add tab (sticky button)" onClick={() => addTab(node)} style={{ marginRight: 4 }}>
                +
            </button>,
        );
        renderValues.buttons.push(
            <span key="info" title="custom tabset button" style={{ fontSize: "0.9em", color: "gray", padding: "0 4px" }}>
                {node.getTabNodes().length} tabs
            </span>,
        );
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Tabset Rendering" path="examples/tabset-rendering/TabSetRendering.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>
                    The onRenderTabSet prop customizes the tabset header. In the tabstrip you can see: a menu icon (the leading item, rendered ahead of the tabs), a + button (a sticky button that
                    stays at the start of the strip) and a &quot;N tabs&quot; counter (a regular button at the end). Click + to add a tab.
                </span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout ref={layoutRef} model={model} factory={factory} onRenderTabSet={onRenderTabSet} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<TabSetRendering />);
}
`,d=i(),f={global:{},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,active:!0,children:[{type:`tab`,id:`t0`,name:`One`,component:`panel`},{type:`tab`,id:`t1`,name:`Two`,component:`panel`}]}]}},p=3,m=t.fromJson(f),h=e=>{if(e.getComponent()===`panel`)return(0,d.jsx)(`div`,{style:{padding:20},children:e.getName()})};function g(){let e=c.useRef(null);return(0,d.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,d.jsx)(a,{title:`Tabset Rendering`,path:`examples/tabset-rendering/TabSetRendering.tsx`,source:u}),(0,d.jsx)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:(0,d.jsx)(`span`,{style:{color:`gray`},children:`The onRenderTabSet prop customizes the tabset header. In the tabstrip you can see: a menu icon (the leading item, rendered ahead of the tabs), a + button (a sticky button that stays at the start of the strip) and a "N tabs" counter (a regular button at the end). Click + to add a tab.`})}),(0,d.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,d.jsx)(r,{ref:e,model:m,factory:h,onRenderTabSet:(t,r)=>{let i=t=>{e.current?.addTabToTabSet(t.getId(),{name:`New `+p++,component:`panel`})};r.leading=(0,d.jsx)(`span`,{title:`menu`,style:{marginRight:4,display:`flex`,alignItems:`center`,padding:`2px 4px`,cursor:`pointer`},onClick:()=>alert(`menu clicked`),children:(0,d.jsx)(n,{})},`leading`),r.stickyButtons.push((0,d.jsx)(`button`,{title:`Add tab (sticky button)`,onClick:()=>i(t),style:{marginRight:4},children:`+`},`add`)),r.buttons.push((0,d.jsxs)(`span`,{title:`custom tabset button`,style:{fontSize:`0.9em`,color:`gray`,padding:`0 4px`},children:[t.getTabNodes().length,` tabs`]},`info`))}})})]})}var _=document.getElementById(`container`);_&&(0,l.createRoot)(_).render((0,d.jsx)(g,{}));