import * as React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { I18nLabel } from "../I18nLabel";
import { Orientation } from "../Orientation";
import { Rect } from "../Rect";
import { CLASSES } from "../Types";
import { Action } from "../model/Action";
import { Actions } from "../model/Actions";
import { BorderNode } from "../model/BorderNode";
import { IDraggable } from "../model/IDraggable";
import { IJsonTabNode } from "../model/IJsonModel";
import { Model } from "../model/Model";
import { Node } from "../model/Node";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { BorderTab } from "./BorderTab";
import { BorderTabSet } from "./BorderTabSet";
import { DragContainer } from "./DragContainer";
import { ErrorBoundary } from "./ErrorBoundary";
import { PopoutWindow } from "./PopoutWindow";
import { AsterickIcon, CloseIcon, EdgeIcon, MaximizeIcon, OverflowIcon, PopoutIcon, RestoreIcon } from "./Icons";
import { Overlay } from "./Overlay";
import { Row } from "./Row";
import { Tab } from "./Tab";
import { copyInlineStyles, enablePointerOnIFrames, isDesktop, isSafari } from "./Utils";
import { LayoutWindow } from "../model/LayoutWindow";
import { TabButtonStamp } from "./TabButtonStamp";
import { SizeTracker } from "./SizeTracker";

export interface ILayoutProps {
    /** the model for this layout */
    model: Model;
    /** factory function for creating the tab components */
    factory: (node: TabNode) => React.ReactNode;
    /** object mapping keys among close, maximize, restore, more, popout to React nodes to use in place of the default icons, can alternatively return functions for creating the React nodes */
    icons?: IIcons;
    /** function called whenever the layout generates an action to update the model (allows for intercepting actions before they are dispatched to the model, for example, asking the user to confirm a tab close.) Returning undefined from the function will halt the action, otherwise return the action to continue */
    onAction?: (action: Action) => Action | undefined;
    /** function called when rendering a tab, allows leading (icon), content section, buttons and name used in overflow menu to be customized */
    onRenderTab?: (
        node: TabNode,
        renderValues: ITabRenderValues, // change the values in this object as required
    ) => void;
    /** function called when rendering a tabset, allows header and buttons to be customized */
    onRenderTabSet?: (
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues, // change the values in this object as required
    ) => void;
    /** function called when model has changed */
    onModelChange?: (model: Model, action: Action) => void;
    /** function called when an external object (not a tab) gets dragged onto the layout, with a single dragenter argument. Should return either undefined to reject the drag/drop or an object with keys dragText, jsonDrop, to create a tab via drag (similar to a call to addTabToTabSet). Function onDropis passed the added tabNodeand thedrop DragEvent`, unless the drag was canceled. */
    onExternalDrag?: (event: React.DragEvent<HTMLElement>) => undefined | {
        json: any,
        onDrop?: (node?: Node, event?: React.DragEvent<HTMLElement>) => void
    };
    /** function called with default css class name, return value is class name that will be used. Mainly for use with css modules. */
    classNameMapper?: (defaultClassName: string) => string;
    /** function called for each I18nLabel to allow user translation, currently used for tab and tabset move messages, return undefined to use default values */
    i18nMapper?: (id: I18nLabel, param?: string) => string | undefined;
    /** if left undefined will do simple check based on userAgent */
    supportsPopout?: boolean | undefined;
    /** URL of popout window relative to origin, defaults to popout.html */
    popoutURL?: string | undefined;
    /** boolean value, defaults to false, resize tabs as splitters are dragged. Warning: this can cause resizing to become choppy when tabs are slow to draw */
    realtimeResize?: boolean | undefined;
    /** callback for rendering the drag rectangles */
    onRenderDragRect?: DragRectRenderCallback;
    /** callback for handling context actions on tabs and tabsets */
    onContextMenu?: NodeMouseEvent;
    /** callback for handling mouse clicks on tabs and tabsets with alt, meta, shift keys, also handles center mouse clicks */
    onAuxMouseClick?: NodeMouseEvent;
    /** callback for handling the display of the tab overflow menu */
    onShowOverflowMenu?: ShowOverflowMenuCallback;
    /** callback for rendering a placeholder when a tabset is empty */
    onTabSetPlaceHolder?: TabSetPlaceHolderCallback;
    /** Name given to popout windows, defaults to 'Popout Window' */
    popoutWindowName?: string;
}

/**
 * A React component that hosts a multi-tabbed layout
 */
export class Layout extends React.Component<ILayoutProps> {
    /** @internal */
    private selfRef: React.RefObject<LayoutInternal>;
    /** @internal */
    private revision: number; // so LayoutInternal knows this is a parent render (used for optimization)

    /** @internal */
    constructor(props: ILayoutProps) {
        super(props);
        this.selfRef = React.createRef<LayoutInternal>();
        this.revision = 0;
    }

    /** re-render the layout */
    redraw() {
        this.selfRef.current!.redraw("parent " + this.revision);
    }

    /**
     * Adds a new tab to the given tabset
     * @param tabsetId the id of the tabset where the new tab will be added
     * @param json the json for the new tab node
     * @returns the added tab node or undefined
     */
    addTabToTabSet(tabsetId: string, json: IJsonTabNode): TabNode | undefined {
        return this.selfRef.current!.addTabToTabSet(tabsetId, json);
    }

