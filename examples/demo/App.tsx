import * as React from "react";
import * as Prism from "prismjs";
import { createRoot } from "react-dom/client";
import { Action, Actions, BorderNode, DropInfo, IJsonTabNode, ITabRenderValues, ITabSetRenderValues, Layout, Model, Node, TabNode, TabSetNode } from "../../src/index";
import { NewFeatures } from "./NewFeatures";
import { showPopup } from "./PopupMenu";
import { SimpleForm } from "./SimpleForm";
import { Utils } from "./Utils";
import "prismjs/themes/prism-coy.css";
import BarChart from "./chart";
import MapComponent from "./openlayter";
import { AGGridExample } from "./aggrid";
import { JsonView } from "./JsonView";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import MUIComponent from "./MUIComponent";
import MUIDataGrid from "./MUIDataGrid";

var fields = ["Name", "Field1", "Field2", "Field3", "Field4", "Field5"];

const ContextExample = React.createContext('');

class App extends React.Component<any, { layoutFile: string | null, model: Model | null, json?: string, adding: boolean, fontSize: string, realtimeResize: boolean }> {

    loadingLayoutName?: string;
    nextGridIndex: number = 1;
    showingPopupMenu: boolean = false;
    htmlTimer?: any = null;
    layoutRef: React.RefObject<Layout>;

    constructor(props: any) {
        super(props);
        this.state = { layoutFile: null, model: null, adding: false, fontSize: "medium", realtimeResize: false };
        this.layoutRef = React.createRef();

        // save layout when unloading page
        window.onbeforeunload = (event: Event) => {
            this.save();
        };
    }

    componentDidMount() {
        this.loadLayout("default", false);

        // use to generate json typescript interfaces 
        // Model.toTypescriptInterfaces();
    }

    onModelChange = () => {
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
        let model = Model.fromJson(json);
        // model.setOnCreateTabSet((tabNode?: TabNode) => {
        //     console.log("onCreateTabSet " + tabNode);
        //     // return { type: "tabset", name: "Header Text" };
        //     return { type: "tabset" };
        // });

        // you can control where nodes can be dropped
        //model.setOnAllowDrop(this.allowDrop);

        const html = Prism.highlight(jsonText, Prism.languages.javascript, 'javascript');
        this.setState({ layoutFile: this.loadingLayoutName!, model: model, json: html });
    }

    allowDrop = (dragNode: (TabNode | TabSetNode), dropInfo: DropInfo) => {
        let dropNode = dropInfo.node;

        // prevent non-border tabs dropping into borders
        if (dropNode.getType() === "border" && (dragNode.getParent() == null || dragNode.getParent()!.getType() != "border"))
            return false;

        // prevent border tabs dropping into main layout
        if (dropNode.getType() !== "border" && (dragNode.getParent() != null && dragNode.getParent()!.getType() == "border"))
            return false;

        return true;
    }

    error = (reason: string) => {
        alert("Error loading json config file: " + this.loadingLayoutName + "\n" + reason);
    }


    onAddActiveClick = (event: React.MouseEvent) => {
        (this.layoutRef!.current!).addTabToActiveTabSet({
            component: "grid",
            icon: "images/article.svg",
            name: "Grid " + this.nextGridIndex++
        });
        // console.log("Added tab", addedTab);
    }

    onAddFromTabSetButton = (node: TabSetNode | BorderNode) => {
        const addedTab = (this.layoutRef!.current!).addTabToTabSet(node.getId(), {
            component: "grid",
            name: "Grid " + this.nextGridIndex++
        });
        console.log("Added tab", addedTab);
    }

