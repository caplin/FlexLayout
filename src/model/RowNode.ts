import { TabNode } from "./TabNode";
import { Attribute } from "../Attribute";
import { AttributeDefinitions } from "../AttributeDefinitions";
import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { Orientation } from "../Orientation";
import { CLASSES } from "../Types";
import { BorderNode } from "./BorderNode";
import { IDraggable } from "./IDraggable";
import { IDropTarget } from "./IDropTarget";
import { IJsonRowNode } from "./IJsonModel";
import { DefaultMax, DefaultMin, Model } from "./Model";
import { Node } from "./Node";
import { TabSetNode } from "./TabSetNode";
import { canDockToWindow } from "../view/Utils";
import { LayoutWindow } from "./LayoutWindow";

export class RowNode extends Node implements IDropTarget {
    static readonly TYPE = "row";

    /** @internal */
    static fromJson(json: any, model: Model, layoutWindow: LayoutWindow) {
        const newLayoutNode = new RowNode(model, layoutWindow.windowId, json);

        if (json.children != null) {
            for (const jsonChild of json.children) {
                if (jsonChild.type === TabSetNode.TYPE) {
                    const child = TabSetNode.fromJson(jsonChild, model, layoutWindow);
                    newLayoutNode.addChild(child);
                } else {
                    const child = RowNode.fromJson(jsonChild, model, layoutWindow);
                    newLayoutNode.addChild(child);
                }
            }
        }

        return newLayoutNode;
    }

    /** @internal */
    private static attributeDefinitions: AttributeDefinitions = RowNode.createAttributeDefinitions();

    /** @internal */
    private windowId: string;
    /** @internal */
    private minHeight: number;
    /** @internal */
    private minWidth: number;
    /** @internal */
    private maxHeight: number;
    /** @internal */
    private maxWidth: number;

    /** @internal */
    constructor(model: Model, windowId: string, json: any) {
        super(model);

        this.windowId = windowId;
        this.minHeight = DefaultMin;
        this.minWidth = DefaultMin;
        this.maxHeight = DefaultMax;
        this.maxWidth = DefaultMax;
        RowNode.attributeDefinitions.fromJson(json, this.attributes);
        this.normalizeWeights();
        model.addNode(this);
    }

    getWeight() {
        return this.attributes.weight as number;
    }

    toJson(): IJsonRowNode {
        const json: any = {};
        RowNode.attributeDefinitions.toJson(json, this.attributes);

        json.children = [];
        for (const child of this.children) {
            json.children.push(child.toJson());
        }

        return json;
    }

    /** @internal */
    getWindowId() {
        return this.windowId;
    }

    setWindowId(windowId: string) {
        this.windowId = windowId;
    }

    /** @internal */
    setWeight(weight: number) {
        this.attributes.weight = weight;
    }

    /** @internal */
    getSplitterBounds(index: number) {
        const h = this.getOrientation() === Orientation.HORZ;
        const c = this.getChildren();
        const ss = this.model.getSplitterSize();
        const fr = c[0].getRect();
        const lr = c[c.length - 1].getRect();
        let p = h ? [fr.x, lr.getRight()] : [fr.y, lr.getBottom()];
        const q = h ? [fr.x, lr.getRight()] : [fr.y, lr.getBottom()];

        for (let i = 0; i < index; i++) {
            const n = c[i] as TabSetNode | RowNode;
            p[0] += h ? n.getMinWidth() : n.getMinHeight();
            q[0] += h ? n.getMaxWidth() : n.getMaxHeight();
            if (i > 0) {
                p[0] += ss;
                q[0] += ss;
            }
        }

        for (let i = c.length - 1; i >= index; i--) {
            const n = c[i] as TabSetNode | RowNode;
            p[1] -= (h ? n.getMinWidth() : n.getMinHeight()) + ss;
            q[1] -= (h ? n.getMaxWidth() : n.getMaxHeight()) + ss;
        }

        p = [Math.max(q[1], p[0]), Math.min(q[0], p[1])];

        return p;
    }

    /** @internal */
    getSplitterInitials(index: number) {
        const h = this.getOrientation() === Orientation.HORZ;
        const c = this.getChildren();
        const ss = this.model.getSplitterSize();
        const initialSizes = [];

        let sum = 0;

        for (let i = 0; i < c.length; i++) {
            const n = c[i] as TabSetNode | RowNode;
            const r = n.getRect();
            const s = h ? r.width : r.height;
            initialSizes.push(s);
            sum += s;
        }

        const startRect = c[index].getRect()
        const startPosition = (h ? startRect.x : startRect.y) - ss;

        return { initialSizes, sum, startPosition };
    }

