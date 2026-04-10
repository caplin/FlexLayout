import * as React from "react";
import { createPortal } from "react-dom";
import { DockLocation } from "../../model/DockLocation";
import { I18nLabel } from "../I18nLabel";
import { Rect } from "../../model/Rect";
import { CLASSES } from "../CSSClassNames";
import { Action } from "../../model/Actions";
import { Actions } from "../../model/Actions";
import { BorderNode } from "../../model/BorderNode";
import { IJsonTabNode } from "../../model/IJsonModel";
import { Model } from "../../model/Model";
import { Node } from "../../model/Node";
import { ILayoutType } from "../../model/IJsonModel";
import { TabNode } from "../../model/TabNode";
import { TabSetNode } from "../../model/TabSetNode";
import { AsterickIcon, CloseIcon, EdgeIcon, MaximizeIcon, OverflowIcon, PopoutIcon, PopoutFloatIcon, RestoreIcon } from "../Icons";
import { Overlay } from "../Overlay";
import { Row } from "../Row";
import { Tab } from "../Tab";
import { enablePointerOnIFrames, isDesktop, copyInlineStyles, Utils_dragging } from "../Utils";
import { Layout as ModelLayout } from "../../model/Layout";
import { TabContentRenderer } from "../TabContentRenderer";
import { DragDropManager } from "./DragDropManager";
import { EdgeIndicators } from "./EdgeIndicators";
import { FloatingWindowContainer } from "./FloatingWindowContainer";
import { BorderContainer } from "./BorderContainer";
import { ITabSetRenderValues, ITabRenderValues, IIcons } from "./LayoutTypes";
import { ILayoutProps } from "../Layout";
import { randomUUID } from "../../model/Utils";
import { DragContainer } from "../DragContainer";

/** @internal */
export interface ILayoutInternalProps extends ILayoutProps {
    parentRedrawRevision: number;

    // used only for sublayouts:
    layoutId?: string;
    mainLayoutController?: LayoutController;
}

/** @internal */
export interface ILayoutInternalState {
    rect: Rect;
    editingTab?: TabNode;
    portal?: React.ReactPortal;
    showEdges: boolean;
    showOverlay: boolean;
    calculatedBorderBarSize: number;
    layoutRedrawRevision: number;
    fullRedrawRevision: number;
    showHiddenBorder: DockLocation;
    splitterSize: number;
}

