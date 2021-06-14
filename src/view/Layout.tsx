import * as React from "react";
import DockLocation from "../DockLocation";
import DragDrop from "../DragDrop";
import { I18nLabel } from "../I18nLabel";
import Action from "../model/Action";
import Actions from "../model/Actions";
import BorderNode from "../model/BorderNode";
import BorderSet from "../model/BorderSet";
import IDraggable from "../model/IDraggable";
import Model, { ILayoutMetrics } from "../model/Model";
import Node from "../model/Node";
import RowNode from "../model/RowNode";
import SplitterNode from "../model/SplitterNode";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import Rect from "../Rect";
import { CLASSES } from "../Types";
import { BorderTabSet } from "./BorderTabSet";
import { Splitter } from "./Splitter";
import { Tab } from "./Tab";
import { TabSet } from "./TabSet";
import { FloatingWindow } from "./FloatingWindow";
import { FloatingWindowTab } from "./FloatingWindowTab";
import { TabFloating } from "./TabFloating";
import { IJsonTabNode } from "../model/IJsonModel";

export interface ILayoutProps {
    model: Model;
    factory: (node: TabNode) => React.ReactNode;
    font?: IFontValues;
    fontFamily?: string;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => ITitleObject | React.ReactNode | undefined;
    closeIcon?: React.ReactNode;
    icons?: IIcons;
    onAction?: (action: Action) => Action | undefined;
    onRenderTab?: (
        node: TabNode,
        renderValues: ITabRenderValues,
    ) => void;
    onRenderTabSet?: (
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues,
    ) => void;
    onModelChange?: (model: Model) => void;
    onExternalDrag?: (event: React.DragEvent<HTMLDivElement>) => undefined | {
      dragText: string,
      json: any,
      onDrop?: (node?: Node, event?: Event) => void
    };
    classNameMapper?: (defaultClassName: string) => string;
    i18nMapper?: (id: I18nLabel, param?: string) => string | undefined;
    supportsPopout?: boolean | undefined;
    popoutURL?: string | undefined;
}
export interface IFontValues {
    size?: string;
    family?: string;
    style?: string;
    weight?: string;
}

export interface ITabSetRenderValues {
    headerContent?: React.ReactNode;
    stickyButtons: React.ReactNode[];
    buttons: React.ReactNode[];
    headerButtons: React.ReactNode[];
}

export interface ITabRenderValues {
    leading: React.ReactNode;
    content: React.ReactNode;
    name: string;
    buttons: React.ReactNode[];
}

export interface ITitleObject {
    titleContent: React.ReactNode;
    name: string;
}

export interface ILayoutState {
    rect: Rect;
    calculatedHeaderBarSize: number;
    calculatedTabBarSize: number;
    calculatedBorderBarSize: number;
    editingTab?: TabNode;
}

export interface IIcons {
    close?: React.ReactNode;
    popout?: React.ReactNode;
    maximize?: React.ReactNode;
    restore?: React.ReactNode;
    more?: React.ReactNode;
}

/** @hidden @internal */
export interface ILayoutCallbacks {
    i18nName(id: I18nLabel, param?: string): string;
    maximize(tabsetNode: TabSetNode): void;
    getPopoutURL(): string;
    isSupportsPopout(): boolean;
    getCurrentDocument(): HTMLDocument | undefined;
    getClassName(defaultClassName: string): string;
    doAction(action: Action): Node | undefined;
    getDomRect(): any;
    getRootDiv(): HTMLDivElement;
    dragStart(
        event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<HTMLDivElement> | undefined,
        dragDivText: string,
        node: Node & IDraggable,
        allowDrag: boolean,
        onClick?: (event: Event) => void,
        onDoubleClick?: (event: Event) => void
    ): void;
    customizeTab(
        tabNode: TabNode,
        renderValues: ITabRenderValues,
    ): void;
    customizeTabSet(
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues,
    ): void;
    styleFont: (style: Record<string, string>) => Record<string, string>;
    setEditingTab(tabNode?: TabNode): void;
    getEditingTab(): TabNode | undefined;

}