    /** @internal */
    calculateSplit(index: number, splitterPos: number, initialSizes: number[], sum: number, startPosition: number) {
        const h = this.getOrientation() === Orientation.HORZ;
        const c = this.getChildren();
        const sn = c[index] as TabSetNode | RowNode;
        const smax = h ? sn.getMaxWidth() : sn.getMaxHeight();

        const sizes = [...initialSizes];

        if (splitterPos < startPosition) { // moved left
            let shift = startPosition - splitterPos;
            let altShift = 0;
            if (sizes[index] + shift > smax) {
                altShift = sizes[index] + shift - smax;
                sizes[index] = smax;
            } else {
                sizes[index] += shift;
            }

            for (let i = index - 1; i >= 0; i--) {
                const n = c[i] as TabSetNode | RowNode;
                const m = h ? n.getMinWidth() : n.getMinHeight();
                if (sizes[i] - shift > m) {
                    sizes[i] -= shift;
                    break;
                } else {
                    shift -= sizes[i] - m;
                    sizes[i] = m;
                }
            }

            for (let i = index+1; i < c.length; i++) {
                const n = c[i] as TabSetNode | RowNode;
                const m = h ? n.getMaxWidth() : n.getMaxHeight();
                if (sizes[i] + altShift < m) {
                    sizes[i] += altShift;
                    break;
                } else {
                    altShift -= m - sizes[i];
                    sizes[i] = m;
                }
            }


        } else {
            let shift = splitterPos - startPosition;
            let altShift = 0;
            if (sizes[index-1] + shift > smax) {
                altShift = sizes[index-1] + shift - smax;
                sizes[index-1] = smax;
            } else {
                sizes[index-1] += shift;
            }

            for (let i = index; i < c.length; i++) {
                const n = c[i] as TabSetNode | RowNode;
                const m = h ? n.getMinWidth() : n.getMinHeight();
                if (sizes[i] - shift > m) {
                    sizes[i] -= shift;
                    break;
                } else {
                    shift -= sizes[i] - m;
                    sizes[i] = m;
                }
            }

            for (let i = index - 1; i >= 0; i--) {
                const n = c[i] as TabSetNode | RowNode;
                const m = h ? n.getMaxWidth() : n.getMaxHeight();
                if (sizes[i] + altShift < m) {
                    sizes[i] += altShift;
                    break;
                } else {
                    altShift -= m - sizes[i];
                    sizes[i] = m;
                }
            }
        }

        // 0.1 is to prevent weight ever going to zero
        const weights = sizes.map(s => Math.max(0.1, s) * 100 / sum);

        // console.log(splitterPos, startPosition, "sizes", sizes);
        // console.log("weights",weights);
        return weights;
    }

    /** @internal */
    getMinSize(orientation: Orientation) {
        if (orientation === Orientation.HORZ) {
            return this.getMinWidth();
        } else {
            return this.getMinHeight();
        }
    }

    /** @internal */
    getMinWidth() {
        return this.minWidth;
    }

    /** @internal */
    getMinHeight() {
        return this.minHeight;
    }

    /** @internal */
    getMaxSize(orientation: Orientation) {
        if (orientation === Orientation.HORZ) {
            return this.getMaxWidth();
        } else {
            return this.getMaxHeight();
        }
    }

    /** @internal */
    getMaxWidth() {
        return this.maxWidth;
    }

    /** @internal */
    getMaxHeight() {
        return this.maxHeight;
    }

    /** @internal */
    calcMinMaxSize() {
        this.minHeight = DefaultMin;
        this.minWidth = DefaultMin;
        this.maxHeight = DefaultMax;
        this.maxWidth = DefaultMax;
        let first = true;
        for (const child of this.children) {
            const c = child as RowNode | TabSetNode;
            c.calcMinMaxSize();
            if (this.getOrientation() === Orientation.VERT) {
                this.minHeight += c.getMinHeight();
                this.maxHeight += c.getMaxHeight();
                if (!first) {
                    this.minHeight += this.model.getSplitterSize();
                    this.maxHeight += this.model.getSplitterSize();
                }
                this.minWidth = Math.max(this.minWidth, c.getMinWidth());
                this.maxWidth = Math.min(this.maxWidth, c.getMaxWidth());
            } else {
                this.minWidth += c.getMinWidth();
                this.maxWidth += c.getMaxWidth();
                if (!first) {
                    this.minWidth += this.model.getSplitterSize();
                    this.maxWidth += this.model.getSplitterSize();
                }
                this.minHeight = Math.max(this.minHeight, c.getMinHeight());
                this.maxHeight = Math.min(this.maxHeight, c.getMaxHeight());
            }
            first = false;
        }
    }

