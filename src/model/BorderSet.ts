import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import BorderNode from "./BorderNode";
import IDraggable from "./IDraggable";
import Model from "./Model";
import Node from "./Node";

class BorderSet {

  /** @hidden @internal */
  static _fromJson(json: any, model: Model) {
    const borderSet = new BorderSet(model);
    borderSet._borders = json.map((borderJson: any) => BorderNode._fromJson(borderJson, model));
    return borderSet;
  }
  /** @hidden @internal */
  private _model: Model;
  /** @hidden @internal */
  private _borders: BorderNode[];

  /** @hidden @internal */
  constructor(model: Model) {
    this._model = model;
    this._borders = [];
  }

  getBorders() {
    return this._borders;
  }

  /** @hidden @internal */
  _forEachNode(fn: (node: Node, level: number) => void) {
    this._borders.forEach((borderNode) => {
      fn(borderNode, 0);
      borderNode.getChildren().forEach((node) => {
        node._forEachNode(fn, 1);
      });
    });
  }

  /** @hidden @internal */
  _toJson() {
    return this._borders.map((borderNode) => borderNode._toJson());
  }

  /** @hidden @internal */
  _layoutBorder(outerInnerRects: { inner: Rect, outer: Rect }) {

    const rect = outerInnerRects.outer;
    const height = rect.height;
    const width = rect.width;
    let sumHeight = 0;
    let sumWidth = 0;
    let adjustableHeight = 0;
    let adjustableWidth = 0;

    const showingBorders = this._borders.filter((border) => border.isShowing());

    // sum size of borders to see they will fit
    for (const border of showingBorders) {
      if (border.isShowing()) {
        border._setAdjustedSize(border.getSize());
        const visible = border.getSelected() !== -1;
        if (border.getLocation().getOrientation() === Orientation.HORZ) {
          sumWidth += border.getBorderBarSize() + this._model.getSplitterSize();
          if (visible) {
            sumWidth += border.getSize();
            adjustableWidth += border.getSize();
          }
        }
        else {
          sumHeight += border.getBorderBarSize() + this._model.getSplitterSize();
          if (visible) {
            sumHeight += border.getSize();
            adjustableHeight += border.getSize();
          }
        }
      }
    }

    // adjust border sizes if too large
    let j = 0;
    while ((sumWidth > width && adjustableWidth > 0)
      || (sumHeight > height && adjustableHeight > 0)) {
      const border = showingBorders[j];
      if (border.getSelected() !== -1) { // visible
        const size = border._getAdjustedSize();
        if (sumWidth > width && adjustableWidth > 0
          && border.getLocation().getOrientation() === Orientation.HORZ
          && size > 0) {
          border._setAdjustedSize(size - 1);
          sumWidth--;
          adjustableWidth--;
        }
        else if (sumHeight > height && adjustableHeight > 0
          && border.getLocation().getOrientation() === Orientation.VERT
          && size > 0) {
          border._setAdjustedSize(size - 1);
          sumHeight--;
          adjustableHeight--;
        }
      }
      j = (j + 1) % showingBorders.length;
    }

    showingBorders.forEach((border) => {
      outerInnerRects.outer = border._layoutBorderOuter(outerInnerRects.outer);
    });

    outerInnerRects.inner = outerInnerRects.outer;

    showingBorders.forEach((border) => {
      outerInnerRects.inner = border._layoutBorderInner(outerInnerRects.inner);
    });
    return outerInnerRects;
  }

  /** @hidden @internal */
  _findDropTargetNode(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
    for (const border of this._borders) {
      if (border.isShowing()) {
        const dropInfo = border.canDrop(dragNode, x, y);
        if (dropInfo !== undefined) {
          return dropInfo;
        }
      }
    }
    return undefined;
  }
}

export default BorderSet;
