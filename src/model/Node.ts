import { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { Orientation } from "../Orientation";
import { Rect } from "../Rect";
import { IDraggable } from "./IDraggable";
import { IJsonBorderNode, IJsonRowNode, IJsonTabNode, IJsonTabSetNode } from "./IJsonModel";
import { Model } from "./Model";

export abstract class Node {
    /** @internal */
    protected model: Model;
    /** @internal */
    protected attributes: Record<string, any>;
    /** @internal */
    protected parent?: Node;
    /** @internal */
    protected children: Node[];
    /** @internal */
    protected rect: Rect;
    /** @internal */
    protected path: string;
    /** @internal */
    protected listeners: Map<string, (params: any) => void>;

    /** @internal */
    protected constructor(_model: Model) {
        this.model = _model;
        this.attributes = {};
        this.children = [];
        this.rect = Rect.empty();
        this.listeners = new Map();
        this.path = "";
    }

    getId() {
        let id = this.attributes.id;
        if (id !== undefined) {
            return id as string;
        }

        id = this.model.nextUniqueId();
        this.setId(id);

        return id as string;
    }

    getModel() {
        return this.model;
    }

    getType() {
        return this.attributes.type as string;
    }

    getParent() {
        return this.parent;
    }

    getChildren() {
        return this.children;
    }

    getRect() {
        return this.rect;
    }

    getPath() {
        return this.path;
    }

    getOrientation(): Orientation {
        if (this.parent === undefined) {
            return this.model.isRootOrientationVertical() ? Orientation.VERT : Orientation.HORZ;
        } else {
            return Orientation.flip(this.parent.getOrientation());
        }
    }

    // event can be: resize, visibility, maximize (on tabset), close
    setEventListener(event: string, callback: (params: any) => void) {
        this.listeners.set(event, callback);
    }

    removeEventListener(event: string) {
        this.listeners.delete(event);
    }

    abstract toJson(): IJsonRowNode | IJsonBorderNode | IJsonTabSetNode | IJsonTabNode | undefined;

    /** @internal */
    setId(id: string) {
        this.attributes.id = id;
    }

    /** @internal */
    fireEvent(event: string, params: any) {
        // console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
        if (this.listeners.has(event)) {
            this.listeners.get(event)!(params);
        }
    }

    /** @internal */
    getAttr(name: string) {
        let val = this.attributes[name];

        if (val === undefined) {
            const modelName = this.getAttributeDefinitions().getModelName(name);
            if (modelName !== undefined) {
                val = this.model.getAttribute(modelName);
            }
        }

        // console.log(name + "=" + val);
        return val;
    }

    /** @internal */
    forEachNode(fn: (node: Node, level: number) => void, level: number) {
        fn(this, level);
        level++;
        for (const node of this.children) {
            node.forEachNode(fn, level);
        }
    }

    /** @internal */
    setPaths(path: string) {
        let i = 0;

        for (const node of this.children) {
            let newPath = path;
            if (node.getType() === "row") {
                if (node.getOrientation() === Orientation.VERT) {
                    newPath += "/c" + i;
                } else {
                    newPath += "/r" + i;
                }
            } else if (node.getType() === "tabset") {
                newPath += "/ts" + i;
            } else if (node.getType() === "tab") {
                newPath += "/t" + i;
            }

            node.path = newPath;

            node.setPaths(newPath);
            i++;
        }
    }

    /** @internal */
    setParent(parent: Node) {
        this.parent = parent;
    }

    /** @internal */
    setRect(rect: Rect) {
        this.rect = rect;
    }

    /** @internal */
    setPath(path: string) {
        this.path = path;
    }

    /** @internal */
    setWeight(weight: number) {
        this.attributes.weight = weight;
    }

    /** @internal */
    setSelected(index: number) {
        this.attributes.selected = index;
    }

    /** @internal */
    findDropTargetNode(windowId: string, dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        let rtn: DropInfo | undefined;
        if (this.rect.contains(x, y)) {
            if (this.model.getMaximizedTabset(windowId) !== undefined) {
                rtn = this.model.getMaximizedTabset(windowId)!.canDrop(dragNode, x, y);
            } else {
                rtn = this.canDrop(dragNode, x, y);
                if (rtn === undefined) {
                    if (this.children.length !== 0) {
                        for (const child of this.children) {
                            rtn = child.findDropTargetNode(windowId, dragNode, x, y);
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
    canDockInto(dragNode: Node & IDraggable, dropInfo: DropInfo | undefined): boolean {
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
            if (this.model.getOnAllowDrop()) {
                return (this.model.getOnAllowDrop() as (dragNode: Node, dropInfo: DropInfo) => boolean)(dragNode, dropInfo);
            }
        }
        return true;
    }

    /** @internal */
    removeChild(childNode: Node) {
        const pos = this.children.indexOf(childNode);
        if (pos !== -1) {
            this.children.splice(pos, 1);
        }
        return pos;
    }

    /** @internal */
    addChild(childNode: Node, pos?: number) {
        if (pos != null) {
            this.children.splice(pos, 0, childNode);
        } else {
            this.children.push(childNode);
            pos = this.children.length - 1;
        }
        childNode.parent = this;
        return pos;
    }

    /** @internal */
    removeAll() {
        this.children = [];
    }

    /** @internal */
    styleWithPosition(style?: Record<string, any>) {
        if (style == null) {
            style = {};
        }
        return this.rect.styleWithPosition(style);
    }

    /** @internal */
    isEnableDivide() {
        return true;
    }

    /** @internal */
    toAttributeString() {
        return JSON.stringify(this.attributes, undefined, "\t");
    }

    // implemented by subclasses
    /** @internal */
    abstract updateAttrs(json: any): void;
    /** @internal */
    abstract getAttributeDefinitions(): AttributeDefinitions;
}
