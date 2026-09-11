import{_ as e,f as t,g as n,m as r,n as i,o as a,p as o,t as s,v as c,y as l}from"./Header-CKq7r1qR.js";var u=l(c(),1),d=[r.SET_ACTIVE_TABSET];function f(e,n){let r=n?.maxBufferSize??100,i=u.useRef(n?.ignoreActionTypes??d);u.useEffect(()=>{i.current=n?.ignoreActionTypes??d});let[a,o]=u.useState(()=>typeof e==`function`?e():e??null),[s,c]=u.useState(0),[l,f]=u.useState(0),p=u.useRef(a),m=u.useRef([]),h=u.useRef([]),g=u.useRef(null);u.useEffect(()=>{if(!a)return;p.current=a;let e={onBeforeAction:e=>{e.isAdjusting()?g.current===null&&(g.current=JSON.stringify(p.current.toJson())):(i.current.includes(e.type)||(m.current.push(g.current??JSON.stringify(p.current.toJson())),m.current.length>r&&m.current.shift(),h.current=[],c(m.current.length),f(0)),g.current=null)}};return a.addChangeListener(e),()=>{a.removeChangeListener(e)}},[a,r]);let _=u.useCallback((e,t=!0)=>{p.current=e,o(e),t&&(m.current=[],h.current=[],g.current=null,c(0),f(0))},[]),v=u.useCallback(()=>{let e=p.current;if(!e)return;let n=m.current.pop();if(n===void 0)return;h.current.push(JSON.stringify(e.toJson()));let r=t.fromJson(JSON.parse(n),e);p.current=r,c(m.current.length),f(h.current.length),o(r)},[]),y=u.useCallback(()=>{let e=p.current;if(!e)return;let n=h.current.pop();if(n===void 0)return;m.current.push(JSON.stringify(e.toJson()));let r=t.fromJson(JSON.parse(n),e);p.current=r,c(m.current.length),f(h.current.length),o(r)},[]),b=u.useCallback(()=>{m.current=[],h.current=[],g.current=null,c(0),f(0)},[]);return{model:a,setModel:_,undo:v,redo:y,canUndo:s>0,canRedo:l>0,undoCount:s,redoCount:l,reset:b}}var p=e(),m=`import { createRoot } from "react-dom/client";
import { Actions, BorderNode, DockLocation, IJsonModel, ITabSetRenderValues, Layout, Model, TabNode, TabSetNode, useUndo } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./UndoRedo.tsx?raw";

const json: IJsonModel = {
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
                    { type: "tab", id: "t2", name: "Three", component: "panel" },
                    { type: "tab", id: "t3", name: "Four", component: "panel" },
                    { type: "tab", id: "t4", name: "Five", component: "panel" },
                ],
            },
        ],
    },
};

let nextIndex = 5;

const factory = (node: TabNode) => {
    if (node.getComponent() === "panel") {
        return <div style={{ padding: 20 }}>{node.getName()}</div>;
    }
    return undefined;
};

function UndoRedo() {
    // useUndo owns the model state and snapshots before every mutation; undo/redo restore the model
    const { model, undo, redo, canUndo, canRedo, undoCount, redoCount } = useUndo(() => Model.fromJson(json));

    const addTab = (tabsetId: string) => {
        model?.doAction(Actions.addTab({ type: "tab", id: "t" + nextIndex, name: "Tab " + nextIndex++, component: "panel" }, tabsetId, DockLocation.CENTER, -1));
    };

    // a sticky "+" button stays pinned at the start of the tabstrip and adds a tab to that tabset
    const onRenderTabSet = (node: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => {
        if (node instanceof TabSetNode) {
            renderValues.stickyButtons.push(
                <button key="add" title="Add a tab" onClick={() => addTab(node.getId())} style={{ marginRight: 4 }}>
                    +
                </button>,
            );
        }
    };

    if (!model) {
        return null;
    }
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Undo / Redo" path="examples/undo-redo/UndoRedo.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <button onClick={undo} disabled={!canUndo}>
                    Undo ({undoCount})
                </button>
                <button onClick={redo} disabled={!canRedo}>
                    Redo ({redoCount})
                </button>
                <span style={{ color: "gray" }}>Use the + button in the tabstrip to add tabs, move tabs around and close them, then undo/redo.</span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} onRenderTabSet={onRenderTabSet} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<UndoRedo />);
}
`,h=a(),g={global:{},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`One`,component:`panel`},{type:`tab`,id:`t1`,name:`Two`,component:`panel`},{type:`tab`,id:`t2`,name:`Three`,component:`panel`},{type:`tab`,id:`t3`,name:`Four`,component:`panel`},{type:`tab`,id:`t4`,name:`Five`,component:`panel`}]}]}},_=5,v=e=>{if(e.getComponent()===`panel`)return(0,h.jsx)(`div`,{style:{padding:20},children:e.getName()})};function y(){let{model:e,undo:a,redo:c,canUndo:l,canRedo:u,undoCount:d,redoCount:p}=f(()=>t.fromJson(g)),y=t=>{e?.doAction(r.addTab({type:`tab`,id:`t`+_,name:`Tab `+_++,component:`panel`},t,n.CENTER,-1))};return e?(0,h.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,h.jsx)(s,{title:`Undo / Redo`,path:`examples/undo-redo/UndoRedo.tsx`,source:m}),(0,h.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:[(0,h.jsxs)(`button`,{onClick:a,disabled:!l,children:[`Undo (`,d,`)`]}),(0,h.jsxs)(`button`,{onClick:c,disabled:!u,children:[`Redo (`,p,`)`]}),(0,h.jsx)(`span`,{style:{color:`gray`},children:`Use the + button in the tabstrip to add tabs, move tabs around and close them, then undo/redo.`})]}),(0,h.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,h.jsx)(i,{model:e,factory:v,onRenderTabSet:(e,t)=>{e instanceof o&&t.stickyButtons.push((0,h.jsx)(`button`,{title:`Add a tab`,onClick:()=>y(e.getId()),style:{marginRight:4},children:`+`},`add`))}})})]}):null}var b=document.getElementById(`container`);b&&(0,p.createRoot)(b).render((0,h.jsx)(y,{}));