import Node from "./Node";
import Model from "./Model";
import Rect from "../Rect";
import DockLocation from "../DockLocation";
import Orientation from "../Orientation";
import DropInfo from "../DropInfo";
import TabNode from "./TabNode";
import TabSetNode from "./TabSetNode";
import SplitterNode from "./SplitterNode";
import Attribute from "../Attribute";
import AttributeDefinitions from "../AttributeDefinitions";
import IDropTarget from "./IDropTarget";
import IDraggable from "./IDraggable";

class BorderNode extends Node implements IDropTarget{
	public static readonly TYPE = "border";
    /** @hidden @internal */
    private static _attributeDefinitions: AttributeDefinitions = BorderNode._createAttributeDefinitions();

    /** @hidden @internal */
	private _contentRect?: Rect;
    /** @hidden @internal */
	private _tabHeaderRect?: Rect;
    /** @hidden @internal */
	private _location: DockLocation;
    /** @hidden @internal */
	private _drawChildren: Array<Node>;
    /** @hidden @internal */
	private _adjustedSize: number = 0;

	/** @hidden @internal */
	constructor(location: DockLocation, json: any, model: Model) {
		super(model);

		this._location = location;
		this._drawChildren = [];
		this._attributes["id"] = `border_${location.getName()}`;
		BorderNode._attributeDefinitions.fromJson(json, this._attributes);
		model._addNode(this);
	}

	getLocation() {
		return this._location;
	}

	getTabHeaderRect() {
		return this._tabHeaderRect;
	}

	getContentRect() {
		return this._contentRect;
	}

	isEnableDrop() {
		return this._getAttr("enableDrop") as boolean;
	}

	getClassName() {
        return this._getAttributeAsStringOrUndefined("className");
	}

	getBorderBarSize() {
		return this._getAttr("barSize") as number;
	}

	getSize() {
		return this._attributes["size"] as number;
	}

	getSelected(): number {
		return this._attributes["selected"] as number;
	}

	getSelectedNode(): Node | undefined {
		if (this.getSelected() !== -1) {
			return this._children[this.getSelected()];
		}
		return undefined;
	}

	getOrientation() {
		return this._location.getOrientation();
	}

	isMaximized() {
		return false;
	}

	isShowing() {
		return this._attributes["show"] as boolean;
	}

	/** @hidden @internal */
	_setSelected(index: number) {
		this._attributes["selected"] = index;
	}

	/** @hidden @internal */
	_setSize(pos: number) {
		this._attributes["size"] = pos;
	}

	/** @hidden @internal */
	_updateAttrs(json: any) {
		BorderNode._attributeDefinitions.update(json, this._attributes);
	}

	/** @hidden @internal */
	_getDrawChildren() {
		return this._drawChildren;
	}

	/** @hidden @internal */
	_setAdjustedSize(size: number) {
		this._adjustedSize = size;
	}

	/** @hidden @internal */
	_getAdjustedSize() {
		return this._adjustedSize;
	}

	/** @hidden @internal */
	_layoutBorderOuter(outer :Rect) {
		const split1 = this._location.split(outer, this.getBorderBarSize()); // split border outer
		this._tabHeaderRect = split1.start;
		return split1.end;
	}

	/** @hidden @internal */
	_layoutBorderInner(inner: Rect) {
		this._drawChildren = [];
		const location = this._location;

		const split1 =
			location.split(inner, this._adjustedSize + this._model.getSplitterSize()); // split off tab contents
		const split2 =
			location.reflect().split(split1.start, this._model.getSplitterSize()); // split contents into content and splitter

		this._contentRect = split2.end;

		this._children.forEach((child, i) => {
			child._layout(this._contentRect!);
			child._setVisible(i === this.getSelected());
			this._drawChildren.push(child);
		});

		if (this.getSelected() == -1) {
			return inner;
		} else {
			const newSplitter = new SplitterNode(this._model);
			newSplitter._setParent(this);
			newSplitter._setRect(split2.start);
			this._drawChildren.push(newSplitter);

			return split1.end;
		}
	}

