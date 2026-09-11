import{_ as e,a as t,f as n,l as r,n as i,o as a,p as o,t as s,u as c,v as l,y as u}from"./Header-CKq7r1qR.js";import{t as d}from"./ContextMenuBuilder-Dhu58-li.js";var f=u(l(),1),p=e(),m=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { BorderNode, ContextMenuBuilder, IJsonModel, Layout, Model, PopupMenuEntry, TabGroupNode, TabNode, TabSetNode, showPopupMenu } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./ContextMenu.tsx?raw";

const json: IJsonModel = {
    global: {
        tabEnableRename: true,
        tabEnablePin: true,
        tabSetEnableCloseButton: true,
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: [
                    { type: "tab", id: "t0", name: "Alpha", component: "panel" },
                    { type: "tab", id: "t1", name: "Beta", component: "panel" },
                    { type: "tab", id: "t2", name: "Gamma", component: "panel" },
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

const makeOnContextMenu = (useDefaultMenu: boolean) => (node: TabNode | TabSetNode | BorderNode | TabGroupNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    const nodeName = node instanceof BorderNode ? node.getType() : node.getName();
    let items: PopupMenuEntry[];
    if (useDefaultMenu) {
        // the standard menu: all the built-in actions for the node type, pre-labeled and enabled/disabled
        items = new ContextMenuBuilder(node).addStandard().build();
    } else {
        // a custom menu built by hand
        const builder = new ContextMenuBuilder(node);
        builder.addCustom({ key: "greet", label: "Hello", onSelect: () => window.alert("Hello from " + nodeName) });
        if (node instanceof TabNode) {
            builder.addDivider().add("rename").add("close");
        } else if (node instanceof TabSetNode) {
            builder.addDivider().add("close");
        }
        items = builder.build();
    }
    if (items.length === 0) {
        return;
    }
    showPopupMenu({
        anchor: { x: event.clientX, y: event.clientY },
        container: node.getLayoutRef()!,
        title: "Menu for " + nodeName,
        items,
        onClose: () => {},
    });
};

function ContextMenu() {
    const [useDefaultMenu, setUseDefaultMenu] = React.useState(true);
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Context Menu" path="examples/context-menu/ContextMenu.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <label>Menu:</label>
                <label>
                    <input type="radio" checked={useDefaultMenu} onChange={() => setUseDefaultMenu(true)} /> Default
                </label>
                <label>
                    <input type="radio" checked={!useDefaultMenu} onChange={() => setUseDefaultMenu(false)} /> Custom
                </label>
                <span style={{ color: "gray" }}>Right-click a tab or tabset to see it.</span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} onContextMenu={makeOnContextMenu(useDefaultMenu)} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<ContextMenu />);
}
`,h=a(),g=n.fromJson({global:{tabEnableRename:!0,tabEnablePin:!0,tabSetEnableCloseButton:!0},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`Alpha`,component:`panel`},{type:`tab`,id:`t1`,name:`Beta`,component:`panel`},{type:`tab`,id:`t2`,name:`Gamma`,component:`panel`}]}]}}),_=e=>{if(e.getComponent()===`panel`)return(0,h.jsx)(`div`,{style:{padding:20},children:e.getName()})},v=e=>(n,i)=>{i.preventDefault(),i.stopPropagation();let a=n instanceof c?n.getType():n.getName(),s;if(e)s=new d(n).addStandard().build();else{let e=new d(n);e.addCustom({key:`greet`,label:`Hello`,onSelect:()=>window.alert(`Hello from `+a)}),n instanceof r?e.addDivider().add(`rename`).add(`close`):n instanceof o&&e.addDivider().add(`close`),s=e.build()}s.length!==0&&t({anchor:{x:i.clientX,y:i.clientY},container:n.getLayoutRef(),title:`Menu for `+a,items:s,onClose:()=>{}})};function y(){let[e,t]=f.useState(!0);return(0,h.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,h.jsx)(s,{title:`Context Menu`,path:`examples/context-menu/ContextMenu.tsx`,source:m}),(0,h.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:[(0,h.jsx)(`label`,{children:`Menu:`}),(0,h.jsxs)(`label`,{children:[(0,h.jsx)(`input`,{type:`radio`,checked:e,onChange:()=>t(!0)}),` Default`]}),(0,h.jsxs)(`label`,{children:[(0,h.jsx)(`input`,{type:`radio`,checked:!e,onChange:()=>t(!1)}),` Custom`]}),(0,h.jsx)(`span`,{style:{color:`gray`},children:`Right-click a tab or tabset to see it.`})]}),(0,h.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,h.jsx)(i,{model:g,factory:_,onContextMenu:v(e)})})]})}var b=document.getElementById(`container`);b&&(0,p.createRoot)(b).render((0,h.jsx)(y,{}));