import{_ as e,f as t,g as n,m as r,n as i,o as a,p as o,t as s,v as c,y as l}from"./Header-DaenXOHN.js";var u=l(c(),1),d=e(),f=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { Actions, BorderNode, DockLocation, IJsonModel, ITabSetRenderValues, Layout, Model, TabNode, TabSetNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./LocalStorage.tsx?raw";

const STORAGE_KEY = "flexlayout-example-layout";

let nextIndex = 2;

const defaultJson: IJsonModel = {
    global: {},
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

const factory = (node: TabNode) => {
    if (node.getComponent() === "panel") {
        return <div style={{ padding: 20 }}>{node.getName()}</div>;
    }
    return undefined;
};

function LocalStorage() {
    const [model, setModel] = React.useState<Model>(() => {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return Model.fromJson(JSON.parse(saved));
            } catch {
                // fall through to the default if the saved json is corrupt
            }
        }
        return Model.fromJson(defaultJson);
    });

    const save = () => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(model.toJson()));
    };
    const load = () => {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setModel(Model.fromJson(JSON.parse(saved)));
            } catch {
                window.alert("Nothing saved or the saved layout was corrupt");
            }
        } else {
            window.alert("Nothing saved");
        }
    };
    const reset = () => {
        setModel(Model.fromJson(defaultJson));
    };

    // a sticky "+" button stays pinned at the start of the tabstrip and adds a tab to that tabset
    const addTab = (tabset: TabSetNode) => {
        model.doAction(Actions.addTab({ type: "tab", id: "t" + nextIndex, name: "Tab " + nextIndex++, component: "panel" }, tabset.getId(), DockLocation.CENTER, -1));
    };
    const onRenderTabSet = (node: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => {
        if (node instanceof TabSetNode) {
            renderValues.stickyButtons.push(
                <button key="add" title="Add a tab" onClick={() => addTab(node)} style={{ marginRight: 4 }}>
                    +
                </button>,
            );
        }
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Load / Save" path="examples/localstorage/LocalStorage.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <button onClick={save}>Save to localStorage</button>
                <button onClick={load}>Load from localStorage</button>
                <button onClick={reset}>Reset</button>
                <span style={{ color: "gray" }}>Use the + button in the tabstrip to add tabs; move tabs around, save, reload the page and load again.</span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} onRenderTabSet={onRenderTabSet} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<LocalStorage />);
}
`,p=a(),m=`flexlayout-example-layout`,h=2,g={global:{},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`One`,component:`panel`},{type:`tab`,id:`t1`,name:`Two`,component:`panel`}]}]}},_=e=>{if(e.getComponent()===`panel`)return(0,p.jsx)(`div`,{style:{padding:20},children:e.getName()})};function v(){let[e,a]=u.useState(()=>{let e=window.localStorage.getItem(m);if(e)try{return t.fromJson(JSON.parse(e))}catch{}return t.fromJson(g)}),c=()=>{window.localStorage.setItem(m,JSON.stringify(e.toJson()))},l=()=>{let e=window.localStorage.getItem(m);if(e)try{a(t.fromJson(JSON.parse(e)))}catch{window.alert(`Nothing saved or the saved layout was corrupt`)}else window.alert(`Nothing saved`)},d=()=>{a(t.fromJson(g))},v=t=>{e.doAction(r.addTab({type:`tab`,id:`t`+h,name:`Tab `+h++,component:`panel`},t.getId(),n.CENTER,-1))};return(0,p.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,p.jsx)(s,{title:`Load / Save`,path:`examples/localstorage/LocalStorage.tsx`,source:f}),(0,p.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:[(0,p.jsx)(`button`,{onClick:c,children:`Save to localStorage`}),(0,p.jsx)(`button`,{onClick:l,children:`Load from localStorage`}),(0,p.jsx)(`button`,{onClick:d,children:`Reset`}),(0,p.jsx)(`span`,{style:{color:`gray`},children:`Use the + button in the tabstrip to add tabs; move tabs around, save, reload the page and load again.`})]}),(0,p.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,p.jsx)(i,{model:e,factory:_,onRenderTabSet:(e,t)=>{e instanceof o&&t.stickyButtons.push((0,p.jsx)(`button`,{title:`Add a tab`,onClick:()=>v(e),style:{marginRight:4},children:`+`},`add`))}})})]})}var y=document.getElementById(`container`);y&&(0,d.createRoot)(y).render((0,p.jsx)(v,{}));