/** @internal */
export const LayoutInternal = React.forwardRef<LayoutController, ILayoutInternalProps>((props, ref) => {

    LayoutInternal.displayName = 'LayoutInternal'; // name in react dev tools

    const [state, setStateRaw] = React.useState<ILayoutInternalState>({
        rect: Rect.empty(),
        editingTab: undefined,
        showEdges: false,
        showOverlay: false,
        calculatedBorderBarSize: 29,
        layoutRedrawRevision: 0,
        fullRedrawRevision: 0,
        showHiddenBorder: DockLocation.CENTER, // using center indicates no hidden border
        splitterSize: 8
    });

    const setState = React.useCallback(
        (update: Partial<ILayoutInternalState> | ((prevState: ILayoutInternalState, props: ILayoutInternalProps) => Partial<ILayoutInternalState>)) => {
            setStateRaw(prev => ({
                ...prev,
                ...(typeof update === 'function' ? update(prev, props) : update)
            }));
        },
        [props]
    );

    const layoutRef = React.useRef<HTMLDivElement>(null); // ref of layout container
    const moveablesRef = React.useRef<HTMLDivElement>(null);
    const findBorderBarSizeRef = React.useRef<HTMLDivElement>(null);
    const mainRef = React.useRef<HTMLDivElement>(null); // ref of border container

    const controller = React.useMemo(() => new LayoutController(props, state, setState), []);

    // keep controller in sync with latest props/state/refs
    controller.setProps(props);
    controller.setStateRaw(state);
    controller.setSetState(setState);
    controller.setLayoutRef(layoutRef);
    controller.setMoveablesRef(moveablesRef);
    controller.setFindBorderBarSizeRef(findBorderBarSizeRef);
    controller.setMainRef(mainRef);

    React.useImperativeHandle(ref, () => controller, [controller]);

    // rerender if tabs have changed size
    React.useLayoutEffect(() => {
        if (controller.isMainLayout()) {
            controller.updateLayoutMetrics();
        }

        // if tab rects have changed then need to rerender to adjust the tab absolute positions
        if (controller.isReLayout()) {
            controller.redrawLayout();
            controller.setReLayout(false);
        }
    });

    // add resize and visibility listeners
    React.useEffect(() => {
        const currentDocument = layoutRef.current!.ownerDocument;
        const currentWindow = currentDocument.defaultView!;

        controller.setCurrentDocument(currentDocument);
        controller.setCurrentWindow(currentWindow);

        // Resize Observer
        const resizeObserver = new currentWindow.ResizeObserver(() => {
            currentWindow.requestAnimationFrame(() => {
                controller.updateRect();
            });
        });
        resizeObserver.observe(layoutRef.current!);

        // Resize Listener
        const resizeListener = () => {
            controller.updateRect();
        };

        currentWindow.addEventListener("resize", resizeListener);

        // visibility listener on main document
        const visibilityChange = () => {
            for (const [_, modelLayout] of controller.getProps().model.getLayouts()) {
                const layout = modelLayout.getController();
                if (layout) {
                    controller.redrawLayout();
                }
            }
        };

        document.addEventListener('visibilitychange', visibilityChange);

        return () => {
            resizeObserver.disconnect();
            currentWindow.removeEventListener("resize", resizeListener);
            document.removeEventListener('visibilitychange', visibilityChange);
        };
    }, [controller, layoutRef.current?.ownerDocument]);

    // keep window popouts styles updated
    React.useEffect(() => {
        let styleObserver: MutationObserver | undefined;

        if (!controller.isMainLayout() && controller.getLayout().getType() === "window") {

            // If it's a popout, synchronize styles from main root div
            const mainRootDiv = controller.getProps().mainLayoutController?.getRootDiv();
            if (mainRootDiv) {
                const sourceElement = mainRootDiv;
                const targetElement = layoutRef.current!;

                copyInlineStyles(sourceElement, targetElement);

                styleObserver = new MutationObserver(() => {
                    const changed = copyInlineStyles(sourceElement, targetElement);
                    if (changed) {
                        controller.redrawLayout();
                    }
                });

                styleObserver.observe(sourceElement, { attributeFilter: ['style'] });
            }
        }

        return () => {
            if (styleObserver) styleObserver.disconnect();
        };
    }, [controller]);

    // handle model changes
    React.useEffect(() => {
        const currentModel = props.model;

        const layout = currentModel.getLayouts().get(controller.getLayoutId())!;
        layout.setController(controller);
        layout.setToExportRectFunction((r: Rect, type: ILayoutType) => {
            return (type === "window") ? controller.getScreenRect(r) : controller.getRelativeRect(r);
        });

        controller.setLayout(layout);

        if (controller.isMainLayout()) {
            currentModel.addChangeListener(controller.onModelChange);

            const updateFromCSSVars = () => {
                // note getComputedStyle is slow
                const size = parseInt(getComputedStyle(layoutRef.current!).getPropertyValue('--splitter-size'));
                if (Number.isFinite(size)) {
                    props.model.setSplitterSize(size);
                    if (state.splitterSize !== size) {
                        setState({ splitterSize: size });
                    }
                }
            }

            updateFromCSSVars();
            const cssVarUpdater = setInterval(updateFromCSSVars, 1000);

            return () => {
                currentModel.removeChangeListener(controller.onModelChange);
                clearInterval(cssVarUpdater);
                controller.tidyMoveablesMap();
            }
        }
        return;
    }, [props.model, controller]);

    if (!layoutRef.current) {
        return (
            <div ref={layoutRef} className={controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT)}>
                <div ref={moveablesRef} key="__moveables__" className={controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_MOVEABLES)}></div>
                <div key="findBorderBarSize" ref={findBorderBarSizeRef} className={controller.getClassName(CLASSES.FLEXLAYOUT__BORDER_SIZER)}>
                    FindBorderBarSize
                </div>
            </div>
        );
    }

    const model = props.model;
    const layoutId = controller.getLayoutId();
    model.getRootRow(layoutId).calcMinMaxSize();
    model.getRootRow(layoutId).setPaths("");

    if (controller.isMainLayout()) {
        model.getBorderSet().setPaths();
        controller.createMoveableDivs();
    }

    const inner = controller.renderLayout();
    const outer = <BorderContainer controller={controller} inner={inner} />;
    const tabs = controller.renderTabContainers();
    const reorderedTabs = controller.reorderComponents(tabs, controller.getOrderedTabIds());

    let metricElements = null;
    let floatingWindows = null;
    let reorderedTabContents = null;
    let tabStamps = null;

    // the main controller handles rendering the tab contents and floating windows
    if (controller.isMainLayout()) {
        metricElements = controller.renderMetricsElements();
        floatingWindows = <FloatingWindowContainer controller={controller} />;
        const tabContents = controller.renderTabContents();
        reorderedTabContents = controller.reorderComponents(tabContents, controller.getOrderedTabMoveableIds());
        tabStamps = <div key="__tabStamps__" className={controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_TAB_STAMPS)}>
            {controller.renderTabStamps()}
        </div>;
    }

    return (
        <div
            ref={layoutRef}
            className={controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT)}
            onDragEnter={controller.getDragDropManager().onDragEnterRaw}
            onDragLeave={controller.getDragDropManager().onDragLeaveRaw}
            onDragOver={controller.getDragDropManager().onDragOver}
            onDrop={controller.getDragDropManager().onDrop}
        >
            <div ref={moveablesRef} key="__moveables__" className={controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_MOVEABLES)}></div>
            {metricElements}
            <Overlay key="__overlay__" controller={controller} show={state.showOverlay} />
            {outer}
            {reorderedTabs}
            {reorderedTabContents}
            {state.portal}
            {floatingWindows}
            {tabStamps}
        </div>
    );
});

