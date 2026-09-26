import{_ as e,f as t,n,o as r,t as i}from"./Header-DaenXOHN.js";var a=e(),o=`import { createRoot } from "react-dom/client";
import { IJsonModel, Layout, Model, TabNode } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./Iframe.tsx?raw";

const json: IJsonModel = {
    global: {
        tabEnableScrollbars: false,
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                weight: 50,
                children: [
                    { type: "tab", id: "t0", name: "React", component: "iframe", config: { url: "https://en.wikipedia.org/wiki/React_(software)" } },
                    { type: "tab", id: "t1", name: "TypeScript", component: "iframe", config: { url: "https://en.wikipedia.org/wiki/TypeScript" } },
                    { type: "tab", id: "t2", name: "JavaScript", component: "iframe", config: { url: "https://en.wikipedia.org/wiki/JavaScript" } },
                ],
            },
            {
                type: "tabset",
                id: "ts1",
                weight: 50,
                children: [
                    { type: "tab", id: "t3", name: "Node.js", component: "iframe", config: { url: "https://en.wikipedia.org/wiki/Node.js" } },
                    { type: "tab", id: "t4", name: "CSS", component: "iframe", config: { url: "https://en.wikipedia.org/wiki/CSS" } },
                    { type: "tab", id: "t5", name: "HTML", component: "iframe", config: { url: "https://en.wikipedia.org/wiki/HTML" } },
                ],
            },
        ],
    },
};

const model = Model.fromJson(json);

const IframePanel = ({ url }: { url: string }) => <iframe src={url} style={{ width: "100%", height: "100%", border: "none" }} title="Wikipedia" />;

const factory = (node: TabNode) => {
    if (node.getComponent() === "iframe") {
        const url = node.getConfig()?.url;
        if (url) {
            return <IframePanel url={url} />;
        }
    }
    return undefined;
};

function Iframe() {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="Iframe" path="examples/iframe/Iframe.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>Wikipedia articles in iframes.</span>
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout model={model} factory={factory} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<Iframe />);
}
`,s=r(),c=t.fromJson({global:{tabEnableScrollbars:!1},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,weight:50,children:[{type:`tab`,id:`t0`,name:`React`,component:`iframe`,config:{url:`https://en.wikipedia.org/wiki/React_(software)`}},{type:`tab`,id:`t1`,name:`TypeScript`,component:`iframe`,config:{url:`https://en.wikipedia.org/wiki/TypeScript`}},{type:`tab`,id:`t2`,name:`JavaScript`,component:`iframe`,config:{url:`https://en.wikipedia.org/wiki/JavaScript`}}]},{type:`tabset`,id:`ts1`,weight:50,children:[{type:`tab`,id:`t3`,name:`Node.js`,component:`iframe`,config:{url:`https://en.wikipedia.org/wiki/Node.js`}},{type:`tab`,id:`t4`,name:`CSS`,component:`iframe`,config:{url:`https://en.wikipedia.org/wiki/CSS`}},{type:`tab`,id:`t5`,name:`HTML`,component:`iframe`,config:{url:`https://en.wikipedia.org/wiki/HTML`}}]}]}}),l=({url:e})=>(0,s.jsx)(`iframe`,{src:e,style:{width:`100%`,height:`100%`,border:`none`},title:`Wikipedia`}),u=e=>{if(e.getComponent()===`iframe`){let t=e.getConfig()?.url;if(t)return(0,s.jsx)(l,{url:t})}};function d(){return(0,s.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,s.jsx)(i,{title:`Iframe`,path:`examples/iframe/Iframe.tsx`,source:o}),(0,s.jsx)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:(0,s.jsx)(`span`,{style:{color:`gray`},children:`Wikipedia articles in iframes.`})}),(0,s.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,s.jsx)(n,{model:c,factory:u})})]})}var f=document.getElementById(`container`);f&&(0,a.createRoot)(f).render((0,s.jsx)(d,{}));