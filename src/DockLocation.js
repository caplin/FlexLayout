import Rect from "./Rect.js";
import Orientation from "./Orientation.js";

const values = {};

class DockLocation {

    constructor(name, orientation, indexPlus) {
        this._name = name;
        this._orientation = orientation;
        this._indexPlus = indexPlus;
        values[this._name] = this;
    }

    getName() {
        return this._name;
    }

    getOrientation() {
        return this._orientation;
    }

    static getByName(name) {
        return values[name];
    }

    static getLocation(rect, x, y) {
        if (x < rect.x + rect.width / 4) {
            return DockLocation.LEFT;
        }

        else if (x > rect.getRight() - rect.width / 4) {
            return DockLocation.RIGHT;
        }

        else if (y < rect.y + rect.height / 4) {
            return DockLocation.TOP;
        }

        else if (y > rect.getBottom() - rect.height / 4) {
            return DockLocation.BOTTOM;
        }
        else {
            return DockLocation.CENTER;
        }
    }

    getDockRect(r) {
        if (this === DockLocation.TOP) {
            return new Rect(r.x, r.y, r.width, r.height / 2);
        }
        else if (this === DockLocation.BOTTOM) {
            return new Rect(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
        }
        if (this === DockLocation.LEFT) {
            return new Rect(r.x, r.y, r.width / 2, r.height);
        }
        else if (this === DockLocation.RIGHT) {
            return new Rect(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
        }
        else {
            return r.clone();
        }
    }

    split(rect, size) {
        if (this === DockLocation.TOP) {
            var r1 = new Rect(rect.x, rect.y, rect.width, size);
            var r2 = new Rect(rect.x, rect.y + size, rect.width, rect.height - size);
            return {start: r1, end: r2};
        }
        else if (this === DockLocation.LEFT) {
            var r1 = new Rect(rect.x, rect.y, size, rect.height);
            var r2 = new Rect(rect.x + size, rect.y, rect.width - size, rect.height);
            return {start: r1, end: r2};
        }
        if (this === DockLocation.RIGHT) {
            var r1 = new Rect(rect.getRight() - size, rect.y, size, rect.height);
            var r2 = new Rect(rect.x, rect.y, rect.width - size, rect.height);
            return {start: r1, end: r2};
        }
        else if (this === DockLocation.BOTTOM) {
            var r1 = new Rect(rect.x, rect.getBottom() - size, rect.width, size);
            var r2 = new Rect(rect.x, rect.y, rect.width, rect.height - size);
            return {start: r1, end: r2};
        }
    }

    reflect() {
        if (this === DockLocation.TOP) {
            return DockLocation.BOTTOM
        }
        else if (this === DockLocation.LEFT) {
            return DockLocation.RIGHT
        }
        if (this === DockLocation.RIGHT) {
            return DockLocation.LEFT
        }
        else if (this === DockLocation.BOTTOM) {
            return DockLocation.TOP
        }
    }

    toString() {
        return "(DockLocation: name=" + this._name + ", orientation=" + this._orientation + ")";
    }
}

// statics
DockLocation.TOP = new DockLocation("top", Orientation.VERT, 0);
DockLocation.BOTTOM = new DockLocation("bottom", Orientation.VERT, 1);
DockLocation.LEFT = new DockLocation("left", Orientation.HORZ, 0);
DockLocation.RIGHT = new DockLocation("right", Orientation.HORZ, 1);
DockLocation.CENTER = new DockLocation("center", Orientation.VERT, 0);

export default DockLocation;

