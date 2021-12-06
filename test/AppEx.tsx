import * as React from 'react';
import { BorderNode, IJsonModel, ITabRenderValues, ITabSetRenderValues, Layout, Model, TabNode, TabSetNode } from '../src';
import './style/app.css';
import './style/light.css';

export function AppEx(props) {
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

    const onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
        if (node.getId() === "onRenderTab1") {
            renderValues.leading = <img src="/test/images/settings.svg" key="1" />
            renderValues.content = "onRenderTab1";
            renderValues.name = "onRenderTab1 overflow"; // name used in overflow menu
            renderValues.buttons.push(<img src="/test/images/folder.svg" key="1" />);
        } else if (node.getId() === "onRenderTab2") {
            renderValues.leading = <img src="/test/images/settings.svg" key="1" />
            renderValues.content = "onRenderTab2";
            renderValues.name = "onRenderTab2 overflow"; // name used in overflow menu
            renderValues.buttons.push(<img src="/test/images/folder.svg" key="1" />);
        }
    }

    const onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
        if (node.getId() === "onRenderTabSet1") {
            renderValues.buttons.push(<img src="/test/images/folder.svg" key="1" />);
            renderValues.buttons.push(<img src="/test/images/settings.svg" key="2" />);
        } else if (node.getId() === "onRenderTabSet2") {
            renderValues.headerContent = "onRenderTabSet2";
            renderValues.headerButtons.push(<img src="/test/images/settings.svg" key="1" />);
            renderValues.headerButtons.push(<img src="/test/images/folder.svg" key="2" />);
            renderValues.buttons.push(<img src="/test/images/folder.svg" key="1" />);
            renderValues.buttons.push(<img src="/test/images/settings.svg" key="2" />);
        } else if (node.getId() === "onRenderTabSet3") {
            renderValues.stickyButtons.push(
                <img src="/test/images/add.svg"
                    alt="Add"
                    key="Add button"
                    title="Add Tab (using onRenderTabSet callback, see Demo)"
                    style={{ marginLeft: 5, width: 24, height: 24 }}
                    onClick={() => this.onAddFromTabSetButton(node)}
                />);
        } else if (node instanceof BorderNode) {
            renderValues.buttons.push(<img src="/test/images/folder.svg" key="1" />);
            renderValues.buttons.push(<img src="/test/images/settings.svg" key="2" />);
        }
    }

    const titleFactory = (node: TabNode) => {
        if (node.getId() === "titleFactory") {
            return {
                titleContent: <>[titleFactory]</>,
                name: "the name for custom tab"
            };
        }
        return;
    }

    const iconFactory = (node: TabNode) => {
        if (node.getId() === "iconFactory") {
            return <>[iconFactory]</>
        }
        return;
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
                    factory={factory}

                    onRenderTab={onRenderTab}
                    onRenderTabSet={onRenderTabSet}
                    titleFactory={titleFactory}
                    iconFactory={iconFactory}
                />
            </div>
        </div>
    );
}

export const layoutEx1: IJsonModel = {
    global: {},
    borders: [
        {
            "type": "border",
            "location": "top",
            "children": [
                {
                    "type": "tab",
                    id: "onRenderTab2",
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
                id: "onRenderTabSet1",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        id: "titleFactory",
                        name: "One",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                id: "onRenderTabSet2",
                name: "will be replaced",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        id: "onRenderTab1",
                        name: "Two",
                        component: "text",
                    }
                ]
            },
            {
                type: "tabset",
                id: "onRenderTabSet3",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        id: "iconFactory",
                        name: "Three",
                        component: "text",
                    }
                ]
            }

        ]
    }
};

export const layoutEx2: IJsonModel = {
    global: {
        "tabSetMinHeight": 100,
        "tabSetMinWidth": 100,
        "borderMinSize": 100,
        "borderEnableAutoHide": true,
        "tabSetEnableClose": true
    },
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
                type: "row",
                weight: 100,
                children: [
                    {
                        type: "tabset",
                        weight: 50,
                        children: [
                            {
                                type: "tab",
                                name: "Three",
                                component: "text",
                            },
                            {
                                type: "tab",
                                name: "Four",
                                component: "text",
                            },
                            {
                                type: "tab",
                                name: "Five",
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
                                name: "Six",
                                component: "text",
                            },
                            {
                                type: "tab",
                                name: "Seven",
                                component: "text",
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
