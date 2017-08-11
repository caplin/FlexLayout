import JsonConverter from "../JsonConverter.js";
import Rect from "../Rect.js";
import DockLocation from "../DockLocation.js";
import Border from "./BorderNode.js";
import Orientation from "../Orientation.js";

class BorderSet {
    constructor(model) {
        this._model = model;
        this._borders = [];
    }

    getBorders() {
        return this._borders;
    }

    toJson() {
        let json = [];
        for (let i = 0; i < this._borders.length; i++) {
            json.push(this._borders[i]._toJson());
        }
        return json;
    }

    static fromJson(json, model) {
        let borderSet = new BorderSet(model);
        for (let i = 0; i < json.length; i++) {
            let borderJson = json[i];
            borderSet._borders.push(Border._fromJson(borderJson, model));
        }

        return borderSet;
    }

    _layout(outerInnerRects) {

        let rect = outerInnerRects.outer;
        let height = rect.height;
        let width = rect.width;
        let sumHeight = 0;
        let sumWidth = 0;
        let countHeight = 0;
        let countWidth = 0;

        for (let i = 0; i < this._borders.length; i++) {
            let border = this._borders[i];
            border._setAdjustedSize(border._size);
            if (border.getLocation().getOrientation() == Orientation.HORZ) {
                sumWidth += border._size + border._tabBarSize + this._model.getSplitterSize();
                countWidth++;
            }
            else {
                sumHeight += border._size + border._tabBarSize + this._model.getSplitterSize();
                countHeight++;
            }
        }

        if (sumWidth > width) {
            let overflow = sumWidth - width;
            let adjust = Math.floor(overflow / countHeight) + 1;
            for (let i = 0; i < this._borders.length; i++) {
                let border = this._borders[i];
                if (border.getLocation().getOrientation() == Orientation.HORZ) {
                    border._setAdjustedSize(border._size - adjust);
                }
            }
        }

        if (sumHeight > height) {
            let overflow = sumHeight - height;
            let adjust = Math.floor(overflow / countHeight) + 1;
            for (let i = 0; i < this._borders.length; i++) {
                let border = this._borders[i];
                if (border.getLocation().getOrientation() == Orientation.VERT) {
                    border._setAdjustedSize(border._size - adjust);
                }
            }
        }

        for (let i = 0; i < this._borders.length; i++) {
            let border = this._borders[i];
            outerInnerRects = border._layout(outerInnerRects);
        }
        return outerInnerRects;
    }

    _findDropTargetNode(dragNode, x, y) {
        for (let i = 0; i < this._borders.length; i++) {
            let border = this._borders[i];

            let dropInfo = border._canDrop(dragNode, x, y);
            if (dropInfo != null) {
                return dropInfo;
            }
        }
        return null;
    }
}

export default BorderSet;