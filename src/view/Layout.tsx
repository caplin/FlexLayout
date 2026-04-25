import * as React from "react";
import { useRef, useImperativeHandle } from "react";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { IJsonTabNode } from "../model/IJsonModel";
import { Node } from "../model/Node";
import { Action } from "../model/Actions";
import { BorderNode } from "../model/BorderNode";
import { Model } from "../model/Model";
import { I18nLabel } from "./I18nLabel";
import { DragRectRenderCallback, NodeMouseEvent, ShowOverflowMenuCallback, TabSetPlaceHolderCallback, ITabSetRenderValues, ITabRenderValues, IIcons } from "./layout/LayoutTypes";
import { LayoutInternal, LayoutController } from "./layout/LayoutInternal";

export interface ILayoutProps {
    /** the model for this layout */
    model: Model;
    /** factory function for creating the tab components */
    factory: (node: TabNode) => React.ReactNode;
    /** sets a top level class name on popout windows */
    popoutClassName?: string;
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
        json: IJsonTabNode,
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
    /** the transition speed of the drag rectangle from one position to another, default is 0.3 secs */
    tabDragSpeed?: number;
    /** set to constrain floating panels to within the layout control */
    constrainFloatPanels?: boolean;
}

export interface ILayoutApi {

     /** re-render the layout */
    redraw(): void;

    /**
     * Adds a new tab to the given tabset
     * @param tabsetId the id of the tabset where the new tab will be added
     * @param json the json for the new tab node
     * @returns the added tab node or undefined
     */
    addTabToTabSet(tabsetId: string, json: IJsonTabNode): TabNode | undefined;

    /**
     * Adds a new tab by dragging an item to the drop location, must be called from within an HTML
     * drag start handler. You can use the setDragComponent() method to set the drag image before calling this 
     * method.
     * @param event the drag start event
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDrop(event: DragEvent, json: IJsonTabNode, onDrop?: (node?: Node, event?: React.DragEvent<HTMLElement>) => void): void;
    
    /**
     * Move a tab/tabset using drag and drop, must be called from within an HTML
     * drag start handler
     * @param event the drag start event
     * @param node the tab or tabset to drag
     */
    moveTabWithDragAndDrop(event: DragEvent, node: (TabNode | TabSetNode)): void;

    /**
     * Adds a new tab to the active tabset (if there is one)
     * @param json the json for the new tab node
     * @returns the added tab node or undefined
     */
    addTabToActiveTabSet(json: IJsonTabNode): TabNode | undefined;

    /**
     * Sets the drag image from a react component for a drag event
     * @param event the drag event
     * @param component the react component to be used for the drag image
     * @param x the x position of the drag cursor on the image
     * @param y the x position of the drag cursor on the image
     */
    setDragComponent(event: DragEvent, component: React.ReactNode, x: number, y: number): void;

    /** Get the root div element of the layout */
    getRootDiv(): HTMLDivElement | null | undefined;
}

/**
 * A React component that hosts a multi-tabbed layout.
 * @category Components
 * @group Main Layout
 */
const Layout = React.forwardRef<ILayoutApi, ILayoutProps>((props, ref) => {
    const controllerRef = useRef<LayoutController>(null);
    const renderRevision = useRef<number>(0);
    const lastModel = useRef<Model>(props.model);
    const key = useRef<number>(0);

    if (lastModel.current !== props.model) {
        key.current++;
        lastModel.current = props.model;
    }

    Layout.displayName = 'Layout'; // name in react dev tools

    useImperativeHandle(ref, () => ({
        redraw: () => {
            controllerRef.current?.redrawLayoutAndTabContent();
        },
        addTabToTabSet: (tabsetId: string, json: IJsonTabNode): TabNode | undefined => {
            return controllerRef.current?.addTabToTabSet(tabsetId, json);
        },
        addTabWithDragAndDrop: (event: DragEvent, json: IJsonTabNode, onDrop?: (node?: Node, event?: React.DragEvent<HTMLElement>) => void) => {
            controllerRef.current?.addTabWithDragAndDrop(event, json, onDrop);
        },
        moveTabWithDragAndDrop: (event: DragEvent, node: (TabNode | TabSetNode)) => {
            controllerRef.current?.moveTabWithDragAndDrop(event, node);
        },
        addTabToActiveTabSet: (json: IJsonTabNode): TabNode | undefined => {
            return controllerRef.current?.addTabToActiveTabSet(json);
        },
        setDragComponent: (event: DragEvent, component: React.ReactNode, x: number, y: number) => {
            controllerRef.current?.setDragComponent(event, component, x, y);
        },
        getRootDiv: () => {
            return controllerRef.current!.getRootDiv();
        },
    }));

    return (<LayoutInternal key={key.current} ref={controllerRef} {...props}  parentRedrawRevision={renderRevision.current++} />);
});

export { Layout };

declare const __VERSION__: string;
export const FlexLayoutVersion = __VERSION__;


