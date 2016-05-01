import DockLocation from "../DockLocation.js";

/**
 * The Action creator class for FlexLayout model actions
 */
class Actions {

    static addNode(json, toNode, location, index) {
        return {type: Actions.ADD_NODE, json: json, toNode: toNode, location: location.getName(), index: index};
    }

    static moveNode(fromNode, toNode, location, index) {
        return {
            type: Actions.MOVE_NODE,
            fromNode: fromNode,
            toNode: toNode,
            location: location.getName(),
            index: index
        };
    }

    static deleteTab(tabNode) {
        return {type: Actions.DELETE_TAB, node: tabNode};
    }

    static renameTab(tabNode, text) {
        return {type: Actions.RENAME_TAB, node: tabNode, text: text};
    }

    static selectTab(tabNode) {
        return {type: Actions.SELECT_TAB, tabNode: tabNode};
    }

    static setActiveTabset(tabsetNode) {
        return {type: Actions.SET_ACTIVE_TABSET, tabsetNode: tabsetNode};
    }

    static adjustSplit(splitSpec) {
        let node1 = splitSpec.node1;
        let node2 = splitSpec.node2;

        return {
            type: Actions.ADJUST_SPLIT,
            node1: node1, weight1: splitSpec.weight1, pixelWidth1: splitSpec.pixelWidth1,
            node2: node2, weight2: splitSpec.weight2, pixelWidth2: splitSpec.pixelWidth2
        };
    }

    static maximizeToggle(node) {
        return {type: Actions.MAXIMIZE_TOGGLE, node: node};
    }

    static updateModelAttributes(attributes) {
        return {type: Actions.UPDATE_MODEL_ATTRIBUTES, json: attributes};
    }

    static updateNodeAttributes(node, attributes) {
        return {type: Actions.UPDATE_NODE_ATTRIBUTES, node: node, json: attributes};
    }
}

Actions.ADD_NODE = "FlexLayout_AddNode";
Actions.MOVE_NODE = "FlexLayout_MoveNode";
Actions.DELETE_TAB = "FlexLayout_DeleteTab";
Actions.RENAME_TAB = "FlexLayout_RenameTab";
Actions.SELECT_TAB = "FlexLayout_SelectTab";
Actions.SET_ACTIVE_TABSET = "FlexLayout_SetActiveTabset";
Actions.ADJUST_SPLIT = "FlexLayout_AdjustSplit";
Actions.MAXIMIZE_TOGGLE = "FlexLayout_MaximizeToggle";
Actions.UPDATE_MODEL_ATTRIBUTES = "FlexLayout_UpdateModelAttributes";
Actions.UPDATE_NODE_ATTRIBUTES = "FlexLayout_UpdateNodeAttributes";

export default Actions;