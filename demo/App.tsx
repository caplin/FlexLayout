import * as React from "react";
import { createRoot } from "react-dom/client";
import { Action, Actions, BorderNode, IJsonTabNode, ITabRenderValues, ITabSetRenderValues, Layout, Model, Node, TabNode, TabSetNode, AddIcon } from "../src/index";
import { NewFeatures } from "./NewFeatures";
import { showPopup } from "./PopupMenu";
import { SimpleForm } from "./SimpleForm";
import { Utils } from "./Utils";
import { AGGridExample } from "./aggrid";
import { JsonView } from "./JsonView";
import MapComponent from "./openlayter";
import MUIComponent from "./MUIComponent";
import MUIDataGrid from "./MUIDataGrid";
import BarChart from "./chart";
import * as Prism from "prismjs";

// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
import "prismjs/themes/prism-coy.css";
import '../style/combined.scss';
import './styles.css';
import './popupmenu.css';

var fields = ["Name", "Field1", "Field2", "Field3", "Field4", "Field5"];

const ContextExample = React.createContext('');

function App() {
    const [layoutFile, setLayoutFile] = React.useState<string | null>(null);
    const [model, setModel] = React.useState<Model | null>(null);
    const [, setJson] = React.useState<string>("");
    const [, setFontSize] = React.useState<string>("medium");
    const [realtimeResize, setRealtimeResize] = React.useState<boolean>(false);
    const [showLayout, setShowLayout] = React.useState<boolean>(false);
    const [popoutClassName, setPopoutClassName] = React.useState<string>("flexlayout__theme_light");

    const loadingLayoutName = React.useRef<string | null>(null);
    const nextGridIndex = React.useRef<number>(1);
    const showingPopupMenu = React.useRef<boolean>(false);
    const layoutRef = React.useRef<Layout | null>(null);

    // latest values to prevent closure problems
    const latestModel = React.useRef<Model>(model);
    const latestLayoutFile = React.useRef<string>(layoutFile);

    latestModel.current = model;
    latestLayoutFile.current = layoutFile;

    const save = () => {
        var jsonStr = JSON.stringify(latestModel.current!.toJson(), null, "\t");
        localStorage.setItem(latestLayoutFile.current!, jsonStr);
    }

    const load = (jsonText: string) => {
        let json = JSON.parse(jsonText);
        let model = Model.fromJson(json);
        // model.setOnCreateTabSet((tabNode?: TabNode) => {
        //     console.log("onCreateTabSet " + tabNode);
        //     // return { type: "tabset", name: "Header Text" };
        //     return { type: "tabset" };
        // });

        // you can control where nodes can be dropped
        //model.setOnAllowDrop(this.allowDrop);

        const html = Prism.highlight(jsonText, Prism.languages.javascript, 'javascript');
        // this.setState({ layoutFile: this.loadingLayoutName!, model: model, json: html });
        setLayoutFile(loadingLayoutName!.current);
        setModel(model);
        setJson(html);
    }

    const loadLayout = (layoutName: string, reload?: boolean) => {
        if (layoutFile !== null) {
            save();
        }

        loadingLayoutName.current = layoutName;
        let loaded = false;
        if (!reload) {
            var json = localStorage.getItem(layoutName);
            if (json != null) {
                load(json);
                loaded = true;
            }
        }

        if (!loaded) {
            Utils.downloadFile("layouts/" + layoutName + ".layout", load, error);
        }
    }

    React.useEffect(() => {
        // save layout when unloading page
        window.onbeforeunload = (event: Event) => {
            save();
        };

        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const layout = params.get('layout') || "default";

        loadLayout(layout, false);

        // use to generate json typescript interfaces 
        // Model.toTypescriptInterfaces();
    }, []);

    // const allowDrop = (dragNode: (TabNode | TabSetNode), dropInfo: DropInfo) => {
    //     let dropNode = dropInfo.node;

    //     // prevent non-border tabs dropping into borders
    //     if (dropNode.getType() === "border" && (dragNode.getParent() == null || dragNode.getParent()!.getType() != "border"))
    //         return false;

    //     // prevent border tabs dropping into main layout
    //     if (dropNode.getType() !== "border" && (dragNode.getParent() != null && dragNode.getParent()!.getType() == "border"))
    //         return false;

    //     return true;
    // }

    const error = (reason: string) => {
        alert("Error loading json config file: " + loadingLayoutName.current + "\n" + reason);
    }

    const onAddActiveClick = (event: React.MouseEvent) => {

        if (layoutFile?.startsWith("test_")) {
            (layoutRef!.current as Layout).addTabToActiveTabSet({
                component: "testing",
                name: "Text" + nextGridIndex.current++
            });
        } else {

            (layoutRef!.current!).addTabToActiveTabSet({
                component: "grid",
                icon: "images/article.svg",
                name: "Grid " + nextGridIndex.current++
            });
        }
        // console.log("Added tab", addedTab);
    }

    const onAddFromTabSetButton = (node: TabSetNode | BorderNode) => {
        const addedTab = (layoutRef!.current!).addTabToTabSet(node.getId(), {
            component: "grid",
            name: "Grid " + nextGridIndex.current++
        });
        console.log("Added tab", addedTab);
    }

    const onRealtimeResize = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRealtimeResize(event.target.checked);
    }

    const onShowLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowLayout(event.target.checked);
    }

    const onRenderDragRect = (content: React.ReactNode | undefined, node?: Node, json?: IJsonTabNode) => {
        if (layoutFile === "newfeatures") {
            return (<>
                {content}
                <div style={{ whiteSpace: "pre" }}>
                    <br />
                    This is a customized<br />
                    drag rectangle
                </div>
            </>
            );
        } else {
            return undefined; // use default rendering
        }
    }

    const onContextMenu = (node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (!showingPopupMenu.current) {
            event.preventDefault();
            event.stopPropagation();
            // console.log(node, event);
            showPopup(
                node instanceof TabNode ? "Tab: " + node.getName() : "Type: " + node.getType(),
                (layoutRef!.current!).getRootDiv()!,
                event.clientX, event.clientY,
                ["Option 1", "Option 2"],
                (item: string | undefined) => {
                    // console.log("selected: " + item);
                    showingPopupMenu.current = false;
                });
            showingPopupMenu.current = true;
        }
    }

    const onAuxMouseClick = (node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // console.log(node, event);
    }

    const onTableDragStart = (event: React.DragEvent<HTMLDivElement>, node: Node) => {
        layoutRef.current!.moveTabWithDragAndDrop(event.nativeEvent, node as TabNode);
    }

    const onDragStart = (event: React.DragEvent<HTMLElement>) => {
        event.stopPropagation();
        if (layoutFile?.startsWith("test_")) {
            const gridName = "Text" + nextGridIndex.current++;
            event.dataTransfer.setData('text/plain', "FlexLayoutTab:" + JSON.stringify({ name: gridName }));
            layoutRef.current!.setDragComponent(event.nativeEvent, gridName, 10, 10);
            layoutRef.current!.addTabWithDragAndDrop(event.nativeEvent, { name: gridName, component: "testing", "icon": "images/article.svg" });

        } else {
            const gridName = "Grid " + nextGridIndex.current++;
            event.dataTransfer.setData('text/plain', "FlexLayoutTab:" + JSON.stringify({ name: gridName }));
            layoutRef.current!.setDragComponent(event.nativeEvent, gridName, 10, 10);
            layoutRef.current!.addTabWithDragAndDrop(event.nativeEvent, { name: gridName, component: "grid", "icon": "images/article.svg" });
        }
    }

    const onExternalDrag = (e: React.DragEvent<HTMLElement>) => {
        // console.log("onExternaldrag ", e.dataTransfer.types);
        // Check for supported content type
        const validTypes = ["text/uri-list", "text/html", "text/plain"];
        if (e.dataTransfer.types.find(t => validTypes.indexOf(t) !== -1) === undefined) return;
        // Set dropEffect (icon)
        e.dataTransfer.dropEffect = "link";
        return {
            json: {
                type: "tab",
                component: "multitype"
            },
            onDrop: (node?: Node, event?: React.DragEvent<HTMLElement>) => {
                if (!node || !event) return;  // aborted drag

                if (node instanceof TabNode) {
                    if (event.dataTransfer) {
                        if (event.dataTransfer.types.indexOf("text/uri-list") !== -1) {
                            const data = event.dataTransfer!.getData("text/uri-list");
                            model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Url", config: { data, type: "url" } }));
                        } else if (event.dataTransfer.types.indexOf("text/html") !== -1) {
                            const data = event.dataTransfer!.getData("text/html");
                            model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Html", config: { data, type: "html" } }));
                        } else if (event.dataTransfer.types.indexOf("text/plain") !== -1) {
                            const data = event.dataTransfer!.getData("text/plain");
                            model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Text", config: { data, type: "text" } }));
                        }
                    }
                }
            }
        }
    };

    const onShowLayoutClick = (event: React.MouseEvent) => {
        console.log(JSON.stringify(model!.toJson(), null, "\t"));
    }

    // const onNewWindow = (event: React.MouseEvent) => {
    //     model!.doAction(Actions.createWindow( {
    //             "type": "row",
    //             "children": [
    //                 {
    //                     "type": "tabset",
    //                     "weight": 100,
    //                     "active": true,
    //                     "children": []
    //                 }
    //             ]
    //     }, {x:100, y:100, width:600, height:400}));
    // }

    const onAction = (action: Action) => {
        return action;
    }

    const factory = (node: TabNode) => {
        // log lifecycle events
        // node.setEventListener("resize", function(p){console.log("resize", node.getName(), p.rect);});
        // node.setEventListener("visibility", function(p){console.log("visibility", node.getName(), p.visible);});
        // node.setEventListener("close", function(p){console.log("close", node.getName());});

        var component = node.getComponent();

        if (component === "json") {
            return (<JsonView model={latestModel.current!} />);
        }
        else if (component === "simpleform") {
            return <SimpleForm />
        }
        else if (component === "mui") {
            return <MUIComponent />
        }
        else if (component === "muigrid") {
            return <MUIDataGrid />
        }
        else if (component === "aggrid") {
            return <AGGridExample />
        }
        else if (component === "chart") {
            return <BarChart />
        }
        else if (component === "map") {
            return <MapComponent />
        }
        else if (component === "grid") {
            if (node.getExtraData().data == null) {
                // create data in node extra data first time accessed
                node.getExtraData().data = makeFakeData();
            }

            return <SimpleTable fields={fields} data={node.getExtraData().data} node={node} onDragStart={onTableDragStart} />;
        }
        else if (component === "sub") {
            var model = node.getExtraData().model;
            if (model == null) {
                node.getExtraData().model = Model.fromJson(node.getConfig().model);
                model = node.getExtraData().model;
                // save submodel on save event
                node.setEventListener("save", (p: any) => {
                    latestModel.current!.doAction(Actions.updateNodeAttributes(node.getId(), { config: { model: node.getExtraData().model.toJson() } }));
                    //  node.getConfig().model = node.getExtraData().model.toJson();
                }
                );
            }

            return <Layout model={model} factory={factory} />;
        }
        else if (component === "text") {
            try {
                return <div dangerouslySetInnerHTML={{ __html: node.getConfig().text }} />;
            } catch (e) {
                console.log(e);
            }
        }
        else if (component === "newfeatures") {
            return <NewFeatures />;
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
        } else if (component === "testing") {
            return <div className="tab_content">{node.getName()}</div>;
        }

        return null;
    }

    const onSelectLayout = (event: React.FormEvent) => {
        var target = event.target as HTMLSelectElement;
        loadLayout(target.value);
    }

    const onReloadFromFile = (event: React.MouseEvent) => {
        loadLayout(layoutFile!, true);
    }

    const onThemeChange = (event: React.FormEvent) => {
        var target = event.target as HTMLSelectElement;
        const themeClassName = "flexlayout__theme_" + target.value;
        document.documentElement.className = themeClassName;
        // need to set popout top level class name to new theme
        setPopoutClassName(themeClassName);
    }

    const onFontSizeChange = (event: React.FormEvent) => {
        var target = event.target as HTMLSelectElement;
        setFontSize(target.value);

        const flexLayoutElement = document.querySelector('.flexlayout__layout') as HTMLElement | null;
        flexLayoutElement!.style.setProperty('--font-size', target.value);
    }

    const onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
        // renderValues.content = (<div>hello</div>);
        // renderValues.content += " *";
        // renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
        // renderValues.name = "tab " + node.getId(); // name used in overflow menu
        if (layoutFile === "newfeatures" && node.getComponent() === "newfeatures") {
            renderValues.buttons.push(<img key="menu" title="added menu button" style={{ width: "1em", height: "1em" }} src="images/menu.svg" />);
        }

        // playwright testing
        if (layoutFile?.startsWith("test_")) {
            if (node.getId() === "onRenderTab1") {
                renderValues.leading = <img src="images/settings.svg" key="1" style={{ width: "1em", height: "1em" }} />
                renderValues.content = "onRenderTab1";
                renderValues.buttons.push(<img src="images/folder.svg" key="1" style={{ width: "1em", height: "1em" }} />);
            } else if (node.getId() === "onRenderTab2") {
                renderValues.leading = <img src="images/settings.svg" key="1" style={{ width: "1em", height: "1em" }} />
                renderValues.content = "onRenderTab2";
                renderValues.buttons.push(<img src="images/folder.svg" key="1" style={{ width: "1em", height: "1em" }} />);
            }
        }
    }

    const onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
        if (node instanceof TabSetNode) {
            if (layoutFile === "newfeatures") {
                renderValues.buttons.push(<img key="menu" title="added menu button" style={{ width: "1em", height: "1em" }} src="images/menu.svg" />);
            } else if (layoutFile === "default") {
                renderValues.stickyButtons.push(
                    <button
                        key="Add button"
                        title="Add tab"
                        className="flexlayout__tab_toolbar_button"
                        onClick={() => onAddFromTabSetButton(node)}
                    ><AddIcon /></button>);

                // put overflow button before + button (default is after)
                // renderValues.overflowPosition=0    
            }
        }

        // playwright testing
        if (layoutFile?.startsWith("test_")) {
            if (node.getId() === "onRenderTabSet1") {
                renderValues.buttons.push(<img src="images/folder.svg" key="1" />);
                renderValues.buttons.push(<img src="images/settings.svg" key="2" />);
            } else if (node.getId() === "onRenderTabSet2") {
                renderValues.buttons.push(<img src="images/folder.svg" key="1" />);
                renderValues.buttons.push(<img src="images/settings.svg" key="2" />);
            } else if (node.getId() === "onRenderTabSet3") {
                renderValues.stickyButtons.push(
                    <img src="images/add.svg"
                        alt="Add"
                        key="Add button"
                        title="Add Tab (using onRenderTabSet callback, see Demo)"
                        style={{ marginLeft: 5, width: 24, height: 24 }}
                    // onClick={() => this.onAddFromTabSetButton(node)}
                    />);
            } else if (node instanceof BorderNode) {
                renderValues.buttons.push(<img src="images/folder.svg" key="1" />);
                renderValues.buttons.push(<img src="images/settings.svg" key="2" />);
            }
        }
    }

    const onTabSetPlaceHolder = (node: TabSetNode) => {
        return <div
            key="placeholder"
            style={{
                display: "flex",
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center"
            }}>Drag tabs to this area</div>;
    }

    const makeFakeData = () => {
        var data = [];
        var r = Math.random() * 50;
        for (var i = 0; i < r; i++) {
            var rec: { [key: string]: any; } = {};
            rec.Name = randomString(5, "BCDFGHJKLMNPQRSTVWXYZ");
            for (var j = 1; j < fields.length; j++) {
                rec[fields[j]] = (1.5 + Math.random() * 2).toFixed(2);
            }
            data.push(rec);
        }
        return data;
    }

    const randomString = (len: number, chars: string) => {
        var a = [];
        for (var i = 0; i < len; i++) {
            a.push(chars[Math.floor(Math.random() * chars.length)]);
        }

        return a.join("");
    }

    let contents: React.ReactNode = "loading ...";
    if (model !== null) {
        contents = <Layout
            ref={layoutRef}
            model={model}
            popoutClassName={popoutClassName}
            popoutWindowName="Demo Popout"
            factory={factory}
            onAction={onAction}
            onRenderTab={onRenderTab}
            onRenderTabSet={onRenderTabSet}
            onRenderDragRect={onRenderDragRect}
            onExternalDrag={onExternalDrag}
            realtimeResize={realtimeResize}
            onContextMenu={layoutFile === "newfeatures" ? onContextMenu : undefined}
            onAuxMouseClick={layoutFile === "newfeatures" ? onAuxMouseClick : undefined}
            // icons={{
            //     more: (node: (TabSetNode | BorderNode), hiddenTabs: { node: TabNode; index: number }[]) => {
            //         return (<div style={{fontSize:".7em"}}>{hiddenTabs.length}</div>);
            //     }
            // }}
            onTabSetPlaceHolder={onTabSetPlaceHolder}

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
        //         if (id === I18nLabel.Move_Tab) {
        //             return `move this tab: ${param}`;
        //         } else if (id === I18nLabel.Move_Tabset) {
        //             return `move this tabset`
        //         }
        //         return undefined;
        //     }
        // }
        />;
    }

    return (
        <React.StrictMode>
            <ContextExample.Provider value="from context">
                <div className="app">
                    <div className="toolbar" dir="ltr">
                        <select className="toolbar_control" onChange={onSelectLayout}>
                            <option value="default">Default</option>
                            <option value="newfeatures">New Features</option>
                            <option value="simple">Simple</option>
                            <option value="mosaic">Mosaic Style</option>
                            <option value="sub">SubLayout</option>
                            <option value="complex">Complex</option>
                        </select>
                        <button key="reloadbutton" className="toolbar_control" onClick={onReloadFromFile} style={{ marginLeft: 5 }}>Reload</button>
                        <div style={{ flexGrow: 1 }}></div>
                        <span style={{ fontSize: "14px" }}>Realtime resize</span>
                        <input
                            name="realtimeResize"
                            type="checkbox"
                            checked={realtimeResize}
                            onChange={onRealtimeResize} />
                        <span style={{ marginLeft: 5, fontSize: "14px" }}>Show layout</span>
                        <input
                            name="show layout"
                            type="checkbox"
                            checked={showLayout}
                            onChange={onShowLayout} />
                        <select className="toolbar_control" style={{ marginLeft: 5 }}
                            onChange={onFontSizeChange}
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
                        </select>
                        <select className="toolbar_control" style={{ marginLeft: 5 }} defaultValue="light" onChange={onThemeChange}>
                            <option value="light">Light</option>
                            <option value="underline">Underline</option>
                            <option value="gray">Gray</option>
                            <option value="dark">Dark</option>
                            <option value="rounded">Rounded</option>
                        </select>
                        {/* <button className="toolbar_control" style={{ marginLeft: 5 }} onClick={onNewWindow}>New Window</button> */}
                        <button className="toolbar_control" style={{ marginLeft: 5 }} onClick={onShowLayoutClick}>Show Layout JSON in Console</button>
                        <button className="toolbar_control drag-from" data-id="add-drag" draggable={true}
                            style={{ height: "30px", marginLeft: 5, border: "none", outline: "none" }}
                            title="Add tab by starting a drag on a draggable element"
                            onDragStart={onDragStart}>
                            Add Drag
                        </button>
                        <button className="toolbar_control" data-id="add-active" style={{ marginLeft: 5 }} title="Add using Layout.addTabToActiveTabSet" onClick={onAddActiveClick}>Add Active</button>
                    </div>
                    <div className={"contents" + (showLayout ? " showLayout" : "")}>
                        {contents}
                    </div>
                </div>
            </ContextExample.Provider>
        </React.StrictMode>
    );
}

function SimpleTable(props: { fields: any, node: Node, data: any, onDragStart: (event: React.DragEvent<HTMLDivElement>, node: Node) => void }) {

    // if (Math.random()>0.8) throw Error("oppps I crashed");
    var headercells = props.fields.map(function (field: any) {
        return <th key={field}>{field}</th>;
    });

    var rows = [];
    for (var i = 0; i < props.data.length; i++) {
        var row = props.fields.map((field: any) => <td key={field}>{props.data[i][field]}</td>);
        rows.push(<tr key={i}>{row}</tr>);
    }

    return <table className="simple_table">
        <tbody>
            <tr>{headercells}</tr>
            {rows}
        </tbody>
    </table>;
}

// function InnerComponent() {
//     const value = React.useContext(ContextExample);
//     return <span>{value}</span>;
// }

const root = createRoot(document.getElementById("container")!);
root.render(<App />)