/** @internal */
export class LayoutController {
    private static Windows: Map<Window, string> = new Map();
    private _props: ILayoutInternalProps;
    private _state: ILayoutInternalState;
    private _setState: (update: Partial<ILayoutInternalState> | ((prevState: ILayoutInternalState, props: ILayoutInternalProps) => Partial<ILayoutInternalState>)) => void;

    private _layoutRef!: React.RefObject<HTMLDivElement | null>;
    private _moveablesRef!: React.RefObject<HTMLDivElement | null>;
    private _findBorderBarSizeRef!: React.RefObject<HTMLDivElement | null>;
    private _mainRef!: React.RefObject<HTMLDivElement | null>;
    private _orderedTabIds: string[];
    private _orderedTabMoveableIds: string[];
    private _moveableElementMap = new Map<string, HTMLElement>();
    private _currentDocument?: Document;
    private _currentWindow?: Window;
    private _supportsPopout: boolean;
    private _popoutURL: string;
    private _icons: IIcons;
    private _dragDropManager: DragDropManager;
    private _layoutId: string;
    private _layout: ModelLayout;
    private _mainController?: LayoutController;
    private _popoutWindowName: string;
    private _cachedLayoutDOMRect: Rect | undefined;
    private _reLayout: boolean;


    constructor(props: ILayoutInternalProps, state: ILayoutInternalState, setState: (update: Partial<ILayoutInternalState> | ((prevState: ILayoutInternalState, props: ILayoutInternalProps) => Partial<ILayoutInternalState>)) => void) {
        this._props = props;
        this._state = state;
        this._setState = setState;
        this._orderedTabIds = [];
        this._orderedTabMoveableIds = [];
        this._supportsPopout = props.supportsPopout !== undefined ? props.supportsPopout : defaultSupportsPopout;
        this._popoutURL = props.popoutURL ? props.popoutURL : "popout.html";
        this._icons = { ...defaultIcons, ...props.icons };
        this._layoutId = props.layoutId ? props.layoutId : Model.MAIN_LAYOUT_ID;
        this._mainController = props.mainLayoutController ? props.mainLayoutController : this;
        this._dragDropManager = new DragDropManager(this);
        this._layout = props.model.getLayouts().get(this._layoutId)!;
        this._layout.setController(this);
        this._popoutWindowName = props.popoutWindowName || "Popout Window";
        this._reLayout = false;
    }

    // *********************************************************************************
    // Render Functions
    // *********************************************************************************

    renderLayout() {
        this._cachedLayoutDOMRect = undefined;
        return (
            <>
                <Row key="__row__" controller={this} rowNode={this._props.model.getRootRow(this._layoutId)} />
                <EdgeIndicators controller={this} />
            </>
        );
    }

