import{_ as e,f as t,n,o as r,t as i,v as a,y as o}from"./Header-DaenXOHN.js";var s=o(a(),1),c=e(),l=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { ILayoutApi, IJsonModel, Layout, Model, TabNode, TabSetNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./Placeholder.tsx?raw";

const json: IJsonModel = {
    global: {
        tabSetEnableCloseButton: true,
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: [
                    { type: "tab", id: "t0", name: "One", component: "panel" },
                    { type: "tab", id: "t1", name: "Two", component: "panel" },
                ],
            },
        ],
    },
};

let nextIndex = 2;
const model = Model.fromJson(json);

const factory = (node: TabNode) => {
    if (node.getComponent() === "panel") {
        return <div style={{ padding: 20 }}>{node.getName()}</div>;
    }
    return undefined;
};

function Placeholder() {
    const layoutRef = React.useRef<ILayoutApi | null>(null);

    const onTabSetPlaceHolder = (node: TabSetNode) => {
        return (
            <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "gray" }}>
                <div>Empty tabset</div>
                <button
                    onClick={() => layoutRef.current?.addTabToTabSet(node.getId(), { name: "Tab " + nextIndex++, component: "panel" })}
                    style={{ marginTop: 8, padding: "4px 12px", cursor: "pointer" }}
                >
                    Add a tab
                </button>
            </div>
        );
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Placeholder" path="examples/placeholder/Placeholder.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>
                    A placeholder is content shown inside a tabset when it has no tabs. Enable it by passing the onTabSetPlaceHolder prop to &lt;Layout&gt;. Remove both tabs to see the placeholder.
                </span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout ref={layoutRef} model={model} factory={factory} onTabSetPlaceHolder={onTabSetPlaceHolder} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<Placeholder />);
}
`,u=r(),d={global:{tabSetEnableCloseButton:!0},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`One`,component:`panel`},{type:`tab`,id:`t1`,name:`Two`,component:`panel`}]}]}},f=2,p=t.fromJson(d),m=e=>{if(e.getComponent()===`panel`)return(0,u.jsx)(`div`,{style:{padding:20},children:e.getName()})};function h(){let e=s.useRef(null);return(0,u.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,u.jsx)(i,{title:`Placeholder`,path:`examples/placeholder/Placeholder.tsx`,source:l}),(0,u.jsx)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:(0,u.jsx)(`span`,{style:{color:`gray`},children:`A placeholder is content shown inside a tabset when it has no tabs. Enable it by passing the onTabSetPlaceHolder prop to <Layout>. Remove both tabs to see the placeholder.`})}),(0,u.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,u.jsx)(n,{ref:e,model:p,factory:m,onTabSetPlaceHolder:t=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexGrow:1,alignItems:`center`,justifyContent:`center`,flexDirection:`column`,gap:8,color:`gray`},children:[(0,u.jsx)(`div`,{children:`Empty tabset`}),(0,u.jsx)(`button`,{onClick:()=>e.current?.addTabToTabSet(t.getId(),{name:`Tab `+f++,component:`panel`}),style:{marginTop:8,padding:`4px 12px`,cursor:`pointer`},children:`Add a tab`})]})})})]})}var g=document.getElementById(`container`);g&&(0,c.createRoot)(g).render((0,u.jsx)(h,{}));