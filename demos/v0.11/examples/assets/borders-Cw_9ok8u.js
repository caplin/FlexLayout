import{_ as e,f as t,m as n,n as r,o as i,t as a,u as o,v as s,y as c}from"./Header-DaenXOHN.js";var l=c(s(),1),u=e(),d=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { Actions, BorderNode, ILayoutApi, IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./Borders.tsx?raw";

const json: IJsonModel = {
    global: {},
    borders: [
        {
            type: "border",
            location: "left",
            children: [
                { type: "tab", id: "b0", name: "Left 1", component: "border" },
                { type: "tab", id: "b1", name: "Left 2", component: "border" },
            ],
        },
        {
            type: "border",
            location: "right",
            children: [
                { type: "tab", id: "b2", name: "Right 1", component: "border" },
                { type: "tab", id: "b3", name: "Right 2", component: "border" },
            ],
        },
    ],
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: [
                    { type: "tab", id: "t0", name: "One", component: "panel" },
                    { type: "tab", id: "t1", name: "Two", component: "panel" },
                    { type: "tab", id: "t2", name: "Three", component: "panel" },
                ],
            },
        ],
    },
};

const model = Model.fromJson(json);

function Borders() {
    const layoutRef = React.useRef<ILayoutApi | null>(null);

    const toggleBorderType = (borderId: string) => {
        const border = model.getNodeById(borderId);
        const overlay = border instanceof BorderNode && border.isOverlay();
        model.doAction(Actions.setBorderType(borderId, overlay ? "split" : "overlay"));
        // redraw so the visible border tab content reflects the new split/overlay mode
        layoutRef.current?.redraw();
    };

    const factory = (node: TabNode) => {
        if (node.getComponent() === "border") {
            const parent = node.getParent();
            const overlay = parent instanceof BorderNode && parent.isOverlay();
            return (
                <div style={{ padding: 20 }}>
                    <h2>{node.getName()}</h2>
                    <p>This border tab {overlay ? "overlays the main layout. It will hide when you click in the main layout." : "splits the main layout."}</p>
                </div>
            );
        }
        if (node.getComponent() === "panel") {
            return (
                <div style={{ padding: 20 }}>
                    <h2>{node.getName()}</h2>
                    <p>A tab in the main layout.</p>
                </div>
            );
        }
        return undefined;
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Borders" path="examples/borders/Borders.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span>Borders:</span>
                <button onClick={() => toggleBorderType("border_left")}>Left: toggle split/overlay</button>
                <button onClick={() => toggleBorderType("border_right")}>Right: toggle split/overlay</button>
                <span style={{ color: "gray" }}>Each border tab&apos;s content says whether it currently overlays or splits the layout.</span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout ref={layoutRef} model={model} factory={factory} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<Borders />);
}
`,f=i(),p=t.fromJson({global:{},borders:[{type:`border`,location:`left`,children:[{type:`tab`,id:`b0`,name:`Left 1`,component:`border`},{type:`tab`,id:`b1`,name:`Left 2`,component:`border`}]},{type:`border`,location:`right`,children:[{type:`tab`,id:`b2`,name:`Right 1`,component:`border`},{type:`tab`,id:`b3`,name:`Right 2`,component:`border`}]}],layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`One`,component:`panel`},{type:`tab`,id:`t1`,name:`Two`,component:`panel`},{type:`tab`,id:`t2`,name:`Three`,component:`panel`}]}]}});function m(){let e=l.useRef(null),t=t=>{let r=p.getNodeById(t),i=r instanceof o&&r.isOverlay();p.doAction(n.setBorderType(t,i?`split`:`overlay`)),e.current?.redraw()};return(0,f.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,f.jsx)(a,{title:`Borders`,path:`examples/borders/Borders.tsx`,source:d}),(0,f.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:[(0,f.jsx)(`span`,{children:`Borders:`}),(0,f.jsx)(`button`,{onClick:()=>t(`border_left`),children:`Left: toggle split/overlay`}),(0,f.jsx)(`button`,{onClick:()=>t(`border_right`),children:`Right: toggle split/overlay`}),(0,f.jsx)(`span`,{style:{color:`gray`},children:`Each border tab's content says whether it currently overlays or splits the layout.`})]}),(0,f.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,f.jsx)(r,{ref:e,model:p,factory:e=>{if(e.getComponent()===`border`){let t=e.getParent(),n=t instanceof o&&t.isOverlay();return(0,f.jsxs)(`div`,{style:{padding:20},children:[(0,f.jsx)(`h2`,{children:e.getName()}),(0,f.jsxs)(`p`,{children:[`This border tab `,n?`overlays the main layout. It will hide when you click in the main layout.`:`splits the main layout.`]})]})}if(e.getComponent()===`panel`)return(0,f.jsxs)(`div`,{style:{padding:20},children:[(0,f.jsx)(`h2`,{children:e.getName()}),(0,f.jsx)(`p`,{children:`A tab in the main layout.`})]})}})})]})}var h=document.getElementById(`container`);h&&(0,u.createRoot)(h).render((0,f.jsx)(m,{}));