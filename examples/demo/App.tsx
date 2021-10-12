import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { v4 } from "uuid";
import * as FlexLayout from "../../src/index";
import { Action, Actions, BorderNode, DropInfo, IJsonTabNode, Node, TabNode, TabSetNode } from "../../src/index";
import { ILayoutProps, ITabRenderValues, ITabSetRenderValues } from "../../src/view/Layout";
import Utils from "./Utils";

var fields = ["Name", "Field1", "Field2", "Field3", "Field4", "Field5"];

class App extends React.Component<any, { layoutFile: string | null, model: FlexLayout.Model | null, adding: boolean, fontSize: string, realtimeResize: boolean }> {

    loadingLayoutName?: string;
    nextGridIndex: number = 1;

    constructor(props: any) {
        super(props);
        this.state = { layoutFile: null, model: null, adding: false, fontSize: "medium", realtimeResize: false };

        // save layout when unloading page
        window.onbeforeunload = (event: Event) => {
            this.save();
        };
    }

    preventIOSScrollingWhenDragging(e: Event) {
        if (FlexLayout.DragDrop.instance.isActive()) {
            e.preventDefault();
        }
    }

    componentDidMount() {
        this.loadLayout("default", false);
        document.body.addEventListener("touchmove", this.preventIOSScrollingWhenDragging, { passive: false });

        // use to generate json typescript interfaces 
        // Model.toTypescriptInterfaces();
    }

    save() {
        var jsonStr = JSON.stringify(this.state.model!.toJson(), null, "\t");
        localStorage.setItem(this.state.layoutFile!, jsonStr);
    }

    loadLayout(layoutName: string, reload?: boolean) {
        if (this.state.layoutFile !== null) {
            this.save();
        }

        this.loadingLayoutName = layoutName;
        let loaded = false;
        if (!reload) {
            var json = localStorage.getItem(layoutName);
            if (json != null) {
                this.load(json);
                loaded = true;
            }
        }

        if (!loaded) {
            Utils.downloadFile("layouts/" + layoutName + ".layout", this.load, this.error);
        }
    }

    load = (jsonText: string) => {
        let json = JSON.parse(jsonText);
        let model = FlexLayout.Model.fromJson(json);
        // model.setOnCreateTabSet((tabNode?: TabNode) => {
        //     console.log("onCreateTabSet " + tabNode);
        //     // return { type: "tabset", name: "Header Text" };
        //     return { type: "tabset" };
        // });

        // you can control where nodes can be dropped
        //model.setOnAllowDrop(this.allowDrop);

        this.setState({ layoutFile: this.loadingLayoutName!, model: model });
    }

    allowDrop = (dragNode: (TabNode | TabSetNode), dropInfo: DropInfo) => {
        let dropNode = dropInfo.node;

        // prevent non-border tabs dropping into borders
        if (dropNode.getType() == "border" && (dragNode.getParent() == null || dragNode.getParent()!.getType() != "border"))
            return false;

        // prevent border tabs dropping into main layout
        if (dropNode.getType() != "border" && (dragNode.getParent() != null && dragNode.getParent()!.getType() == "border"))
            return false;

        return true;
    }

    error = (reason: string) => {
        alert("Error loading json config file: " + this.loadingLayoutName + "\n" + reason);
    }

    onAddDragMouseDown = (event: React.MouseEvent | React.TouchEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        if (this.state.model!.getMaximizedTabset() == null) {
            (this.refs.layout as FlexLayout.Layout).addTabWithDragAndDrop("Add grid\n(Drag to location)", {
                component: "grid",
                name: "Grid " + this.nextGridIndex++
            }, this.onAdded);
            // this.setState({ adding: true });
        }
    }

    onAddActiveClick = (event: React.MouseEvent) => {
        if (this.state.model!.getMaximizedTabset() == null) {
            (this.refs.layout as FlexLayout.Layout).addTabToActiveTabSet({
                component: "grid",
                name: "Grid " + this.nextGridIndex++
            });
        }
    }

    onAddFromTabSetButton = (node: TabSetNode | BorderNode) => {
        // if (this.state.model!.getMaximizedTabset() == null) {
        (this.refs.layout as FlexLayout.Layout).addTabToTabSet(node.getId(), {
            component: "grid",
            name: "Grid " + this.nextGridIndex++
        });
        // }
    }