    renderTabContainers() {
        const tabs = new Map<string, React.ReactNode>();

        this._props.model.visitLayoutNodes(this._layoutId, (node) => {
            if (node instanceof TabNode) {
                const tabNode = node as TabNode;
                const isSelected = tabNode.isSelected();
                const isRendered = tabNode.isRendered();
                const isEnableRenderOnDemand = tabNode.isEnableRenderOnDemand();

                // Render tab container at correct position
                if (isRendered || isSelected || !isEnableRenderOnDemand) {
                    tabs.set(tabNode.getId(), (
                        <Tab
                            key={tabNode.getId()}
                            controller={this}
                            tabNode={tabNode}
                            selected={isSelected} />
                    ));
                }
            }
        });

        return tabs;
    }

    renderTabContents() {
        const tabContents = new Map<string, React.ReactNode>();

        for (const [layoutId, layout] of this._props.model.getLayouts()) {
            this._props.model.visitLayoutNodes(layoutId, (node) => {
                if (node instanceof TabNode) {
                    const tabNode = node as TabNode;
                    const isSelected = tabNode.isSelected();
                    const isRendered = tabNode.isRendered();
                    const isEnableRenderOnDemand = tabNode.isEnableRenderOnDemand();
                    const rect = (tabNode.getParent() as BorderNode | TabSetNode).getContentRect();
                    const visible = isSelected || !isEnableRenderOnDemand;
                    const renderTabContent = isRendered || (visible && rect.width > 0 && rect.height > 0);

                    if (renderTabContent) {
                        const element = tabNode.getMoveableElement()!;
                        const windowId = layout.getWindowId() || "";
                        const key = tabNode.getId() + (tabNode.isEnableWindowReMount() ? windowId : "");

                        // Render tab content into moveable div using portal
                        // Note: TabContentRenderer calls the factory to render the contents
                        tabContents.set(tabNode.getId(), createPortal(
                            <TabContentRenderer
                                key={key}
                                controller={this}
                                tabNode={tabNode}
                                rect={rect}
                                windowId={windowId}
                                visible={visible}
                                fullRedrawRevision={this._state.fullRedrawRevision}
                                parentRedrawRevision={this._props.parentRedrawRevision}
                            >
                            </TabContentRenderer>
                            , element, key));

                        tabNode.setRendered(true);
                    }
                }
            });
        }

        return tabContents;
    }

    renderMetricsElements() {
        return (
            <div key="findBorderBarSize" ref={this._findBorderBarSizeRef} className={this.getClassName(CLASSES.FLEXLAYOUT__BORDER_SIZER)}>
                FindBorderBarSize
            </div>
        );
    }

    renderTabStamps() {
        const tabStamps: React.ReactNode[] = [];

        this._props.model.visitNodes((node) => {
            if (node instanceof TabNode) {
                const child = node as TabNode;

                // what the tab should look like when dragged (since images need to have been loaded before drag image can be taken)
                tabStamps.push(<DragContainer key={child.getId()} controller={this} tabNode={child} dragging={Utils_dragging} />)
            }
        });

        return tabStamps;
    }

    // *********************************************************************************
    // Logic
    // *********************************************************************************

    createMoveableDivs() {
        this._props.model.visitNodes((node) => {
            if (node instanceof TabNode) {
                const tabNode = node as TabNode;
                const element = this.getMoveableElement(tabNode.getId());
                tabNode.setMoveableElement(element);
            }
        });
    }

    getMoveablesDiv() {
        return this._moveablesRef.current;
    }

    getMoveableElement(id: string) {
        let moveableElement = this._moveableElementMap.get(id);
        if (moveableElement === undefined) {
            moveableElement = document.createElement("div");
            this._moveablesRef.current!.appendChild(moveableElement);
            moveableElement.className = CLASSES.FLEXLAYOUT__TAB_MOVEABLE;
            this._moveableElementMap.set(id, moveableElement);
        }
        return moveableElement;
    }

