import Attribute from "../Attribute";
import AttributeDefinitions from "../AttributeDefinitions";
import DockLocation from "../DockLocation";
import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import { JSMap } from "../Types";
import Action from "./Action";
import Actions from "./Actions";
import BorderNode from "./BorderNode";
import BorderSet from "./BorderSet";
import IDraggable from "./IDraggable";
import IDropTarget from "./IDropTarget";
import Node from "./Node";
import RowNode from "./RowNode";
import TabNode from "./TabNode";
import TabSetNode from "./TabSetNode";

/**
 * Class containing the Tree of Nodes used by the FlexLayout component
 */
class Model {

  /**
   * Loads the model from the given json object
   * @param json the json model to load
   * @returns {Model} a new Model object
   */
  static fromJson(json: any) {
    const model = new Model();
    Model._attributeDefinitions.fromJson(json.global, model._attributes);

    if (json.borders) {
      model._borders = BorderSet._fromJson(json.borders, model);
    }
    model._root = RowNode._fromJson(json.layout, model);
    model._tidy(); // initial tidy of node tree
    return model;
  }
  /** @hidden @internal */
  private static _attributeDefinitions: AttributeDefinitions = Model._createAttributeDefinitions();

  /** @hidden @internal */
  private static _createAttributeDefinitions(): AttributeDefinitions {
    const attributeDefinitions = new AttributeDefinitions();
    // splitter
    attributeDefinitions.add("splitterSize", 8).setType(Attribute.INT).setFrom(1);
    attributeDefinitions.add("enableEdgeDock", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("marginInsets", { top: 0, right: 0, bottom: 0, left: 0 }).setType(Attribute.JSON);

    // tab
    attributeDefinitions.add("tabEnableClose", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabEnableDrag", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabEnableRename", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabClassName", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabIcon", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabEnableRenderOnDemand", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabDragSpeed", 0.3).setType(Attribute.NUMBER);

    // tabset
    attributeDefinitions.add("tabSetEnableDeleteWhenEmpty", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDrop", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDrag", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableDivide", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetEnableMaximize", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetClassNameTabStrip", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabSetClassNameHeader", undefined).setType(Attribute.STRING);
    attributeDefinitions.add("tabSetEnableTabStrip", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("tabSetHeaderHeight", 20).setType(Attribute.INT).setFrom(0);
    attributeDefinitions.add("tabSetTabStripHeight", 20).setType(Attribute.INT).setFrom(0);
    attributeDefinitions.add("tabSetMarginInsets", { top: 0, right: 0, bottom: 0, left: 0 }).setType(Attribute.JSON);
    attributeDefinitions.add("tabSetBorderInsets", { top: 0, right: 0, bottom: 0, left: 0 }).setType(Attribute.JSON);

    attributeDefinitions.add("borderBarSize", 25);
    attributeDefinitions.add("borderEnableDrop", true).setType(Attribute.BOOLEAN);
    attributeDefinitions.add("borderClassName", undefined).setType(Attribute.STRING);
    return attributeDefinitions;
  }

  /** @hidden @internal */
  private _attributes: JSMap<any>;
  /** @hidden @internal */
  private _idMap: JSMap<Node>;
  /** @hidden @internal */
  private _nextId: number;
  /** @hidden @internal */
  private _changeListener?: (() => void);
  /** @hidden @internal */
  private _root?: RowNode;
  /** @hidden @internal */
  private _borders: BorderSet;
  /** @hidden @internal */
  private _onAllowDrop?: (dragNode: (Node), dropInfo: DropInfo) => boolean;
  /** @hidden @internal */
  private _maximizedTabSet?: TabSetNode;
  /** @hidden @internal */
  private _activeTabSet?: TabSetNode;
  /** @hidden @internal */
  private _borderRects: { inner: Rect, outer: Rect } = { inner: Rect.empty(), outer: Rect.empty() };

  /**
   * 'private' constructor. Use the static method Model.fromJson(json) to create a model
   *  @hidden @internal
   */

  private constructor() {
    this._attributes = {};
    this._idMap = {};
    this._nextId = 0;
    this._borders = new BorderSet(this);
  }

  /** @hidden @internal */
  _setChangeListener(listener: (() => void) | undefined) {
    this._changeListener = listener;
  }


  /**
   * Get the currently active tabset node
   */
  getActiveTabset() {
    return this._activeTabSet;
  }

  /** @hidden @internal */
  _setActiveTabset(tabsetNode: TabSetNode) {
    this._activeTabSet = tabsetNode;
  }

  /**
   * Get the currently maximized tabset node
   */
  getMaximizedTabset() {
    return this._maximizedTabSet;
  }

  /** @hidden @internal */
  _setMaximizedTabset(tabsetNode: TabSetNode) {
    this._maximizedTabSet = tabsetNode;
  }

  /**
   * Gets the root RowNode of the model
   * @returns {RowNode}
   */
  getRoot() {
    return this._root as RowNode;
  }

  /**
   * Gets the
   * @returns {BorderSet|*}
   */
  getBorderSet() {
    return this._borders;
  }

  /** @hidden @internal */
  _getOuterInnerRects() {
    return this._borderRects;
  }

  /**
   * Visits all the nodes in the model and calls the given function for each
   * @param fn a function that takes visited node and a integer level as parameters
   */
  visitNodes(fn: (node: Node, level: number) => void) {
    this._borders._forEachNode(fn);
    (this._root as RowNode)._forEachNode(fn, 0);
  }

  /**
   * Gets a node by its id
   * @param id the id to find
   */
  getNodeById(id: string) {
    return this._idMap[id];
  }

  /**
   * Update the node tree by performing the given action,
   * Actions should be generated via static methods on the Actions class
   * @param action the action to perform
   */
  doAction(action: Action) {
    // console.log(action);
    switch (action.type) {
      case Actions.ADD_NODE:
        {
          const newNode = new TabNode(this, action.data.json);
          const toNode = this._idMap[action.data.toNode] as (Node & IDraggable);
          if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
            toNode.drop(newNode, DockLocation.getByName(action.data.location), action.data.index);
          }
          break;
        }
      case Actions.MOVE_NODE:
        {
          const fromNode = this._idMap[action.data.fromNode] as (Node & IDraggable);
          if (fromNode instanceof TabNode || fromNode instanceof TabSetNode) {
            const toNode = this._idMap[action.data.toNode] as (Node & IDropTarget);
            if (toNode instanceof TabSetNode || toNode instanceof BorderNode || toNode instanceof RowNode) {
              toNode.drop(fromNode, DockLocation.getByName(action.data.location), action.data.index);
            }
          }
          break;
        }
      case Actions.DELETE_TAB:
        {
          const node = this._idMap[action.data.node];
          if (node instanceof TabNode) {
            delete this._idMap[action.data.node];
            node._delete();
          }
          break;
        }
      case Actions.RENAME_TAB:
        {
          const node = this._idMap[action.data.node];
          if (node instanceof TabNode) {
            node._setName(action.data.text);
          }
          break;
        }
      case Actions.SELECT_TAB:
        {
          const tabNode = this._idMap[action.data.tabNode];
          if (tabNode instanceof TabNode) {
            const parent = tabNode.getParent() as Node;
            const pos = parent.getChildren().indexOf(tabNode);

            if (parent instanceof BorderNode) {
              if (parent.getSelected() === pos) {
                parent._setSelected(-1);
              }
              else {
                parent._setSelected(pos);
              }

            }
            else if (parent instanceof TabSetNode) {
              if (parent.getSelected() !== pos) {
                parent._setSelected(pos);
              }
              this._activeTabSet = parent;
            }
          }
          break;
        }
      case Actions.SET_ACTIVE_TABSET:
        {
          const tabsetNode = this._idMap[action.data.tabsetNode];
          if (tabsetNode instanceof TabSetNode) {
            this._activeTabSet = tabsetNode;
          }
          break;
        }
      case Actions.ADJUST_SPLIT:
        {
          const node1 = this._idMap[action.data.node1];
          const node2 = this._idMap[action.data.node2];

          if ((node1 instanceof TabSetNode || node1 instanceof RowNode) &&
            (node2 instanceof TabSetNode || node2 instanceof RowNode)) {
            this._adjustSplitSide(node1, action.data.weight1, action.data.pixelWidth1);
            this._adjustSplitSide(node2, action.data.weight2, action.data.pixelWidth2);
          }
          break;
        }
      case Actions.ADJUST_BORDER_SPLIT:
        {
          const node = this._idMap[action.data.node];
          if (node instanceof BorderNode) {
            node._setSize(action.data.pos);
          }
          break;
        }
      case Actions.MAXIMIZE_TOGGLE:
        {
          const node = this._idMap[action.data.node];
          if (node instanceof TabSetNode) {
            if (node === this._maximizedTabSet) {
              this._maximizedTabSet = undefined;
            } else {
              this._maximizedTabSet = node;
              this._activeTabSet = node;
            }
          }

          break;
        }
      case Actions.UPDATE_MODEL_ATTRIBUTES:
        {
          this._updateAttrs(action.data.json);
          break;
        }

      case Actions.UPDATE_NODE_ATTRIBUTES:
        {
          const node = this._idMap[action.data.node];
          node._updateAttrs(action.data.json);
          break;
        }
      default:
        break;
    }

    this._updateIdMap();

    if (this._changeListener !== undefined) {
      this._changeListener();
    }
  }

  /** @hidden @internal */
  _updateIdMap() {
    // regenerate idMap to stop it building up
    this._idMap = {};
    this.visitNodes((node) => this._idMap[node.getId()] = node);
    // console.log(JSON.stringify(Object.keys(this._idMap)));
  }

  /** @hidden @internal */
  _adjustSplitSide(node: (TabSetNode | RowNode), weight: number, pixels: number) {
    node._setWeight(weight);
    if (node.getWidth() != null && node.getOrientation() === Orientation.VERT) {
      node._updateAttrs({ width: pixels });
    }
    else if (node.getHeight() != null && node.getOrientation() === Orientation.HORZ) {
      node._updateAttrs({ height: pixels });
    }
  }

  /**
   * Converts the model to a json object
   * @returns {*} json object that represents this model
   */
  toJson() {
    const json: any = { global: {}, layout: {} };
    Model._attributeDefinitions.toJson(json.global, this._attributes);

    // save state of nodes
    this.visitNodes((node) => {
      node._fireEvent("save", undefined);
    });

    json.borders = this._borders._toJson();
    json.layout = (this._root as RowNode)._toJson();
    return json;
  }

  getSplitterSize() {
    return this._attributes.splitterSize as number;
  }

  isEnableEdgeDock() {
    return this._attributes.enableEdgeDock as boolean;
  }

  /** @hidden @internal */
  _addNode(node: Node) {
    const id = node.getId();
    if (this._idMap[id] !== undefined) {
      throw new Error(`Error: each node must have a unique id, duplicate id:${node.getId()}`);
    }

    if (node.getType() !== "splitter") {
      this._idMap[id] = node;
    }
  }

  /** @hidden @internal */
  _layout(rect: Rect) {
    // let start = Date.now();
    this._borderRects = this._borders._layoutBorder({ outer: rect, inner: rect });
    rect = this._borderRects.inner.removeInsets(this._getAttribute("marginInsets"));

    (this._root as RowNode)._layout(rect);
    return rect;
    // console.log("layout time: " + (Date.now() - start));
  }

  /** @hidden @internal */
  _findDropTargetNode(dragNode: (Node & IDraggable), x: number, y: number) {
    let node = (this._root as RowNode)._findDropTargetNode(dragNode, x, y);
    if (node === undefined) {
      node = this._borders._findDropTargetNode(dragNode, x, y);
    }
    return node;
  }

  /** @hidden @internal */
  _tidy() {
    // console.log("before _tidy", this.toString());
    (this._root as RowNode)._tidy();
    // console.log("after _tidy", this.toString());
  }

  /** @hidden @internal */
  _updateAttrs(json: any) {
    Model._attributeDefinitions.update(json, this._attributes);
  }

  /** @hidden @internal */
  _nextUniqueId() {
    this._nextId++;
    while (this._idMap["#" + this._nextId] !== undefined) {
      this._nextId++;
    }

    return "#" + this._nextId;
  }

  /** @hidden @internal */
  _getAttribute(name: string): any {
    return this._attributes[name];
  }

  /**
   * Sets a function to allow/deny dropping a node
   * @param onAllowDrop function that takes the drag node and DropInfo and returns true if the drop is allowed
   */
  setOnAllowDrop(onAllowDrop: (dragNode: Node, dropInfo: DropInfo) => boolean) {
    this._onAllowDrop = onAllowDrop;
  }

  /** @hidden @internal */
  _getOnAllowDrop() {
    return this._onAllowDrop;
  }

  toString() {
    return JSON.stringify(this.toJson());
  }
}

export default Model;
