import * as React from "react";
import { createRoot } from "react-dom/client";
import { Action, Actions, BorderNode, IJsonTabNode, ITabRenderValues, ITabSetRenderValues, Layout, Model, Node, TabNode, TabSetNode, AddIcon, MenuIcon, SettingsIcon, ILayoutApi, showPopupMenu, PopupMenuEntry } from "../src/index";
import { NewFeatures } from "./NewFeatures";
import { SimpleForm } from "./SimpleForm";
import { Utils } from "./Utils";
import { AGGridExample } from "./aggrid";
import { JsonView } from "./JsonView";
import { ActionLog } from "./ActionLog";
import MapComponent from "./openlayer";
import MonacoComponent from "./monaco";
import TerminalComponent from "./terminal";
import MUIComponent from "./MUIComponent";
import MUIDataGrid from "./MUIDataGrid";
import BarChart from "./chart";
import * as Prism from "prismjs";

import "prismjs/themes/prism-coy.css";
import '../style/combined.scss';
import './styles.css';
import { Attributes } from "./Attributes";
import { TabLayout } from "../src/view/TabLayout";

const fields = ["Name", "Field1", "Field2", "Field3", "Field4", "Field5"];

const randomString = (len: number, chars: string) => {
    const a = [];
    for (let i = 0; i < len; i++) {
        a.push(chars[Math.floor(Math.random() * chars.length)]);
    }

    return a.join("");
}

const makeFakeData = () => {
    const data = [];
    const r = Math.random() * 50;
    for (let i = 0; i < r; i++) {
        const rec: { [key: string]: any; } = {};
        rec.Name = randomString(5, "BCDFGHJKLMNPQRSTVWXYZ");
        for (let j = 1; j < fields.length; j++) {
            rec[fields[j]] = (1.5 + Math.random() * 2).toFixed(2);
        }
        data.push(rec);
    }
    return data;
}

const ContextExample = React.createContext('');

const borderIconStyle = { width: "1em", height: "1em", display: "flex", alignItems: "center" };

// a side panel splitting the layout (side by side)
const SplitBorderIcon = () => (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={borderIconStyle} viewBox="0 0 24 24">
        <rect x="3.75" y="4.75" width="16.5" height="14.5" rx="1" fill="none" stroke="var(--color-icon)" strokeWidth="1.5" />
        <rect x="6.75" y="7.75" width="6" height="8.5" rx="1" fill="var(--color-icon)" stroke="var(--color-icon)" />
    </svg>
);

// a side panel floating over the layout (protrudes beyond the frame, knocked out where it crosses it)
const OverlayBorderIcon = () => (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" style={borderIconStyle} viewBox="0 0 24 24">
        <rect x="3.75" y="4.75" width="16.5" height="14.5" rx="1" fill="none" stroke="var(--color-icon)" strokeWidth="1.5" />
        <rect x="3.75" y="4.75" width="8" height="14.5" rx="1" fill="var(--color-icon)" stroke="var(--color-icon)" />
    </svg>
);