    tidyMoveablesMap() {
        // console.log("tidyMoveablesMap");
        const tabs = new Map<string, TabNode>();
        this._props.model.visitNodes((node, _) => {
            if (node instanceof TabNode) {
                tabs.set(node.getId(), node);
            }
        });

        for (const [nodeId, element] of this._moveableElementMap) {
            if (!tabs.has(nodeId)) {
                // console.log("delete", nodeId);
                element.remove(); // remove from dom
                this._moveableElementMap.delete(nodeId); // remove map entry 
            }
        }
    }

    redrawLayout() {
        this._mainController?.setState((state) => {
            return { layoutRedrawRevision: state.layoutRedrawRevision + 1 };
        });
    }

    redrawLayoutAndTabContent(isLayoutRevision: boolean = true) {
        this._mainController?.setState((state) => {
            return { fullRedrawRevision: state.fullRedrawRevision + 1 };
        });
    }

    doAction(action: Action): Node | undefined {
        if (this._props.onAction !== undefined) {
            const outcome = this._props.onAction(action);
            if (outcome !== undefined) {
                return this._props.model.doAction(outcome);
            }
            return undefined;
        } else {
            return this._props.model.doAction(action);
        }
    }

    updateRect = () => {
        if (this._layoutRef.current) {
            let element = this._layoutRef.current;
            if (!this._layout.isMainLayout() && this._layout.getType() === "float") {
                const floatWindow = element.closest("." + this.getClassName(CLASSES.FLEXLAYOUT__FLOAT_WINDOW));
                if (floatWindow instanceof HTMLDivElement) {
                    element = floatWindow;
                }
            }

            let rect = Rect.fromDomRect(element.getBoundingClientRect());
            if (!this._layout.isMainLayout() && this._layout.getType() === "float") {
                const rootRect = this._mainController!.getDomRect();
                rect = rect.relativeTo(rootRect);
            }

            if (!rect.equalsWhenRounded(this._state.rect) && rect.width !== 0 && rect.height !== 0) {
                // console.log("updateRect", rect.floor());
                this.setState({ rect });
                this._layout.setRect(rect);
                if (!this._layout.isMainLayout()) {
                    this.redrawLayout();
                }
            }
        }
    };

    onModelChange = (action: Action) => {
        if (action.type == Actions.DELETE_TAB && this._state.showHiddenBorder !== DockLocation.CENTER) {
            const borderNode = this._props.model.getBorderSet().getBorderMap().get(this._state.showHiddenBorder);
            if (borderNode!.getChildren().length === 0) {
                this._setState({ showHiddenBorder: DockLocation.CENTER });
            }
        }

        this.redrawLayout();
        if (this._props.onModelChange) {
            this._props.onModelChange(this._props.model, action);
        }
    };

    reorderComponents(components: Map<string, React.ReactNode>, ids: string[]) {
        const nextIds = ids.filter(id => components.has(id));
        const nextIdsSet = new Set(nextIds);

        for (const id of components.keys()) {
            if (!nextIdsSet.has(id)) {
                nextIds.push(id);
            }
        }

        ids.splice(0, ids.length, ...nextIds);
        return ids.map(id => components.get(id));
    }

