import DockLocation from "../DockLocation";
import Action from "./Action";

/**
 * The Action creator class for FlexLayout model actions
 */
class Actions {

  static ADD_NODE = "FlexLayout_AddNode";
  static MOVE_NODE = "FlexLayout_MoveNode";
  static DELETE_TAB = "FlexLayout_DeleteTab";
  static RENAME_TAB = "FlexLayout_RenameTab";
  static SELECT_TAB = "FlexLayout_SelectTab";
  static SET_ACTIVE_TABSET = "FlexLayout_SetActiveTabset";
  static ADJUST_SPLIT = "FlexLayout_AdjustSplit";
  static ADJUST_BORDER_SPLIT = "FlexLayout_AdjustBorderSplit";
  static MAXIMIZE_TOGGLE = "FlexLayout_MaximizeToggle";
  static UPDATE_MODEL_ATTRIBUTES = "FlexLayout_UpdateModelAttributes";
  static UPDATE_NODE_ATTRIBUTES = "FlexLayout_UpdateNodeAttributes";

  /**
   * Adds a tab node to the given tabset node
   * @param json the json for the new tab node e.g {type:"tab", component:"table"}
   * @param toNodeId the new tab node will be added to the tabset with this node id
   * @param location the location where the new tab will be added, one of the DockLocation enum values.
   * @param index for docking to the center this value is the index of the tab, use -1 to add to the end.
   * @returns {{type: (string|string), json: *, toNode: *, location: (*|string), index: *}}
   */
  static addNode(json: any, toNodeId: string, location: DockLocation, index: number): Action {
    return new Action(Actions.ADD_NODE, { json, toNode: toNodeId, location: location.getName(), index });
  }

  /**
   * Moves a node (tab or tabset) from one location to another
   * @param fromNodeId the id of the node to move
   * @param toNodeId the id of the node to receive the moved node
   * @param location the location where the moved node will be added, one of the DockLocation enum values.
   * @param index for docking to the center this value is the index of the tab, use -1 to add to the end.
   * @returns {{type: (string|string), fromNode: *, toNode: *, location: (*|string), index: *}}
   */
  static moveNode(fromNodeId: string, toNodeId: string, location: DockLocation, index: number): Action {
    return new Action(Actions.MOVE_NODE, {
      fromNode: fromNodeId,
      toNode: toNodeId,
      location: location.getName(),
      index
    });
  }

  /**
   * Deletes a tab node from the layout
   * @param tabNodeId the id of the node to delete
   * @returns {{type: (string|string), node: *}}
   */
  static deleteTab(tabNodeId: string): Action {
    return new Action(Actions.DELETE_TAB, { node: tabNodeId });
  }

  /**
   * Change the given nodes tab text
   * @param tabNodeId the id of the node to rename
   * @param text the test of the tab
   * @returns {{type: (string|string), node: *, text: *}}
   */
  static renameTab(tabNodeId: string, text: string): Action {
    return new Action(Actions.RENAME_TAB, { node: tabNodeId, text });
  }

  /**
   * Selects the given tab in its parent tabset
   * @param tabNodeId the id of the node to set selected
   * @returns {{type: (string|string), tabNode: *}}
   */
  static selectTab(tabNodeId: string): Action {
    return new Action(Actions.SELECT_TAB, { tabNode: tabNodeId });
  }

  /**
   * Set the given tabset node as the active tabset
   * @param tabsetNodeId the id of the tabset node to set as active
   * @returns {{type: (string|string), tabsetNode: *}}
   */
  static setActiveTabset(tabsetNodeId: string): Action {
    return new Action(Actions.SET_ACTIVE_TABSET, { tabsetNode: tabsetNodeId });
  }

  /**
   * Adjust the splitter between two tabsets
   * @example
   *  Actions.adjustSplit({node1: "1", weight1:30, pixelWidth1:300, node2: "2", weight2:70, pixelWidth2:700});
   *
   * @param splitSpec an object the defines the new split between two tabsets, see example below.
   * @returns {{type: (string|string), node1: *, weight1: *, pixelWidth1: *, node2: *, weight2: *, pixelWidth2: *}}
   */
  static adjustSplit(splitSpec: { node1Id: string, weight1: number, pixelWidth1: number, node2Id: string, weight2: number, pixelWidth2: number }): Action {
    const node1 = splitSpec.node1Id;
    const node2 = splitSpec.node2Id;

    return new Action(Actions.ADJUST_SPLIT, {
      node1, weight1: splitSpec.weight1, pixelWidth1: splitSpec.pixelWidth1,
      node2, weight2: splitSpec.weight2, pixelWidth2: splitSpec.pixelWidth2
    });
  }

  static adjustBorderSplit(nodeId: string, pos: number): Action {
    return new Action(Actions.ADJUST_BORDER_SPLIT, { node: nodeId, pos });
  }

  /**
   * Maximizes the given tabset
   * @param tabsetNodeId the id of the tabset to maximize
   * @returns {{type: (string|string), node: *}}
   */
  static maximizeToggle(tabsetNodeId: string): Action {
    return new Action(Actions.MAXIMIZE_TOGGLE, { node: tabsetNodeId });
  }

  /**
   * Updates the global model jsone attributes
   * @param attributes the json for the model attributes to update (merge into the existing attributes)
   * @returns {{type: (string|string), json: *}}
   */
  static updateModelAttributes(attributes: any): Action {
    return new Action(Actions.UPDATE_MODEL_ATTRIBUTES, { json: attributes });
  }

  /**
   * Updates the given nodes json attributes
   * @param nodeId the id of the node to update
   * @param attributes the json attributes to update (merge with the existing attributes)
   * @returns {{type: (string|string), node: *, json: *}}
   */
  static updateNodeAttributes(nodeId: string, attributes: any): Action {
    return new Action(Actions.UPDATE_NODE_ATTRIBUTES, { node: nodeId, json: attributes });
  }
}

export default Actions;