function App() {
    const [layoutFile, setLayoutFile] = React.useState<string | null>(null);
    const [model, setModel] = React.useState<Model | null>(null);
    const [, setJson] = React.useState<string>("");
    const [, setFontSize] = React.useState<string>("medium");
    const [realtimeResize, setRealtimeResize] = React.useState<boolean>(true);
    const [showLayout, setShowLayout] = React.useState<boolean>(false);
    const [attrs, setAttrs] = React.useState<boolean>(false);

    const [popoutClassName, setPopoutClassName] = React.useState<string>("flexlayout__theme_alpha_light");

    const loadingLayoutName = React.useRef<string | null>(null);
    const nextGridIndex = React.useRef<number>(1);

    const contextMenuHideRef = React.useRef<(() => void) | null>(null);
    const layoutRef = React.useRef<ILayoutApi | null>(null);

    // latest values to prevent closure problems
    const latestModel = React.useRef<Model | null>(model);
    const latestLayoutFile = React.useRef<string | null>(layoutFile);

     React.useEffect(() => {
        latestModel.current = model;
        latestLayoutFile.current = layoutFile;
        // e2e test hooks (used by popout-leak.spec / popup-position.spec): drive the live model and
        // layout the way app code would, without pointer interactions
        (window as any).__flexDispatch = (action: Action) => latestModel.current?.doAction(action);
        (window as any).__flexActions = Actions;
        (window as any).__flexModel = () => latestModel.current;
        (window as any).__flexLayout = () => layoutRef.current;
     });

    const save = () => {
        const jsonStr = JSON.stringify(latestModel.current!.toJson(), null, "\t");
        localStorage.setItem(latestLayoutFile.current!, jsonStr);
    }

    const load = (jsonText: string) => {
        const json = JSON.parse(jsonText);
        const model = Model.fromJson(json);

        // model.addChangeListener((action:Action) => {
        //     console.log(JSON.stringify(action));
        // });

        // model.setOnCreateTabSet((tabNode?: TabNode) => {
        //     console.log("onCreateTabSet " + tabNode);
        //     // return { type: "tabset", name: "Header Text" };
        //     return { type: "tabset" };
        // });

        // you can control where nodes can be dropped
        //model.setOnAllowDrop(this.allowDrop);

        const html = Prism.highlight(jsonText, Prism.languages.javascript, 'javascript');
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
            const json = localStorage.getItem(layoutName);
            if (json != null) {
                load(json);
                loaded = true;
            }
        }

        if (!loaded) {
            Utils.downloadFile("layouts/" + layoutName + ".layout", load, error);
        }
    }

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

    React.useEffect(() => {
        // save layout when unloading page
        window.onbeforeunload = () => {
            save();
        };

        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const layout = params.get('layout') || "default";

        loadLayout(layout, false);

        // use to generate json typescript interfaces
        // Model.toTypescriptInterfaces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onAddActiveClick = (_event: React.MouseEvent) => {

        if (layoutFile?.startsWith("test_")) {
            layoutRef!.current!.addTabToActiveTabSet({
                component: "testing",
                name: "Text" + nextGridIndex.current++
            });
        } else {
            layoutRef!.current!.addTabToActiveTabSet({
                component: "grid",
                icon: "images/article.svg",
                name: "Grid " + nextGridIndex.current++
            });
        }
    }

    const onAddFromTabSetButton = (node: TabSetNode | BorderNode) => {
        const addedTab = layoutRef!.current!.addTabToTabSet(node.getId(), {
            component: "grid",
            name: "Grid " + nextGridIndex.current++
        });
        console.log("Added tab", addedTab);
    }

    const onAddPopoutClick = (_event: React.MouseEvent) => {
        const rootDiv = layoutRef.current?.getRootDiv();
        if (rootDiv && model) {
            const rootRect = rootDiv.getBoundingClientRect();
            const width = Math.round(rootRect.width / 3);
            const height = Math.round(rootRect.height / 3);
            const x = Math.round((rootRect.width - width) / 2);
            const y = Math.round((rootRect.height - height) / 2);

            model.doAction(Actions.createPopout(
                {
                    type: "row",
                    children: [
                        {
                            type: "tabset",
                            children: [
                                {
                                    component: "grid",
                                    name: "Grid " + nextGridIndex.current++
                                }
                            ]
                        }
                    ]
                },
                { x, y, width, height },
                "float"
            ));
        }
    }

    const onRealtimeResize = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRealtimeResize(event.target.checked);
    }

    const onShowLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowLayout(event.target.checked);
    }

    const onAttrs = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAttrs(event.target.checked);
    }

    const onRenderDragRect = (content: React.ReactNode | undefined, _node?: Node, _json?: IJsonTabNode) => {
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
        event.preventDefault();
        event.stopPropagation();

        // build the menu from the node's capabilities (only tabs have a menu in this demo)
        const items: PopupMenuEntry[] = [];
        if (node instanceof TabNode) {
            if (node.isEnableRename()) {
                items.push({ key: "rename", label: "Rename" });
            }
            if (node.getParent() instanceof TabSetNode) {
                items.push({ key: "pin", label: node.isPinned() ? "Unpin" : "Pin" });
            }
            if (node.isCloseable()) {
                items.push({ key: "sep1", type: "divider" });
                items.push({ key: "close", label: "Close" });
            }
        }
        if (items.length === 0) {
            return;
        }

        contextMenuHideRef.current?.(); // close any menu already open
        contextMenuHideRef.current = showPopupMenu({
            anchor: { x: event.clientX, y: event.clientY },
            container: layoutRef.current?.getRootDiv() ?? undefined,
            title: "Menu for " + (node instanceof TabNode ? "Tab: " + node.getName() : node.getType()),
            items,
            onSelect: (item) => {
                if (item.key === "rename") {
                    layoutRef.current?.editTabName(node.getId());
                } else if (item.key === "pin" && node instanceof TabNode) {
                    model?.doAction(Actions.setTabPinned(node.getId(), !node.isPinned()));
                } else if (item.key === "close") {
                    model?.doAction(Actions.deleteTab(node.getId()));
                }
                (window as any).__lastContextSelect = item.key; // e2e hook (context-menu.spec)
            },
            onClose: () => {
                contextMenuHideRef.current = null;
            },
        });
    }

    const onAuxMouseClick = (_node: TabNode | TabSetNode | BorderNode, _event: React.MouseEvent<HTMLElement, MouseEvent>) => {
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

    const onRerenderClick = (_event: React.MouseEvent) => {
        // round trip the model: swapping in a new model keeps the tab contents mounted (no flash)
        setModel(Model.fromJson(latestModel.current!.toJson(), latestModel.current!));
    };

    const onShowLayoutClick = (_event: React.MouseEvent) => {
        console.log(JSON.stringify(model!.toJson(), null, "\t"));
    }

    const onAction = (action: Action) => {
        return action;
    }

    const factory = (node: TabNode) => {
        // log lifecycle events
        // node.setEventListener("resize", function(p){console.log("resize", node.getName(), p.rect);});
        // node.setEventListener("visibility", function(p){console.log("visibility", node.getName(), p.visible);});
        // node.setEventListener("close", function(p){console.log("close", node.getName());});

        if (attrs) {
            return <Attributes node={node} />
        }

        const component = node.getComponent();

        if (component === "json") {
            return (<JsonView model={latestModel.current!} />);
        }
        else if (component === "user sublayout") {
            /*
                If you define both a component and a subLayoutId in the tab then you must
                render the sublayout here by wrapping the <TabLayout> component.
            */
            return (<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div title="Header rendered in factory method"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-tab-unselected)",
                        backgroundColor: "var(--color-tabset-background)",
                        marginBottom: 5,
                        fontWeight: 500,
                    }}>User Defined Header</div>
                <TabLayout tabNode={node} />
            </div>);
        }
        else if (component === "simpleform") {
            return <SimpleForm />
        }
        else if (component === "mui") {
            return <MUIComponent />
        }
        else if (component === "muigrid") {
            return <MUIDataGrid theme={popoutClassName} />
        }
        else if (component === "aggrid") {
            return <AGGridExample theme={popoutClassName} />
        }
        else if (component === "chart") {
            return <BarChart />
        }
        else if (component === "actionlog") {
            return <ActionLog model={model!} />;
        }
        else if (component === "map") {
            return <MapComponent />
        }
        else if (component === "monaco") {
            return <MonacoComponent />
        }
        else if (component === "xterm") {
            return <TerminalComponent getModel={() => latestModel.current} layoutApi={layoutRef} />
        }
        else if (component === "grid") {
            if (node.getExtraData().data == null) {
                // create data in node extra data first time accessed
                node.getExtraData().data = makeFakeData();
            }

            return <SimpleTable fields={fields} data={node.getExtraData().data} node={node} onDragStart={onTableDragStart} />;
        }
        else if (component === "sub") {
            let model = node.getExtraData().model;
            if (model == null) {
                node.getExtraData().model = Model.fromJson(node.getConfig().model);
                model = node.getExtraData().model;
                // save submodel on save event
                node.setEventListener("save", (_p: any) => {
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
        } else if (component === "iframe") {
            // used by the iframe state-preservation e2e test: the srcDoc stamps a unique id on each
            // (re)load onto document.body, so a test can tell whether the iframe was reloaded when
            // its tab moved (preserved in-layout, reloaded when moved to a popout window)
            const srcDoc =
                "<!doctype html><body><input id='field'>" +
                "<script>document.body.dataset.loadId=Math.random().toString(36).slice(2)</script>";
            return (
                <iframe
                    title={node.getId()}
                    data-testid="state-iframe"
                    srcDoc={srcDoc}
                    style={{ display: "block", border: "none", boxSizing: "border-box" }}
                    width="100%"
                    height="100%"
                />
            );
        }

        return null;
    }

    const onSelectLayout = (event: React.FormEvent) => {
        const target = event.target as HTMLSelectElement;
        loadLayout(target.value);
    }

    const onReloadFromFile = (_event: React.MouseEvent) => {
        loadLayout(layoutFile!, true);
    }

    const onThemeChange = (event: React.FormEvent) => {
        const target = event.target as HTMLSelectElement;
        const themeClassName = "flexlayout__theme_" + target.value;
        document.documentElement.className = themeClassName;
        // need to set popout top level class name to new theme
        setPopoutClassName(themeClassName);
    }

    const onFontSizeChange = (event: React.FormEvent) => {
        const target = event.target as HTMLSelectElement;
        setFontSize(target.value);

        const flexLayoutElement = document.querySelector('.flexlayout__layout') as HTMLElement | null;
        flexLayoutElement!.style.setProperty('--font-size', target.value);
    }

    const onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
        // renderValues.content = (<div>hello</div>);
        // renderValues.content += " *";
        // renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
        if (layoutFile === "newfeatures" && node.getComponent() === "newfeatures") {
            renderValues.buttons.push(createButton("Tab settings", "settingbtn", undefined, <SettingsIcon />));
        }

        // playwright testing
        if (layoutFile?.startsWith("test_")) {
            if (node.getId() === "onRenderTab1") {
                renderValues.leading = <img src="images/settings.svg" key="1" alt="" style={{ width: "1em", height: "1em" }} />
                renderValues.content = "onRenderTab1";
                renderValues.buttons.push(<img src="images/folder.svg" key="1" alt="" style={{ width: "1em", height: "1em" }} />);
            } else if (node.getId() === "onRenderTab2") {
                renderValues.leading = <img src="images/settings.svg" key="1" alt="" style={{ width: "1em", height: "1em" }} />
                renderValues.content = "onRenderTab2";
                renderValues.buttons.push(<img src="images/folder.svg" key="1" alt="" style={{ width: "1em", height: "1em" }} />);
            }
        }
    }

    const onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
        if (node instanceof TabSetNode) {
            if (layoutFile === "newfeatures") {
                const button = createButton("Menu for selected tab", "menubtn", (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    const selected = node.getSelectedNode();
                    if (selected instanceof TabNode) {
                        onContextMenu(selected, e);
                    }
                }, <MenuIcon />);
                renderValues.leading = <div style={{ display: "flex", alignItems: "center", alignContent: "center", padding: 3 }}>
                    {button}
                </div>;
            }

            if (layoutFile === "newfeatures") {
                renderValues.buttons.push(createButton("Tabset settings", "settingbtn", undefined, <SettingsIcon />));
            }

            if (layoutFile === "default") {
                const button = createButton("Add tab", "addtab", (_e: React.MouseEvent<HTMLElement, MouseEvent>) => onAddFromTabSetButton(node), <AddIcon />);

                renderValues.stickyButtons.push(button);
                // put overflow button before + button (default is after)
                // renderValues.overflowPosition=0    
            }
        }

        if (node instanceof BorderNode &&
            node.getSelected() !== -1 && // only when the border panel is showing
            (layoutFile === "default" || layoutFile === "newfeatures" || layoutFile === "test_overlay")) {
            // toggle between the split and overlay border types; the icon shows the current
            // mode: the panel splitting the layout, or floating over it
            const overlay = node.isOverlay();
            renderValues.buttons.push(createButton(
                overlay ? "Overlay border (toggle to split)" : "Split border (toggle to overlay)",
                "bordertype",
                () => model?.doAction(Actions.setBorderType(node.getId(), overlay ? "split" : "overlay")),
                overlay ? <OverlayBorderIcon /> : <SplitBorderIcon />));
        }

        // playwright testing
        if (layoutFile?.startsWith("test_")) {
            // note: the imgs must be given a size - unsized imgs of svgs without intrinsic
            // dimensions get the 300x150 default in webkit, blowing the toolbar up over the tabs
            if (node.getId() === "onRenderTabSet1") {
                renderValues.buttons.push(<img src="images/folder.svg" key="1" alt="" style={{ width: "1em", height: "1em" }} />);
                renderValues.buttons.push(<img src="images/settings.svg" key="2" alt="" style={{ width: "1em", height: "1em" }} />);
            } else if (node.getId() === "onRenderTabSet2") {
                renderValues.buttons.push(<img src="images/folder.svg" key="1" alt="" style={{ width: "1em", height: "1em" }} />);
                renderValues.buttons.push(<img src="images/settings.svg" key="2" alt="" style={{ width: "1em", height: "1em" }} />);
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
                renderValues.buttons.push(<img src="images/folder.svg" key="1" alt="" style={{ width: "1em", height: "1em" }} />);
                renderValues.buttons.push(<img src="images/settings.svg" key="2" alt="" style={{ width: "1em", height: "1em" }} />);
            }
        }
    }

    const createButton = (title: string, key: string, handler: React.MouseEventHandler | undefined, content: React.ReactNode) => {
        return (<button className="flexlayout__tab_toolbar_button"
            title={title}
            key={key}
            tabIndex={0} // Safari only tabs to elements with an explicit tabindex
            style={{ display: "flex", alignItems: "center" }}
            onClick={handler}>
            {content}
        </button>);
    }

    const onTabSetPlaceHolder = (_node: TabSetNode) => {
        return <div
            key="placeholder"
            style={{
                display: "flex",
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center"
            }}>Drag tabs to this area</div>;
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
            keyMap={{ focusTabToggle: "F6", focusNextTabset: "Ctrl+]", focusPreviousTabset: "Ctrl+[" }}
            onContextMenu={layoutFile === "default" || layoutFile === "newfeatures" || layoutFile === "test_pinned" || layoutFile === "test_overlay" ? onContextMenu : undefined}
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
                        <select className="toolbar_control" aria-label="Layout" onChange={onSelectLayout}>
                            <option value="default">Default</option>
                            <option value="newfeatures">New Features</option>
                            <option value="simple">Simple</option>
                            <option value="mosaic">Mosaic Style</option>
                            <option value="sub">SubLayout</option>
                            <option value="complex">Complex</option>
                        </select>
                        <button key="reloadbutton" className="toolbar_control" onClick={onReloadFromFile} style={{ marginLeft: 5 }}>Reload</button>
                        <div style={{ flexGrow: 1 }}></div>
                        <button className="toolbar_control" data-id="rerender" style={{ marginRight: 5 }} title="Round trip the model through toJson/fromJson and set the new model" onClick={onRerenderClick}>To-From JSON</button>
                        <span style={{ marginLeft: 5 }}>Realtime resize</span>
                        <input
                            name="realtimeResize"
                            type="checkbox"
                            aria-label="Realtime resize"
                            checked={realtimeResize}
                            onChange={onRealtimeResize} />
                        <span style={{ marginLeft: 5 }}>Show layout</span>
                        <input
                            name="show layout"
                            type="checkbox"
                            aria-label="Show layout"
                            checked={showLayout}
                            onChange={onShowLayout} />
                        <span style={{ marginLeft: 5 }}>Attributes</span>
                        <input
                            name="attrs"
                            type="checkbox"
                            aria-label="Attributes"
                            checked={attrs}
                            onChange={onAttrs} />
                        <select className="toolbar_control" aria-label="Font size" style={{ marginLeft: 5 }}
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
                        <select className="toolbar_control" aria-label="Theme" style={{ marginLeft: 5 }} defaultValue="alpha_light" onChange={onThemeChange}>
                            <option value="alpha_light">Alpha Light</option>
                            <option value="alpha_dark">Alpha Dark</option>
                            <option value="alpha_rounded">Alpha Rounded</option>
                            <option value="aria">Aria</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="rounded">Rounded</option>
                            <option value="underline">Underline</option>
                            <option value="gray">Gray</option>
                        </select>
                        <button className="toolbar_control" style={{ marginLeft: 5 }} title="print layout json to the developer console" onClick={onShowLayoutClick}>{"Print"}</button>
                        <button className="toolbar_control drag-from" data-id="add-drag" draggable={true}
                            style={{ height: "30px", marginLeft: 5, border: "none", outline: "none" }}
                            title="Add tab by starting a drag on a draggable element"
                            onDragStart={onDragStart}>
                            Add Drag
                        </button>
                        <button className="toolbar_control" data-id="add-active" style={{ marginLeft: 5 }} title="Add using Layout.addTabToActiveTabSet" onClick={onAddActiveClick}>Add Active</button>
                        <button className="toolbar_control" style={{ marginLeft: 5 }} title="Add using Actions.createPopout" onClick={onAddPopoutClick}>Add Float</button>
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
    const headercells = props.fields.map(function (field: any) {
        return <th key={field}>{field}</th>;
    });

    const rows = [];
    for (let i = 0; i < props.data.length; i++) {
        const row = props.fields.map((field: any) => <td key={field}>{props.data[i][field]}</td>);
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
