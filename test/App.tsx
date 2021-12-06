import * as React from 'react';
import { Layout, Model, TabNode, IJsonModel } from '../src';
import './style/light.css';
import './style/app.css';

export function App(props) {
    const model = Model.fromJson(props.json);

    const selfRef = React.useRef<Layout | null>(null);
    const nextGridIndex = React.useRef<number>(0);

    const onAddDragMouseDown = (event: React.MouseEvent | React.TouchEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        (selfRef.current as Layout).addTabWithDragAndDrop("Add text\n(Drag to location)", {
            component: "text",
            name: "Text" + nextGridIndex.current++
        }, null);
    }

    const onAddActiveClick = (event: React.MouseEvent) => {
        (selfRef.current as Layout).addTabToActiveTabSet({
            component: "text",
            name: "Text" + nextGridIndex.current++
        });
    }

    const onAddIndirectClick = (event: React.MouseEvent) => {
        (selfRef.current as Layout).addTabWithDragAndDropIndirect("Add grid\n(Drag to location)", {
            component: "text",
            name: "Text" + nextGridIndex.current++
        }, null);
    }

    const onAddbyIdClick = (event: React.MouseEvent) => {
        (selfRef.current as Layout).addTabToTabSet("#1", {
            component: "text",
            name: "Text" + nextGridIndex.current++
        });
    }

    const factory = (node: TabNode) => {
        var component = node.getComponent();
        if (component === "text") {
            return <div className="tab_content">{node.getName()}</div>;
        }
    }

    return (
        <div className="container">
            <div>
                <button
                    style={{ height: "30px", marginLeft: 5, border: "none", outline: "none" }}
                    data-id="add-drag"
                    onMouseDown={onAddDragMouseDown}
                    onTouchStart={onAddDragMouseDown}>Add Drag</button>
                <button data-id="add-active" onClick={onAddActiveClick}>Add Active</button>
                <button data-id="add-indirect" onClick={onAddIndirectClick}>Add Indirect</button>
                <button data-id="add-byId" onClick={onAddbyIdClick}>Add by Id #1</button>
            </div>
            <div style={{ position: "relative", flexGrow: 1 }}>
                <Layout
                    ref={selfRef}
                    model={model}
                    factory={factory} />
            </div>
        </div>
    );
}

export const twoTabs: IJsonModel = {
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                id: "#1",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Two",
                        component: "text",
                    }
                ]
            }
        ]
    }
};

export const threeTabs: IJsonModel = {
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                name: "TheHeader",
                children: [
                    {
                        type: "tab",
                        name: "Two",
                        icon: "/test/images/settings.svg",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Three",
                        component: "text",
                    }
                ]
            }

        ]
    }
};


export const withBorders: IJsonModel = {
    global: {},
    borders: [
        {
            "type": "border",
            "location": "top",
            "children": [
                {
                    "type": "tab",
                    "name": "top1",
                    "component": "text"
                }
            ]
        },
        {
            "type": "border",
            "location": "bottom",
            "children": [
                {
                    "type": "tab",
                    "name": "bottom1",
                    "component": "text"
                },
                {
                    "type": "tab",
                    "name": "bottom2",
                    "component": "text"
                }
            ]
        },
        {
            "type": "border",
            "location": "left",
            "children": [
                {
                    "type": "tab",
                    "name": "left1",
                    "component": "text"
                }
            ]
        },
        {
            "type": "border",
            "location": "right",
            "children": [
                {
                    "type": "tab",
                    "name": "right1",
                    "component": "text"
                }
            ]
        }
    ],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                id: "#1",
                children: [
                    {
                        type: "tab",
                        name: "Two",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Three",
                        component: "text",
                    }
                ]
            }

        ]
    }
};
