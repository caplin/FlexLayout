import { DockLocation } from "./DockLocation";
import { IGlobalAttributes, IJsonRect, IJsonRowNode, IJsonTabNode, IRowAttributes, ITabAttributes, ITabSetAttributes } from "./IJsonModel";
import { ILayoutType } from "./IJsonModel";

/**
 * The Action creator class for FlexLayout model actions
 */
export class Actions {
    
    static ADD_TAB = "FlexLayout_AddTab";
    static DELETE_TAB = "FlexLayout_DeleteTab";
    static RENAME_TAB = "FlexLayout_RenameTab";
    static SET_TAB_PINNED = "FlexLayout_SetTabPinned";
    static SET_BORDER_TYPE = "FlexLayout_SetBorderType";
    static SELECT_TAB = "FlexLayout_SelectTab";
    static MOVE_NODE = "FlexLayout_MoveNode";
    static DELETE_TABSET = "FlexLayout_DeleteTabset";
    static SET_ACTIVE_TABSET = "FlexLayout_SetActiveTabset";
    static ADJUST_WEIGHTS = "FlexLayout_AdjustWeights";
    static ADJUST_BORDER_SPLIT = "FlexLayout_AdjustBorderSplit";
    static MAXIMIZE_TOGGLE = "FlexLayout_MaximizeToggle";
    static UPDATE_MODEL_ATTRIBUTES = "FlexLayout_UpdateModelAttributes";
    static UPDATE_NODE_ATTRIBUTES = "FlexLayout_UpdateNodeAttributes";

    static POPOUT_TAB = "FlexLayout_PopoutTab";
    static POPOUT_TABSET = "FlexLayout_PopoutTabset";
    static CLOSE_POPOUT = "FlexLayout_ClosePopout";
    static MOVE_POPOUT_TO_FRONT = "FlexLayout_MoveFloatToFront";
    
    static CREATE_SUBLAYOUT = "FlexLayout_CreateSubLayout";

    /**
     * Adds a tab node to the given tabset node
     * @param json the json for the new tab node e.g {type:"tab", component:"table"}
     * @param toNodeId the new tab node will be added to the tabset with this node id
     * @param location the location where the new tab will be added, one of the DockLocation enum values.
     * @param index for docking to the center this value is the index of the tab, use -1 to add to the end.
     * @param select (optional) whether to select the new tab, overriding autoSelectTab
     * @returns {Action} the action
     */
    static addTab(json: IJsonTabNode, toNodeId: string, location: DockLocation, index: number, select?: boolean): Action {
        return new Action(Actions.ADD_TAB, {
            json,
            toNode: toNodeId,
            location: location.getName(),
            index,
            select,
        });
    }

    /** @deprecated use 'addTab' instead */
    static addNode(json: IJsonTabNode, toNodeId: string, location: DockLocation, index: number, select?: boolean): Action {
        return this.addTab(json, toNodeId, location, index, select);
    }


    /**
     * Moves a node (tab or tabset) from one location to another
     * @param fromNodeId the id of the node to move
     * @param toNodeId the id of the node to receive the moved node
     * @param location the location where the moved node will be added, one of the DockLocation enum values.
     * @param index for docking to the center this value is the index of the tab, use -1 to add to the end.
     * @param select (optional) whether to select the moved tab(s) in new tabset, overriding autoSelectTab
     * @returns {Action} the action
     */
    static moveNode(fromNodeId: string, toNodeId: string, location: DockLocation, index: number, select?: boolean): Action {
        return new Action(Actions.MOVE_NODE, {
            fromNode: fromNodeId,
            toNode: toNodeId,
            location: location.getName(),
            index,
            select,
        });
    }

    /**
     * Deletes a tab node from the layout
     * @param tabNodeId the id of the tab node to delete
     * @returns {Action} the action
     */
    static deleteTab(tabNodeId: string): Action {
        return new Action(Actions.DELETE_TAB, { node: tabNodeId });
    }

    /**
     * Deletes a tabset node and all it's child tab nodes from the layout
     * @param tabsetNodeId the id of the tabset node to delete
     * @returns {Action} the action
     */
    static deleteTabset(tabsetNodeId: string): Action {
        return new Action(Actions.DELETE_TABSET, { node: tabsetNodeId });
    }

    /**
     * Change the given nodes tab text
     * @param tabNodeId the id of the tab node to rename
     * @param text the test of the tab
     * @returns {Action} the action
     */
    static renameTab(tabNodeId: string, text: string): Action {
        return new Action(Actions.RENAME_TAB, { node: tabNodeId, text });
    }

    /**
     * Pins or unpins the given tab; pinning moves it to the end of the pinned group at the
     * start of its tabset's tabstrip, unpinning moves it to the start of the unpinned tabs.
     * Only applies to tabs in tabsets (ignored for border tabs).
     * @param tabNodeId the id of the tab node to pin/unpin
     * @param pinned the new pinned state
     * @returns {Action} the action
     */
    static setTabPinned(tabNodeId: string, pinned: boolean): Action {
        return new Action(Actions.SET_TAB_PINNED, { node: tabNodeId, pinned });
    }

