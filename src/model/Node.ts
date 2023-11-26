import { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { Orientation } from "../Orientation";
import { Rect } from "../Rect";
import { IDraggable } from "./IDraggable";
import { IJsonBorderNode, IJsonRowNode, IJsonTabNode, IJsonTabSetNode } from "./IJsonModel";
import { Model, ILayoutMetrics } from "./Model";

export abstract class Node {
    /** @internal */
    protected _model: Model;
    /** @internal */
    protected _attributes: Record<string, any>;
    /** @internal */
    protected _parent?: Node;
    /** @internal */
    protected _children: Node[];
    /** @internal */
    protected _fixed: boolean;
    /** @internal */
    protected _rect: Rect;
    /** @internal */
    protected _visible: boolean;
    /** @internal */
    protected _listeners: Record<string, ((params: any) => void)[]>;
    /** @internal */
    protected _dirty: boolean = false;
    /** @internal */
    protected _tempSize: number = 0;

    /** @internal */
    protected constructor(model: Model) {
        this._model = model;
        this._attributes = {};
        this._children = [];
        this._fixed = false;
        this._rect = Rect.empty();
        this._visible = false;
        this._listeners = {};
    }

    getId() {
        let id = this._attributes.id;
        if (id !== undefined) {
            return id as string;
        }

        id = this._model._nextUniqueId();
        this._setId(id);

        return id as string;
    }

    getModel() {
        return this._model;
    }

    getType() {
        return this._attributes.type as string;
    }

    getParent() {
        return this._parent;
    }

    getChildren() {
        return this._children;
    }

    getRect() {
        return this._rect;
    }

    isVisible() {
        return this._visible;
    }

    getOrientation(): Orientation {
        if (this._parent === undefined) {
            return this._model.isRootOrientationVertical() ? Orientation.VERT : Orientation.HORZ;
        } else {
            return Orientation.flip(this._parent.getOrientation());
        }
    }
    
    /**
     * Removes existing event listeners and replaces them with the given listener
     * @param event valid events: resize, visibility, maximize (on tabset), close
     * @param callback
     */
    setEventListener(event: string, callback: (params: any) => void) {
        this._listeners[event] = [callback];
    }

    /**
     * Adds the given listener alongside existing listeners
     * @param event valid events: resize, visibility, maximize (on tabset), close
     * @param callback
     */
    addEventListener(event: string, callback: (params: any) => void) {
        if (this._listeners[event] !== undefined) {
            this._listeners[event].push(callback);
        } else {
            this._listeners[event] = [callback];
        }
    }

    /**
     * If callback is provided, it is removed from the event.
     * If no callback is provided, all callbacks are removed from the event.
     * @param event valid events: resize, visibility, maximize (on tabset), close
     * @param callback the specific callback to remove
     */
    removeEventListener(event: string, callback?: (params: any) => void) {
        if (callback) {
            if (this._listeners[event] !== undefined) {
                const index = this._listeners[event].indexOf(callback);
                if (index !== -1) {
                    this._listeners[event].splice(index, 1);
                }
            }
        } else {
            this._listeners[event] = [];
        }
    }

    abstract toJson(): IJsonRowNode | IJsonBorderNode | IJsonTabSetNode | IJsonTabNode | undefined;

    /** @internal */
    _setId(id: string) {
        this._attributes.id = id;
    }

    /** @internal */
    _fireEvent(event: string, params: any) {
        // console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
        if (this._listeners[event] !== undefined) {
            for(const callback of this._listeners[event]) {
                callback(params);
            }
        }
    }

    /** @internal */
    _getAttr(name: string) {
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

    /** @internal */
    _forEachNode(fn: (node: Node, level: number) => void, level: number) {
        fn(this, level);
        level++;
        for (const node of this._children) {
            node._forEachNode(fn, level);
        }
    }

    /** @internal */
    _setVisible(visible: boolean) {
        if (visible !== this._visible) {
            this._fireEvent("visibility", { visible });
            this._visible = visible;
        }
    }

    /** @internal */
    _getDrawChildren(): Node[] | undefined {
        return this._children;
    }

    /** @internal */
    _setParent(parent: Node) {
        this._parent = parent;
    }

    /** @internal */
    _setRect(rect: Rect) {
        this._rect = rect;
    }

    /** @internal */
    _setWeight(weight: number) {
        this._attributes.weight = weight;
    }

    /** @internal */
    _setSelected(index: number) {
        this._attributes.selected = index;
    }

    /** @internal */
    _isFixed() {
        return this._fixed;
    }

    /** @internal */
    _layout(rect: Rect, metrics: ILayoutMetrics) {
        this._rect = rect;
    }

    /** @internal */
    _findDropTargetNode(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        let rtn: DropInfo | undefined;
        if (this._rect.contains(x, y)) {
            if (this._model.getMaximizedTabset() !== undefined) {
                rtn = this._model.getMaximizedTabset()!.canDrop(dragNode, x, y);
            } else {
                rtn = this.canDrop(dragNode, x, y);
                if (rtn === undefined) {
                    if (this._children.length !== 0) {
                        for (const child of this._children) {
                            rtn = child._findDropTargetNode(dragNode, x, y);
                            if (rtn !== undefined) {
                                break;
                            }
                        }
                    }
                }
            }
        }

        return rtn;
    }

    /** @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        return undefined;
    }

    /** @internal */
    _canDockInto(dragNode: Node & IDraggable, dropInfo: DropInfo | undefined): boolean {
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
                return (this._model._getOnAllowDrop() as (dragNode: Node, dropInfo: DropInfo) => boolean)(dragNode, dropInfo);
            }
        }
        return true;
    }

    /** @internal */
    _removeChild(childNode: Node) {
        const pos = this._children.indexOf(childNode);
        if (pos !== -1) {
            this._children.splice(pos, 1);
        }
        this._dirty = true;
        return pos;
    }

    /** @internal */
    _addChild(childNode: Node, pos?: number) {
        if (pos != null) {
            this._children.splice(pos, 0, childNode);
        } else {
            this._children.push(childNode);
            pos = this._children.length - 1;
        }
        childNode._parent = this;
        this._dirty = true;
        return pos;
    }

    /** @internal */
    _removeAll() {
        this._children = [];
        this._dirty = true;
    }

    /** @internal */
    _styleWithPosition(style?: Record<string, any>) {
        if (style == null) {
            style = {};
        }
        return this._rect.styleWithPosition(style);
    }

    /** @internal */
    _getTempSize() {
        return this._tempSize;
    }

    /** @internal */
    _setTempSize(value: number) {
        this._tempSize = value;
    }

    /** @internal */
    isEnableDivide() {
        return true;
    }

    /** @internal */
    _toAttributeString() {
        return JSON.stringify(this._attributes, undefined, "\t");
    }

    // implemented by subclasses
    /** @internal */
    abstract _updateAttrs(json: any): void;
    /** @internal */
    abstract _getAttributeDefinitions(): AttributeDefinitions;
}
