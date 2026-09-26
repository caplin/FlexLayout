import{_ as e,f as t,g as n,l as r,m as i,n as a,o,p as s,t as c,v as l,y as u}from"./Header-DaenXOHN.js";var d=u(l(),1),f=e(),p=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { Action, Actions, BorderNode, DockLocation, IJsonModel, ITabSetRenderValues, Layout, Model, TabNode, TabSetNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./ActionInterception.tsx?raw";

const json: IJsonModel = {
    global: {},
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
                    { type: "tab", id: "t3", name: "Delta", component: "panel" },
                ],
            },
        ],
    },
};

let nextIndex = 4;
const model = Model.fromJson(json);

const factory = (node: TabNode) => {
    if (node.getComponent() === "panel") {
        return (
            <div style={{ padding: 20 }}>
                <h2>{node.getName()}</h2>
                <p>Close this tab with its X button (or Ctrl+Delete when focused) to see interception in action.</p>
            </div>
        );
    }
    return undefined;
};

// selection/movement noise that would drown the log
const IGNORED_ACTION_TYPES = new Set([Actions.SELECT_TAB, Actions.SET_ACTIVE_TABSET]);

const actionLabel = (type: string) => type.replace("FlexLayout_", "").replace(/_/g, " ").toLowerCase();