    /**
     * Sets the display type of the given border. In 'overlay' mode the selected tab's panel
     * overlays the main layout area instead of insetting it (Visual Studio style auto hide),
     * and is deselected by a pointer-down in the main layout area.
     * @param borderNodeId the id of the border node (border ids are "border_" + location, e.g. "border_left")
     * @param borderType the new border type
     * @returns {Action} the action
     */
    static setBorderType(borderNodeId: string, borderType: "split" | "overlay"): Action {
        return new Action(Actions.SET_BORDER_TYPE, { node: borderNodeId, borderType });
    }

    /**
     * Selects the given tab in its parent tabset
     * @param tabNodeId the id of the tab node to set selected
     * @returns {Action} the action
     */
    static selectTab(tabNodeId: string): Action {
        return new Action(Actions.SELECT_TAB, { tabNode: tabNodeId });
    }

    /**
     * Set the given tabset node as the active tabset
     * @param tabsetNodeId the id of the tabset node to set as active
     * @returns {Action} the action
     */
    static setActiveTabset(tabsetNodeId: string | undefined, layoutId?: string | undefined): Action {
        return new Action(Actions.SET_ACTIVE_TABSET, { tabsetNode: tabsetNodeId, layoutId: layoutId });
    }

    /**
     * Adjust the weights of a row, used when the splitter is moved
     * @param nodeId the id of the row node whose childrens weights are being adjusted
     * @param weights an array of weights to be applied to the children 
     * @returns {Action} the action
     */
    static adjustWeights(nodeId: string, weights: number[]): Action {
        return new Action(Actions.ADJUST_WEIGHTS, { nodeId, weights });
    }

    /**
     * Adjust the size of the border
     * @param nodeId the id of the border node to adjust
     * @param size the new border size 
     * @returns {Action} the action
     */
    static adjustBorderSplit(nodeId: string, size: number): Action {
        return new Action(Actions.ADJUST_BORDER_SPLIT, { node: nodeId, size });
    }

    /**
     * Maximizes the given tabset
     * @param tabsetNodeId the id of the tabset to maximize
     * @returns {Action} the action
     */
    static maximizeToggle(tabsetNodeId: string, layoutId?: string | undefined): Action {
        return new Action(Actions.MAXIMIZE_TOGGLE, { node: tabsetNodeId, layoutId: layoutId });
    }

    /**
     * Updates the global model jsone attributes
     * @param attributes the json for the model attributes to update (merge into the existing attributes)
     * @returns {Action} the action
     */
    static updateModelAttributes(attributes: IGlobalAttributes): Action {
        return new Action(Actions.UPDATE_MODEL_ATTRIBUTES, { json: attributes });
    }

    /**
     * Updates the given nodes json attributes
     * @param nodeId the id of the node to update
     * @param attributes the json attributes to update (merge with the existing attributes)
     * @returns {Action} the action
     */
    static updateNodeAttributes(nodeId: string, attributes: IRowAttributes | ITabSetAttributes | ITabAttributes): Action {
        return new Action(Actions.UPDATE_NODE_ATTRIBUTES, { node: nodeId, json: attributes });
    }

    /**
     * Pops out the given tab node into a new browser window or floating panel
     * @param nodeId the tab node to popout
     * @param type the type of window to create, either "window" (native browser window) or "float" (simulated div based window)
     * @returns {Action} the action
     */
    static popoutTab(nodeId: string, type: ILayoutType = "window"): Action {
        return new Action(Actions.POPOUT_TAB, { node: nodeId, type });
    }

    /**
     * Pops out the given tabset node into a new browser window or floating panel
     * @param nodeId the tabset node to popout
     * @param type the type of window to create, either "window" (native browser window) or "float" (simulated div based window)
     * @returns {Action} the action
     */
    static popoutTabset(nodeId: string, type: ILayoutType = "window"): Action {
        return new Action(Actions.POPOUT_TABSET, { node: nodeId, type });
    }

    /**
     * Closes the popout
     * @param layoutId the id of the popout to close
     * @returns {Action} the action
     */
    static closePopout(layoutId: string): Action {
        return new Action(Actions.CLOSE_POPOUT, { layoutId: layoutId });
    }

    /**
     * Moves a floating panel popout to the front of the display
     * @param layoutId the id of the floating panel popout to move
     * @returns {Action} the action
     */
    static movePopoutToFront(layoutId: string): Action {
        return new Action(Actions.MOVE_POPOUT_TO_FRONT, { layoutId: layoutId });
    }

    /**
     * Creates a new empty popout window with the given layout (alias for createSubLayout)
     * @param layout the json layout for the new window
     * @param rect the window rectangle in screen coordinates
     * @param type the type of the popout either "window", "float"
     * @returns {Action} the action
     */
    static createPopout(layout: IJsonRowNode, rect: IJsonRect, type: ILayoutType): Action {
        return this.createSubLayout(layout, rect, type);
    }

    /**
     * Creates a new sublayout with the given layout
     * @param layout the json layout for the new window
     * @param rect the window rectangle in screen coordinates
     * @param type the type of the sublayout either "window", "float" or "tab"
     * @returns {Action} the action
     */
    static createSubLayout(layout: IJsonRowNode, rect: IJsonRect, type: ILayoutType): Action {
        return new Action(Actions.CREATE_SUBLAYOUT, { layout, rect, type });
    }



}

export class Action {
    type: string;
    data: Record<string, any>;

    constructor(type: string, data: Record<string, any>) {
        this.type = type;
        this.data = data;
    }
}
