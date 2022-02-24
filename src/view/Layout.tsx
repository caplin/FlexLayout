import * as React from "react";
import * as ReactDOM from "react-dom";
import { DockLocation } from "../DockLocation";
import { DragDrop } from "../DragDrop";
import { DropInfo } from "../DropInfo";
import { I18nLabel } from "../I18nLabel";
import { Action } from "../model/Action";
import { Actions } from "../model/Actions";
import { BorderNode } from "../model/BorderNode";
import { BorderSet } from "../model/BorderSet";
import { IDraggable } from "../model/IDraggable";
import { Model, ILayoutMetrics } from "../model/Model";
import { Node } from "../model/Node";
import { RowNode } from "../model/RowNode";
import { SplitterNode } from "../model/SplitterNode";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { Rect } from "../Rect";
import { CLASSES } from "../Types";
import { BorderTabSet } from "./BorderTabSet";
import { Splitter } from "./Splitter";
import { Tab } from "./Tab";
import { TabSet } from "./TabSet";
import { FloatingWindow } from "./FloatingWindow";
import { FloatingWindowTab } from "./FloatingWindowTab";
import { TabFloating } from "./TabFloating";
import { IJsonTabNode } from "../model/IJsonModel";
import { Orientation } from "../Orientation";
import { CloseIcon, MaximizeIcon, OverflowIcon, PopoutIcon, RestoreIcon } from "./Icons";
import { TabButtonStamp } from "./TabButtonStamp";

