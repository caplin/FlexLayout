import{_ as e,a as t,f as n,n as r,o as i,t as a,u as o,v as s,y as c}from"./Header-CKq7r1qR.js";import{t as l}from"./ContextMenuBuilder-Dhu58-li.js";var u=c(s(),1),d=e(),f=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { BorderNode, ContextMenuBuilder, IJsonModel, Layout, Model, PopupMenuEntry, TabGroupNode, TabNode, TabSetNode, showPopupMenu } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./TabGroups.tsx?raw";

const json: IJsonModel = {
    global: {
        tabEnablePin: true,
        tabSetEnableTabGroups: true,
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: [
                    {
                        type: "tabgroup",
                        name: "Colors",
                        color: "#3b7de7",
                        children: [
                            { type: "tab", id: "t0", name: "Red", component: "panel" },
                            { type: "tab", id: "t1", name: "Green", component: "panel" },
                        ],
                    },
                    {
                        type: "tabgroup",
                        name: "Shapes",
                        color: "#94b870",
                        children: [
                            { type: "tab", id: "t2", name: "Circle", component: "panel" },
                            { type: "tab", id: "t3", name: "Square", component: "panel" },
                        ],
                    },
                    { type: "tab", id: "t4", name: "Solo", component: "panel" },
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

function TabGroups() {
    const contextMenuHideRef = React.useRef<(() => void) | null>(null);

    // default menus: tabs include group actions via tabSetEnableTabGroups, group pills include
    // the rename/color controls via their unified default menu
    const onContextMenu = (node: TabNode | TabSetNode | BorderNode | TabGroupNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        const items: PopupMenuEntry[] = new ContextMenuBuilder(node, { closeMenu: () => contextMenuHideRef.current?.() }).addStandard().build();
        if (items.length === 0) {
            return;
        }
        contextMenuHideRef.current?.();
        contextMenuHideRef.current = showPopupMenu({
            anchor: { x: event.clientX, y: event.clientY },
            container: node.getLayoutRef()!,
            title: "Menu for " + (node instanceof BorderNode ? node.getType() : node.getName()),
            items,
            onClose: () => {
                contextMenuHideRef.current = null;
            },
        });
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Tab Groups" path="examples/tab-groups/TabGroups.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>
                    The tabstrip has two colored group pills (Colors, Shapes) plus a solo tab. Right-click a pill to rename it, change its color, collapse/expand it or ungroup it. Right-click a tab to
                    add it to a new or existing group, or remove it from its group.
                </span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} onContextMenu={onContextMenu} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<TabGroups />);
}
`,p=i(),m=n.fromJson({global:{tabEnablePin:!0,tabSetEnableTabGroups:!0},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tabgroup`,name:`Colors`,color:`#3b7de7`,children:[{type:`tab`,id:`t0`,name:`Red`,component:`panel`},{type:`tab`,id:`t1`,name:`Green`,component:`panel`}]},{type:`tabgroup`,name:`Shapes`,color:`#94b870`,children:[{type:`tab`,id:`t2`,name:`Circle`,component:`panel`},{type:`tab`,id:`t3`,name:`Square`,component:`panel`}]},{type:`tab`,id:`t4`,name:`Solo`,component:`panel`}]}]}}),h=e=>{if(e.getComponent()===`panel`)return(0,p.jsx)(`div`,{style:{padding:20},children:(0,p.jsx)(`h2`,{children:e.getName()})})};function g(){let e=u.useRef(null);return(0,p.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,p.jsx)(a,{title:`Tab Groups`,path:`examples/tab-groups/TabGroups.tsx`,source:f}),(0,p.jsx)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:(0,p.jsx)(`span`,{style:{color:`gray`},children:`The tabstrip has two colored group pills (Colors, Shapes) plus a solo tab. Right-click a pill to rename it, change its color, collapse/expand it or ungroup it. Right-click a tab to add it to a new or existing group, or remove it from its group.`})}),(0,p.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,p.jsx)(r,{model:m,factory:h,onContextMenu:(n,r)=>{r.preventDefault(),r.stopPropagation();let i=new l(n,{closeMenu:()=>e.current?.()}).addStandard().build();i.length!==0&&(e.current?.(),e.current=t({anchor:{x:r.clientX,y:r.clientY},container:n.getLayoutRef(),title:`Menu for `+(n instanceof o?n.getType():n.getName()),items:i,onClose:()=>{e.current=null}}))}})})]})}var _=document.getElementById(`container`);_&&(0,d.createRoot)(_).render((0,p.jsx)(g,{}));