import{_ as e,f as t,n,o as r,t as i,v as a,y as o}from"./Header-DaenXOHN.js";var s=o(a(),1),c=e(),l=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./KeyboardAccessibility.tsx?raw";

const json: IJsonModel = {
    global: {
        tabEnableRename: true,
        tabSetEnableActiveIcon: true,
    },
    borders: [
        {
            type: "border",
            location: "right",
            borderType: "overlay",
            children: [{ type: "tab", id: "b0", name: "Notes", component: "panel" }],
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
            {
                type: "tabset",
                id: "ts1",
                children: [
                    { type: "tab", id: "t3", name: "Four", component: "panel" },
                    { type: "tab", id: "t4", name: "Five", component: "panel" },
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
                <p>Use the layout keyboard shortcuts below. Click a tab button first, then press the keys to see each command work.</p>
            </div>
        );
    }
    return undefined;
};

const Key = ({ children }: { children: string }) => (
    <kbd
        style={{
            display: "inline-block",
            padding: "1px 6px",
            border: "1px solid #d1d5db",
            borderBottomWidth: 2,
            borderRadius: 4,
            background: "#f3f4f6",
            fontSize: "0.85em",
            fontFamily: "ui-monospace, monospace",
        }}
    >
        {children}
    </kbd>
);

function KeyboardAccessibility() {
    // these toggles rebuild the keyMap, showing that bindings are merged over the defaults and can
    // be disabled by setting a binding to undefined
    const [enableFocusToggle, setEnableFocusToggle] = React.useState(true);
    const [disableClose, setDisableClose] = React.useState(false);

    const keyMap = {
        closeTab: disableClose ? undefined : "Ctrl+Delete",
        renameTab: "F2",
        focusTabToggle: enableFocusToggle ? "F6" : undefined,
        focusNextTabset: "Alt+ArrowRight",
        focusPreviousTabset: "Alt+ArrowLeft",
        closeOverlayBorder: "Escape",
    };

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Keyboard Accessibility" path="examples/keyboard-accessibility/KeyboardAccessibility.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <label>
                    <input type="checkbox" checked={enableFocusToggle} onChange={(e) => setEnableFocusToggle(e.target.checked)} /> Enable <Key>F6</Key> focus toggle
                </label>
                <label>
                    <input type="checkbox" checked={disableClose} onChange={(e) => setDisableClose(e.target.checked)} /> Disable <Key>Ctrl+Delete</Key> close tab
                </label>
                <span style={{ color: "gray" }}>Active bindings are advertised via the aria-keyshortcuts attribute.</span>
            </div>
            <div style={{ padding: "4px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 13, lineHeight: 1.7 }}>
                <strong>Try it:</strong> click a tab, then:
                <ul style={{ margin: "4px 0 8px 20px" }}>
                    <li>
                        <Key>Tab</Key> / arrow keys move focus between tab buttons (the arrow navigation is part of the tablist role and cannot be rebound)
                    </li>
                    <li>
                        <Key>F2</Key> renames the focused tab (renaming is enabled on this layout)
                    </li>
                    <li>
                        <Key>Ctrl+Delete</Key> closes the focused tab when it is closeable
                    </li>
                    <li>
                        <Key>F6</Key> toggles focus between the tab button and its content panel
                    </li>
                    <li>
                        <Key>Alt+ArrowRight</Key> / <Key>Alt+ArrowLeft</Key> jump focus to the next / previous tabset
                    </li>
                    <li>
                        Click the Notes tab in the right border to open its overlay panel, then press <Key>Escape</Key> to dismiss it
                    </li>
                </ul>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} keyMap={keyMap} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<KeyboardAccessibility />);
}
`,u=r(),d=t.fromJson({global:{tabEnableRename:!0,tabSetEnableActiveIcon:!0},borders:[{type:`border`,location:`right`,borderType:`overlay`,children:[{type:`tab`,id:`b0`,name:`Notes`,component:`panel`}]}],layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,children:[{type:`tab`,id:`t0`,name:`One`,component:`panel`},{type:`tab`,id:`t1`,name:`Two`,component:`panel`},{type:`tab`,id:`t2`,name:`Three`,component:`panel`}]},{type:`tabset`,id:`ts1`,children:[{type:`tab`,id:`t3`,name:`Four`,component:`panel`},{type:`tab`,id:`t4`,name:`Five`,component:`panel`}]}]}}),f=e=>{if(e.getComponent()===`panel`)return(0,u.jsxs)(`div`,{style:{padding:20},children:[(0,u.jsx)(`h2`,{children:e.getName()}),(0,u.jsx)(`p`,{children:`Use the layout keyboard shortcuts below. Click a tab button first, then press the keys to see each command work.`})]})},p=({children:e})=>(0,u.jsx)(`kbd`,{style:{display:`inline-block`,padding:`1px 6px`,border:`1px solid #d1d5db`,borderBottomWidth:2,borderRadius:4,background:`#f3f4f6`,fontSize:`0.85em`,fontFamily:`ui-monospace, monospace`},children:e});function m(){let[e,t]=s.useState(!0),[r,a]=s.useState(!1);return(0,u.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,u.jsx)(i,{title:`Keyboard Accessibility`,path:`examples/keyboard-accessibility/KeyboardAccessibility.tsx`,source:l}),(0,u.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:16,alignItems:`center`,flexWrap:`wrap`},children:[(0,u.jsxs)(`label`,{children:[(0,u.jsx)(`input`,{type:`checkbox`,checked:e,onChange:e=>t(e.target.checked)}),` Enable `,(0,u.jsx)(p,{children:`F6`}),` focus toggle`]}),(0,u.jsxs)(`label`,{children:[(0,u.jsx)(`input`,{type:`checkbox`,checked:r,onChange:e=>a(e.target.checked)}),` Disable `,(0,u.jsx)(p,{children:`Ctrl+Delete`}),` close tab`]}),(0,u.jsx)(`span`,{style:{color:`gray`},children:`Active bindings are advertised via the aria-keyshortcuts attribute.`})]}),(0,u.jsxs)(`div`,{style:{padding:`4px 12px`,background:`#f9fafb`,borderBottom:`1px solid #e5e7eb`,fontSize:13,lineHeight:1.7},children:[(0,u.jsx)(`strong`,{children:`Try it:`}),` click a tab, then:`,(0,u.jsxs)(`ul`,{style:{margin:`4px 0 8px 20px`},children:[(0,u.jsxs)(`li`,{children:[(0,u.jsx)(p,{children:`Tab`}),` / arrow keys move focus between tab buttons (the arrow navigation is part of the tablist role and cannot be rebound)`]}),(0,u.jsxs)(`li`,{children:[(0,u.jsx)(p,{children:`F2`}),` renames the focused tab (renaming is enabled on this layout)`]}),(0,u.jsxs)(`li`,{children:[(0,u.jsx)(p,{children:`Ctrl+Delete`}),` closes the focused tab when it is closeable`]}),(0,u.jsxs)(`li`,{children:[(0,u.jsx)(p,{children:`F6`}),` toggles focus between the tab button and its content panel`]}),(0,u.jsxs)(`li`,{children:[(0,u.jsx)(p,{children:`Alt+ArrowRight`}),` / `,(0,u.jsx)(p,{children:`Alt+ArrowLeft`}),` jump focus to the next / previous tabset`]}),(0,u.jsxs)(`li`,{children:[`Click the Notes tab in the right border to open its overlay panel, then press `,(0,u.jsx)(p,{children:`Escape`}),` to dismiss it`]})]})]}),(0,u.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,u.jsx)(n,{model:d,factory:f,keyMap:{closeTab:r?void 0:`Ctrl+Delete`,renameTab:`F2`,focusTabToggle:e?`F6`:void 0,focusNextTabset:`Alt+ArrowRight`,focusPreviousTabset:`Alt+ArrowLeft`,closeOverlayBorder:`Escape`}})})]})}var h=document.getElementById(`container`);h&&(0,c.createRoot)(h).render((0,u.jsx)(m,{}));