import AttributeDefinitions from "../AttributeDefinitions";
import DockLocation from "../DockLocation";
import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import { JSMap } from "../Types";
import IDraggable from "./IDraggable";
import Model from "./Model";

abstract class Node {

  /** @hidden @internal */
  protected _model: Model;
  /** @hidden @internal */
  protected _attributes: JSMap<any>;
  /** @hidden @internal */
  protected _parent?: Node;
  /** @hidden @internal */
  protected _children: Node[];
  /** @hidden @internal */
  protected _fixed: boolean;
  /** @hidden @internal */
  protected _rect: Rect;
  /** @hidden @internal */
  protected _visible: boolean;
  /** @hidden @internal */
  protected _listeners: JSMap<(params: any) => void>;
  /** @hidden @internal */
  protected _dirty: boolean = false;
  /** @hidden @internal */
  protected _tempSize: number = 0;

  /** @hidden @internal */
  protected constructor(model: Model) {
    this._model = model;
    this._attributes = {};
    this._children = [];
    this._fixed = false;
    this._rect = Rect.empty();
    this._visible = false;
    this._listeners = {};
  }

  public getId() {
    let id = this._attributes.id;
    if (id !== undefined) {
      return id as string;
    }

    id = this._model._nextUniqueId();
    this._setId(id);

    return id as string;
  }

  public getModel() {
    return this._model;
  }

  public getType() {
    return this._attributes.type as string;
  }

  public getParent() {
    return this._parent;
  }

  public getChildren() {
    return this._children;
  }

  public getRect() {
    return this._rect;
  }

  public isVisible() {
    return this._visible;
  }

  public getOrientation(): Orientation {
    if (this._parent === undefined) {
      return Orientation.HORZ;
    }
    else {
      return Orientation.flip(this._parent.getOrientation());
    }
  }

  // event can be: resize, visibility, maximize (on tabset), close
  public setEventListener(event: string, callback: (params: any) => void) {
    this._listeners[event] = callback;
  }

  public removeEventListener(event: string) {
    delete this._listeners[event];
  }

  /** @hidden @internal */
  public _setId(id: string) {
    this._attributes.id = id;
  }

  /** @hidden @internal */
  public _fireEvent(event: string, params: any) {
    // console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
    if (this._listeners[event] !== undefined) {
      this._listeners[event](params);
    }
  }

  /** @hidden @internal */
  public _getAttr(name: string) {
    let val = this._attributes[name];

    if (val === undefined) {
      const modelName = this._getAttributeDefinitions().getModelName(name);
      if (modelName !== undefined) {
        val = this._model._getAttribute(modelName);
      }
    }

    // console.log(name + "=" + val);
    return val;
  }

  /** @hidden @internal */
  public _forEachNode(fn: (node: Node, level: number) => void, level: number) {
    fn(this, level);
    level++;
    this._children.forEach((node) => {
      node._forEachNode(fn, level);
    });
  }


  /** @hidden @internal */
  public _setVisible(visible: boolean) {
    if (visible !== this._visible) {
      this._fireEvent("visibility", { visible });
      this._visible = visible;
    }
  }

  /** @hidden @internal */
  public _getDrawChildren(): Node[] | undefined {
    return this._children;
  }

  /** @hidden @internal */
  public _setParent(parent: Node) {
    this._parent = parent;
  }

  /** @hidden @internal */
  public _setRect(rect: Rect) {
    this._rect = rect;
  }

  /** @hidden @internal */
  public _setWeight(weight: number) {
    this._attributes.weight = weight;
  }

  /** @hidden @internal */
  public _setSelected(index: number) {
    this._attributes.selected = index;
  }

  /** @hidden @internal */
  public _isFixed() {
    return this._fixed;
  }

  /** @hidden @internal */
  public _layout(rect: Rect) {
    this._rect = rect;
  }

  /** @hidden @internal */
  public _findDropTargetNode(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
    let rtn: DropInfo | undefined;
    if (this._rect.contains(x, y)) {
      rtn = this.canDrop(dragNode, x, y);
      if (rtn === undefined) {
        if (this._children.length !== 0) {
          for (let i = 0; i < this._children.length; i++) {
            const child = this._children[i];
            rtn = child._findDropTargetNode(dragNode, x, y);
            if (rtn !== undefined) {
              break;
            }
          }
        }
      }
    }

    return rtn;
  }

  /** @hidden @internal */
  public canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
    return undefined;
  }

  /** @hidden @internal */
  public _canDockInto(dragNode: (Node & IDraggable), dropInfo: DropInfo | undefined): boolean {
    if (dropInfo != null) {
      if (dropInfo.location === DockLocation.CENTER && dropInfo.node.isEnableDrop() === false) {
        return false;
      }

      // prevent named tabset docking into another tabset, since this would lose the header
      if (dropInfo.location === DockLocation.CENTER && dragNode.getType() === "tabset" && dragNode.getName() !== undefined) {
        return false;
      }

      if (dropInfo.location !== DockLocation.CENTER && dropInfo.node.isEnableDivide() === false) {
        return false;
      }

      // finally check model callback to check if drop allowed
      if (this._model._getOnAllowDrop()) {
        return (this._model._getOnAllowDrop() as (dragNode: (Node), dropInfo: DropInfo) => boolean)(dragNode, dropInfo);
      }
    }
    return true;
  }

  /** @hidden @internal */
  public _removeChild(childNode: Node) {
    const pos = this._children.indexOf(childNode);
    if (pos !== -1) {
      this._children.splice(pos, 1);
    }
    this._dirty = true;
    return pos;
  }

  /** @hidden @internal */
  public _addChild(childNode: Node, pos?: number) {
    if (pos != null) {
      this._children.splice(pos, 0, childNode);
    }
    else {
      this._children.push(childNode);
      pos = this._children.length - 1;
    }
    childNode._parent = this;
    this._dirty = true;
    return pos;
  }

  /** @hidden @internal */
  public _removeAll() {
    this._children = [];
    this._dirty = true;
  }

  /** @hidden @internal */
  public _styleWithPosition(style?: JSMap<any>) {
    if (style == null) {
      style = {};
    }
    return this._rect.styleWithPosition(style);
  }

  /** @hidden @internal */
  public _getTempSize() {
    return this._tempSize;
  }

  /** @hidden @internal */
  public _setTempSize(value: number) {
    this._tempSize = value;
  }

  /** @hidden @internal */
  public isEnableDivide() {
    return true;
  }

  /** @hidden @internal */
  public _toAttributeString() {
    return JSON.stringify(this._attributes, undefined, "\t");
  }

  // implemented by subclasses
  /** @hidden @internal */
  public abstract _updateAttrs(json: any): void;
  /** @hidden @internal */
  public abstract _getAttributeDefinitions(): AttributeDefinitions;
  /** @hidden @internal */
  public abstract _toJson(): any;

  /** @hidden @internal */
  protected _getAttributeAsStringOrUndefined(attr: string) {
    const value = this._attributes[attr];
    if (value !== undefined) {
      return value as string;
    }
    return undefined;
  }

  /** @hidden @internal */
  protected _getAttributeAsNumberOrUndefined(attr: string) {
    const value = this._attributes[attr];
    if (value !== undefined) {
      return value as number;
    }
    return undefined;
  }

}

export default Node;