    onAddIndirectClick = (event: React.MouseEvent) => {
        if (this.state.model!.getMaximizedTabset() == null) {
            (this.refs.layout as FlexLayout.Layout).addTabWithDragAndDropIndirect("Add grid\n(Drag to location)", {
                component: "grid",
                name: "Grid " + this.nextGridIndex++
            }, this.onAdded);
            this.setState({ adding: true });
        }
    }

    onRealtimeResize = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            realtimeResize: event.target.checked
        });
    }

    onRenderDragRect = (text: String, node?: Node, json?: IJsonTabNode) => {
        if (node !== undefined) {
            return <div>{JSON.stringify(node?.toJson())}</div>
        } else if (json !== undefined) {
            return <div>{JSON.stringify(json)}</div>
        }
        return undefined;
    }

    onExternalDrag = (e: React.DragEvent) => {
        // console.log("onExternaldrag ", e.dataTransfer.types);
        // Check for supported content type
        const validTypes = ["text/uri-list", "text/html", "text/plain"];
        if (e.dataTransfer.types.find(t => validTypes.indexOf(t) !== -1) === undefined) return;
        // Set dropEffect (icon)
        e.dataTransfer.dropEffect = "link";
        return {
            dragText: "Drag To New Tab",
            json: {
                type: "tab",
                component: "multitype"
            },
            onDrop: (node?: Node, event?: Event) => {
                if (!node || !event) return;  // aborted drag

                if (node instanceof TabNode && event instanceof DragEvent) {
                    const dragEvent = event as DragEvent;
                    if (dragEvent.dataTransfer) {
                        if (dragEvent.dataTransfer.types.indexOf("text/uri-list") !== -1) {
                            const data = dragEvent.dataTransfer!.getData("text/uri-list");
                            this.state.model!.doAction(FlexLayout.Actions.updateNodeAttributes(node.getId(), { name: "Url", config: { data, type: "url" } }));
                        }
                        else if (dragEvent.dataTransfer.types.indexOf("text/html") !== -1) {
                            const data = dragEvent.dataTransfer!.getData("text/html");
                            this.state.model!.doAction(FlexLayout.Actions.updateNodeAttributes(node.getId(), { name: "Html", config: { data, type: "html" } }));
                        }
                        else if (dragEvent.dataTransfer.types.indexOf("text/plain") !== -1) {
                            const data = dragEvent.dataTransfer!.getData("text/plain");
                            this.state.model!.doAction(FlexLayout.Actions.updateNodeAttributes(node.getId(), { name: "Text", config: { data, type: "text" } }));
                        }
                    }
                }
            }
        }
    };

    onShowLayoutClick = (event: React.MouseEvent) => {
        console.log(JSON.stringify(this.state.model!.toJson(), null, "\t"));
    }

    onAdded = () => {
        this.setState({ adding: false });
    }

    onTableClick = (node: Node, event: Event) => {
        // console.log("tab: \n" + node._toAttributeString());
        // console.log("tabset: \n" + node.getParent()!._toAttributeString());
    }

    onAction = (action: Action) => {
        return action;
    }

    factory = (node: TabNode) => {
        // log lifecycle events
        //node.setEventListener("resize", function(p){console.log("resize", node);});
        //node.setEventListener("visibility", function(p){console.log("visibility", node);});
        //node.setEventListener("close", function(p){console.log("close", node);});

        var component = node.getComponent();

        if (component === "grid") {
            if (node.getExtraData().data == null) {
                // create data in node extra data first time accessed
                node.getExtraData().data = this.makeFakeData();
            }

            return <SimpleTable fields={fields} onClick={this.onTableClick.bind(this, node)} data={node.getExtraData().data} />;
        }
        else if (component === "sub") {
            var model = node.getExtraData().model;
            if (model == null) {
                node.getExtraData().model = FlexLayout.Model.fromJson(node.getConfig().model);
                model = node.getExtraData().model;
                // save submodel on save event
                node.setEventListener("save", (p: any) => {
                    this.state.model!.doAction(FlexLayout.Actions.updateNodeAttributes(node.getId(), { config: { model: node.getExtraData().model.toJson() } }));
                    //  node.getConfig().model = node.getExtraData().model.toJson();
                }
                );
            }

            return <FlexLayout.Layout model={model} factory={this.factory} />;
        }
        else if (component === "text") {
            try {
                return <div dangerouslySetInnerHTML={{ __html: node.getConfig().text }} />;
            } catch (e) {
                console.log(e);
            }
        }
        else if (component === "multitype") {
            try {
                const config = node.getConfig();
                if (config.type === "url") {
                    return <iframe title={node.getId()} src={config.data} style={{ display: "block", border: "none", boxSizing: "border-box" }} width="100%" height="100%" />;
                } else if (config.type === "html") {
                    return (<div dangerouslySetInnerHTML={{ __html: config.data }} />);
                } else if (config.type === "text") {
                    return (
                        <textarea style={{ position: "absolute", width: "100%", height: "100%", resize: "none", boxSizing: "border-box", border: "none" }}
                            defaultValue={config.data}
                        />);
                }
            } catch (e) {
                return (<div>{String(e)}</div>);
            }
        }
        else if (component === "tabstorage") {
            return <TabStorage tab={node} layout={this.refs.layout as FlexLayout.Layout} />
        }

        return null;
    }

    titleFactory = (node: TabNode) => {
        if (node.getId() === "custom-tab") {
            // return "(Added by titleFactory) " + node.getName();
            return {
                titleContent: <div>(Added by titleFactory) {node.getName()}</div>,
                name: "the name for custom tab"
            };
        }
        return;
    }

    iconFactory = (node: TabNode) => {
        if (node.getId() === "custom-tab") {
            return <><span style={{ marginRight: 3 }}>:)</span></>
        }
        return;
    }

    onSelectLayout = (event: React.FormEvent) => {
        var target = event.target as HTMLSelectElement;
        this.loadLayout(target.value);
    }

    onReloadFromFile = (event: React.MouseEvent) => {
        this.loadLayout(this.state.layoutFile!, true);
    }

    onThemeChange = (event: React.FormEvent) => {
        var target = event.target as HTMLSelectElement;
        let flexlayout_stylesheet: any = window.document.getElementById("flexlayout-stylesheet");
        let index = flexlayout_stylesheet.href.lastIndexOf("/");
        let newAddress = flexlayout_stylesheet.href.substr(0, index);
        flexlayout_stylesheet.setAttribute("href", newAddress + "/" + target.value + ".css");
        let page_stylesheet = window.document.getElementById("page-stylesheet");
        page_stylesheet!.setAttribute("href", target.value + ".css");
        this.forceUpdate();
    }

    onSizeChange = (event: React.FormEvent) => {
        var target = event.target as HTMLSelectElement;
        this.setState({ fontSize: target.value });
    }

    onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
        // renderValues.content += " *";
        // renderValues.name = "tab " + node.getId(); // name used in overflow menu
        // renderValues.buttons.push(<img src="images/grey_ball.png"/>);
    }

    onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
        if (this.state.layoutFile === "default") {
            //renderValues.headerContent = "-- " + renderValues.headerContent + " --";
            //renderValues.buttons.push(<img src="images/grey_ball.png"/>);
            renderValues.stickyButtons.push(
                <img src="images/add.png"
                    alt="Add"
                    key="Add button"
                    title="Add Tab (using onRenderTabSet callback, see Demo)"
                    style={{ marginLeft: 5, width: 24, height: 24 }}
                    onClick={() => this.onAddFromTabSetButton(node)}
                />);
        }
    }

    render() {


        let contents: React.ReactNode = "loading ...";
        let maximized = false;
        if (this.state.model !== null) {
            maximized = this.state.model.getMaximizedTabset() !== undefined;
            contents = <FlexLayout.Layout
                ref="layout"
                model={this.state.model}
                factory={this.factory}
                font={{ size: this.state.fontSize }}
                onAction={this.onAction}
                titleFactory={this.titleFactory}
                iconFactory={this.iconFactory}
                onRenderTab={this.onRenderTab}
                onRenderTabSet={this.onRenderTabSet}
                onExternalDrag={this.onExternalDrag}
                realtimeResize={this.state.realtimeResize}
                onTabDrag={(dragging, over, x, y, location, refresh) => {
                    const tabStorageImpl = over.getExtraData().tabStorage_onTabDrag as ILayoutProps['onTabDrag']
                    if (tabStorageImpl) return tabStorageImpl(dragging, over, x, y, location, refresh)
                    return undefined
                }}
                // onDragRectRender={this.onRenderDragRect}
            // classNameMapper={
            //     className => {
            //         console.log(className);
            //         if (className === "flexlayout__tab_button--selected") {
            //             className = "override__tab_button--selected";
            //         }
            //         return className;
            //     }
            // }
            // i18nMapper = {
            //     (id, param?) => {
            //         if (id === FlexLayout.I18nLabel.Move_Tab) {
            //             return `move this tab: ${param}`;
            //         } else if (id === FlexLayout.I18nLabel.Move_Tabset) {
            //             return `move this tabset`
            //         }
            //         return undefined;
            //     }
            // }
            />;
        }

        return <div className="app">
            <div className="toolbar">
                <select onChange={this.onSelectLayout}>
                    <option value="default">Default</option>
                    <option value="newfeatures">New Features</option>
                    <option value="simple">Simple</option>
                    <option value="justsplitters">Just Splitters</option>
                    <option value="sub">SubLayout</option>
                    <option value="complex">Complex</option>
                    <option value="preferred">Using Preferred size</option>
                    <option value="trader">Trader</option>
                </select>
                <button onClick={this.onReloadFromFile} style={{ marginLeft: 5 }}>reload from file</button>
                <div style={{ flexGrow: 1 }}></div>
                <span style={{ fontSize: "14px" }}>Realtime resize</span>
                <input
                    name="realtimeResize"
                    type="checkbox"
                    checked={this.state.realtimeResize}
                    onChange={this.onRealtimeResize} />
                <select style={{ marginLeft: 5 }}
                    onChange={this.onSizeChange}
                    defaultValue="medium">
                    <option value="xx-small">Size xx-small</option>
                    <option value="x-small">Size x-small</option>
                    <option value="small">Size small</option>
                    <option value="medium">Size medium</option>
                    <option value="large">Size large</option>
                    <option value="8px">Size 8px</option>
                    <option value="10px">Size 10px</option>
                    <option value="12px">Size 12px</option>
                    <option value="14px">Size 14px</option>
                    <option value="16px">Size 16px</option>
                    <option value="18px">Size 18px</option>
                    <option value="20px">Size 20px</option>
                    <option value="25px">Size 25px</option>
                    <option value="30px">Size 30px</option>
                    <option value="70%">Size 70%</option>
                    <option value="80%">Size 80%</option>
                    <option value="90%">Size 90%</option>
                    <option value="100%">Size 100%</option>
                    <option value="120%">Size 120%</option>
                    <option value="140%">Size 140%</option>
                    <option value="160%">Size 160%</option>
                    <option value="180%">Size 180%</option>
                    <option value="200%">Size 200%</option>
                </select>
                <select style={{ marginLeft: 5 }} defaultValue="gray" onChange={this.onThemeChange}>
                    <option value="light">Light</option>
                    <option value="gray">Gray</option>
                    <option value="dark">Dark</option>
                </select>
                <button style={{ marginLeft: 5 }} onClick={this.onShowLayoutClick}>Show Layout JSON in Console</button>
                <button disabled={this.state.adding || maximized}
                    style={{ height: "30px", marginLeft: 5, border: "none", outline: "none", backgroundColor: "lightgray" }}
                    title="Add using Layout.addTabWithDragAndDrop"
                    onMouseDown={this.onAddDragMouseDown}
                    onTouchStart={this.onAddDragMouseDown}>Add Drag</button>
                <button disabled={this.state.adding || maximized} style={{ marginLeft: 5 }} title="Add using Layout.addTabToActiveTabSet" onClick={this.onAddActiveClick}>Add Active</button>
                <button disabled={this.state.adding || maximized} style={{ marginLeft: 5 }} title="Add using Layout.addTabWithDragAndDropIndirect" onClick={this.onAddIndirectClick}>Add Indirect</button>
            </div>
            <div className="contents">
                {contents}
            </div>
        </div>;
    }

    makeFakeData() {
        var data = [];
        var r = Math.random() * 50;
        for (var i = 0; i < r; i++) {
            var rec: { [key: string]: any; } = {};
            rec.Name = this.randomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
            for (var j = 1; j < fields.length; j++) {
                rec[fields[j]] = (1.5 + Math.random() * 2).toFixed(2);
            }
            data.push(rec);
        }
        return data;
    }

    randomString(len: number, chars: string) {
        var a = [];
        for (var i = 0; i < len; i++) {
            a.push(chars[Math.floor(Math.random() * chars.length)]);
        }

        return a.join("");
    }
}

