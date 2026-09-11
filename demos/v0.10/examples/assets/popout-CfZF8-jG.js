import{_ as e,f as t,n,o as r,t as i}from"./Header-CKq7r1qR.js";var a=e(),o=`import { createRoot } from "react-dom/client";
import { IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./Popout.tsx?raw";

// Both the popout-to-window (enablePopout) and popout-to-float (enableFloat) features are
// enabled globally, along with their header icons. Popouts open the popout.html host page that
// ships alongside this example (examples/popout/popout.html).
const json: IJsonModel = {
    global: {
        tabEnablePopout: true,
        tabEnablePopoutIcon: true,
        tabEnableFloat: true,
        tabEnableFloatIcon: true,
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                weight: 50,
                children: [
                    { type: "tab", id: "t0", name: "One", component: "content" },
                    { type: "tab", id: "t1", name: "Two", component: "content" },
                ],
            },
            {
                type: "tabset",
                id: "ts1",
                weight: 50,
                children: [{ type: "tab", id: "t2", name: "Three", component: "content" }],
            },
        ],
    },
};

const Content = ({ title }: { title: string }) => (
    <div style={{ padding: 20 }}>
        <h2>{title}</h2>
        <p>Use the icons in the tabset header to pop this tab out into a floating panel or a native window, then drag it back in.</p>
    </div>
);

const model = Model.fromJson(json);

const factory = (node: TabNode) => {
    if (node.getComponent() === "content") {
        return <Content title={node.getName()} />;
    }
    return undefined;
};

function Popout() {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Popout" path="examples/popout/Popout.tsx" source={sourceCode} />

            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<Popout />);
}
`,s=r(),c={global:{tabEnablePopout:!0,tabEnablePopoutIcon:!0,tabEnableFloat:!0,tabEnableFloatIcon:!0},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,weight:50,children:[{type:`tab`,id:`t0`,name:`One`,component:`content`},{type:`tab`,id:`t1`,name:`Two`,component:`content`}]},{type:`tabset`,id:`ts1`,weight:50,children:[{type:`tab`,id:`t2`,name:`Three`,component:`content`}]}]}},l=({title:e})=>(0,s.jsxs)(`div`,{style:{padding:20},children:[(0,s.jsx)(`h2`,{children:e}),(0,s.jsx)(`p`,{children:`Use the icons in the tabset header to pop this tab out into a floating panel or a native window, then drag it back in.`})]}),u=t.fromJson(c),d=e=>{if(e.getComponent()===`content`)return(0,s.jsx)(l,{title:e.getName()})};function f(){return(0,s.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,s.jsx)(i,{title:`Popout`,path:`examples/popout/Popout.tsx`,source:o}),(0,s.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,s.jsx)(n,{model:u,factory:d})})]})}var p=document.getElementById(`container`);p&&(0,a.createRoot)(p).render((0,s.jsx)(f,{}));