    onRealtimeResize = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            realtimeResize: event.target.checked
        });
    }

    onRenderDragRect = (content: React.ReactNode | undefined, node?: Node, json?: IJsonTabNode) => {
        if (this.state.layoutFile === "newfeatures") {
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

    onContextMenu = (node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (!this.showingPopupMenu) {
            event.preventDefault();
            event.stopPropagation();
            // console.log(node, event);
            showPopup(
                node instanceof TabNode ? "Tab: " + node.getName() : "Type: " + node.getType(),
                (this.layoutRef!.current!).getRootDiv()!,
                event.clientX, event.clientY,
                ["Option 1", "Option 2"],
                (item: string | undefined) => {
                    // console.log("selected: " + item);
                    this.showingPopupMenu = false;
                });
            this.showingPopupMenu = true;
        }
    }

    onAuxMouseClick = (node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // console.log(node, event);
    }

    onTableDragStart = (event: React.DragEvent<HTMLDivElement>, node: Node) => {
        this.layoutRef.current!.moveTabWithDragAndDrop(event.nativeEvent, node as TabNode);
    }

    onDragStart = (event: React.DragEvent<HTMLElement>) => {
        event.stopPropagation();
        const gridName = "Grid " + this.nextGridIndex++;
        event.dataTransfer.setData('text/plain', "FlexLayoutTab:" + JSON.stringify({ name: gridName }));
        this.layoutRef.current!.setDragComponent(event.nativeEvent, gridName, 10, 10);
        this.layoutRef.current!.addTabWithDragAndDrop(event.nativeEvent, { name: gridName, component: "grid", "icon": "images/article.svg" });
    }

    onExternalDrag = (e: React.DragEvent<HTMLElement>) => {
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
                            this.state.model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Url", config: { data, type: "url" } }));
                        } else if (event.dataTransfer.types.indexOf("text/html") !== -1) {
                            const data = event.dataTransfer!.getData("text/html");
                            this.state.model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Html", config: { data, type: "html" } }));
                        } else if (event.dataTransfer.types.indexOf("text/plain") !== -1) {
                            const data = event.dataTransfer!.getData("text/plain");
                            this.state.model!.doAction(Actions.updateNodeAttributes(node.getId(), { name: "Text", config: { data, type: "text" } }));
                        }
                    }
                }
            }
        }
    };

    onShowLayoutClick = (event: React.MouseEvent) => {
        console.log(JSON.stringify(this.state.model!.toJson(), null, "\t"));
    }

    // onNewWindow = (event: React.MouseEvent) => {
    //     this.state.model!.doAction(Actions.createWindow( {
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

    onAdded = () => {
        this.setState({ adding: false });
    }

    onAction = (action: Action) => {
        return action;
    }

    factory = (node: TabNode) => {
        // log lifecycle events
        // node.setEventListener("resize", function(p){console.log("resize", node.getName(), p.rect);});
        // node.setEventListener("visibility", function(p){console.log("visibility", node.getName(), p.visible);});
        // node.setEventListener("close", function(p){console.log("close", node.getName());});

        var component = node.getComponent();

        if (component === "json") {
            return (<JsonView model={this.state.model!}/>);
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
                node.getExtraData().data = this.makeFakeData();
            }

            return <SimpleTable fields={fields} data={node.getExtraData().data} node={node} onDragStart={this.onTableDragStart} />;
        }
        else if (component === "sub") {
            var model = node.getExtraData().model;
            if (model == null) {
                node.getExtraData().model = Model.fromJson(node.getConfig().model);
                model = node.getExtraData().model;
                // save submodel on save event
                node.setEventListener("save", (p: any) => {
                    this.state.model!.doAction(Actions.updateNodeAttributes(node.getId(), { config: { model: node.getExtraData().model.toJson() } }));
                    //  node.getConfig().model = node.getExtraData().model.toJson();
                }
                );
            }

            return <Layout model={model} factory={this.factory} />;
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
        }

        return null;
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
        let page_stylesheet = window.document.getElementById("page-stylesheet");
        let index = flexlayout_stylesheet.href.lastIndexOf("/");
        let newAddress = flexlayout_stylesheet.href.substr(0, index);

        let s1 = document.createElement("link");
        s1.setAttribute("id", "flexlayout-stylesheet");
        s1.setAttribute("rel", "stylesheet");
        s1.setAttribute("href", newAddress + "/" + target.value + ".css");

        let s2 = document.createElement("link");
        s2.setAttribute("id", "page-stylesheet");
        s2.setAttribute("rel", "stylesheet");
        s2.setAttribute("href", target.value + ".css");

        const promises: Promise<boolean>[] = [];
        promises.push(new Promise((resolve) => {
            s1.onload = () => resolve(true);
        }));
        promises.push(new Promise((resolve) => {
            s2.onload = () => resolve(true);
        }));
        document.head.appendChild(s1);
        document.head.appendChild(s2);

        Promise.all(promises).then(() => {
            document.head.removeChild(flexlayout_stylesheet);
            document.head.removeChild(page_stylesheet!);
            this.forceUpdate();
        });
    }

    onFontSizeChange = (event: React.FormEvent) => {
        var target = event.target as HTMLSelectElement;
        this.setState({ fontSize: target.value });

        const flexLayoutElement = document.querySelector('.flexlayout__layout') as HTMLElement | null;
        flexLayoutElement!.style.setProperty('--font-size', target.value);
    }

    onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
        // renderValues.content = (<div>hello</div>);
        // renderValues.content += " *";
        // renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
        // renderValues.name = "tab " + node.getId(); // name used in overflow menu
        // renderValues.buttons.push(<div style={{flexGrow:1}}></div>);
        // renderValues.buttons.push(<img style={{width:"1em", height:"1em"}} src="images/folder.svg"/>);
    }

    onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
        if (this.state.layoutFile === "default") {
            //renderValues.buttons.push(<img key="folder" style={{width:"1em", height:"1em"}} src="images/folder.svg"/>);
            if (node instanceof TabSetNode) { // don't show + button on border tabsets
                renderValues.stickyButtons.push(
                    <img src="images/add.svg"
                        alt="Add"
                        key="Add button"
                        title="Add Tab (using onRenderTabSet callback, see Demo)"
                        style={{ width: "1.1em", height: "1.1em" }}
                        className="flexlayout__tab_toolbar_button"
                        onClick={() => this.onAddFromTabSetButton(node)}
                    />);

                // put overflow button before + button (default is after)
                // renderValues.overflowPosition=0    
            }
        }
    }

    onTabSetPlaceHolder(node: TabSetNode) {
        return <div
            key="placeholder"
            style={{
                display: "flex",
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center"
            }}>Drag tabs to this area</div>;
    }


    render() {
        let contents: React.ReactNode = "loading ...";
        if (this.state.model !== null) {
            contents = <Layout
            ref={this.layoutRef}
            model={this.state.model}
            popoutWindowName="Demo Popout"
            factory={this.factory}
                onAction={this.onAction}
                onModelChange={this.onModelChange}
                onRenderTab={this.onRenderTab}
                onRenderTabSet={this.onRenderTabSet}
                onRenderDragRect={this.onRenderDragRect}
                onExternalDrag={this.onExternalDrag}
                realtimeResize={this.state.realtimeResize}
                onContextMenu={this.state.layoutFile === "newfeatures" ? this.onContextMenu : undefined}
                onAuxMouseClick={this.state.layoutFile === "newfeatures" ? this.onAuxMouseClick : undefined}
                // icons={{
                //     more: (node: (TabSetNode | BorderNode), hiddenTabs: { node: TabNode; index: number }[]) => {
                //         return (<div style={{fontSize:".7em"}}>{hiddenTabs.length}</div>);
                //     }
                // }}
                onTabSetPlaceHolder={this.onTabSetPlaceHolder}

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
                            <select className="toolbar_control" onChange={this.onSelectLayout}>
                                <option value="default">Default</option>
                                <option value="newfeatures">New Features</option>
                                <option value="simple">Simple</option>
                                <option value="mosaic">Mosaic Style</option>
                                <option value="sub">SubLayout</option>
                                <option value="complex">Complex</option>
                            </select>
                            <button className="toolbar_control" onClick={this.onReloadFromFile} style={{ marginLeft: 5 }}>Reload</button>
                            <div style={{ flexGrow: 1 }}></div>
                            <span style={{ fontSize: "14px" }}>Realtime resize</span>
                            <input
                                name="realtimeResize"
                                type="checkbox"
                                checked={this.state.realtimeResize}
                                onChange={this.onRealtimeResize} />
                            <select className="toolbar_control" style={{ marginLeft: 5 }}
                                onChange={this.onFontSizeChange}
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
                            <select className="toolbar_control" style={{ marginLeft: 5 }} defaultValue="light" onChange={this.onThemeChange}>
                                <option value="light">Light</option>
                                <option value="underline">Underline</option>
                                <option value="gray">Gray</option>
                                <option value="dark">Dark</option>
                                <option value="rounded">Rounded</option>
                            </select>
                            {/* <button className="toolbar_control" style={{ marginLeft: 5 }} onClick={this.onNewWindow}>New Window</button> */}
                            <button className="toolbar_control" style={{ marginLeft: 5 }} onClick={this.onShowLayoutClick}>Show Layout JSON in Console</button>
                            <button className="toolbar_control drag-from" draggable={true}
                                style={{ height: "30px", marginLeft: 5, border: "none", outline: "none" }}
                                title="Add tab by starting a drag on a draggable element"
                                onDragStart={this.onDragStart}>
                                Add Drag
                            </button>
                            <button className="toolbar_control" disabled={this.state.adding} style={{ marginLeft: 5 }} title="Add using Layout.addTabToActiveTabSet" onClick={this.onAddActiveClick}>Add Active</button>
                        </div>
                        <div className="contents">
                            {contents}
                        </div>
                    </div>
                </ContextExample.Provider>
            </React.StrictMode>
        );
    }

    makeFakeData() {
        var data = [];
        var r = Math.random() * 50;
        for (var i = 0; i < r; i++) {
            var rec: { [key: string]: any; } = {};
            rec.Name = this.randomString(5, "BCDFGHJKLMNPQRSTVWXYZ");
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

class SimpleTable extends React.Component<{ fields: any, node: Node, data: any, onDragStart: (event: React.DragEvent<HTMLDivElement>, node: Node) => void }, any> {
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

        return <table className="simple_table"
        // draggable={true} 
        // onDragStart={(e) => this.props.onDragStart(e, this.props.node)}
        >
            <tbody>
                <tr>{headercells}</tr>
                {rows}
            </tbody>
        </table>;
    }
}

// function InnerComponent() {
//     const value = React.useContext(ContextExample);
//     return <span>{value}</span>;
// }

const root = createRoot(document.getElementById("container")!);
root.render(<App />)
