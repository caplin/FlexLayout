import Orientation from "./Orientation.js";

class Rect {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    clone() {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    equals(rect) {
        if (this.x === rect.x
            && this.y === rect.y
            && this.width === rect.width
            && this.height === rect.height) {
            return true;
        }
        else {
            return false;
        }
    }

    getBottom() {
        return this.y + this.height;
    }

    getRight() {
        return this.x + this.width;
    }

    positionElement(element) {
        this.styleWithPosition(element.style);
    }

    styleWithPosition(style) {
        style.left = this.x + "px";
        style.top = this.y + "px";
        style.width = Math.max(0, this.width) + "px"; // need Math.max to prevent -ve, cause error in IE
        style.height = Math.max(0, this.height) + "px";
        style.position = "absolute";
        return style;
    }

    contains(x, y) {
        if (this.x <= x && x <= this.getRight()
            && this.y <= y && y <= this.getBottom()) {
            return true;
        }
        else {
            return false;
        }
    }

    centerInRect(outerRect) {
        this.x = (outerRect.width - this.width) / 2;
        this.y = (outerRect.height - this.height) / 2;
    }


    _getSize(orientation) {
        let prefSize = this.width;
        if (orientation === Orientation.VERT) {
            prefSize = this.height;
        }
        return prefSize;
    }

    toString() {
        return "(Rect: x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";
    }
}

export default Rect;