	/** @hidden @internal */
	_remove(node: TabNode) {
		if (this.getSelected() !== -1) {
			const selectedNode = this._children[this.getSelected()];
			if (node === selectedNode) {
				this._setSelected(-1);
				this._removeChild(node);
			} else {
				this._removeChild(node);
				for (let i = 0; i < this._children.length; i++) {
					if (this._children[i] === selectedNode) {
						this._setSelected(i);
						break;
					}
				}
			}
		} else {
			this._removeChild(node);
		}
	}

	/** @hidden @internal */
	canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
		if (dragNode.getType() !== TabNode.TYPE) {
			return undefined;
		}

		let dropInfo = undefined;
		const dockLocation = DockLocation.CENTER;

		if (this._tabHeaderRect!.contains(x, y)) {
			if (this._location._orientation === Orientation.VERT) {
				if (this._children.length > 0) {
					let child = this._children[0];
					let childRect = (child as TabNode).getTabRect()!;
					const childY = childRect.y;

					const childHeight = childRect.height;

					let pos = this._tabHeaderRect!.x;
					let childCenter = 0;
					for (let i = 0; i < this._children.length; i++) {
						child = this._children[i];
						childRect = (child as TabNode).getTabRect()!;
						childCenter = childRect.x + childRect.width / 2;
						if (x >= pos && x < childCenter) {
							let outlineRect = new Rect(childRect.x - 2, childY, 3, childHeight);
							dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
							break;
						}
						pos = childCenter;
					}
					if (dropInfo == undefined) {
						let outlineRect = new Rect(childRect.getRight() - 2, childY, 3, childHeight);
						dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
					}
				} else {
					let outlineRect = new Rect(this._tabHeaderRect!.x + 1, this._tabHeaderRect!.y + 2, 3, 18);
					dropInfo = new DropInfo(this, outlineRect, dockLocation, 0, "flexlayout__outline_rect");

				}
			} else {
				if (this._children.length > 0) {
					let child = this._children[0];
					let childRect = (child as TabNode).getTabRect()!;
					const childX = childRect.x;
					const childWidth = childRect.width;

					let pos = this._tabHeaderRect!.y;
					let childCenter = 0;
					for (let i = 0; i < this._children.length; i++) {
						child = this._children[i];
						childRect = (child as TabNode).getTabRect()!;
						childCenter = childRect.y + childRect.height / 2;
						if (y >= pos && y < childCenter) {
							let outlineRect = new Rect(childX, childRect.y - 2, childWidth, 3);
							dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
							break;
						}
						pos = childCenter;
					}
					if (dropInfo == undefined) {
						let outlineRect = new Rect(childX, childRect.getBottom() - 2, childWidth, 3);
						dropInfo = new DropInfo(this, outlineRect, dockLocation, this._children.length, "flexlayout__outline_rect");
					}
				} else {
					let outlineRect = new Rect(this._tabHeaderRect!.x + 2, this._tabHeaderRect!.y + 1, 18, 3);
					dropInfo = new DropInfo(this, outlineRect, dockLocation, 0, "flexlayout__outline_rect");
				}

			}
			if (!dragNode._canDockInto(dragNode, dropInfo)) {
				return undefined;
			}
		} else if (this.getSelected() !== -1 && this._contentRect!.contains(x, y)) {
			let outlineRect = this._contentRect;
			dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, "flexlayout__outline_rect");
			if (!dragNode._canDockInto(dragNode, dropInfo)) {
				return undefined;
			}
		}

		return dropInfo;
	}

	/** @hidden @internal */
	drop(dragNode: (Node & IDraggable), location: DockLocation, index: number): void {
		let fromIndex = 0;
		let parent: Node | undefined = dragNode.getParent();
		if (parent !== undefined) {
			fromIndex = parent._removeChild(dragNode);
		}

		// if dropping a tab back to same tabset and moving to forward position then reduce insertion index
		if (dragNode.getType() === TabNode.TYPE && parent === this && fromIndex < index && index > 0) {
			index--;
		}

		// for the tabset/border being removed from set the selected index
		if (parent !== undefined) {
			if (parent instanceof TabSetNode) {
				parent._setSelected(0);
			} else if (parent instanceof BorderNode) {
				if (parent.getSelected() !== -1) {
					if (fromIndex === parent.getSelected() && parent._children.length > 0) {
						parent._setSelected(0);
					} else if (fromIndex < parent.getSelected()) {
						parent._setSelected(parent.getSelected() - 1);
					} else if (fromIndex > parent.getSelected()) {
						// leave selected index as is
					} else {
						parent._setSelected(-1);
					}
				}
			}
		}

		// simple_bundled dock to existing tabset
		let insertPos = index;
		if (insertPos === -1) {
			insertPos = this._children.length;
		}

		if (dragNode.getType() === TabNode.TYPE) {
			this._addChild(dragNode, insertPos);
		}

		if (this.getSelected() !== -1) { // already open
			this._setSelected(insertPos);
		}

		this._model._tidy();
	}

	/** @hidden @internal */
	_toJson() {
		const json: any = {};
		BorderNode._attributeDefinitions.toJson(json, this._attributes);
		json.location = this._location.getName();
		json.children = this._children.map((child) => (child as TabNode)._toJson());
		return json;
	}

	/** @hidden @internal */
	static _fromJson(json: any, model: Model) {

		const location = DockLocation.getByName(json.location);
		const border = new BorderNode(location, json, model);
		if (json.children) {
			border._children = json.children.map((jsonChild: any) => {
				const child = TabNode._fromJson(jsonChild, model);
				child._setParent(border);
				return child;
			});
		}

		return border;
	}

	/** @hidden @internal */
	_getSplitterBounds(splitter: SplitterNode) {
		const pBounds = [0, 0];
		const outerRect = this._model._getOuterInnerRects().outer;
		const innerRect = this._model._getOuterInnerRects().inner;
		if (this._location === DockLocation.TOP) {
			pBounds[0] = outerRect.y;
			pBounds[1] = innerRect.getBottom() - splitter.getHeight();
		} else if (this._location === DockLocation.LEFT) {
			pBounds[0] = outerRect.x;
			pBounds[1] = innerRect.getRight() - splitter.getWidth();
		} else if (this._location === DockLocation.BOTTOM) {
			pBounds[0] = innerRect.y;
			pBounds[1] = outerRect.getBottom() - splitter.getHeight();
		} else if (this._location === DockLocation.RIGHT) {
			pBounds[0] = innerRect.x;
			pBounds[1] = outerRect.getRight() - splitter.getWidth();
		}
		return pBounds;
	}

	/** @hidden @internal */
	_calculateSplit(splitter: SplitterNode, splitterPos: number) {
		const pBounds = this._getSplitterBounds(splitter);
		if (this._location === DockLocation.BOTTOM || this._location === DockLocation.RIGHT) {
			return Math.max(0, pBounds[1] - splitterPos);
		} else {
			return Math.max(0, splitterPos - pBounds[0]);
		}
	}

	/** @hidden @internal */
	_getAttributeDefinitions() {
		return BorderNode._attributeDefinitions;
	}

	/** @hidden @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {

		let attributeDefinitions = new AttributeDefinitions();
		attributeDefinitions.add("type", BorderNode.TYPE, true);

		attributeDefinitions.add("size", 200);
		attributeDefinitions.add("selected", -1);
		attributeDefinitions.add("show", true).setType(Attribute.BOOLEAN);

		attributeDefinitions.addInherited("barSize", "borderBarSize").setType(Attribute.INT).setFrom(0);
		attributeDefinitions.addInherited("enableDrop", "borderEnableDrop").setType(Attribute.BOOLEAN);
		attributeDefinitions.addInherited("className", "borderClassName").setType(Attribute.STRING);
		return attributeDefinitions;
	}
}


export default BorderNode;
