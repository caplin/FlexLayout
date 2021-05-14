import AttributeDefinitions from "../AttributeDefinitions";
import DockLocation from "../DockLocation";
import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import IDraggable from "./IDraggable";
import Model, { ILayoutMetrics } from "./Model";

abstract class Node {
    /** @hidden @internal */
    protected _model: Model;
    /** @hidden @internal */
    protected _attributes: Record<string, any>;
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
    protected _listeners: Record<string, (params: any) => void>;
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

    // event can be: resize, visibility, maximize (on tabset), close
    setEventListener(event: string, callback: (params: any) => void) {
        this._listeners[event] = callback;
    }

    removeEventListener(event: string) {
        delete this._listeners[event];
    }

    /** @hidden @internal */
    _setId(id: string) {
        this._attributes.id = id;
    }

    /** @hidden @internal */
    _fireEvent(event: string, params: any) {
        // console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
        if (this._listeners[event] !== undefined) {
            this._listeners[event](params);
        }
    }

    /** @hidden @internal */
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

    /** @hidden @internal */
    _forEachNode(fn: (node: Node, level: number) => void, level: number) {
        fn(this, level);
        level++;
        this._children.forEach((node) => {
            node._forEachNode(fn, level);
        });
    }

    /** @hidden @internal */
    _setVisible(visible: boolean) {
        if (visible !== this._visible) {
            this._fireEvent("visibility", { visible });
            this._visible = visible;
        }
    }

    /** @hidden @internal */
    _getDrawChildren(): Node[] | undefined {
        return this._children;
    }

    /** @hidden @internal */
    _setParent(parent: Node) {
        this._parent = parent;
    }

    /** @hidden @internal */
    _setRect(rect: Rect) {
        this._rect = rect;
    }

    /** @hidden @internal */
    _setWeight(weight: number) {
        this._attributes.weight = weight;
    }

    /** @hidden @internal */
    _setSelected(index: number) {
        this._attributes.selected = index;
    }

    /** @hidden @internal */
    _isFixed() {
        return this._fixed;
    }

    /** @hidden @internal */
    _layout(rect: Rect, metrics: ILayoutMetrics) {
        this._rect = rect;
    }

    /** @hidden @internal */
    _findDropTargetNode(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        let rtn: DropInfo | undefined;
        if (this._rect.contains(x, y)) {
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

        return rtn;
    }

    /** @hidden @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        return undefined;
    }

    /** @hidden @internal */
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

    /** @hidden @internal */
    _removeChild(childNode: Node) {
        const pos = this._children.indexOf(childNode);
        if (pos !== -1) {
            this._children.splice(pos, 1);
        }
        this._dirty = true;
        return pos;
    }

    /** @hidden @internal */
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

    /** @hidden @internal */
    _removeAll() {
        this._children = [];
        this._dirty = true;
    }

    /** @hidden @internal */
    _styleWithPosition(style?: Record<string, any>) {
        if (style == null) {
            style = {};
        }
        return this._rect.styleWithPosition(style);
    }

    /** @hidden @internal */
    _getTempSize() {
        return this._tempSize;
    }

    /** @hidden @internal */
    _setTempSize(value: number) {
        this._tempSize = value;
    }

    /** @hidden @internal */
    isEnableDivide() {
        return true;
    }

    /** @hidden @internal */
    _toAttributeString() {
        return JSON.stringify(this._attributes, undefined, "\t");
    }

    // implemented by subclasses
    /** @hidden @internal */
    abstract _updateAttrs(json: any): void;
    /** @hidden @internal */
    abstract _getAttributeDefinitions(): AttributeDefinitions;
    /** @hidden @internal */
    abstract _toJson(): any;
}

export default Node;