    /**
     * Adds a new tab by dragging an item to the drop location, must be called from within an HTML
     * drag start handler. You can use the setDragComponent() method to set the drag image before calling this 
     * method.
     * @param event the drag start event
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDrop(event: DragEvent, json: IJsonTabNode, onDrop?: (node?: Node, event?: React.DragEvent<HTMLElement>) => void) {
        this.selfRef.current!.addTabWithDragAndDrop(event, json, onDrop);
    }

    /**
     * Move a tab/tabset using drag and drop, must be called from within an HTML
     * drag start handler
     * @param event the drag start event
     * @param node the tab or tabset to drag
     */
    moveTabWithDragAndDrop(event: DragEvent, node: (TabNode | TabSetNode)) {
        this.selfRef.current!.moveTabWithDragAndDrop(event, node);
    }

    /**
     * Adds a new tab to the active tabset (if there is one)
     * @param json the json for the new tab node
     * @returns the added tab node or undefined
     */
    addTabToActiveTabSet(json: IJsonTabNode): TabNode | undefined {
        return this.selfRef.current!.addTabToActiveTabSet(json);
    }

    /**
     * Sets the drag image from a react component for a drag event
     * @param event the drag event
     * @param component the react component to be used for the drag image
     * @param x the x position of the drag cursor on the image
     * @param y the x position of the drag cursor on the image
     */
    setDragComponent(event: DragEvent, component: React.ReactNode, x: number, y: number) {
        this.selfRef.current!.setDragComponent(event, component, x, y);
    }

    /** Get the root div element of the layout */
    getRootDiv() {
        return this.selfRef.current!.getRootDiv();
    }

    /** @internal */
    render() {
        return (<LayoutInternal ref={this.selfRef} {...this.props} renderRevision={this.revision++} />)
    }
}

/** @internal */
interface ILayoutInternalProps extends ILayoutProps {
    renderRevision: number;

    // used only for popout windows:
    windowId?: string;
    mainLayout?: LayoutInternal;
}

/** @internal */
interface ILayoutInternalState {
    rect: Rect;
    editingTab?: TabNode;
    portal?: React.ReactPortal;
    showEdges: boolean;
    showOverlay: boolean;
    calculatedBorderBarSize: number;
    layoutRevision: number;
    forceRevision: number;
    showHiddenBorder: DockLocation;
}

/** @internal */
export class LayoutInternal extends React.Component<ILayoutInternalProps, ILayoutInternalState> {
    public static dragState: DragState | undefined = undefined;

    private selfRef: React.RefObject<HTMLDivElement>;
    private moveablesRef: React.RefObject<HTMLDivElement>;
    private findBorderBarSizeRef: React.RefObject<HTMLDivElement>;
    private mainRef: React.RefObject<HTMLDivElement>;
    private previousModel?: Model;
    private orderedIds: string[];
    private moveableElementMap = new Map<string, HTMLElement>();
    private dropInfo: DropInfo | undefined;
    private outlineDiv?: HTMLElement;
    private currentDocument?: Document;
    private currentWindow?: Window;
    private supportsPopout: boolean;
    private popoutURL: string;
    private icons: IIcons;
    private resizeObserver?: ResizeObserver;

    private dragEnterCount: number = 0;
    private dragging: boolean = false;
    private windowId: string;
    private layoutWindow: LayoutWindow;
    private mainLayout: LayoutInternal;
    private isMainWindow: boolean;
    private isDraggingOverWindow: boolean;
    private styleObserver: MutationObserver | undefined;
    private popoutWindowName: string;
    // private renderCount: any;

    constructor(props: ILayoutInternalProps) {
        super(props);

        this.orderedIds = [];
        this.selfRef = React.createRef<HTMLDivElement>();
        this.moveablesRef = React.createRef<HTMLDivElement>();
        this.mainRef = React.createRef<HTMLDivElement>();
        this.findBorderBarSizeRef = React.createRef<HTMLDivElement>();

        this.supportsPopout = props.supportsPopout !== undefined ? props.supportsPopout : defaultSupportsPopout;
        this.popoutURL = props.popoutURL ? props.popoutURL : "popout.html";
        this.icons = { ...defaultIcons, ...props.icons };
        this.windowId = props.windowId ? props.windowId : Model.MAIN_WINDOW_ID;
        this.mainLayout = this.props.mainLayout ? this.props.mainLayout : this;
        this.isDraggingOverWindow = false;
        this.layoutWindow = this.props.model.getwindowsMap().get(this.windowId)!;
        this.layoutWindow.layout = this;
        this.popoutWindowName = this.props.popoutWindowName || "Popout Window";
        // this.renderCount = 0;

        this.state = {
            rect: Rect.empty(),
            editingTab: undefined,
            showEdges: false,
            showOverlay: false,
            calculatedBorderBarSize: 29,
            layoutRevision: 0,
            forceRevision: 0,
            showHiddenBorder: DockLocation.CENTER
        };

        this.isMainWindow = this.windowId === Model.MAIN_WINDOW_ID;
    }

    componentDidMount() {
        this.updateRect();

        this.currentDocument = (this.selfRef.current as HTMLElement).ownerDocument;
        this.currentWindow = this.currentDocument.defaultView!;

        this.layoutWindow.window = this.currentWindow;
        this.layoutWindow.toScreenRectFunction = (r) => this.getScreenRect(r);

        this.resizeObserver = new ResizeObserver(entries => {
            requestAnimationFrame(() => {
                this.updateRect();
            });
        });
        if (this.selfRef.current) {
            this.resizeObserver.observe(this.selfRef.current);
        }

        if (this.isMainWindow) {
            this.props.model.addChangeListener(this.onModelChange);
            this.updateLayoutMetrics();
        } else {
            // since resizeObserver doesn't always work as expected when observing element in another document
            this.currentWindow.addEventListener("resize", () => {
                this.updateRect();
            });

            const sourceElement = this.props.mainLayout!.getRootDiv()!;
            const targetElement = this.selfRef.current!;

            copyInlineStyles(sourceElement, targetElement);

            this.styleObserver = new MutationObserver(() => {
                const changed = copyInlineStyles(sourceElement, targetElement);
                if (changed) {
                    this.redraw("mutation observer");
                }
            });

            // Observe changes to the source element's style attribute
            this.styleObserver.observe(sourceElement, { attributeFilter: ['style'] });
        }

        // allow tabs to overlay when hidden
        document.addEventListener('visibilitychange', () => {
            for (const [_, layoutWindow] of this.props.model.getwindowsMap()) {
                const layout = layoutWindow.layout;
                if (layout) {
                    this.redraw("visibility change");
                }
            }
        });
    }

