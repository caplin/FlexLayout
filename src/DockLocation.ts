import Orientation from "./Orientation";
import Rect from "./Rect";
import { JSMap } from "./Types";

class DockLocation {

    static values: JSMap<DockLocation> = {};
    static TOP = new DockLocation("top", Orientation.VERT, 0);
    static BOTTOM = new DockLocation("bottom", Orientation.VERT, 1);
    static LEFT = new DockLocation("left", Orientation.HORZ, 0);
    static RIGHT = new DockLocation("right", Orientation.HORZ, 1);
    static CENTER = new DockLocation("center", Orientation.VERT, 0);

    /** @hidden @internal */
    static getByName(name: string): DockLocation {
        return DockLocation.values[name];
    }

    /** @hidden @internal */
    static getLocation(rect: Rect, x: number, y: number) {
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

    /** @hidden @internal */
    _name: string;
    /** @hidden @internal */
    _orientation: Orientation;
    /** @hidden @internal */
    _indexPlus: number;

    /** @hidden @internal */
    constructor(name: string, orientation: Orientation, indexPlus: number) {
        this._name = name;
        this._orientation = orientation;
        this._indexPlus = indexPlus;
        DockLocation.values[this._name] = this;
    }

    getName() {
        return this._name;
    }

    getOrientation() {
        return this._orientation;
    }

    /** @hidden @internal */
    getDockRect(r: Rect) {
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

    /** @hidden @internal */
    split(rect: Rect, size: number) {
        if (this === DockLocation.TOP) {
            const r1 = new Rect(rect.x, rect.y, rect.width, size);
            const r2 = new Rect(rect.x, rect.y + size, rect.width, rect.height - size);
            return { start: r1, end: r2 };
        }
        else if (this === DockLocation.LEFT) {
            const r1 = new Rect(rect.x, rect.y, size, rect.height);
            const r2 = new Rect(rect.x + size, rect.y, rect.width - size, rect.height);
            return { start: r1, end: r2 };
        }
        if (this === DockLocation.RIGHT) {
            const r1 = new Rect(rect.getRight() - size, rect.y, size, rect.height);
            const r2 = new Rect(rect.x, rect.y, rect.width - size, rect.height);
            return { start: r1, end: r2 };
        }
        else {// if (this === DockLocation.BOTTOM) {
            const r1 = new Rect(rect.x, rect.getBottom() - size, rect.width, size);
            const r2 = new Rect(rect.x, rect.y, rect.width, rect.height - size);
            return { start: r1, end: r2 };
        }
    }

    /** @hidden @internal */
    reflect() {
        if (this === DockLocation.TOP) {
            return DockLocation.BOTTOM;
        }
        else if (this === DockLocation.LEFT) {
            return DockLocation.RIGHT;
        }
        if (this === DockLocation.RIGHT) {
            return DockLocation.LEFT;
        }
        else { // if (this === DockLocation.BOTTOM) {
            return DockLocation.TOP;
        }
    }

    toString() {
        return "(DockLocation: name=" + this._name + ", orientation=" + this._orientation + ")";
    }
}


export default DockLocation;

