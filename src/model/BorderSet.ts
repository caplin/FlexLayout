import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import BorderNode from "./BorderNode";
import IDraggable from "./IDraggable";
import Model from "./Model";
import Node from "./Node";

class BorderSet {

  /** @hidden @internal */
  public static _fromJson(json: any, model: Model) {
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

  public getBorders() {
    return this._borders;
  }

  /** @hidden @internal */
  public _forEachNode(fn: (node: Node, level: number) => void) {
    this._borders.forEach((borderNode) => {
      fn(borderNode, 0);
      borderNode.getChildren().forEach((node) => {
        node._forEachNode(fn, 1);
      });
    });
  }

  /** @hidden @internal */
  public _toJson() {
    return this._borders.map((borderNode) => borderNode._toJson());
  }

  /** @hidden @internal */
  public _layoutBorder(outerInnerRects: { inner: Rect, outer: Rect }) {

    const rect = outerInnerRects.outer;
    const height = rect.height;
    const width = rect.width;
    let sumHeight = 0;
    let sumWidth = 0;
    let adjustableHeight = 0;
    let adjustableWidth = 0;

    const showingBorders = this._borders.filter((border) => border.isShowing());

    // sum size of borders to see they will fit
    for (let i = 0; i < showingBorders.length; i++) {
      const border = showingBorders[i];
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
    let i = 0;
    while ((sumWidth > width && adjustableWidth > 0)
      || (sumHeight > height && adjustableHeight > 0)) {
      const border = showingBorders[i];
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
      i = (i + 1) % showingBorders.length;
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
  public _findDropTargetNode(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
    for (let i = 0; i < this._borders.length; i++) {
      const border = this._borders[i];
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