class SimpleTable extends React.Component<{ fields: any, data: any, onClick: any }, any> {
    shouldComponentUpdate() {
        return true;
    }

    render() {
        // if (Math.random()>0.8) throw Error("oppps I crashed");
        var headercells = this.props.fields.map(function (field: any) {
            return <th key={field}>{field}</th>;
        });

        var rows = [];
        for (var i = 0; i < this.props.data.length; i++) {
            var row = this.props.fields.map((field: any) => <td key={field}>{this.props.data[i][field]}</td>);
            rows.push(<tr key={i}>{row}</tr>);
        }

        return <table className="simple_table" onClick={this.props.onClick}>
            <tbody>
                <tr>{headercells}</tr>
                {rows}
            </tbody>
        </table>;
    }
}

function TabStorage({ tab, layout }: { tab: TabNode, layout: FlexLayout.Layout }) {
    const [storedTabs, setStoredTabs] = useState<IJsonTabNode[]>(tab.getConfig()?.storedTabs ?? [])

    useEffect(() => {
        tab.getModel().doAction(Actions.updateNodeAttributes(tab.getId(), { config: { ...(tab.getConfig() ?? {}), storedTabs } }))
    }, [storedTabs])

    const [contents, setContents] = useState<HTMLDivElement | null>(null)
    const [list, setList] = useState<HTMLDivElement | null>(null)
    const refs = useRef<Map<string, HTMLDivElement | undefined>>(new Map()).current
    const [emptyElem, setEmptyElem] = useState<HTMLDivElement | null>(null)

    // true = down, false = up, null = none
    const [scrollDown, setScrollDown] = useState<boolean | null>(null)

    const scrollInvalidateRef = useRef<() => void>()
    const scroller = useCallback((isDown: boolean) => {
        contents?.scrollBy(0, isDown ? 10 : -10)
        scrollInvalidateRef.current?.()
    }, [contents])

    const scrollerRef = useRef(scroller)
    scrollerRef.current = scroller

    useEffect(() => {
        if (scrollDown !== null) {
            let scrollInterval: NodeJS.Timeout
            let scrollTimeout = setTimeout(() => {
                scrollerRef.current(scrollDown)
                scrollInterval = setInterval(() => scrollerRef.current(scrollDown), 50)
            }, 500)

            return () => {
                clearTimeout(scrollTimeout)
                clearInterval(scrollInterval)
            }
        }

        return
    }, [scrollDown])

    const kickstartingCallback = useCallback((dragging: TabNode | IJsonTabNode) => {
        const json = dragging instanceof TabNode ? dragging.toJson() as IJsonTabNode : dragging

        if (json.id === undefined) {
            json.id = `#${v4()}`
        }

        setStoredTabs(tabs => [...tabs, json])

        if (dragging instanceof TabNode) {
            tab.getModel().doAction(Actions.deleteTab(dragging.getId()));
        }
    }, [tab])

    const calculateInsertion = useCallback((absoluteY: number) => {
        const rects = storedTabs.map(json => refs.get(json.id!)!.getBoundingClientRect())

        const splits = [rects[0].top]

        for (let i = 1; i < rects.length; i++) {
            splits.push((rects[i - 1].bottom + rects[i].top) / 2)
        }

        splits.push(rects[rects.length - 1].bottom)

        let insertionIndex = 0

        for (let i = 1; i < splits.length; i++) {
            if (Math.abs(splits[i] - absoluteY) <= Math.abs(splits[insertionIndex] - absoluteY)) {
                insertionIndex = i
            }
        }

        return {
            insertionIndex,
            split: splits[insertionIndex]
        }
    }, [storedTabs])

    const insertionCallback = useCallback((dragging: TabNode | IJsonTabNode, _, __, y: number) => {
        const absoluteY = y + tab.getRect().y + layout.getDomRect().top
        const { insertionIndex } = calculateInsertion(absoluteY)
        const json = dragging instanceof TabNode ? dragging.toJson() as IJsonTabNode : dragging

        if (json.id === undefined) {
            json.id = `#${v4()}`
        }

        setStoredTabs(tabs => {
            const newTabs = [...tabs]
            const foundAt = newTabs.indexOf(json)

            if (foundAt > -1) {
                newTabs.splice(foundAt, 1)
                newTabs.splice(insertionIndex > foundAt ? insertionIndex - 1 : insertionIndex, 0, json)
            } else {
                newTabs.splice(insertionIndex, 0, json)
            }

            return newTabs
        })

        setScrollDown(null)

        if (dragging instanceof TabNode) {
            tab.getModel().doAction(Actions.deleteTab(dragging.getId()));
        }
    }, [calculateInsertion, tab, layout])

    tab.getExtraData().tabStorage_onTabDrag = useCallback(((dragging, over, x, y, _, refresh) => {
        if (contents && list) {
            const layoutDomRect = layout.getDomRect()
            const tabRect = tab.getRect()

            const rootX = tabRect.x + layoutDomRect.left
            const rootY = tabRect.y + layoutDomRect.top
            const absX = x + rootX
            const absY = y + rootY

            const listBounds = list.getBoundingClientRect()
            if (absX < listBounds.left || absX >= listBounds.right ||
                absY < listBounds.top || absY >= listBounds.bottom) return

            if (emptyElem) {
                return {
                    x: listBounds.left - rootX,
                    y: listBounds.top - rootY,
                    width: listBounds.width,
                    height: listBounds.height,
                    callback: kickstartingCallback,
                    cursor: 'copy'
                }
            } else {
                const insertion = calculateInsertion(absY)

                scrollInvalidateRef.current = refresh

                if (absY - rootY < tabRect.height / 5) {
                    setScrollDown(false)
                } else if (absY - rootY > tabRect.height * 4/5) {
                    setScrollDown(true)
                } else {
                    setScrollDown(null)
                }

                return {
                    x: listBounds.left - rootX,
                    y: insertion.split - rootY - 2, // -2 needed for border thickness, TODO: have flexlayout automatically make this unnecessary for 0-height/width borders
                    width: listBounds.width,
                    height: 0,
                    callback: insertionCallback,
                    invalidated: () => setScrollDown(null),
                    cursor: 'row-resize'
                }
            }
        }

        return undefined
    }) as Required<ILayoutProps>['onTabDrag'], [storedTabs, contents, list, refs, emptyElem])

    return <div ref={setContents} className="tab-storage">
        <p>
            This component demonstrates the custom drag and drop features of FlexLayout, by allowing you to store tabs in a list.
            You can drag tabs into the list, reorder the list, and drag tabs out of the list, all using the layout's built-in drag system!
        </p>
        <div ref={setList} className="tab-storage-tabs">
            {storedTabs.length === 0 && <div ref={setEmptyElem} className="tab-storage-empty">Looks like there's nothing here! Try dragging a tab over this text.</div>}
            {storedTabs.map((stored, i) => (
                <div
                    ref={ref => ref ? refs.set(stored.id!, ref) : refs.delete(stored.id!)}
                    className="tab-storage-entry"
                    key={stored.id}
                    onMouseDown={e => {
                        e.preventDefault()
                        layout.addTabWithDragAndDrop(stored.name ?? 'Unnamed', stored, (node) => node && setStoredTabs(tabs => tabs.filter(tab => tab !== stored)))
                    }}
                    onTouchStart={e => {
                        layout.addTabWithDragAndDrop(stored.name ?? 'Unnamed', stored, (node) => node && setStoredTabs(tabs => tabs.filter(tab => tab !== stored)))
                    }}
                >
                    {stored.name ?? 'Unnamed'}
                </div>))
            }
        </div>
    </div>
}

ReactDOM.render(<App />, document.getElementById("container"));