export type CustomDragCallback = (dragging: TabNode | IJsonTabNode, over: TabNode, x: number, y: number, location: DockLocation) => void;
export type DragRectRenderCallback = (content: React.ReactElement | undefined, node?: Node, json?: IJsonTabNode) => React.ReactElement | undefined;
export type FloatingTabPlaceholderRenderCallback = (dockPopout: () => void, showPopout: () => void) => React.ReactElement | undefined;
export type NodeMouseEvent = (node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
export type ShowOverflowMenuCallback = (
    node: TabSetNode | BorderNode,
    mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
) => void;
export type TabSetPlaceHolderCallback = (node: TabSetNode) => React.ReactNode;

export interface ILayoutProps {
    model: Model;
    factory: (node: TabNode) => React.ReactNode;
    font?: IFontValues;
    fontFamily?: string;
    iconFactory?: (node: TabNode) => React.ReactNode | undefined;
    titleFactory?: (node: TabNode) => ITitleObject | React.ReactNode | undefined;
    icons?: IIcons;
    onAction?: (action: Action) => Action | undefined;
    onRenderTab?: (
        node: TabNode,
        renderValues: ITabRenderValues, // change the values in this object as required
    ) => void;
    onRenderTabSet?: (
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues, // change the values in this object as required
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
    realtimeResize?: boolean | undefined;
    onTabDrag?: (dragging: TabNode | IJsonTabNode, over: TabNode, x: number, y: number, location: DockLocation, refresh: () => void) => undefined | {
        x: number,
        y: number,
        width: number,
        height: number,
        callback: CustomDragCallback,
        // Called once when `callback` is not going to be called anymore (user canceled the drag, moved mouse and you returned a different callback, etc)
        invalidated?: () => void,
        cursor?: string | undefined
    };
    onRenderDragRect?: DragRectRenderCallback;
    onRenderFloatingTabPlaceholder?: FloatingTabPlaceholderRenderCallback;
    onContextMenu?: NodeMouseEvent;
    onAuxMouseClick?: NodeMouseEvent;
    onShowOverflowMenu?: ShowOverflowMenuCallback;
    onTabSetPlaceHolder?: TabSetPlaceHolderCallback;
}
export interface IFontValues {
    size?: string;
    family?: string;
    style?: string;
    weight?: string;
}

export interface ITabSetRenderValues {
    headerContent?: React.ReactNode;
    centerContent?: React.ReactNode;
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
    showHiddenBorder: DockLocation;
    portal?: React.ReactNode;
}

export interface IIcons {
    close?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    closeTabset?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    popout?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    maximize?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    restore?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    more?: (React.ReactNode | ((tabSetNode: (TabSetNode | BorderNode), hiddenTabs: { node: TabNode; index: number }[]) => React.ReactNode));
}

const defaultIcons = {
    close: <CloseIcon />,
    closeTabset: <CloseIcon />,
    popout: <PopoutIcon />,
    maximize: <MaximizeIcon />,
    restore: <RestoreIcon />,
    more: <OverflowIcon />,
};

export interface ICustomDropDestination {
    rect: Rect;
    callback: CustomDragCallback;
    invalidated: (() => void) | undefined;
    dragging: TabNode | IJsonTabNode;
    over: TabNode;
    x: number;
    y: number;
    location: DockLocation;
    cursor: string | undefined;
}

/** @internal */
export interface ILayoutCallbacks {
    i18nName(id: I18nLabel, param?: string): string;
    maximize(tabsetNode: TabSetNode): void;
    getPopoutURL(): string;
    isSupportsPopout(): boolean;
    isRealtimeResize(): boolean;
    getCurrentDocument(): HTMLDocument | undefined;
    getClassName(defaultClassName: string): string;
    doAction(action: Action): Node | undefined;
    getDomRect(): any;
    getRootDiv(): HTMLDivElement;
    dragStart(
        event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<HTMLDivElement> | undefined,
        dragDivText: string | undefined,
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
    getOnRenderFloatingTabPlaceholder(): FloatingTabPlaceholderRenderCallback | undefined;
    showContextMenu(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>): void;
    auxMouseClick(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>): void;
    showPortal: (portal: React.ReactNode, portalDiv: HTMLDivElement) => void;
    hidePortal: () => void;
    getShowOverflowMenu(): ShowOverflowMenuCallback | undefined;
    getTabSetPlaceHolderCallback() : TabSetPlaceHolderCallback | undefined;
}

// Popout windows work in latest browsers based on webkit (Chrome, Opera, Safari, latest Edge) and Firefox. They do
// not work on any version if IE or the original Edge browser
// Assume any recent desktop browser not IE or original Edge will work
/** @internal */
// @ts-ignore
const isIEorEdge = typeof window !== "undefined" && (window.document.documentMode || /Edge\//.test(window.navigator.userAgent));
/** @internal */
const isDesktop = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
/** @internal */
const defaultSupportsPopout: boolean = isDesktop && !isIEorEdge;

/**
 * A React component that hosts a multi-tabbed layout
 */
export class Layout extends React.Component<ILayoutProps, ILayoutState> {

    /** @internal */
    private selfRef: React.RefObject<HTMLDivElement>;
    /** @internal */
    private findHeaderBarSizeRef: React.RefObject<HTMLDivElement>;
    /** @internal */
    private findTabBarSizeRef: React.RefObject<HTMLDivElement>;
    /** @internal */
    private findBorderBarSizeRef: React.RefObject<HTMLDivElement>;
    /** @internal */
    private previousModel?: Model;
    /** @internal */
    private centerRect?: Rect;

    /** @internal */
    // private start: number = 0;
    /** @internal */
    // private layoutTime: number = 0;

    /** @internal */
    private tabIds: string[];
    /** @internal */
    private newTabJson: IJsonTabNode | undefined;
    /** @internal */
    private firstMove: boolean = false;
    /** @internal */
    private dragNode?: Node & IDraggable;
    /** @internal */
    private dragDiv?: HTMLDivElement;
    /** @internal */
    private dragRectRendered: boolean = true;
    /** @internal */
    private dragDivText: string | undefined = undefined;
    /** @internal */
    private dropInfo: DropInfo | undefined;
    /** @internal */
    private customDrop: ICustomDropDestination | undefined;
    /** @internal */
    private outlineDiv?: HTMLDivElement;

    /** @internal */
    private edgeRectLength = 100;
    /** @internal */
    private edgeRectWidth = 10;
    /** @internal */
    private edgesShown = false;
    /** @internal */
    private edgeRightDiv?: HTMLDivElement;
    /** @internal */
    private edgeBottomDiv?: HTMLDivElement;
    /** @internal */
    private edgeLeftDiv?: HTMLDivElement;
    /** @internal */
    private edgeTopDiv?: HTMLDivElement;
    /** @internal */
    private fnNewNodeDropped?: (node?: Node, event?: Event) => void;
    /** @internal */
    private currentDocument?: HTMLDocument;
    /** @internal */
    private currentWindow?: Window;
    /** @internal */
    private supportsPopout: boolean;
    /** @internal */
    private popoutURL: string;
    /** @internal */
    private icons: IIcons;
    /** @internal */
    private firstRender: boolean;
    /** @internal */
    private resizeObserver?: ResizeObserver;

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
        this.icons = { ...defaultIcons, ...props.icons };
        this.firstRender = true;

        this.state = {
            rect: new Rect(0, 0, 0, 0),
            calculatedHeaderBarSize: 25,
            calculatedTabBarSize: 26,
            calculatedBorderBarSize: 30,
            editingTab: undefined,
            showHiddenBorder: DockLocation.CENTER,
        };

        this.onDragEnter = this.onDragEnter.bind(this);
    }

    /** @internal */
    styleFont(style: Record<string, string>): Record<string, string> {
        if (this.props.font) {
            if (this.selfRef.current) {
                if (this.props.font.size) {
                    this.selfRef.current.style.setProperty("--font-size", this.props.font.size);
                }
                if (this.props.font.family) {
                    this.selfRef.current.style.setProperty("--font-family", this.props.font.family);
                }
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

    /** @internal */
    onModelChange = () => {
        this.forceUpdate();
        if (this.props.onModelChange) {
            this.props.onModelChange(this.props.model);
        }
    };

    /** @internal */
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

    /** @internal */
    componentDidMount() {
        this.updateRect();
        this.updateLayoutMetrics();

        // need to re-render if size changes
        this.currentDocument = (this.selfRef.current as HTMLDivElement).ownerDocument;
        this.currentWindow = this.currentDocument.defaultView!;
        this.resizeObserver = new ResizeObserver(entries => {
            this.updateRect(entries[0].contentRect);
        });
        this.resizeObserver.observe(this.selfRef.current!);
    }

    /** @internal */
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

    /** @internal */
    updateRect = (domRect: DOMRectReadOnly = this.getDomRect()) => {
        const rect = new Rect(0, 0, domRect.width, domRect.height);
        if (!rect.equals(this.state.rect) && rect.width !== 0 && rect.height !== 0) {
            this.setState({ rect });
        }
    };

    /** @internal */
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

    /** @internal */
    getClassName = (defaultClassName: string) => {
        if (this.props.classNameMapper === undefined) {
            return defaultClassName;
        } else {
            return this.props.classNameMapper(defaultClassName);
        }
    };

    /** @internal */
    getCurrentDocument() {
        return this.currentDocument;
    }

    /** @internal */
    getDomRect() {
        return this.selfRef.current!.getBoundingClientRect();
    }

    /** @internal */
    getRootDiv() {
        return this.selfRef.current!;
    }

    /** @internal */
    isSupportsPopout() {
        return this.supportsPopout;
    }

    /** @internal */
    isRealtimeResize() {
        return this.props.realtimeResize ?? false;
    }

    /** @internal */
    onTabDrag(...args: Parameters<Required<ILayoutProps>['onTabDrag']>) {
        return this.props.onTabDrag?.(...args);
    }

    /** @internal */
    getPopoutURL() {
        return this.popoutURL;
    }

    /** @internal */
    componentWillUnmount() {
        this.resizeObserver?.unobserve(this.selfRef.current!)
    }

    /** @internal */
    setEditingTab(tabNode?: TabNode) {
        this.setState({ editingTab: tabNode });
    }

    /** @internal */
    getEditingTab() {
        return this.state.editingTab;
    }

    /** @internal */
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
            borderBarSize: this.state.calculatedBorderBarSize
        };
        this.props.model._setShowHiddenBorder(this.state.showHiddenBorder);

        this.centerRect = this.props.model._layout(this.state.rect, metrics);

        this.renderBorder(this.props.model.getBorderSet(), borderComponents, tabComponents, floatingWindows, splitterComponents);
        this.renderChildren("", this.props.model.getRoot(), tabSetComponents, tabComponents, floatingWindows, splitterComponents);

        if (this.edgesShown) {
            this.repositionEdges(this.state.rect)
        }

        const nextTopIds: string[] = [];
        const nextTopIdsMap: Record<string, string> = {};

        // Keep any previous tabs in the same DOM order as before, removing any that have been deleted
        for (const t of this.tabIds) {
            if (tabComponents[t]) {
                nextTopIds.push(t);
                nextTopIdsMap[t] = t;
            }
        }
        this.tabIds = nextTopIds;

        // Add tabs that have been added to the DOM
        for (const t of Object.keys(tabComponents)) {
            if (!nextTopIdsMap[t]) {
                this.tabIds.push(t);
            }
        }

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
                {this.state.portal}
            </div>
        );
    }

    /** @internal */
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

    /** @internal */
    onCloseWindow = (id: string) => {
        this.doAction(Actions.unFloatTab(id));
        try {
            (this.props.model.getNodeById(id) as TabNode)._setWindow(undefined);
        } catch (e) {
            // catch incase it was a model change
        }
    };

    /** @internal */
    onSetWindow = (id: string, window: Window) => {
        (this.props.model.getNodeById(id) as TabNode)._setWindow(window);
    };

    /** @internal */
    renderBorder(borderSet: BorderSet, borderComponents: React.ReactNode[], tabComponents: Record<string, React.ReactNode>, floatingWindows: React.ReactNode[], splitterComponents: React.ReactNode[]) {
        for (const border of borderSet.getBorders()) {
            const borderPath = `/border/${border.getLocation().getName()}`;
            if (border.isShowing()) {
                borderComponents.push(
                    <BorderTabSet
                        key={`border_${border.getLocation().getName()}`}
                        path={borderPath}
                        border={border}
                        layout={this}
                        iconFactory={this.props.iconFactory}
                        titleFactory={this.props.titleFactory}
                        icons={this.icons}
                    />
                );
                const drawChildren = border._getDrawChildren();
                let i = 0;
                let tabCount = 0;
                for (const child of drawChildren) {
                    if (child instanceof SplitterNode) {
                        let path = borderPath + "/s";
                        splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child} path={path} />);
                    } else if (child instanceof TabNode) {
                        let path = borderPath + "/t" + tabCount++;
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
                            tabComponents[child.getId()] = <TabFloating key={child.getId()}
                                layout={this}
                                path={path}
                                node={child}
                                selected={i === border.getSelected()
                                } />;
                        } else {
                            tabComponents[child.getId()] = <Tab key={child.getId()}
                                layout={this}
                                path={path}
                                node={child}
                                selected={i === border.getSelected()}
                                factory={this.props.factory} />;
                        }
                    }
                    i++;
                }
            }
        }
    }

    /** @internal */
    renderChildren(path: string, node: RowNode | TabSetNode, tabSetComponents: React.ReactNode[], tabComponents: Record<string, React.ReactNode>, floatingWindows: React.ReactNode[], splitterComponents: React.ReactNode[]) {
        const drawChildren = node._getDrawChildren();
        let splitterCount = 0;
        let tabCount = 0;
        let rowCount = 0;

        for (const child of drawChildren!) {
            if (child instanceof SplitterNode) {
                const newPath = path + "/s" + (splitterCount++);
                splitterComponents.push(<Splitter key={child.getId()} layout={this} path={newPath} node={child} />);
            } else if (child instanceof TabSetNode) {
                const newPath = path + "/ts" + (rowCount++);
                tabSetComponents.push(<TabSet key={child.getId()} layout={this} path={newPath} node={child} iconFactory={this.props.iconFactory} titleFactory={this.props.titleFactory} icons={this.icons} />);
                this.renderChildren(newPath, child, tabSetComponents, tabComponents, floatingWindows, splitterComponents);
            } else if (child instanceof TabNode) {
                const newPath = path + "/t" + (tabCount++);
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
                    tabComponents[child.getId()] = <TabFloating key={child.getId()} layout={this} path={newPath} node={child} selected={child === selectedTab} />;
                } else {
                    tabComponents[child.getId()] = <Tab key={child.getId()} layout={this} path={newPath} node={child} selected={child === selectedTab} factory={this.props.factory} />;
                }
            } else {
                // is row
                const newPath = path + ((child.getOrientation() === Orientation.HORZ) ? "/r" : "/c") + (rowCount++);
                this.renderChildren(newPath, child as RowNode, tabSetComponents, tabComponents, floatingWindows, splitterComponents);
            }
        }
    }

    /** @internal */
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
     * @param onDrop a callback to call when the drag is complete (node and event will be undefined if the drag was cancelled)
     */
    addTabWithDragAndDrop(dragText: string | undefined, json: IJsonTabNode, onDrop?: (node?: Node, event?: Event) => void) {
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
     * @param onDrop a callback to call when the drag is complete (node and event will be undefined if the drag was cancelled)
     */
    addTabWithDragAndDropIndirect(dragText: string | undefined, json: IJsonTabNode, onDrop?: (node?: Node, event?: Event) => void) {
        this.fnNewNodeDropped = onDrop;
        this.newTabJson = json;

        DragDrop.instance.addGlass(this.onCancelAdd);

        this.dragDivText = dragText;
        this.dragDiv = this.currentDocument!.createElement("div");
        this.dragDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__DRAG_RECT);
        this.dragDiv.addEventListener("mousedown", this.onDragDivMouseDown);
        this.dragDiv.addEventListener("touchstart", this.onDragDivMouseDown);

        this.dragRectRender(this.dragDivText, undefined, this.newTabJson, () => {
            if (this.dragDiv) {
                // now it's been rendered into the dom it can be centered
                this.dragDiv.style.visibility = "visible";
                const domRect = this.dragDiv.getBoundingClientRect();
                const r = new Rect(0, 0, domRect?.width, domRect?.height);
                r.centerInRect(this.state.rect);
                this.dragDiv.setAttribute("data-layout-path", "/drag-rectangle");
                this.dragDiv.style.left = r.x + "px";
                this.dragDiv.style.top = r.y + "px";
            }
        });

        const rootdiv = this.selfRef.current;
        rootdiv!.appendChild(this.dragDiv);
    }

    /** @internal */
    onCancelAdd = () => {
        const rootdiv = this.selfRef.current;
        rootdiv!.removeChild(this.dragDiv!);
        this.dragDiv = undefined;
        this.hidePortal();
        if (this.fnNewNodeDropped != null) {
            this.fnNewNodeDropped();
            this.fnNewNodeDropped = undefined;
        }

        try {
            this.customDrop?.invalidated?.()
        } catch (e) {
            console.error(e)
        }

        DragDrop.instance.hideGlass();
        this.newTabJson = undefined;
        this.customDrop = undefined;
    };

    /** @internal */
    onCancelDrag = (wasDragging: boolean) => {
        if (wasDragging) {
            const rootdiv = this.selfRef.current!;

            try {
                rootdiv.removeChild(this.outlineDiv!);
            } catch (e) { }

            try {
                rootdiv.removeChild(this.dragDiv!);
            } catch (e) { }

            this.dragDiv = undefined;
            this.hidePortal();
            this.hideEdges(rootdiv);
            if (this.fnNewNodeDropped != null) {
                this.fnNewNodeDropped();
                this.fnNewNodeDropped = undefined;
            }

            try {
                this.customDrop?.invalidated?.()
            } catch (e) {
                console.error(e)
            }

            DragDrop.instance.hideGlass();
            this.newTabJson = undefined;
            this.customDrop = undefined;
        }
        this.setState({ showHiddenBorder: DockLocation.CENTER });

    };

    /** @internal */
    onDragDivMouseDown = (event: Event) => {
        event.preventDefault();
        this.dragStart(event, this.dragDivText, TabNode._fromJson(this.newTabJson, this.props.model, false), true, undefined, undefined);
    };

    /** @internal */
    dragStart = (
        event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<HTMLDivElement> | undefined,
        dragDivText: string | undefined,
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

    /** @internal */
    dragRectRender = (text: String | undefined, node?: Node, json?: IJsonTabNode, onRendered?: () => void) => {
        let content: React.ReactElement | undefined;

        if (text !== undefined) {
            content = <div style={{ whiteSpace: "pre" }}>{text.replace("<br>", "\n")}</div>;
        } else {
            if (node && node instanceof TabNode) {
                content = (<TabButtonStamp
                    node={node}
                    layout={this}
                    iconFactory={this.props.iconFactory}
                    titleFactory={this.props.titleFactory}
                />);
            }
        }

        if (this.props.onRenderDragRect !== undefined) {
            const customContent = this.props.onRenderDragRect(content, node, json);
            if (customContent !== undefined) {
                content = customContent;
            }
        }

        // hide div until the render is complete
        this.dragDiv!.style.visibility = "hidden";
        this.dragRectRendered = false;
        this.showPortal(
            <DragRectRenderWrapper
                // wait for it to be rendered
                onRendered={() => {
                    this.dragRectRendered = true;
                    onRendered?.();
                }}>
                {content}
            </DragRectRenderWrapper>,
            this.dragDiv!);
    };

    /** @internal */
    showPortal = (control: React.ReactNode, element: HTMLElement) => {
        const portal = ReactDOM.createPortal(control, element);
        this.setState({ portal });
    };

    /** @internal */
    hidePortal = () => {
        this.setState({ portal: undefined });
    };

    /** @internal */
    onDragStart = () => {
        this.dropInfo = undefined;
        this.customDrop = undefined;
        const rootdiv = this.selfRef.current!;
        this.outlineDiv = this.currentDocument!.createElement("div");
        this.outlineDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__OUTLINE_RECT);
        this.outlineDiv.style.visibility = "hidden";
        rootdiv.appendChild(this.outlineDiv);

        if (this.dragDiv == null) {
            this.dragDiv = this.currentDocument!.createElement("div");
            this.dragDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__DRAG_RECT);
            this.dragDiv.setAttribute("data-layout-path", "/drag-rectangle");
            this.dragRectRender(this.dragDivText, this.dragNode, this.newTabJson);

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

    /** @internal */
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

        this.checkForBorderToShow(pos.x, pos.y);

        // keep it between left & right
        const dragRect = this.dragDiv!.getBoundingClientRect();
        let newLeft = pos.x - dragRect.width / 2;
        if (newLeft + dragRect.width > clientRect.width) {
            newLeft = clientRect.width - dragRect.width;
        }
        newLeft = Math.max(0, newLeft);

        this.dragDiv!.style.left = newLeft + "px";
        this.dragDiv!.style.top = pos.y + 5 + "px";
        if (this.dragRectRendered && this.dragDiv!.style.visibility === "hidden") {
            // make visible once the drag rect has been rendered
            this.dragDiv!.style.visibility = "visible";
        }

        let dropInfo = this.props.model._findDropTargetNode(this.dragNode!, pos.x, pos.y);
        if (dropInfo) {
            if (this.props.onTabDrag) {
                this.handleCustomTabDrag(dropInfo, pos, event);
            } else {
                this.dropInfo = dropInfo;
                this.outlineDiv!.className = this.getClassName(dropInfo.className);
                dropInfo.rect.positionElement(this.outlineDiv!);
                this.outlineDiv!.style.visibility = "visible";
            }
        }
    };

    /** @internal */
    onDragEnd = (event: Event) => {
        const rootdiv = this.selfRef.current!;
        rootdiv.removeChild(this.outlineDiv!);
        rootdiv.removeChild(this.dragDiv!);
        this.dragDiv = undefined;
        this.hidePortal();

        this.hideEdges(rootdiv);
        DragDrop.instance.hideGlass();

        if (this.dropInfo) {
            if (this.customDrop) {
                this.newTabJson = undefined;

                try {
                    const { callback, dragging, over, x, y, location } = this.customDrop;
                    callback(dragging, over, x, y, location);
                    if (this.fnNewNodeDropped != null) {
                        this.fnNewNodeDropped();
                        this.fnNewNodeDropped = undefined;
                    }
                } catch (e) {
                    console.error(e)
                }
            } else if (this.newTabJson !== undefined) {
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
        this.setState({ showHiddenBorder: DockLocation.CENTER });
    };

    /** @internal */
    private handleCustomTabDrag(dropInfo: DropInfo, pos: { x: number; y: number; }, event: React.MouseEvent<Element, MouseEvent>) {
        let invalidated = this.customDrop?.invalidated;
        const currentCallback = this.customDrop?.callback;
        this.customDrop = undefined;

        const dragging = this.newTabJson || (this.dragNode instanceof TabNode ? this.dragNode : undefined);
        if (dragging && (dropInfo.node instanceof TabSetNode || dropInfo.node instanceof BorderNode) && dropInfo.index === -1) {
            const selected = dropInfo.node.getSelectedNode() as TabNode | undefined;
            const tabRect = selected?.getRect();

            if (selected && tabRect?.contains(pos.x, pos.y)) {
                let customDrop: ICustomDropDestination | undefined = undefined;

                try {
                    const dest = this.onTabDrag(dragging, selected, pos.x - tabRect.x, pos.y - tabRect.y, dropInfo.location, () => this.onDragMove(event));

                    if (dest) {
                        customDrop = {
                            rect: new Rect(dest.x + tabRect.x, dest.y + tabRect.y, dest.width, dest.height),
                            callback: dest.callback,
                            invalidated: dest.invalidated,
                            dragging: dragging,
                            over: selected,
                            x: pos.x - tabRect.x,
                            y: pos.y - tabRect.y,
                            location: dropInfo.location,
                            cursor: dest.cursor
                        };
                    }
                } catch (e) {
                    console.error(e);
                }

                if (customDrop?.callback === currentCallback) {
                    invalidated = undefined;
                }

                this.customDrop = customDrop;
            }
        }

        this.dropInfo = dropInfo;
        this.outlineDiv!.className = this.getClassName(this.customDrop ? CLASSES.FLEXLAYOUT__OUTLINE_RECT : dropInfo.className);

        if (this.customDrop) {
            this.customDrop.rect.positionElement(this.outlineDiv!);
        } else {
            dropInfo.rect.positionElement(this.outlineDiv!);
        }

        DragDrop.instance.setGlassCursorOverride(this.customDrop?.cursor);
        this.outlineDiv!.style.visibility = "visible";

        try {
            invalidated?.();
        } catch (e) {
            console.error(e);
        }
    }

    /** @internal */
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


    /** @internal */
    checkForBorderToShow(x: number, y: number) {
        const r = this.props.model._getOuterInnerRects().outer;
        const c = r.getCenter();
        const margin = this.edgeRectWidth;
        const offset = this.edgeRectLength / 2;

        let overEdge = false;
        if (this.props.model.isEnableEdgeDock() && this.state.showHiddenBorder === DockLocation.CENTER) {
            if ((y > c.y - offset && y < c.y + offset) ||
                (x > c.x - offset && x < c.x + offset)) {
                overEdge = true;
            }
        }

        let location = DockLocation.CENTER;
        if (!overEdge) {
            if (x <= r.x + margin) {
                location = DockLocation.LEFT;
            } else if (x >= r.getRight() - margin) {
                location = DockLocation.RIGHT;
            } else if (y <= r.y + margin) {
                location = DockLocation.TOP;
            } else if (y >= r.getBottom() - margin) {
                location = DockLocation.BOTTOM;
            }
        }

        if (location !== this.state.showHiddenBorder) {
            this.setState({ showHiddenBorder: location });
        }
    }

    /** @internal */
    showEdges(rootdiv: HTMLElement) {
        if (this.props.model.isEnableEdgeDock()) {
            const length = this.edgeRectLength + "px";
            const radius = "50px";
            const width = this.edgeRectWidth + "px";

            this.edgeTopDiv = this.currentDocument!.createElement("div");
            this.edgeTopDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            this.edgeTopDiv.style.width = length;
            this.edgeTopDiv.style.height = width;
            this.edgeTopDiv.style.borderBottomLeftRadius = radius;
            this.edgeTopDiv.style.borderBottomRightRadius = radius;

            this.edgeLeftDiv = this.currentDocument!.createElement("div");
            this.edgeLeftDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            this.edgeLeftDiv.style.width = width;
            this.edgeLeftDiv.style.height = length;
            this.edgeLeftDiv.style.borderTopRightRadius = radius;
            this.edgeLeftDiv.style.borderBottomRightRadius = radius;

            this.edgeBottomDiv = this.currentDocument!.createElement("div");
            this.edgeBottomDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            this.edgeBottomDiv.style.width = length;
            this.edgeBottomDiv.style.height = width;
            this.edgeBottomDiv.style.borderTopLeftRadius = radius;
            this.edgeBottomDiv.style.borderTopRightRadius = radius;

            this.edgeRightDiv = this.currentDocument!.createElement("div");
            this.edgeRightDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            this.edgeRightDiv.style.width = width;
            this.edgeRightDiv.style.height = length;
            this.edgeRightDiv.style.borderTopLeftRadius = radius;
            this.edgeRightDiv.style.borderBottomLeftRadius = radius;

            this.repositionEdges(this.state.rect);

            rootdiv.appendChild(this.edgeTopDiv);
            rootdiv.appendChild(this.edgeLeftDiv);
            rootdiv.appendChild(this.edgeBottomDiv);
            rootdiv.appendChild(this.edgeRightDiv);

            this.edgesShown = true;
        }
    }

    /** @internal */
    repositionEdges(domRect: Rect) {
        if (this.props.model.isEnableEdgeDock()) {
            const r = this.centerRect!;

            this.edgeTopDiv!.style.top = r.y + "px";
            this.edgeTopDiv!.style.left = r.x + (r.width - this.edgeRectLength) / 2 + "px";

            this.edgeLeftDiv!.style.top = r.y + (r.height - this.edgeRectLength) / 2 + "px";
            this.edgeLeftDiv!.style.left = r.x + "px";

            this.edgeBottomDiv!.style.bottom = domRect.height - r.getBottom() + "px";
            this.edgeBottomDiv!.style.left = r.x + (r.width - this.edgeRectLength) / 2 + "px";

            this.edgeRightDiv!.style.top = r.y + (r.height - this.edgeRectLength) / 2 + "px";
            this.edgeRightDiv!.style.right = domRect.width - r.getRight() + "px";
        }
    }

    /** @internal */
    hideEdges(rootdiv: HTMLElement) {
        if (this.props.model.isEnableEdgeDock()) {
            try {
                rootdiv.removeChild(this.edgeTopDiv!);
                rootdiv.removeChild(this.edgeLeftDiv!);
                rootdiv.removeChild(this.edgeBottomDiv!);
                rootdiv.removeChild(this.edgeRightDiv!);
            } catch (e) { }
        }

        this.edgesShown = false;
    }

    /** @internal */
    maximize(tabsetNode: TabSetNode) {
        this.doAction(Actions.maximizeToggle(tabsetNode.getId()));
    }

    /** @internal */
    customizeTab(
        tabNode: TabNode,
        renderValues: ITabRenderValues,
    ) {
        if (this.props.onRenderTab) {
            this.props.onRenderTab(tabNode, renderValues);
        }
    }

    /** @internal */
    customizeTabSet(
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues,
    ) {
        if (this.props.onRenderTabSet) {
            this.props.onRenderTabSet(tabSetNode, renderValues);
        }
    }

    /** @internal */
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

    /** @internal */
    getOnRenderFloatingTabPlaceholder() {
        return this.props.onRenderFloatingTabPlaceholder;
    }

    /** @internal */
    getShowOverflowMenu() {
        return this.props.onShowOverflowMenu;
    }

    /** @internal */
    getTabSetPlaceHolderCallback() {
        return this.props.onTabSetPlaceHolder;
    }
    /** @internal */
    showContextMenu(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) {
        if (this.props.onContextMenu) {
            this.props.onContextMenu(node, event);
        }
    }

    /** @internal */
    auxMouseClick(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) {
        if (this.props.onAuxMouseClick) {
            this.props.onAuxMouseClick(node, event);
        }
    }
}

// wrapper round the drag rect renderer that can call
// a method once the rendering is written to the dom

/** @internal */
interface IDragRectRenderWrapper {
    onRendered?: () => void;
    children: React.ReactNode;
}

/** @internal */
const DragRectRenderWrapper = (props: IDragRectRenderWrapper) => {
    React.useEffect(() => {
        props.onRendered?.();
    }, [props]);

    return (<React.Fragment>
        {props.children}
    </React.Fragment>)
}