    /** @internal */
    tidy() {
        let i = 0;
        while (i < this.children.length) {
            const child = this.children[i];
            if (child instanceof RowNode) {
                child.tidy();

                const childChildren = child.getChildren();
                if (childChildren.length === 0) {
                    this.removeChild(child);
                } else if (childChildren.length === 1) {
                    // hoist child/children up to this level
                    const subchild = childChildren[0];
                    this.removeChild(child);
                    if (subchild instanceof RowNode) {
                        let subChildrenTotal = 0;
                        const subChildChildren = subchild.getChildren();
                        for (const ssc of subChildChildren) {
                            const subsubChild = ssc as RowNode | TabSetNode;
                            subChildrenTotal += subsubChild.getWeight();
                        }
                        for (let j = 0; j < subChildChildren.length; j++) {
                            const subsubChild = subChildChildren[j] as RowNode | TabSetNode;
                            subsubChild.setWeight((child.getWeight() * subsubChild.getWeight()) / subChildrenTotal);
                            this.addChild(subsubChild, i + j);
                        }
                    } else {
                        subchild.setWeight(child.getWeight());
                        this.addChild(subchild, i);
                    }
                } else {
                    i++;
                }
            } else if (child instanceof TabSetNode && child.getChildren().length === 0) {
                if (child.isEnableDeleteWhenEmpty()) {
                    this.removeChild(child);
                    if (child === this.model.getMaximizedTabset(this.windowId)) {
                        this.model.setMaximizedTabset(undefined, this.windowId);
                    }
                } else {
                    i++;
                }
            } else {
                i++;
            }
        }

        // add tabset into empty root
        if (this === this.model.getRoot(this.windowId) && this.children.length === 0) {
            const callback = this.model.getOnCreateTabSet();
            let attrs = callback ? callback() : {};
            attrs = { ...attrs, selected: -1 };
            const child = new TabSetNode(this.model, attrs);
            this.model.setActiveTabset(child, this.windowId);
            this.addChild(child);
        }

    }