// Popout windows work in latest browsers based on webkit (Chrome, Opera, Safari, latest Edge) and Firefox. They do
// not work on any version if IE or the original Edge browser
// Assume any recent desktop browser not IE or original Edge will work
/** @hidden @internal */
// @ts-ignore
const isIEorEdge = typeof window !== "undefined" && (window.document.documentMode || /Edge\//.test(window.navigator.userAgent));
/** @hidden @internal */
const isDesktop = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
/** @hidden @internal */
const defaultSupportsPopout: boolean = isDesktop && !isIEorEdge;

/**
 * A React component that hosts a multi-tabbed layout
 */
export class Layout extends React.Component<ILayoutProps, ILayoutState> {
    /** @hidden @internal */
    private selfRef: React.RefObject<HTMLDivElement>;
    /** @hidden @internal */
    private findHeaderBarSizeRef: React.RefObject<HTMLDivElement>;
    /** @hidden @internal */
    private findTabBarSizeRef: React.RefObject<HTMLDivElement>;
    /** @hidden @internal */
    private findBorderBarSizeRef: React.RefObject<HTMLDivElement>;
    /** @hidden @internal */
    private previousModel?: Model;
    /** @hidden @internal */
    private centerRect?: Rect;

    /** @hidden @internal */
    // private start: number = 0;
    /** @hidden @internal */
    // private layoutTime: number = 0;

    /** @hidden @internal */
    private tabIds: string[];
    /** @hidden @internal */
    private newTabJson: any;
    /** @hidden @internal */
    private firstMove: boolean = false;
    /** @hidden @internal */
    private dragNode?: Node & IDraggable;
    /** @hidden @internal */
    private dragDiv?: HTMLDivElement;
    /** @hidden @internal */
    private dragDivText: string = "";
    /** @hidden @internal */
    private dropInfo: any;
    /** @hidden @internal */
    private outlineDiv?: HTMLDivElement;

    /** @hidden @internal */
    private edgeRightDiv?: HTMLDivElement;
    /** @hidden @internal */
    private edgeBottomDiv?: HTMLDivElement;
    /** @hidden @internal */
    private edgeLeftDiv?: HTMLDivElement;
    /** @hidden @internal */
    private edgeTopDiv?: HTMLDivElement;
    /** @hidden @internal */
    private fnNewNodeDropped?: (node?: Node, event?: Event) => void;
    /** @hidden @internal */
    private currentDocument?: HTMLDocument;
    /** @hidden @internal */
    private currentWindow?: Window;
    /** @hidden @internal */
    private supportsPopout: boolean;
    /** @hidden @internal */
    private popoutURL: string;
    /** @hidden @internal */
    private icons?: IIcons;
    /** @hidden @internal */
    private firstRender: boolean;
    /** @hidden @internal */
    private resizeObserver? : ResizeObserver;

    constructor(props: ILayoutProps) {
        super(props);
        this.props.model._setChangeListener(this.onModelChange);
        this.tabIds = [];
        this.selfRef = React.createRef<HTMLDivElement>();
        this.findHeaderBarSizeRef = React.createRef<HTMLDivElement>();
        this.findTabBarSizeRef = React.createRef<HTMLDivElement>();
        this.findBorderBarSizeRef = React.createRef<HTMLDivElement>();
        this.supportsPopout = props.supportsPopout !== undefined ? props.supportsPopout : defaultSupportsPopout;
        this.popoutURL = props.popoutURL ? props.popoutURL : "popout.html";
        // For backwards compatibility, prop closeIcon sets prop icons.close:
        this.icons = props.closeIcon ? Object.assign({ close: props.closeIcon }, props.icons) : props.icons;
        this.firstRender = true;

        this.state = { rect: new Rect(0, 0, 0, 0), 
            calculatedHeaderBarSize: 25, 
            calculatedTabBarSize: 26, 
            calculatedBorderBarSize: 30,
            editingTab: undefined,
        };

        this.onDragEnter = this.onDragEnter.bind(this);
    }

    /** @hidden @internal */
    styleFont(style: Record<string, string>): Record<string, string> {
        if (this.props.font) {
            if (this.props.font.size) {
                style.fontSize = this.props.font.size;
            }
            if (this.props.font.family) {
                style.fontFamily = this.props.font.family;
            }
            if (this.props.font.style) {
                style.fontStyle = this.props.font.style;
            }
            if (this.props.font.weight) {
                style.fontWeight = this.props.font.weight;
            }
        }
        return style;
    }

    /** @hidden @internal */
    onModelChange = () => {
        this.forceUpdate();
        if (this.props.onModelChange) {
            this.props.onModelChange(this.props.model);
        }
    };

    /** @hidden @internal */
    doAction(action: Action): Node | undefined {
        if (this.props.onAction !== undefined) {
            const outcome = this.props.onAction(action);
            if (outcome !== undefined) {
                return this.props.model.doAction(outcome);
            }
            return undefined;
        } else {
            return this.props.model.doAction(action);
        }
    }

    /** @hidden @internal */
    componentDidMount() {
        this.updateRect();
        this.updateLayoutMetrics();

        // need to re-render if size changes
        this.currentDocument = (this.selfRef.current as HTMLDivElement).ownerDocument;
        this.currentWindow = this.currentDocument.defaultView!;
        this.resizeObserver = new ResizeObserver(entries => {
            this.updateRect();
        });
        this.resizeObserver.observe(this.selfRef.current!);
    }

    /** @hidden @internal */
    componentDidUpdate() {
        this.updateLayoutMetrics();
        if (this.props.model !== this.previousModel) {
            if (this.previousModel !== undefined) {
                this.previousModel._setChangeListener(undefined); // stop listening to old model
            }
            this.props.model._setChangeListener(this.onModelChange);
            this.previousModel = this.props.model;
        }
        // console.log("Layout time: " + this.layoutTime + "ms Render time: " + (Date.now() - this.start) + "ms");
    }

    /** @hidden @internal */
    updateRect = () => {
        const domRect = this.getDomRect();
        const rect = new Rect(0, 0, domRect.width, domRect.height);
        if (!rect.equals(this.state.rect) && rect.width !== 0 && rect.height !== 0) {
            this.setState({ rect });
        }
    };

    /** @hidden @internal */
    updateLayoutMetrics = () => {
        if (this.findHeaderBarSizeRef.current) {
            const headerBarSize = this.findHeaderBarSizeRef.current.getBoundingClientRect().height;
            if (headerBarSize !== this.state.calculatedHeaderBarSize) {
                this.setState({ calculatedHeaderBarSize: headerBarSize });
            }
        }
        if (this.findTabBarSizeRef.current) {
            const tabBarSize = this.findTabBarSizeRef.current.getBoundingClientRect().height;
            if (tabBarSize !== this.state.calculatedTabBarSize) {
                this.setState({ calculatedTabBarSize: tabBarSize });
            }
        }
        if (this.findBorderBarSizeRef.current) {
            const borderBarSize = this.findBorderBarSizeRef.current.getBoundingClientRect().height;
            if (borderBarSize !== this.state.calculatedBorderBarSize) {
                this.setState({ calculatedBorderBarSize: borderBarSize });
            }
        }
    };

    /** @hidden @internal */
    getClassName = (defaultClassName: string) => {
        if (this.props.classNameMapper === undefined) {
            return defaultClassName;
        } else {
            return this.props.classNameMapper(defaultClassName);
        }
    };

    /** @hidden @internal */
    getCurrentDocument() {
        return this.currentDocument;
    }

    /** @hidden @internal */
    getDomRect() {
        return this.selfRef.current!.getBoundingClientRect();
    }

    /** @hidden @internal */
    getRootDiv() {
        return this.selfRef.current!;
    }

    /** @hidden @internal */
    isSupportsPopout() {
        return this.supportsPopout;
    }

    /** @hidden @internal */
    getPopoutURL() {
        return this.popoutURL;
    }

    /** @hidden @internal */
    componentWillUnmount() {
        this.resizeObserver?.unobserve(this.selfRef.current!)
    }

    /** @hidden @internal */
    setEditingTab(tabNode?: TabNode) {
        this.setState({editingTab:tabNode});
    }

    /** @hidden @internal */
    getEditingTab() {
        return this.state.editingTab;
    }

    /** @hidden @internal */
    render() {
        // first render will be used to find the size (via selfRef)
        if (this.firstRender) {
            this.firstRender = false;
            return (
                <div ref={this.selfRef} className={this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT)}>
                    {this.metricsElements()}
                </div>
            );
        }

        this.props.model._setPointerFine(window && window.matchMedia && window.matchMedia("(pointer: fine)").matches);
        // this.start = Date.now();
        const borderComponents: React.ReactNode[] = [];
        const tabSetComponents: React.ReactNode[] = [];
        const floatingWindows: React.ReactNode[] = [];
        const tabComponents: Record<string, React.ReactNode> = {};
        const splitterComponents: React.ReactNode[] = [];

        const metrics: ILayoutMetrics = {
            headerBarSize: this.state.calculatedHeaderBarSize,
            tabBarSize: this.state.calculatedTabBarSize,
            borderBarSize: this.state.calculatedBorderBarSize,
        };

        this.centerRect = this.props.model._layout(this.state.rect, metrics);

        this.renderBorder(this.props.model.getBorderSet(), borderComponents, tabComponents, floatingWindows, splitterComponents);
        this.renderChildren(this.props.model.getRoot(), tabSetComponents, tabComponents, floatingWindows, splitterComponents);

        const nextTopIds: string[] = [];
        const nextTopIdsMap: Record<string, string> = {};

        // Keep any previous tabs in the same DOM order as before, removing any that have been deleted
        this.tabIds.forEach((t) => {
            if (tabComponents[t]) {
                nextTopIds.push(t);
                nextTopIdsMap[t] = t;
            }
        });
        this.tabIds = nextTopIds;

        // Add tabs that have been added to the DOM
        Object.keys(tabComponents).forEach((t) => {
            if (!nextTopIdsMap[t]) {
                this.tabIds.push(t);
            }
        });

        // this.layoutTime = (Date.now() - this.start);

        return (
            <div ref={this.selfRef} className={this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT)} onDragEnter={this.props.onExternalDrag ? this.onDragEnter : undefined}>
                {tabSetComponents}
                {this.tabIds.map((t) => {
                    return tabComponents[t];
                })}
                {borderComponents}
                {splitterComponents}
                {floatingWindows}
                {this.metricsElements()}
            </div>
        );
    }

    /** @hidden @internal */
    metricsElements() {
        // used to measure the tab and border tab sizes
        const fontStyle = this.styleFont({ visibility: "hidden" });
        return (
            <React.Fragment>
                <div key="findHeaderBarSize" ref={this.findHeaderBarSizeRef} style={fontStyle} className={this.getClassName(CLASSES.FLEXLAYOUT__TABSET_HEADER_SIZER)}>
                    FindHeaderBarSize
                </div>
                <div key="findTabBarSize" ref={this.findTabBarSizeRef} style={fontStyle} className={this.getClassName(CLASSES.FLEXLAYOUT__TABSET_SIZER)}>
                    FindTabBarSize
                </div>
                <div key="findBorderBarSize" ref={this.findBorderBarSizeRef} style={fontStyle} className={this.getClassName(CLASSES.FLEXLAYOUT__BORDER_SIZER)}>
                    FindBorderBarSize
                </div>
            </React.Fragment>
        );
    }

    /** @hidden @internal */
    onCloseWindow = (id: string) => {
        this.doAction(Actions.unFloatTab(id));
        try {
            (this.props.model.getNodeById(id) as TabNode)._setWindow(undefined);
        } catch (e) {
            // catch incase it was a model change
        }
    };

    /** @hidden @internal */
    onSetWindow = (id: string, window: Window) => {
        (this.props.model.getNodeById(id) as TabNode)._setWindow(window);
    };

    /** @hidden @internal */
    renderBorder(borderSet: BorderSet, borderComponents: React.ReactNode[], tabComponents: Record<string, React.ReactNode>, floatingWindows: React.ReactNode[], splitterComponents: React.ReactNode[]) {
        for (const border of borderSet.getBorders()) {
            if (border.isShowing()) {
                borderComponents.push(
                    <BorderTabSet
                        key={"border_" + border.getLocation().getName()}
                        border={border}
                        layout={this}
                        iconFactory={this.props.iconFactory}
                        titleFactory={this.props.titleFactory}
                        icons={this.icons}
                    />
                );
                const drawChildren = border._getDrawChildren();
                let i = 0;
                for (const child of drawChildren) {
                    if (child instanceof SplitterNode) {
                        splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child} />);
                    } else if (child instanceof TabNode) {
                        if (this.supportsPopout && child.isFloating()) {
                            const rect = this._getScreenRect(child);
                            floatingWindows.push(
                                <FloatingWindow
                                    key={child.getId()}
                                    url={this.popoutURL}
                                    rect={rect}
                                    title={child.getName()}
                                    id={child.getId()}
                                    onSetWindow={this.onSetWindow}
                                    onCloseWindow={this.onCloseWindow}
                                >
                                    <FloatingWindowTab layout={this} node={child} factory={this.props.factory} />
                                </FloatingWindow>
                            );
                            tabComponents[child.getId()] = <TabFloating key={child.getId()} layout={this} node={child} selected={i === border.getSelected()} />;
                        } else {
                            tabComponents[child.getId()] = <Tab key={child.getId()} layout={this} node={child} selected={i === border.getSelected()} factory={this.props.factory} />;
                        }
                    }
                    i++;
                }
            }
        }
    }

    /** @hidden @internal */
    renderChildren(node: RowNode | TabSetNode, tabSetComponents: React.ReactNode[], tabComponents: Record<string, React.ReactNode>, floatingWindows: React.ReactNode[], splitterComponents: React.ReactNode[]) {
        const drawChildren = node._getDrawChildren();

        for (const child of drawChildren!) {
            if (child instanceof SplitterNode) {
                splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child} />);
            } else if (child instanceof TabSetNode) {
                tabSetComponents.push(<TabSet key={child.getId()} layout={this} node={child} iconFactory={this.props.iconFactory} titleFactory={this.props.titleFactory} icons={this.icons} />);
                this.renderChildren(child, tabSetComponents, tabComponents, floatingWindows, splitterComponents);
            } else if (child instanceof TabNode) {
                const selectedTab = child.getParent()!.getChildren()[(child.getParent() as TabSetNode).getSelected()];
                if (selectedTab === undefined) {
                    // this should not happen!
                    console.warn("undefined selectedTab should not happen");
                }
                if (this.supportsPopout && child.isFloating()) {
                    const rect = this._getScreenRect(child);
                    floatingWindows.push(
                        <FloatingWindow
                            key={child.getId()}
                            url={this.popoutURL}
                            rect={rect}
                            title={child.getName()}
                            id={child.getId()}
                            onSetWindow={this.onSetWindow}
                            onCloseWindow={this.onCloseWindow}
                        >
                            <FloatingWindowTab layout={this} node={child} factory={this.props.factory} />
                        </FloatingWindow>
                    );
                    tabComponents[child.getId()] = <TabFloating key={child.getId()} layout={this} node={child} selected={child === selectedTab} />;
                } else {
                    tabComponents[child.getId()] = <Tab key={child.getId()} layout={this} node={child} selected={child === selectedTab} factory={this.props.factory} />;
                }
            } else {
                // is row
                this.renderChildren(child as RowNode, tabSetComponents, tabComponents, floatingWindows, splitterComponents);
            }
        }
    }

    /** @hidden @internal */
    _getScreenRect(node: TabNode) {
        const rect = node!.getRect()!.clone();
        const bodyRect: DOMRect = this.selfRef.current!.getBoundingClientRect();
        const navHeight = Math.min(80, this.currentWindow!.outerHeight - this.currentWindow!.innerHeight);
        const navWidth = Math.min(80, this.currentWindow!.outerWidth - this.currentWindow!.innerWidth);
        rect.x = rect.x + bodyRect.x + this.currentWindow!.screenX + navWidth;
        rect.y = rect.y + bodyRect.y + this.currentWindow!.screenY + navHeight;
        return rect;
    }

    /**
     * Adds a new tab to the given tabset
     * @param tabsetId the id of the tabset where the new tab will be added
     * @param json the json for the new tab node
     */
    addTabToTabSet(tabsetId: string, json: IJsonTabNode) {
        const tabsetNode = this.props.model.getNodeById(tabsetId);
        if (tabsetNode !== undefined) {
            this.doAction(Actions.addNode(json, tabsetId, DockLocation.CENTER, -1));
        }
    }

    /**
     * Adds a new tab to the active tabset (if there is one)
     * @param json the json for the new tab node
     */
    addTabToActiveTabSet(json: IJsonTabNode) {
        const tabsetNode = this.props.model.getActiveTabset();
        if (tabsetNode !== undefined) {
            this.doAction(Actions.addNode(json, tabsetNode.getId(), DockLocation.CENTER, -1));
        }
    }

    /**
     * Adds a new tab by dragging a labeled panel to the drop location, dragging starts immediatelly
     * @param dragText the text to show on the drag panel
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDrop(dragText: string, json: IJsonTabNode, onDrop?: (node?: Node, event?: Event) => void) {
        this.fnNewNodeDropped = onDrop;
        this.newTabJson = json;
        this.dragStart(undefined, dragText, TabNode._fromJson(json, this.props.model, false), true, undefined, undefined);
    }

    /**
     * Adds a new tab by dragging a labeled panel to the drop location, dragging starts when you
     * mouse down on the panel
     *
     * @param dragText the text to show on the drag panel
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDropIndirect(dragText: string, json: IJsonTabNode, onDrop?: () => void) {
        this.fnNewNodeDropped = onDrop;
        this.newTabJson = json;

        DragDrop.instance.addGlass(this.onCancelAdd);

        this.dragDivText = dragText;
        this.dragDiv = this.currentDocument!.createElement("div");
        this.dragDiv.className = this.getClassName("flexlayout__drag_rect");
        this.dragDiv.innerHTML = this.dragDivText;
        this.dragDiv.addEventListener("mousedown", this.onDragDivMouseDown);
        this.dragDiv.addEventListener("touchstart", this.onDragDivMouseDown);

        const r = new Rect(10, 10, 150, 50);
        r.centerInRect(this.state.rect);
        this.dragDiv.style.left = r.x + "px";
        this.dragDiv.style.top = r.y + "px";

        const rootdiv = this.selfRef.current;
        rootdiv!.appendChild(this.dragDiv);
    }

    /** @hidden @internal */
    onCancelAdd = () => {
        const rootdiv = this.selfRef.current;
        rootdiv!.removeChild(this.dragDiv!);
        this.dragDiv = undefined;
        if (this.fnNewNodeDropped != null) {
            this.fnNewNodeDropped();
            this.fnNewNodeDropped = undefined;
        }
        DragDrop.instance.hideGlass();
        this.newTabJson = undefined;
    };

    /** @hidden @internal */
    onCancelDrag = (wasDragging: boolean) => {
        if (wasDragging) {
            const rootdiv = this.selfRef.current!;

            try {
                rootdiv.removeChild(this.outlineDiv!);
            } catch (e) {}

            try {
                rootdiv.removeChild(this.dragDiv!);
            } catch (e) {}

            this.dragDiv = undefined;
            this.hideEdges(rootdiv);
            if (this.fnNewNodeDropped != null) {
                this.fnNewNodeDropped();
                this.fnNewNodeDropped = undefined;
            }
            DragDrop.instance.hideGlass();
            this.newTabJson = undefined;
        }
    };

    /** @hidden @internal */
    onDragDivMouseDown = (event: Event) => {
        event.preventDefault();
        this.dragStart(event, this.dragDivText, TabNode._fromJson(this.newTabJson, this.props.model, false), true, undefined, undefined);
    };

    /** @hidden @internal */
    dragStart = (
        event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<HTMLDivElement> | undefined,
        dragDivText: string,
        node: Node & IDraggable,
        allowDrag: boolean,
        onClick?: (event: Event) => void,
        onDoubleClick?: (event: Event) => void
    ) => {
        if (this.props.model.getMaximizedTabset() !== undefined || !allowDrag) {
            DragDrop.instance.startDrag(event, undefined, undefined, undefined, undefined, onClick, onDoubleClick, this.currentDocument, this.selfRef.current!);
        } else {
            this.dragNode = node;
            this.dragDivText = dragDivText;
            DragDrop.instance.startDrag(event, this.onDragStart, this.onDragMove, this.onDragEnd, this.onCancelDrag, onClick, onDoubleClick, this.currentDocument, this.selfRef.current!);
        }
    };

    /** @hidden @internal */
    onDragStart = () => {
        this.dropInfo = undefined;
        const rootdiv = this.selfRef.current!;
        this.outlineDiv = this.currentDocument!.createElement("div");
        this.outlineDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__OUTLINE_RECT);
        this.outlineDiv.style.visibility = "hidden";
        rootdiv.appendChild(this.outlineDiv);

        if (this.dragDiv == null) {
            this.dragDiv = this.currentDocument!.createElement("div");
            this.dragDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__DRAG_RECT);
            this.dragDiv.innerHTML = this.dragDivText;
            rootdiv.appendChild(this.dragDiv);
        }
        // add edge indicators
        this.showEdges(rootdiv);

        if (this.dragNode !== undefined && this.dragNode instanceof TabNode && this.dragNode.getTabRect() !== undefined) {
            this.dragNode.getTabRect()!.positionElement(this.outlineDiv);
        }
        this.firstMove = true;

        return true;
    };

    /** @hidden @internal */
    onDragMove = (event: React.MouseEvent<Element>) => {
        if (this.firstMove === false) {
            const speed = this.props.model._getAttribute("tabDragSpeed") as number;
            this.outlineDiv!.style.transition = `top ${speed}s, left ${speed}s, width ${speed}s, height ${speed}s`;
        }
        this.firstMove = false;
        const clientRect = this.selfRef.current!.getBoundingClientRect();
        const pos = {
            x: event.clientX - clientRect.left,
            y: event.clientY - clientRect.top,
        };

        this.dragDiv!.style.left = pos.x - this.dragDiv!.getBoundingClientRect().width / 2 + "px";
        this.dragDiv!.style.top = pos.y + 5 + "px";

        const dropInfo = this.props.model._findDropTargetNode(this.dragNode!, pos.x, pos.y);
        if (dropInfo) {
            this.dropInfo = dropInfo;
            this.outlineDiv!.className = this.getClassName(dropInfo.className);
            dropInfo.rect.positionElement(this.outlineDiv!);
            this.outlineDiv!.style.visibility = "visible";
        }
    };

    /** @hidden @internal */
    onDragEnd = (event: Event) => {
        const rootdiv = this.selfRef.current!;
        rootdiv.removeChild(this.outlineDiv!);
        rootdiv.removeChild(this.dragDiv!);
        this.dragDiv = undefined;
        this.hideEdges(rootdiv);
        DragDrop.instance.hideGlass();

        if (this.dropInfo) {
            if (this.newTabJson !== undefined) {
                const newNode = this.doAction(Actions.addNode(this.newTabJson, this.dropInfo.node.getId(), this.dropInfo.location, this.dropInfo.index));

                if (this.fnNewNodeDropped != null) {
                    this.fnNewNodeDropped(newNode, event);
                    this.fnNewNodeDropped = undefined;
                }
                this.newTabJson = undefined;
            } else if (this.dragNode !== undefined) {
                this.doAction(Actions.moveNode(this.dragNode.getId(), this.dropInfo.node.getId(), this.dropInfo.location, this.dropInfo.index));
            }
        }
    };

    /** @hidden @internal */
    onDragEnter(event: React.DragEvent<HTMLDivElement>) {
        // DragDrop keeps track of number of dragenters minus the number of
        // dragleaves. Only start a new drag if there isn't one already.
        if (DragDrop.instance.isDragging())
            return;
        const drag = this.props.onExternalDrag!(event);
        if (drag) {
            // Mimic addTabWithDragAndDrop, but pass in DragEvent
            this.fnNewNodeDropped = drag.onDrop;
            this.newTabJson = drag.json;
            this.dragStart(event, drag.dragText, TabNode._fromJson(drag.json, this.props.model, false), true, undefined, undefined);
        }
    }

    /** @hidden @internal */
    showEdges(rootdiv: HTMLElement) {
        if (this.props.model.isEnableEdgeDock()) {
            const domRect = rootdiv.getBoundingClientRect();
            const r = this.centerRect!;
            const size = 100;
            const length = size + "px";
            const radius = "50px";
            const width = "10px";

            this.edgeTopDiv = this.currentDocument!.createElement("div");
            this.edgeTopDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            this.edgeTopDiv.style.top = r.y + "px";
            this.edgeTopDiv.style.left = r.x + (r.width - size) / 2 + "px";
            this.edgeTopDiv.style.width = length;
            this.edgeTopDiv.style.height = width;
            this.edgeTopDiv.style.borderBottomLeftRadius = radius;
            this.edgeTopDiv.style.borderBottomRightRadius = radius;

            this.edgeLeftDiv = this.currentDocument!.createElement("div");
            this.edgeLeftDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            this.edgeLeftDiv.style.top = r.y + (r.height - size) / 2 + "px";
            this.edgeLeftDiv.style.left = r.x + "px";
            this.edgeLeftDiv.style.width = width;
            this.edgeLeftDiv.style.height = length;
            this.edgeLeftDiv.style.borderTopRightRadius = radius;
            this.edgeLeftDiv.style.borderBottomRightRadius = radius;

            this.edgeBottomDiv = this.currentDocument!.createElement("div");
            this.edgeBottomDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            this.edgeBottomDiv.style.bottom = domRect.height - r.getBottom() + "px";
            this.edgeBottomDiv.style.left = r.x + (r.width - size) / 2 + "px";
            this.edgeBottomDiv.style.width = length;
            this.edgeBottomDiv.style.height = width;
            this.edgeBottomDiv.style.borderTopLeftRadius = radius;
            this.edgeBottomDiv.style.borderTopRightRadius = radius;

            this.edgeRightDiv = this.currentDocument!.createElement("div");
            this.edgeRightDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            this.edgeRightDiv.style.top = r.y + (r.height - size) / 2 + "px";
            this.edgeRightDiv.style.right = domRect.width - r.getRight() + "px";
            this.edgeRightDiv.style.width = width;
            this.edgeRightDiv.style.height = length;
            this.edgeRightDiv.style.borderTopLeftRadius = radius;
            this.edgeRightDiv.style.borderBottomLeftRadius = radius;

            rootdiv.appendChild(this.edgeTopDiv);
            rootdiv.appendChild(this.edgeLeftDiv);
            rootdiv.appendChild(this.edgeBottomDiv);
            rootdiv.appendChild(this.edgeRightDiv);
        }
    }

    /** @hidden @internal */
    hideEdges(rootdiv: HTMLElement) {
        if (this.props.model.isEnableEdgeDock()) {
            try {
                rootdiv.removeChild(this.edgeTopDiv!);
                rootdiv.removeChild(this.edgeLeftDiv!);
                rootdiv.removeChild(this.edgeBottomDiv!);
                rootdiv.removeChild(this.edgeRightDiv!);
            } catch (e) {}
        }
    }

    /** @hidden @internal */
    maximize(tabsetNode: TabSetNode) {
        this.doAction(Actions.maximizeToggle(tabsetNode.getId()));
    }

    /** @hidden @internal */
    customizeTab(
        tabNode: TabNode,
        renderValues: ITabRenderValues,
    ) {
        if (this.props.onRenderTab) {
            this.props.onRenderTab(tabNode, renderValues);
        }
    }

    /** @hidden @internal */
    customizeTabSet(
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues,
    ) {
        if (this.props.onRenderTabSet) {
            this.props.onRenderTabSet(tabSetNode, renderValues);
        }
    }

    /** @hidden @internal */
    i18nName(id: I18nLabel, param?: string) {
        let message;
        if (this.props.i18nMapper) {
            message = this.props.i18nMapper(id, param);
        }
        if (message === undefined) {
            message = id + (param === undefined ? "" : param);
        }
        return message;
    }
}

export default Layout;