    componentDidUpdate() {
        this.currentDocument = (this.selfRef.current as HTMLElement).ownerDocument;
        this.currentWindow = this.currentDocument.defaultView!;
        if (this.isMainWindow) {
            if (this.props.model !== this.previousModel) {
                if (this.previousModel !== undefined) {
                    this.previousModel.removeChangeListener(this.onModelChange); // stop listening to old model
                }
                this.props.model.getwindowsMap().get(this.windowId)!.layout = this;
                this.props.model.addChangeListener(this.onModelChange);
                this.layoutWindow = this.props.model.getwindowsMap().get(this.windowId)!;
                this.layoutWindow.layout = this;
                this.layoutWindow.toScreenRectFunction = (r) => this.getScreenRect(r);
                this.previousModel = this.props.model;
                this.tidyMoveablesMap();
            }

            this.updateLayoutMetrics();
        }
    }

    componentWillUnmount() {
        if (this.selfRef.current) {
            this.resizeObserver?.unobserve(this.selfRef.current);
        }
        this.styleObserver?.disconnect();
    }

    render() {
        // console.log("render", this.windowId, this.state.revision, this.renderCount++);
        // first render will be used to find the size (via selfRef)
        if (!this.selfRef.current) {
            return (
                <div ref={this.selfRef} className={this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT)}>
                    <div ref={this.moveablesRef} key="__moveables__" className={this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_MOVEABLES)}></div>
                    {this.renderMetricsElements()}
                </div>
            );
        }

        const model = this.props.model;
        model.getRoot(this.windowId).calcMinMaxSize();
        model.getRoot(this.windowId).setPaths("");
        model.getBorderSet().setPaths();

        const inner = this.renderLayout();
        const outer = this.renderBorders(inner);

        const tabs = this.renderTabs();
        const reorderedTabs = this.reorderComponents(tabs, this.orderedIds);

        let floatingWindows = null;
        let tabMoveables = null;
        let tabStamps = null;
        let metricElements = null;

        if (this.isMainWindow) {
            floatingWindows = this.renderWindows();
            metricElements = this.renderMetricsElements();
            tabMoveables = this.renderTabMoveables();
            tabStamps = <div key="__tabStamps__" className={this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_TAB_STAMPS)}>
                {this.renderTabStamps()}
            </div>;
        }

        return (
            <div
                ref={this.selfRef}
                className={this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT)}
                onDragEnter={this.onDragEnterRaw}
                onDragLeave={this.onDragLeaveRaw}
                onDragOver={this.onDragOver}
                onDrop={this.onDrop}
            >
                <div ref={this.moveablesRef} key="__moveables__" className={this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_MOVEABLES)}></div>
                {metricElements}
                <Overlay key="__overlay__" layout={this} show={this.state.showOverlay} />
                {outer}
                {reorderedTabs}
                {tabMoveables}
                {tabStamps}
                {this.state.portal}
                {floatingWindows}
            </div>
        );
    }

    renderBorders(
        inner: React.ReactNode
    ) {
        const classMain = this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_MAIN);
        const borders = this.props.model.getBorderSet().getBorderMap()
        if (this.isMainWindow && borders.size > 0) {
            inner = (
                <div className={classMain} ref={this.mainRef}>
                    {inner}
                </div>);
            const borderSetComponents = new Map<DockLocation, React.ReactNode>();
            const borderSetContentComponents = new Map<DockLocation, React.ReactNode>();
            for (const [_, location] of DockLocation.values) {
                const border = borders.get(location);
                const showBorder = border && (
                    !border.isAutoHide() ||
                    (border.isAutoHide() && (border.getChildren().length > 0 || this.state.showHiddenBorder === location)));
                if (showBorder) {
                    borderSetComponents.set(location, <BorderTabSet layout={this} border={border} size={this.state.calculatedBorderBarSize} />);
                    borderSetContentComponents.set(location, <BorderTab layout={this} border={border} show={border.getSelected() !== -1} />);
                }
            }

            const classBorderOuter = this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_BORDER_CONTAINER);
            const classBorderInner = this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_BORDER_CONTAINER_INNER);

            if (this.props.model.getBorderSet().getLayoutHorizontal()) {
                const innerWithBorderTabs = (
                    <div className={classBorderInner} style={{ flexDirection: "column" }}>
                        {borderSetContentComponents.get(DockLocation.TOP)}
                        <div className={classBorderInner} style={{ flexDirection: "row" }}>
                            {borderSetContentComponents.get(DockLocation.LEFT)}
                            {inner}
                            {borderSetContentComponents.get(DockLocation.RIGHT)}
                        </div>
                        {borderSetContentComponents.get(DockLocation.BOTTOM)}
                    </div>
                );
                return (
                    <div className={classBorderOuter} style={{ flexDirection: "column" }}>
                        {borderSetComponents.get(DockLocation.TOP)}
                        <div className={classBorderInner} style={{ flexDirection: "row" }}>
                            {borderSetComponents.get(DockLocation.LEFT)}
                            {innerWithBorderTabs}
                            {borderSetComponents.get(DockLocation.RIGHT)}
                        </div>
                        {borderSetComponents.get(DockLocation.BOTTOM)}
                    </div>
                );
            } else {
                const innerWithBorderTabs = (
                    <div className={classBorderInner} style={{ flexDirection: "row" }}>
                        {borderSetContentComponents.get(DockLocation.LEFT)}
                        <div className={classBorderInner} style={{ flexDirection: "column" }}>
                            {borderSetContentComponents.get(DockLocation.TOP)}
                            {inner}
                            {borderSetContentComponents.get(DockLocation.BOTTOM)}
                        </div>
                        {borderSetContentComponents.get(DockLocation.RIGHT)}
                    </div>
                );

                return (
                    <div className={classBorderOuter} style={{ flexDirection: "row" }}>
                        {borderSetComponents.get(DockLocation.LEFT)}
                        <div className={classBorderInner} style={{ flexDirection: "column" }}>
                            {borderSetComponents.get(DockLocation.TOP)}
                            {innerWithBorderTabs}
                            {borderSetComponents.get(DockLocation.BOTTOM)}
                        </div>
                        {borderSetComponents.get(DockLocation.RIGHT)}
                    </div>
                );
            }

        } else { // no borders
            return (
                <div className={classMain} ref={this.mainRef} style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, display: "flex" }}>
                    {inner}
                </div>
            );
        }
    }

    renderLayout() {
        return (
            <>
                <Row key="__row__" layout={this} node={this.props.model.getRoot(this.windowId)} />
                {this.renderEdgeIndicators()}
            </>
        );
    }

    renderEdgeIndicators() {
        const edges: React.ReactNode[] = [];
        const arrowIcon = this.icons.edgeArrow;
        if (this.state.showEdges) {
            const r = this.props.model.getRoot(this.windowId).getRect();
            const length = edgeRectLength;
            const width = edgeRectWidth;
            const offset = edgeRectLength / 2;
            const className = this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT);
            const radius = 50;
            edges.push(<div key="North" style={{ top: 0, left: r.width / 2 - offset, width: length, height: width, borderBottomLeftRadius: radius, borderBottomRightRadius: radius }} className={className + " " + this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT_TOP)}>
                <div style={{ transform: "rotate(180deg)" }}>
                    {arrowIcon}
                </div>
            </div>);
            edges.push(<div key="West" style={{ top: r.height / 2 - offset, left: 0, width: width, height: length, borderTopRightRadius: radius, borderBottomRightRadius: radius }} className={className + " " + this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT_LEFT)}>
                <div style={{ transform: "rotate(90deg)" }}>
                    {arrowIcon}
                </div>
            </div>);
            edges.push(<div key="South" style={{ top: r.height - width, left: r.width / 2 - offset, width: length, height: width, borderTopLeftRadius: radius, borderTopRightRadius: radius }} className={className + " " + this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT_BOTTOM)}>
                <div>
                    {arrowIcon}
                </div>
            </div>);
            edges.push(<div key="East" style={{ top: r.height / 2 - offset, left: r.width - width, width: width, height: length, borderTopLeftRadius: radius, borderBottomLeftRadius: radius }} className={className + " " + this.getClassName(CLASSES.FLEXLAYOUT__EDGE_RECT_RIGHT)}>
                <div style={{ transform: "rotate(-90deg)" }}>
                    {arrowIcon}
                </div>
            </div>);
        }

        return edges;
    }

    renderWindows() {
        const floatingWindows: React.ReactNode[] = [];
        if (this.supportsPopout) {
            const windows = this.props.model.getwindowsMap();
            let i = 1;
            for (const [windowId, layoutWindow] of windows) {

                if (windowId !== Model.MAIN_WINDOW_ID) {
                    floatingWindows.push(
                        <PopoutWindow
                            key={windowId}
                            layout={this}
                            title={this.popoutWindowName + " " + i}
                            layoutWindow={layoutWindow}
                            url={this.popoutURL + "?id=" + windowId}
                            onSetWindow={this.onSetWindow}
                            onCloseWindow={this.onCloseWindow}
                        >
                            <LayoutInternal {...this.props} windowId={windowId} mainLayout={this} />
                        </PopoutWindow>
                    );
                    i++;
                }
            }
        }
        return floatingWindows;
    }

    renderTabMoveables() {
        const tabMoveables: React.ReactNode[] = [];

        this.props.model.visitNodes((node) => {
            if (node instanceof TabNode) {
                const child = node as TabNode;
                const element = this.getMoveableElement(child.getId());
                child.setMoveableElement(element);
                const selected = child.isSelected();
                const rect = (child.getParent() as BorderNode | TabSetNode).getContentRect();

                // only render first time if size >0
                const renderTab = child.isRendered() ||
                    ((selected || !child.isEnableRenderOnDemand()) && (rect.width > 0 && rect.height > 0));

                if (renderTab) {
                    //  console.log("rendertab", child.getName(), this.props.renderRevision);
                    const key = child.getId() + (child.isEnableWindowReMount() ? child.getWindowId() : "");
                    tabMoveables.push(createPortal(
                        <SizeTracker rect={rect} selected={child.isSelected()} forceRevision={this.state.forceRevision} tabsRevision={this.props.renderRevision} key={key}>
                            <ErrorBoundary message={this.i18nName(I18nLabel.Error_rendering_component)}>
                                {this.props.factory(child)}
                            </ErrorBoundary>
                        </SizeTracker>
                        , element, key));

                    child.setRendered(renderTab);
                }
            }
        });

        return tabMoveables;
    }

    renderTabStamps() {
        const tabStamps: React.ReactNode[] = [];

        this.props.model.visitNodes((node) => {
            if (node instanceof TabNode) {
                const child = node as TabNode;

                // what the tab should look like when dragged (since images need to have been loaded before drag image can be taken)
                tabStamps.push(<DragContainer key={child.getId()} layout={this} node={child} />)
            }
        });

        return tabStamps;
    }

    renderTabs() {
        const tabs = new Map<string, React.ReactNode>();
        this.props.model.visitWindowNodes(this.windowId, (node) => {
            if (node instanceof TabNode) {
                const child = node as TabNode;
                const selected = child.isSelected();
                const path = child.getPath();

                const renderTab = child.isRendered() || selected || !child.isEnableRenderOnDemand();

                if (renderTab) {
                    // const rect = (child.getParent() as BorderNode | TabSetNode).getContentRect();
                    // const key = child.getId();

                    tabs.set(child.getId(), (
                        // <SizeTracker rect={rect} forceRevision={this.state.forceRevision} key={key}>
                        <Tab
                            key={child.getId()}
                            layout={this}
                            path={path}
                            node={child}
                            selected={selected} />
                        // </SizeTracker>
                    ));
                }
            }
        });
        return tabs;
    }

    renderMetricsElements() {
        return (
            <div key="findBorderBarSize" ref={this.findBorderBarSizeRef} className={this.getClassName(CLASSES.FLEXLAYOUT__BORDER_SIZER)}>
                FindBorderBarSize
            </div>
        );
    }

    checkForBorderToShow(x: number, y: number) {
        const r = this.getBoundingClientRect(this.mainRef.current!);
        const c = r.getCenter();
        const margin = edgeRectWidth;
        const offset = edgeRectLength / 2;

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

    updateLayoutMetrics = () => {
        if (this.findBorderBarSizeRef.current) {
            const borderBarSize = this.findBorderBarSizeRef.current.getBoundingClientRect().height;
            if (borderBarSize !== this.state.calculatedBorderBarSize) {
                this.setState({ calculatedBorderBarSize: borderBarSize });
            }
        }
    };

    tidyMoveablesMap() {
        // console.log("tidyMoveablesMap");
        const tabs = new Map<string, TabNode>();
        this.props.model.visitNodes((node, _) => {
            if (node instanceof TabNode) {
                tabs.set(node.getId(), node);
            }
        });

        for (const [nodeId, element] of this.moveableElementMap) {
            if (!tabs.has(nodeId)) {
                // console.log("delete", nodeId);
                element.remove(); // remove from dom
                this.moveableElementMap.delete(nodeId); // remove map entry 
            }
        }
    }

    reorderComponents(components: Map<string, React.ReactNode>, ids: string[]) {
        const nextIds: string[] = [];
        const nextIdsSet = new Set<string>();

        let reordered: React.ReactNode[] = [];
        // Keep any previous tabs in the same DOM order as before, removing any that have been deleted
        for (const id of ids) {
            if (components.get(id)) {
                nextIds.push(id);
                nextIdsSet.add(id);
            }
        }
        ids.splice(0, ids.length, ...nextIds);

        // Add tabs that have been added to the DOM
        for (const [id, _] of components) {
            if (!nextIdsSet.has(id)) {
                ids.push(id);
            }
        }

        reordered = ids.map((id) => {
            return components.get(id);
        });

        return reordered;
    }

    onModelChange = (action: Action) => {
        this.redrawInternal("model change");
        if (this.props.onModelChange) {
            this.props.onModelChange(this.props.model, action);
        }
    };

    redraw(type?: string) {
        // console.log("redraw", this.windowId, type);
        this.mainLayout.setState((state, props) => { return { forceRevision: state.forceRevision + 1 } });
    }

    redrawInternal(type: string) {
        // console.log("redrawInternal", this.windowId, type);
        this.mainLayout.setState((state, props) => { return { layoutRevision: state.layoutRevision + 1 } });
    }

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

    updateRect = () => {
        const rect = this.getDomRect()
        if (!rect.equals(this.state.rect) && rect.width !== 0 && rect.height !== 0) {
            // console.log("updateRect", rect.floor());
            this.setState({ rect });
            if (this.windowId !== Model.MAIN_WINDOW_ID) {
                this.redrawInternal("rect updated");
            }
        }
    };

    getBoundingClientRect(div: HTMLElement): Rect {
        const layoutRect = this.getDomRect();
        if (layoutRect) {
            return Rect.getBoundingClientRect(div).relativeTo(layoutRect);
        }
        return Rect.empty();
    }

    getMoveableContainer() {
        return this.moveablesRef.current;
    }

    getMoveableElement(id: string) {
        let moveableElement = this.moveableElementMap.get(id);
        if (moveableElement === undefined) {
            moveableElement = document.createElement("div");
            this.moveablesRef.current!.appendChild(moveableElement);
            moveableElement.className = CLASSES.FLEXLAYOUT__TAB_MOVEABLE;
            this.moveableElementMap.set(id, moveableElement);
        }
        return moveableElement;
    }

    getMainLayout() {
        return this.mainLayout;
    }

    getClassName = (defaultClassName: string) => {
        if (this.props.classNameMapper === undefined) {
            return defaultClassName;
        } else {
            return this.props.classNameMapper(defaultClassName);
        }
    };

    getCurrentDocument() {
        return this.currentDocument;
    }

    getDomRect() {
        if (this.selfRef.current) {
            return Rect.fromDomRect(this.selfRef.current.getBoundingClientRect());
        } else {
            return Rect.empty();
        }
    }

    getWindowId() {
        return this.windowId;
    }

    getRootDiv() {
        return this.selfRef.current;
    }

    getMainElement() {
        return this.mainRef.current;
    }

    getFactory() {
        return this.props.factory;
    }

    isSupportsPopout() {
        return this.supportsPopout;
    }

    isRealtimeResize() {
        return this.props.realtimeResize ?? false;
    }

    getPopoutURL() {
        return this.popoutURL;
    }

    setEditingTab(tabNode?: TabNode) {
        this.setState({ editingTab: tabNode });
    }

    getEditingTab() {
        return this.state.editingTab;
    }

    getModel() {
        return this.props.model;
    }

    onCloseWindow = (windowLayout: LayoutWindow) => {
        this.doAction(Actions.closeWindow(windowLayout.windowId));
    };

    onSetWindow = (windowLayout: LayoutWindow, window: Window) => {
    };

    getScreenRect(inRect: Rect) {
        const rect = inRect.clone();
        const layoutRect = this.getDomRect();
        // Note: outerHeight can be less than innerHeight when window is zoomed, so cannot use
        // const navHeight = Math.min(65, this.currentWindow!.outerHeight - this.currentWindow!.innerHeight);
        // const navWidth = Math.min(65, this.currentWindow!.outerWidth - this.currentWindow!.innerWidth);
        const navHeight = 60;
        const navWidth = 2;
        // console.log(rect.y, this.currentWindow!.screenX,layoutRect.y);
        rect.x = this.currentWindow!.screenX + this.currentWindow!.scrollX + navWidth / 2 + layoutRect.x + rect.x;
        rect.y = this.currentWindow!.screenY + this.currentWindow!.scrollY + (navHeight - navWidth / 2) + layoutRect.y + rect.y;
        rect.height += navHeight;
        rect.width += navWidth;
        return rect;
    }

    addTabToTabSet(tabsetId: string, json: IJsonTabNode): TabNode | undefined {
        const tabsetNode = this.props.model.getNodeById(tabsetId);
        if (tabsetNode !== undefined) {
            const node = this.doAction(Actions.addNode(json, tabsetId, DockLocation.CENTER, -1));
            return node as TabNode;
        }
        return undefined;
    }

    addTabToActiveTabSet(json: IJsonTabNode): TabNode | undefined {
        const tabsetNode = this.props.model.getActiveTabset(this.windowId);
        if (tabsetNode !== undefined) {
            const node = this.doAction(Actions.addNode(json, tabsetNode.getId(), DockLocation.CENTER, -1));
            return node as TabNode;
        }
        return undefined;
    }

    showControlInPortal = (control: React.ReactNode, element: HTMLElement) => {
        const portal = createPortal(control, element) as React.ReactPortal;
        this.setState({ portal });
    };

    hideControlInPortal = () => {
        this.setState({ portal: undefined });
    };

    getIcons = () => {
        return this.icons;
    };

    maximize(tabsetNode: TabSetNode) {
        this.doAction(Actions.maximizeToggle(tabsetNode.getId(), this.getWindowId()));
    }

    customizeTab(
        tabNode: TabNode,
        renderValues: ITabRenderValues,
    ) {
        if (this.props.onRenderTab) {
            this.props.onRenderTab(tabNode, renderValues);
        }
    }

    customizeTabSet(
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues,
    ) {
        if (this.props.onRenderTabSet) {
            this.props.onRenderTabSet(tabSetNode, renderValues);
        }
    }

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

    getShowOverflowMenu() {
        return this.props.onShowOverflowMenu;
    }

    getTabSetPlaceHolderCallback() {
        return this.props.onTabSetPlaceHolder;
    }

    showContextMenu(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) {
        if (this.props.onContextMenu) {
            this.props.onContextMenu(node, event);
        }
    }

    auxMouseClick(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) {
        if (this.props.onAuxMouseClick) {
            this.props.onAuxMouseClick(node, event);
        }
    }

    public showOverlay(show: boolean) {
        this.setState({ showOverlay: show });
        enablePointerOnIFrames(!show, this.currentDocument!);
    }



    // *************************** Start Drag Drop *************************************

    addTabWithDragAndDrop(event: DragEvent, json: IJsonTabNode, onDrop?: (node?: Node, event?: React.DragEvent<HTMLElement>) => void) {
        const tempNode = TabNode.fromJson(json, this.props.model, false);
        LayoutInternal.dragState = new DragState(this.mainLayout, DragSource.Add, tempNode, json, onDrop);
    }

    moveTabWithDragAndDrop(event: DragEvent, node: (TabNode | TabSetNode)) {
        this.setDragNode(event, node);
    }

    public setDragNode = (event: DragEvent, node: Node & IDraggable) => {
        LayoutInternal.dragState = new DragState(this.mainLayout, DragSource.Internal, node, undefined, undefined);
        // Note: can only set (very) limited types on android! so cannot set json
        // Note: must set text/plain for android to allow drag, 
        //  so just set a simple message indicating its a flexlayout drag (this is not used anywhere else)
        event.dataTransfer!.setData('text/plain', "--flexlayout--");
        event.dataTransfer!.effectAllowed = "copyMove";
        event.dataTransfer!.dropEffect = "move";

        this.dragEnterCount = 0;

        if (node instanceof TabSetNode) {
            let rendered = false;
            let content = this.i18nName(I18nLabel.Move_Tabset);
            if (node.getChildren().length > 0) {
                content = this.i18nName(I18nLabel.Move_Tabs).replace("?", String(node.getChildren().length));
            }
            if (this.props.onRenderDragRect) {
                const dragComponent = this.props.onRenderDragRect(content, node, undefined);
                if (dragComponent) {
                    this.setDragComponent(event, dragComponent, 10, 10);
                    rendered = true;
                }
            }
            if (!rendered) {
                this.setDragComponent(event, content, 10, 10);
            }
        } else {
            const element = event.target as HTMLElement;
            const rect = element.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;
            const parentNode = node?.getParent();
            const isInVerticalBorder = parentNode instanceof BorderNode && (parentNode as BorderNode).getOrientation() === Orientation.HORZ;
            const x = isInVerticalBorder ? 10 : offsetX;
            const y = isInVerticalBorder ? 10 : offsetY;

            let rendered = false;
            if (this.props.onRenderDragRect) {
                const content = <TabButtonStamp key={node.getId()} layout={this} node={node as TabNode} />;
                const dragComponent = this.props.onRenderDragRect(content, node, undefined);
                if (dragComponent) {
                    this.setDragComponent(event, dragComponent, x, y);
                    rendered = true;
                }
            }
            if (!rendered) {
                if (isSafari()) { // safari doesnt render the offscreen tabstamps
                    this.setDragComponent(event, <TabButtonStamp node={node as TabNode} layout={this}/>, x,y);
                } else {
                    event.dataTransfer!.setDragImage((node as TabNode).getTabStamp()!, x, y);
                }
            }
        }
    };



    public setDragComponent(event: DragEvent, component: React.ReactNode, x: number, y: number) {
        let dragElement: JSX.Element = (
            <div style={{ position: "unset" }}
                className={this.getClassName(CLASSES.FLEXLAYOUT__LAYOUT) + " " + this.getClassName(CLASSES.FLEXLAYOUT__DRAG_RECT)}>
                {component}
            </div>
        );

        const tempDiv = this.currentDocument!.createElement('div');
        tempDiv.setAttribute("data-layout-path", "/drag-rectangle");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-10000px";
        tempDiv.style.top = "-10000px";
        this.currentDocument!.body.appendChild(tempDiv);
        createRoot(tempDiv).render(dragElement);

        event.dataTransfer!.setDragImage(tempDiv, x, y);
        setTimeout(() => {
            this.currentDocument!.body.removeChild(tempDiv!);
        }, 0);
    }

    setDraggingOverWindow(overWindow: boolean) {
        // console.log("setDraggingOverWindow", overWindow);
        if (this.isDraggingOverWindow !== overWindow) {
            if (this.outlineDiv) {
                this.outlineDiv!.style.visibility = overWindow ? "hidden" : "visible";
            }

            if (overWindow) {
                this.setState({ showEdges: false });
            } else {
                // add edge indicators
                if (this.props.model.getMaximizedTabset(this.windowId) === undefined) {
                    this.setState({ showEdges: this.props.model.isEnableEdgeDock() });
                }
            }

            this.isDraggingOverWindow = overWindow;
        }
    }

    onDragEnterRaw = (event: React.DragEvent<HTMLElement>) => {
        this.dragEnterCount++;
        if (this.dragEnterCount === 1) {
            this.onDragEnter(event);
        }
    }

    onDragLeaveRaw = (event: React.DragEvent<HTMLElement>) => {
        this.dragEnterCount--;
        if (this.dragEnterCount === 0) {
            this.onDragLeave(event);
        }
    }

    clearDragMain() {
        // console.log("clear drag main");
        LayoutInternal.dragState = undefined;
        if (this.windowId === Model.MAIN_WINDOW_ID) {
            this.isDraggingOverWindow = false;
        }
        for (const [, layoutWindow] of this.props.model.getwindowsMap()) {
            // console.log(layoutWindow);
            layoutWindow.layout!.clearDragLocal();
        }
    }

    clearDragLocal() {
        // console.log("clear drag local", this.windowId);
        this.setState({ showEdges: false });
        this.showOverlay(false);
        this.dragEnterCount = 0;
        this.dragging = false;
        if (this.outlineDiv) {
            this.selfRef.current!.removeChild(this.outlineDiv);
            this.outlineDiv = undefined;
        }
    }

    onDragEnter = (event: React.DragEvent<HTMLElement>) => {
        // console.log("onDragEnter", this.windowId, this.dragEnterCount);

        if (!LayoutInternal.dragState && this.props.onExternalDrag) { // not internal dragging
            const externalDrag = this.props.onExternalDrag!(event);
            if (externalDrag) {
                const tempNode = TabNode.fromJson(externalDrag.json, this.props.model, false);
                LayoutInternal.dragState = new DragState(this.mainLayout, DragSource.External, tempNode, externalDrag.json, externalDrag.onDrop);
            }
        }

        if (LayoutInternal.dragState) {
            if (this.windowId !== Model.MAIN_WINDOW_ID && LayoutInternal.dragState.mainLayout === this.mainLayout) {
                LayoutInternal.dragState.mainLayout.setDraggingOverWindow(true);
            }

            if (LayoutInternal.dragState.mainLayout !== this.mainLayout) {
                return; // drag not by this layout or its popouts
            }

            event.preventDefault();

            this.dropInfo = undefined;
            const rootdiv = this.selfRef.current;
            this.outlineDiv = this.currentDocument!.createElement("div");
            this.outlineDiv.className = this.getClassName(CLASSES.FLEXLAYOUT__OUTLINE_RECT);
            this.outlineDiv.style.visibility = "hidden";
            const speed = this.props.model.getAttribute("tabDragSpeed") as number;
            this.outlineDiv.style.transition = `top ${speed}s, left ${speed}s, width ${speed}s, height ${speed}s`;

            rootdiv!.appendChild(this.outlineDiv);

            this.dragging = true;
            this.showOverlay(true);
            // add edge indicators
            if (!this.isDraggingOverWindow && this.props.model.getMaximizedTabset(this.windowId) === undefined) {
                this.setState({ showEdges: this.props.model.isEnableEdgeDock() });
            }

            const clientRect = this.selfRef.current?.getBoundingClientRect()!;
            const r = new Rect(
                event.clientX - (clientRect.left),
                event.clientY - (clientRect.top),
                1, 1
            );
            r.positionElement(this.outlineDiv);
        }
    }

    onDragOver = (event: React.DragEvent<HTMLElement>) => {
        if (this.dragging && !this.isDraggingOverWindow) {
            // console.log("onDragOver");

            event.preventDefault();
            const clientRect = this.selfRef.current?.getBoundingClientRect();
            const pos = {
                x: event.clientX - (clientRect?.left ?? 0),
                y: event.clientY - (clientRect?.top ?? 0),
            };

            this.checkForBorderToShow(pos.x, pos.y);

            let dropInfo = this.props.model.findDropTargetNode(this.windowId, LayoutInternal.dragState!.dragNode!, pos.x, pos.y);
            if (dropInfo) {
                this.dropInfo = dropInfo;
                if (this.outlineDiv) {
                    this.outlineDiv.className = this.getClassName(dropInfo.className);
                    dropInfo.rect.positionElement(this.outlineDiv);
                    this.outlineDiv.style.visibility = "visible";
                }
            }
        }
    }

    onDragLeave = (event: React.DragEvent<HTMLElement>) => {
        // console.log("onDragLeave", this.windowId, this.dragging);
        if (this.dragging) {
            if (this.windowId !== Model.MAIN_WINDOW_ID) {
                LayoutInternal.dragState!.mainLayout.setDraggingOverWindow(false);
            }

            this.clearDragLocal();
        }
    }

    onDrop = (event: React.DragEvent<HTMLElement>) => {
        // console.log("ondrop", this.windowId, this.dragging, Layout.dragState);

        if (this.dragging) {
            event.preventDefault();

            const dragState = LayoutInternal.dragState!;
            if (this.dropInfo) {
                if (dragState.dragJson !== undefined) {
                    const newNode = this.doAction(Actions.addNode(dragState.dragJson, this.dropInfo.node.getId(), this.dropInfo.location, this.dropInfo.index));

                    if (dragState.fnNewNodeDropped !== undefined) {
                        dragState.fnNewNodeDropped(newNode, event);
                    }
                } else if (dragState.dragNode !== undefined) {
                    this.doAction(Actions.moveNode(dragState.dragNode.getId(), this.dropInfo.node.getId(), this.dropInfo.location, this.dropInfo.index));
                }
            }

            this.mainLayout.clearDragMain();
        }
        this.dragEnterCount = 0; // must set to zero here ref sublayouts
    }

    // *************************** End Drag Drop *************************************
}

