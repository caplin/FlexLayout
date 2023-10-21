import { Orientation } from "./Orientation";

export class Rect {
    static empty() {
        return new Rect(0, 0, 0, 0);
    }

    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static fromElement(element: Element) {
        let { x, y, width, height } = element.getBoundingClientRect();
        return new Rect(x, y, width, height);
    }

    clone() {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    equals(rect: Rect | null | undefined) {
        return this.x === rect?.x && this.y === rect?.y && this.width === rect?.width && this.height === rect?.height
    }

    getBottom() {
        return this.y + this.height;
    }

    getRight() {
        return this.x + this.width;
    }

    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    positionElement(element: HTMLElement, position?: string) {
        this.styleWithPosition(element.style, position);
    }

    styleWithPosition(style: Record<string, any>, position: string = "absolute") {
        style.left = this.x + "px";
        style.top = this.y + "px";
        style.width = Math.max(0, this.width) + "px"; // need Math.max to prevent -ve, cause error in IE
        style.height = Math.max(0, this.height) + "px";
        style.position = position;
        return style;
    }

    contains(x: number, y: number) {
        if (this.x <= x && x <= this.getRight() && this.y <= y && y <= this.getBottom()) {
            return true;
        } else {
            return false;
        }
    }

    removeInsets(insets: { top: number; left: number; bottom: number; right: number }) {
        return new Rect(this.x + insets.left, this.y + insets.top, Math.max(0, this.width - insets.left - insets.right), Math.max(0, this.height - insets.top - insets.bottom));
    }

    centerInRect(outerRect: Rect) {
        this.x = (outerRect.width - this.width) / 2;
        this.y = (outerRect.height - this.height) / 2;
    }

    /** @internal */
    _getSize(orientation: Orientation) {
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
