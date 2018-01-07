import Rect from "../Rect.js";
import Orientation from "../Orientation.js";
import DockLocation from "../DockLocation.js";

class Node {

    constructor(model) {
        this._model = model;
        this._attributes = {};
        this._parent = null;
        this._children = [];
        this._fixed = false;
        this._rect = new Rect();
        this._visible = false;
        this._listeners = {};
    }

    getId() {
        return this._attributes["id"];
    }

    getModel() {
        return this._model;
    }

    getType() {
        return this._attributes["type"];
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

    getOrientation() {
        if (this._parent == null) {
            return Orientation.HORZ;
        }
        else {
            return Orientation.flip(this._parent.getOrientation());
        }
    }

    // event can be: resize, visibility, maximize (on tabset), close
    setEventListener(event, callback) {
        this._listeners[event] = callback;
    }

    removeEventListener(event) {
        delete this._listeners[event];
    }

    _setId(id) {
        this._attributes["id"] = id;
    }

    _fireEvent(event, params) {
        //console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
        if (this._listeners[event] != null) {
            this._listeners[event](params);
        }
    }

    _getAttr(name) {
        let val = this._attributes[name];

        if ( val === undefined) {
            let modelName = this._getAttributeDefinitions().getModelName(name);
            if (modelName != null) {
                val = this._model._attributes[modelName];
            }
        }

        //console.log(name + "=" + val);
        return val;
    }

    _forEachNode(fn, level) {
        fn(this, level);
        level++;
        this._children.forEach((node) => {
            node._forEachNode(fn, level);
        })
    }

    _getPrefSize(orientation) {
        let prefSize = this.getWidth();
        if (orientation === Orientation.VERT) {
            prefSize = this.getHeight();
        }
        return prefSize;
    }

    _setVisible(visible) {
        if (visible != this._visible) {
            this._fireEvent("visibility", {visible: visible});
            this._visible = visible;
        }
    }

    _getDrawChildren() {
        return this._children;
    }

    _layout(rect) {
        this._rect = rect;
    }

    _findDropTargetNode(dragNode, x, y) {
        let rtn = null;
        if (this._rect.contains(x, y)) {
            rtn = this._canDrop(dragNode, x, y);
            if (rtn == null) {
                if (this._children.length !== 0) {
                    for (let i = 0; i < this._children.length; i++) {
                        const child = this._children[i];
                        rtn = child._findDropTargetNode(dragNode, x, y);
                        if (rtn != null) {
                            break;
                        }
                    }
                }
            }
        }

        return rtn;
    }

    _canDrop(dragNode, x, y) {
        return null;
    }

    _canDockInto(dragNode, dropInfo) {
        if (dropInfo != null) {
            if (dropInfo.location === DockLocation.CENTER && dropInfo.node.isEnableDrop() === false) {
                return false;
            }

            // prevent named tabset docking into another tabset, since this would loose the header
            if (dropInfo.location === DockLocation.CENTER && dragNode.getType() === "tabset" && dragNode.getName() !== null) {
                return false;
            }

            if (dropInfo.location !== DockLocation.CENTER && dropInfo.node.isEnableDivide() === false) {
                return false;
            }

            // finally check model callback to check if drop allowed
            if (this._model._onAllowDrop) {
                return this._model._onAllowDrop(dragNode, dropInfo);
            }
        }
        return true;
    }

    _removeChild(childNode) {
        const pos = this._children.indexOf(childNode);
        if (pos !== -1) {
            this._children.splice(pos, 1);
        }
        this._dirty = true;
        return pos;
    }

    _addChild(childNode, pos) {
        if (pos != undefined) {
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

    _removeAll() {
        this._children = [];
        this._dirty = true;
    }

    _styleWithPosition(style) {
        if (style == undefined) {
            style = {};
        }

        if (!this._visible) {
            style.display = "none";
        }
        return this._rect.styleWithPosition(style);
    }

    isEnableDivide() {
        return true;
    }

    // implemented by subclasses
    _updateAttrs(json) {
    }

    // implemented by subclasses
    _getAttributeDefinitions() {
        return null;
    }

    _toStringIndented(lines, indent) {
        lines.push(indent + this.getType() + " " + this.getWeight().toFixed(2) + " " + this.getId());
        indent = indent + "\t";
        this._children.forEach((child) => {
            child._toStringIndented(lines, indent);
        });
    }

    _toAttributeString() {
        return JSON.stringify(this._attributes, null, "\t");
    }

}

export default Node;