export const FlexLayoutVersion = "0.8.1";

export type DragRectRenderCallback = (
    content: React.ReactNode | undefined,
    node?: Node,
    json?: IJsonTabNode
) => React.ReactNode | undefined;

export type NodeMouseEvent = (
    node: TabNode | TabSetNode | BorderNode,
    event: React.MouseEvent<HTMLElement, MouseEvent>
) => void;

export type ShowOverflowMenuCallback = (
    node: TabSetNode | BorderNode,
    mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
) => void;

export type TabSetPlaceHolderCallback = (node: TabSetNode) => React.ReactNode;

export interface ITabSetRenderValues {
    /** components that will be added after the tabs */
    stickyButtons: React.ReactNode[];
    /** components that will be added at the end of the tabset */
    buttons: React.ReactNode[];
    /** position to insert overflow button within [...stickyButtons, ...buttons]
     * if left undefined position will be after the sticky buttons (if any) 
     */
    overflowPosition: number | undefined;
}

export interface ITabRenderValues {
    /** the icon or other leading component */
    leading: React.ReactNode;
    /** the main tab text/component */
    content: React.ReactNode;
    /** a set of react components to add to the tab after the content */
    buttons: React.ReactNode[];
}

export interface IIcons {
    close?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    closeTabset?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    popout?: (React.ReactNode | ((tabNode: TabNode) => React.ReactNode));
    maximize?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    restore?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
    more?: (React.ReactNode | ((tabSetNode: (TabSetNode | BorderNode), hiddenTabs: { node: TabNode; index: number }[]) => React.ReactNode));
    edgeArrow?: React.ReactNode;
    activeTabset?: (React.ReactNode | ((tabSetNode: TabSetNode) => React.ReactNode));
}