function ActionInterception() {
    const [log, setLog] = React.useState<string[]>([]);
    const [confirmClose, setConfirmClose] = React.useState(true);
    // names captured before a delete removes the node from the model
    const deleteNamesRef = React.useRef(new Map<string, string>());

    const resolveNodeName = (action: Action, m: Model) => {
        const id = action.data?.node as string | undefined;
        if (!id) {
            return undefined;
        }
        if (action.type === Actions.DELETE_TAB) {
            return deleteNamesRef.current.get(id) ?? id;
        }
        const node = m.getNodeById(id);
        if (node instanceof TabNode || node instanceof TabSetNode) {
            return node.getName();
        }
        return id;
    };

    const describeAction = (action: Action, m: Model) => {
        const name = resolveNodeName(action, m);
        const quoted = name === undefined ? "" : \` "\${name}"\`;
        switch (action.type) {
            case Actions.ADD_TAB:
                return \`Add tab\${quoted}\`;
            case Actions.DELETE_TAB:
                return \`Close tab\${quoted}\`;
            case Actions.RENAME_TAB:
                return \`Rename tab\${quoted}\`;
            case Actions.MOVE_NODE:
                return \`Move\${quoted}\`;
            case Actions.SET_TAB_PINNED:
                return action.data?.pinned ? \`Pin tab\${quoted}\` : \`Unpin tab\${quoted}\`;
            case Actions.MAXIMIZE_TOGGLE:
                return "Maximize / restore tabset";
            case Actions.SET_BORDER_TYPE:
                return \`Set border type to \${action.data?.borderType}\`;
            case Actions.UPDATE_NODE_ATTRIBUTES:
                return \`Update attributes of\${quoted}\`;
            default:
                return actionLabel(action.type) + (name === undefined ? "" : \` (\${name})\`);
        }
    };

    // onModelChange fires for every performed action (drag resize excluded via isAdjusting), no
    // matter how it was dispatched, so it is the single reliable place to build the log
    const onModelChange = (m: Model, action: Action) => {
        if (action.isAdjusting() || IGNORED_ACTION_TYPES.has(action.type)) {
            return;
        }
        const line = \`\${new Date().toLocaleTimeString()}  \${describeAction(action, m)}\`;
        setLog((prev) => [line, ...prev].slice(0, 50));
    };

    // onAction only sees actions that originate inside the layout (tab X, context menus, drags).
    // Returning undefined vetoes the action before it touches the model.
    const onAction = (action: Action): Action | undefined => {
        if (action.type === Actions.DELETE_TAB) {
            const nodeId = action.data?.node as string | undefined;
            const node = nodeId ? model.getNodeById(nodeId) : undefined;
            if (nodeId && node instanceof TabNode) {
                deleteNamesRef.current.set(nodeId, node.getName());
                if (confirmClose && !window.confirm(\`Close "\${node.getName()}"?\`)) {
                    deleteNamesRef.current.delete(nodeId);
                    return undefined;
                }
            }
        }
        return action;
    };

    // a sticky "+" adds a tab straight via model.doAction, which bypasses onAction (UI-only
    // interception) but is still reported by onModelChange
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
            <ExampleHeader title="Action Interception" path="examples/action-interception/ActionInterception.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 12, alignItems: "center" }}>
                <label>
                    <input type="checkbox" checked={confirmClose} onChange={(e) => setConfirmClose(e.target.checked)} /> Ask before closing a tab
                </label>
                <button onClick={() => setLog([])}>Clear log</button>
                <span style={{ color: "gray" }}>The + button adds a tab via model.doAction (skips onAction, still logged). Close a tab with its X to trigger the onAction confirmation.</span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, display: "flex", flexDirection: "row", minHeight: 0 }}>
                <div
                    style={{
                        flex: "0 0 300px",
                        borderRight: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    <strong style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Action log ({log.length})</strong>
                    <div style={{ overflowY: "auto", flexGrow: 1, fontSize: 12, fontFamily: "ui-monospace, monospace" }}>
                        {log.map((line, i) => (
                            <div key={log.length - i} style={{ padding: "4px 12px", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ position: "relative", flexGrow: 1 }}>
                    <Layout model={model} factory={factory} onAction={onAction} onModelChange={onModelChange} onRenderTabSet={onRenderTabSet} />
                </div>
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<ActionInterception />);
}
`,m=o(),h={global:{},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`Alpha`,component:`panel`},{type:`tab`,id:`t1`,name:`Beta`,component:`panel`},{type:`tab`,id:`t2`,name:`Gamma`,component:`panel`},{type:`tab`,id:`t3`,name:`Delta`,component:`panel`}]}]}},g=4,_=t.fromJson(h),v=e=>{if(e.getComponent()===`panel`)return(0,m.jsxs)(`div`,{style:{padding:20},children:[(0,m.jsx)(`h2`,{children:e.getName()}),(0,m.jsx)(`p`,{children:`Close this tab with its X button (or Ctrl+Delete when focused) to see interception in action.`})]})},y=new Set([i.SELECT_TAB,i.SET_ACTIVE_TABSET]),b=e=>e.replace(`FlexLayout_`,``).replace(/_/g,` `).toLowerCase();function x(){let[e,t]=d.useState([]),[o,l]=d.useState(!0),u=d.useRef(new Map),f=(e,t)=>{let n=e.data?.node;if(!n)return;if(e.type===i.DELETE_TAB)return u.current.get(n)??n;let a=t.getNodeById(n);return a instanceof r||a instanceof s?a.getName():n},h=(e,t)=>{let n=f(e,t),r=n===void 0?``:` "${n}"`;switch(e.type){case i.ADD_TAB:return`Add tab${r}`;case i.DELETE_TAB:return`Close tab${r}`;case i.RENAME_TAB:return`Rename tab${r}`;case i.MOVE_NODE:return`Move${r}`;case i.SET_TAB_PINNED:return e.data?.pinned?`Pin tab${r}`:`Unpin tab${r}`;case i.MAXIMIZE_TOGGLE:return`Maximize / restore tabset`;case i.SET_BORDER_TYPE:return`Set border type to ${e.data?.borderType}`;case i.UPDATE_NODE_ATTRIBUTES:return`Update attributes of${r}`;default:return b(e.type)+(n===void 0?``:` (${n})`)}},x=(e,n)=>{if(n.isAdjusting()||y.has(n.type))return;let r=`${new Date().toLocaleTimeString()}  ${h(n,e)}`;t(e=>[r,...e].slice(0,50))},S=e=>{if(e.type===i.DELETE_TAB){let t=e.data?.node,n=t?_.getNodeById(t):void 0;if(t&&n instanceof r&&(u.current.set(t,n.getName()),o&&!window.confirm(`Close "${n.getName()}"?`))){u.current.delete(t);return}}return e},C=e=>{_.doAction(i.addTab({type:`tab`,id:`t`+g,name:`Tab `+g++,component:`panel`},e.getId(),n.CENTER,-1))};return(0,m.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,m.jsx)(c,{title:`Action Interception`,path:`examples/action-interception/ActionInterception.tsx`,source:p}),(0,m.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:12,alignItems:`center`},children:[(0,m.jsxs)(`label`,{children:[(0,m.jsx)(`input`,{type:`checkbox`,checked:o,onChange:e=>l(e.target.checked)}),` Ask before closing a tab`]}),(0,m.jsx)(`button`,{onClick:()=>t([]),children:`Clear log`}),(0,m.jsx)(`span`,{style:{color:`gray`},children:`The + button adds a tab via model.doAction (skips onAction, still logged). Close a tab with its X to trigger the onAction confirmation.`})]}),(0,m.jsxs)(`div`,{style:{position:`relative`,flexGrow:1,display:`flex`,flexDirection:`row`,minHeight:0},children:[(0,m.jsxs)(`div`,{style:{flex:`0 0 300px`,borderRight:`1px solid #e5e7eb`,background:`#f9fafb`,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,m.jsxs)(`strong`,{style:{padding:`8px 12px`,borderBottom:`1px solid #e5e7eb`},children:[`Action log (`,e.length,`)`]}),(0,m.jsx)(`div`,{style:{overflowY:`auto`,flexGrow:1,fontSize:12,fontFamily:`ui-monospace, monospace`},children:e.map((t,n)=>(0,m.jsx)(`div`,{style:{padding:`4px 12px`,borderBottom:`1px solid #f0f0f0`,whiteSpace:`nowrap`},children:t},e.length-n))})]}),(0,m.jsx)(`div`,{style:{position:`relative`,flexGrow:1},children:(0,m.jsx)(a,{model:_,factory:v,onAction:S,onModelChange:x,onRenderTabSet:(e,t)=>{e instanceof s&&t.stickyButtons.push((0,m.jsx)(`button`,{title:`Add a tab`,onClick:()=>C(e),style:{marginRight:4},children:`+`},`add`))}})})]})]})}var S=document.getElementById(`container`);S&&(0,f.createRoot)(S).render((0,m.jsx)(x,{}));