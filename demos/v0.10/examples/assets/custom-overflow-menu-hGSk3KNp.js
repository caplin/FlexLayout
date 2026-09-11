import{_ as e,a as t,f as n,m as r,n as i,o as a,t as o,v as s,y as c}from"./Header-CKq7r1qR.js";var l=c(s(),1),u=e(),d=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { Actions, BorderNode, IJsonModel, Layout, Model, PopupMenuEntry, TabNode, TabSetNode, showPopupMenu } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./CustomOverflowMenu.tsx?raw";

const json: IJsonModel = {
    global: {},
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                children: Array.from({ length: 50 }, (_, i) => ({
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
                <p>Make the window (or this tabset) narrow until some tabs are hidden, then open the &raquo; overflow menu to see the custom version.</p>
            </div>
        );
    }
    return undefined;
};

function CustomOverflowMenu() {
    const [mode, setMode] = React.useState<"select" | "close">("select");
    const hideMenuRef = React.useRef<(() => void) | null>(null);

    // replaces the default hidden-tab overflow menu with our own popup built from the hidden items
    const onShowOverflowMenu = (
        node: TabSetNode | BorderNode,
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        items: { index: number; node: TabNode }[],
        onSelect: (item: { index: number; node: TabNode }) => void,
    ) => {
        event.preventDefault();
        if (items.length === 0) {
            return;
        }
        const entries: PopupMenuEntry[] = items.map((item) => {
            const onPick = () => {
                hideMenuRef.current?.();
                if (mode === "close") {
                    model.doAction(Actions.deleteTab(item.node.getId()));
                } else {
                    onSelect(item);
                }
            };
            return {
                key: item.node.getId(),
                icon: <span style={{ minWidth: "1.4em", textAlign: "right", color: "gray", fontSize: "0.85em", marginRight: 2 }}>{item.index + 1}</span>,
                label: item.node.getName() + (mode === "close" ? "  (close)" : ""),
                onSelect: onPick,
            };
        });
        hideMenuRef.current?.();
        hideMenuRef.current = showPopupMenu({
            anchor: { x: event.clientX, y: event.clientY },
            container: node.getLayoutRef()!,
            title: \`\${items.length} hidden \${items.length === 1 ? "tab" : "tabs"}\`,
            items: entries,
            onClose: () => {
                hideMenuRef.current = null;
            },
        });
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Custom Overflow Menu" path="examples/custom-overflow-menu/CustomOverflowMenu.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 12, alignItems: "center" }}>
                <span>When tabs are hidden:</span>
                <label>
                    <input type="radio" checked={mode === "select"} onChange={() => setMode("select")} /> menu selects the tab
                </label>
                <label>
                    <input type="radio" checked={mode === "close"} onChange={() => setMode("close")} /> menu closes the tab
                </label>
                <span style={{ color: "gray" }}>Shown by the &raquo; button at the end of the tabstrip via onShowOverflowMenu.</span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} onShowOverflowMenu={onShowOverflowMenu} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<CustomOverflowMenu />);
}
`,f=a(),p={global:{},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:Array.from({length:50},(e,t)=>({type:`tab`,id:`t`+t,name:`Tab `+(t+1),component:`panel`}))}]}},m=n.fromJson(p),h=e=>{if(e.getComponent()===`panel`)return(0,f.jsxs)(`div`,{style:{padding:20},children:[(0,f.jsx)(`h2`,{children:e.getName()}),(0,f.jsx)(`p`,{children:`Make the window (or this tabset) narrow until some tabs are hidden, then open the » overflow menu to see the custom version.`})]})};function g(){let[e,n]=l.useState(`select`),a=l.useRef(null);return(0,f.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,f.jsx)(o,{title:`Custom Overflow Menu`,path:`examples/custom-overflow-menu/CustomOverflowMenu.tsx`,source:d}),(0,f.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:12,alignItems:`center`},children:[(0,f.jsx)(`span`,{children:`When tabs are hidden:`}),(0,f.jsxs)(`label`,{children:[(0,f.jsx)(`input`,{type:`radio`,checked:e===`select`,onChange:()=>n(`select`)}),` menu selects the tab`]}),(0,f.jsxs)(`label`,{children:[(0,f.jsx)(`input`,{type:`radio`,checked:e===`close`,onChange:()=>n(`close`)}),` menu closes the tab`]}),(0,f.jsx)(`span`,{style:{color:`gray`},children:`Shown by the » button at the end of the tabstrip via onShowOverflowMenu.`})]}),(0,f.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,f.jsx)(i,{model:m,factory:h,onShowOverflowMenu:(n,i,o,s)=>{if(i.preventDefault(),o.length===0)return;let c=o.map(t=>({key:t.node.getId(),icon:(0,f.jsx)(`span`,{style:{minWidth:`1.4em`,textAlign:`right`,color:`gray`,fontSize:`0.85em`,marginRight:2},children:t.index+1}),label:t.node.getName()+(e===`close`?`  (close)`:``),onSelect:()=>{a.current?.(),e===`close`?m.doAction(r.deleteTab(t.node.getId())):s(t)}}));a.current?.(),a.current=t({anchor:{x:i.clientX,y:i.clientY},container:n.getLayoutRef(),title:`${o.length} hidden ${o.length===1?`tab`:`tabs`}`,items:c,onClose:()=>{a.current=null}})}})})]})}var _=document.getElementById(`container`);_&&(0,u.createRoot)(_).render((0,f.jsx)(g,{}));