const defaultIcons = {
    close: <CloseIcon />,
    closeTabset: <CloseIcon />,
    popout: <PopoutIcon />,
    maximize: <MaximizeIcon />,
    restore: <RestoreIcon />,
    more: <OverflowIcon />,
    edgeArrow: <EdgeIcon />,
    activeTabset: <AsterickIcon />
};

enum DragSource {
    Internal = "internal",
    External = "external",
    Add = "add"
}

/** @internal */
const defaultSupportsPopout: boolean = isDesktop();

/** @internal */
const edgeRectLength = 100;
/** @internal */
const edgeRectWidth = 10;

// global layout drag state
class DragState {
    public readonly mainLayout: LayoutInternal;
    public readonly dragSource: DragSource;
    public readonly dragNode: Node & IDraggable | undefined;
    public readonly dragJson: IJsonTabNode | undefined;
    public readonly fnNewNodeDropped: ((node?: Node, event?: React.DragEvent<HTMLElement>) => void) | undefined;

    public constructor(
        mainLayout: LayoutInternal,
        dragSource: DragSource,
        dragNode: Node & IDraggable | undefined,
        dragJson: IJsonTabNode | undefined,
        fnNewNodeDropped: ((node?: Node, event?: React.DragEvent<HTMLElement>) => void) | undefined
    ) {
        this.mainLayout = mainLayout;
        this.dragSource = dragSource;
        this.dragNode = dragNode;
        this.dragJson = dragJson;
        this.fnNewNodeDropped = fnNewNodeDropped;
    }
}