    /** @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
        const yy = y - this.rect.y;
        const xx = x - this.rect.x;
        const w = this.rect.width;
        const h = this.rect.height;
        const margin = 10; // height of edge rect
        const half = 50; // half width of edge rect
        let dropInfo;

        if (this.getWindowId() !== Model.MAIN_WINDOW_ID && !canDockToWindow(dragNode)) {
            return undefined;
        }

        if (this.model.isEnableEdgeDock() && this.parent === undefined) {
            if (x < this.rect.x + margin && yy > h / 2 - half && yy < h / 2 + half) {
                const dockLocation = DockLocation.LEFT;
                const outlineRect = dockLocation.getDockRect(this.rect);
                outlineRect.width = outlineRect.width / 2;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
            } else if (x > this.rect.getRight() - margin && yy > h / 2 - half && yy < h / 2 + half) {
                const dockLocation = DockLocation.RIGHT;
                const outlineRect = dockLocation.getDockRect(this.rect);
                outlineRect.width = outlineRect.width / 2;
                outlineRect.x += outlineRect.width;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
            } else if (y < this.rect.y + margin && xx > w / 2 - half && xx < w / 2 + half) {
                const dockLocation = DockLocation.TOP;
                const outlineRect = dockLocation.getDockRect(this.rect);
                outlineRect.height = outlineRect.height / 2;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
            } else if (y > this.rect.getBottom() - margin && xx > w / 2 - half && xx < w / 2 + half) {
                const dockLocation = DockLocation.BOTTOM;
                const outlineRect = dockLocation.getDockRect(this.rect);
                outlineRect.height = outlineRect.height / 2;
                outlineRect.y += outlineRect.height;
                dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, CLASSES.FLEXLAYOUT__OUTLINE_RECT_EDGE);
            }

            if (dropInfo !== undefined) {
                if (!dragNode.canDockInto(dragNode, dropInfo)) {
                    return undefined;
                }
            }
        }

        return dropInfo;
    }

    /** @internal */
    drop(dragNode: Node, location: DockLocation, index: number): void {
        const dockLocation = location;

        const parent = dragNode.getParent();

        if (parent) {
            parent.removeChild(dragNode);
        }

        if (parent !== undefined && parent! instanceof TabSetNode) {
            parent.setSelected(0);
        }

        if (parent !== undefined && parent! instanceof BorderNode) {
            parent.setSelected(-1);
        }

        let node: TabSetNode | RowNode | undefined;
        if (dragNode instanceof TabSetNode || dragNode instanceof RowNode) {
            node = dragNode;
            // need to turn round if same orientation unless docking oposite direction
            if (node instanceof RowNode && node.getOrientation() === this.getOrientation() &&
                (location.getOrientation() === this.getOrientation() || location === DockLocation.CENTER)) {
                node = new RowNode(this.model, this.windowId, {});
                node.addChild(dragNode);
            }
        } else {
            const callback = this.model.getOnCreateTabSet();
            node = new TabSetNode(this.model, callback ? callback(dragNode as TabNode) : {});
            node.addChild(dragNode);
        }
        let size = this.children.reduce((sum, child) => {
            return sum + (child as RowNode | TabSetNode).getWeight();
        }, 0);

        if (size === 0) {
            size = 100;
        }

        node.setWeight(size / 3);

        const horz = !this.model.isRootOrientationVertical();
        if (dockLocation === DockLocation.CENTER) {
            if (index === -1) {
                this.addChild(node, this.children.length);
            } else {
                this.addChild(node, index);
            }
        } else if (horz && dockLocation === DockLocation.LEFT || !horz && dockLocation === DockLocation.TOP) {
            this.addChild(node, 0);
        } else if (horz && dockLocation === DockLocation.RIGHT || !horz && dockLocation === DockLocation.BOTTOM) {
            this.addChild(node);
        } else if (horz && dockLocation === DockLocation.TOP || !horz && dockLocation === DockLocation.LEFT) {
            const vrow = new RowNode(this.model, this.windowId, {});
            const hrow = new RowNode(this.model, this.windowId, {});
            hrow.setWeight(75);
            node.setWeight(25);
            for (const child of this.children) {
                hrow.addChild(child);
            }
            this.removeAll();
            vrow.addChild(node);
            vrow.addChild(hrow);
            this.addChild(vrow);
        } else if (horz && dockLocation === DockLocation.BOTTOM || !horz && dockLocation === DockLocation.RIGHT) {
            const vrow = new RowNode(this.model, this.windowId, {});
            const hrow = new RowNode(this.model, this.windowId, {});
            hrow.setWeight(75);
            node.setWeight(25);
            for (const child of this.children) {
                hrow.addChild(child);
            }
            this.removeAll();
            vrow.addChild(hrow);
            vrow.addChild(node);
            this.addChild(vrow);
        }

        if (node instanceof TabSetNode) {
            this.model.setActiveTabset(node, this.windowId);
        }

        this.model.tidy();
    }



    /** @internal */
    isEnableDrop() {
        return true;
    }

    /** @internal */
    getAttributeDefinitions() {
        return RowNode.attributeDefinitions;
    }

    /** @internal */
    updateAttrs(json: any) {
        RowNode.attributeDefinitions.update(json, this.attributes);
    }

    /** @internal */
    static getAttributeDefinitions() {
        return RowNode.attributeDefinitions;
    }


    // NOTE:  flex-grow cannot have values < 1 otherwise will not fill parent, need to normalize 
    normalizeWeights() {
        let sum = 0;
        for (const n of this.children) {
            const node = (n as TabSetNode | RowNode);
            sum += node.getWeight();
        }

        if (sum === 0) {
            sum = 1;
        }

        for (const n of this.children) {
            const node = (n as TabSetNode | RowNode);
            node.setWeight(Math.max(0.001, 100 * node.getWeight() / sum));
        }
    }

    /** @internal */
    private static createAttributeDefinitions(): AttributeDefinitions {
        const attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", RowNode.TYPE, true).setType(Attribute.STRING).setFixed();
        attributeDefinitions.add("id", undefined).setType(Attribute.STRING).setDescription(
            `the unique id of the row, if left undefined a uuid will be assigned`
        );
        attributeDefinitions.add("weight", 100).setType(Attribute.NUMBER).setDescription(
            `relative weight for sizing of this row in parent row`
        );

        return attributeDefinitions;
    }
}
