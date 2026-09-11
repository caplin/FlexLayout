import{_ as e,f as t,n,o as r,t as i}from"./Header-CKq7r1qR.js";var a=e(),o=`import { createRoot } from "react-dom/client";
import { IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./MinSizes.tsx?raw";

// tabMinWidth / tabMinHeight set the minimum size (in px) of every tab panel, so the splitters
// will not let any panel shrink below 200px.
const json: IJsonModel = {
    global: {
        tabMinWidth: 200,
        tabMinHeight: 200,
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                weight: 50,
                children: [{ type: "tab", id: "t0", name: "Left", component: "panel" }],
            },
            {
                type: "tabset",
                id: "ts1",
                weight: 50,
                children: [{ type: "tab", id: "t1", name: "Right", component: "panel" }],
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
                <p>This panel has a minimum size of 200px — the splitters will not let it shrink any further.</p>
            </div>
        );
    }
    return undefined;
};

function MinSizes() {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Min Sizes" path="examples/min-sizes/MinSizes.tsx" source={sourceCode} />

            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<MinSizes />);
}
`,s=r(),c=t.fromJson({global:{tabMinWidth:200,tabMinHeight:200},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,weight:50,children:[{type:`tab`,id:`t0`,name:`Left`,component:`panel`}]},{type:`tabset`,id:`ts1`,weight:50,children:[{type:`tab`,id:`t1`,name:`Right`,component:`panel`}]}]}}),l=e=>{if(e.getComponent()===`panel`)return(0,s.jsxs)(`div`,{style:{padding:20},children:[(0,s.jsx)(`h2`,{children:e.getName()}),(0,s.jsx)(`p`,{children:`This panel has a minimum size of 200px — the splitters will not let it shrink any further.`})]})};function u(){return(0,s.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,s.jsx)(i,{title:`Min Sizes`,path:`examples/min-sizes/MinSizes.tsx`,source:o}),(0,s.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,s.jsx)(n,{model:c,factory:l})})]})}var d=document.getElementById(`container`);d&&(0,a.createRoot)(d).render((0,s.jsx)(u,{}));