    checkForBorderToShow(x: number, y: number) {
        const r = this.getBoundingClientRect(this._mainRef.current!);
        const c = r.getCenter();
        const margin = edgeRectWidth;
        const offset = edgeRectLength / 2;

        let overEdge = false;
        if (this._props.model.isEnableEdgeDock() && this._state.showHiddenBorder === DockLocation.CENTER) {
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

        if (location !== this._state.showHiddenBorder) {
            this.setState({ showHiddenBorder: location });
        }
    }

    updateLayoutMetrics = () => {
        if (this._findBorderBarSizeRef.current) {
            const borderBarSize = this._findBorderBarSizeRef.current.getBoundingClientRect().height;
            if (borderBarSize !== this._state.calculatedBorderBarSize) {
                this.setState({ calculatedBorderBarSize: borderBarSize });
            }
        }
    };

    // *************************** Drag Drop Methods *************************************

    addTabWithDragAndDrop(event: DragEvent, json: IJsonTabNode, onDrop?: (node?: Node, event?: React.DragEvent<HTMLElement>) => void) {
        this._dragDropManager.addTabWithDragAndDrop(event, json, onDrop);
    }

    moveTabWithDragAndDrop(event: DragEvent, node: (TabNode | TabSetNode)) {
        this._dragDropManager.moveTabWithDragAndDrop(event, node);
    }

    setDragComponent(event: DragEvent, component: React.ReactNode, x: number, y: number) {
        this._dragDropManager.setDragComponent(event, component, x, y);
    }

    // *********************************************************************************
    // Getters, Setters, and Utilities
    // *********************************************************************************

    getProps() { return this._props; }
    setProps(value: ILayoutInternalProps) { this._props = value; }

    getState() { return this._state; }
    setStateRaw(value: ILayoutInternalState) { this._state = value; }

    setState(update: Partial<ILayoutInternalState> | ((prevState: ILayoutInternalState, props: ILayoutInternalProps) => Partial<ILayoutInternalState>)) {
        this._setState(update);
    }
    setSetState(value: (update: Partial<ILayoutInternalState> | ((prevState: ILayoutInternalState, props: ILayoutInternalProps) => Partial<ILayoutInternalState>)) => void) {
        this._setState = value;
    }

    getLayoutRef() { return this._layoutRef; }
    setLayoutRef(value: React.RefObject<HTMLDivElement | null>) { this._layoutRef = value; }

    getMoveablesRef() { return this._moveablesRef; }
    setMoveablesRef(value: React.RefObject<HTMLDivElement | null>) { this._moveablesRef = value; }

    getFindBorderBarSizeRef() { return this._findBorderBarSizeRef; }
    setFindBorderBarSizeRef(value: React.RefObject<HTMLDivElement | null>) { this._findBorderBarSizeRef = value; }

    getMainRef() { return this._mainRef; }
    setMainRef(value: React.RefObject<HTMLDivElement | null>) { this._mainRef = value; }

    getOrderedTabIds() { return this._orderedTabIds; }
    getOrderedTabMoveableIds() { return this._orderedTabMoveableIds; }

    getCurrentDocument() { return this._currentDocument; }
    setCurrentDocument(value: Document | undefined) { this._currentDocument = value; }

    getCurrentWindow() { return this._currentWindow; }
    setCurrentWindow(value: Window | undefined) {
        this._currentWindow = value;
        if (value && !LayoutController.Windows.has(value)) {
            LayoutController.Windows.set(value, randomUUID())
        }
    }

    getWindowId(): string | undefined {
        if (this.getCurrentWindow()) {
            return LayoutController.Windows.get(this.getCurrentWindow()!);
        }
        return undefined;
    }

    isSupportsPopout() { return this._supportsPopout; }
    getPopoutURL() { return this._popoutURL; }
    getIcons() { return this._icons; }

    getDragDropManager() { return this._dragDropManager; }

    getLayoutId() { return this._layoutId; }
    getLayout() { return this._layout; }
    setLayout(value: ModelLayout) { this._layout = value; }

    getMainController() { return this._mainController; }
    isMainLayout() { return this._layout.isMainLayout(); }

    getPopoutWindowName() { return this._popoutWindowName; }

    isReLayout() { return this._reLayout; }
    setReLayout(value: boolean) { this._reLayout = value; }

    getBoundingClientRect(div: HTMLElement): Rect {
        const layoutRect = this.getDomRect();
        if (layoutRect) {
            return Rect.getBoundingClientRect(div).relativeTo(layoutRect);
        }
        return Rect.empty();
    }

    getMoveableContainer() {
        return this._moveablesRef.current;
    }

    getClassName = (defaultClassName: string) => {
        if (this._props.classNameMapper === undefined) {
            return defaultClassName;
        } else {
            return this._props.classNameMapper(defaultClassName);
        }
    };

    getDomRect() {
        if (this._cachedLayoutDOMRect !== undefined) {
            return this._cachedLayoutDOMRect;
        }

        // must get on demand, since page may have scrolled
        if (this._layoutRef.current) {
            this._cachedLayoutDOMRect = Rect.fromDomRect(this._layoutRef.current.getBoundingClientRect());
            return this._cachedLayoutDOMRect;
        } else {
            return Rect.empty();
        }
    }

    getRootDiv() {
        return this._layoutRef.current;
    }

    getMainElement() {
        return this._mainRef.current;
    }

    getFactory() {
        return this._props.factory;
    }

    isRealtimeResize() {
        return this._props.realtimeResize ?? false;
    }

    setEditingTab(tabNode?: TabNode) {
        this.setState({ editingTab: tabNode });
    }

    getEditingTab() {
        return this._state.editingTab;
    }

    getModel() {
        return this._props.model;
    }

    getTabDragSpeed() {
        return this._props.tabDragSpeed ? this._props.tabDragSpeed : 0.3;
    }

    onCloseLayout = (layout: ModelLayout) => {
        this.doAction(Actions.closePopout(layout.getLayoutId()));
    };

    onSetWindow = (layout: ModelLayout, window: Window) => {
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
        rect.x = this._currentWindow!.screenX + this._currentWindow!.scrollX + navWidth / 2 + layoutRect.x + rect.x;
        rect.y = this._currentWindow!.screenY + this._currentWindow!.scrollY + (navHeight - navWidth / 2) + layoutRect.y + rect.y;
        rect.height += navHeight;
        rect.width += navWidth;
        return rect;
    }

    getRelativeRect(inRect: Rect) {
        const rect = inRect.clone();
        if (!this._layout.isMainLayout()) {
            const layoutRect = this._layout.getRect();
            rect.x += layoutRect.x;
            rect.y += layoutRect.y;
        }
        return rect;
    }

    moveWindowToFront(layoutId: string) {
        this.doAction(Actions.movePopoutToFront(layoutId));
    }

    addTabToTabSet(tabsetId: string, json: IJsonTabNode): TabNode | undefined {
        const tabsetNode = this._props.model.getNodeById(tabsetId);
        if (tabsetNode !== undefined) {
            const node = this.doAction(Actions.addNode(json, tabsetId, DockLocation.CENTER, -1));
            return node as TabNode;
        }
        return undefined;
    }

    addTabToActiveTabSet(json: IJsonTabNode): TabNode | undefined {
        const tabsetNode = this._props.model.getActiveTabset(this._layoutId);
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

    maximize(tabsetNode: TabSetNode) {
        this.doAction(Actions.maximizeToggle(tabsetNode.getId(), this.getLayoutId()));
    }

    customizeTab(
        tabNode: TabNode,
        renderValues: ITabRenderValues,
    ) {
        if (this._props.onRenderTab) {
            this._props.onRenderTab(tabNode, renderValues);
        }
    }

    customizeTabSet(
        tabSetNode: TabSetNode | BorderNode,
        renderValues: ITabSetRenderValues,
    ) {
        if (this._props.onRenderTabSet) {
            this._props.onRenderTabSet(tabSetNode, renderValues);
        }
    }

    i18nName(id: I18nLabel, param?: string) {
        let message;
        if (this._props.i18nMapper) {
            message = this._props.i18nMapper(id, param);
        }
        if (message === undefined) {
            message = id + (param === undefined ? "" : param);
        }
        return message;
    }

    getShowOverflowMenu() {
        return this._props.onShowOverflowMenu;
    }

    getTabSetPlaceHolderCallback() {
        return this._props.onTabSetPlaceHolder;
    }

    showContextMenu(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) {
        if (this._props.onContextMenu) {
            this._props.onContextMenu(node, event);
        }
    }

    auxMouseClick(node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) {
        if (this._props.onAuxMouseClick) {
            this._props.onAuxMouseClick(node, event);
        }
    }

    showOverlay(show: boolean) {
        this.setState({ showOverlay: show });
        enablePointerOnIFrames(!show, this._currentDocument!);
    }

    showOverlayOnAllWindows(show: boolean) {
        // console.log("showOverlayOnAllWindows", show);
        for (const [, layout] of this._props.model.getLayouts()) {
            if (layout.getController()) {
                layout.getController()!.showOverlay(show);
            }
        }
    }


}

const defaultIcons = {
    close: <CloseIcon />,
    closeTabset: <CloseIcon />,
    closeFloatPopout: <CloseIcon />,
    popout: <PopoutIcon />,
    popoutFloat: <PopoutFloatIcon />,
    maximize: <MaximizeIcon />,
    restore: <RestoreIcon />,
    more: <OverflowIcon />,
    edgeArrow: <EdgeIcon />,
    activeTabset: <AsterickIcon />
};

const defaultSupportsPopout: boolean = isDesktop();

/** @internal */
export const edgeRectLength = 100;

/** @internal */
export const edgeRectWidth = 10;
