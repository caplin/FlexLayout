import Orientation from "./Orientation";
import Rect from "./Rect";

class DockLocation {
    static values: Record<string, DockLocation> = {};
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
        x = x - rect.x;
        y = y - rect.y;
        const h = rect.height;
        const w = rect.width;

        // not in center, use gradients to determine location
        if (x < w * 0.25 || x > w * 0.75 ||
            y < h * 0.25 || y > h * 0.75) {
            if (x !== 0 && w - x !== 0) { // prevent division by zero   
                const g = h / w;
                const g1 = y / x;
                const g2 = (h - y) / x;
                const g3 = (h - y) / (w - x);
                const g4 = y / (w - x);

                if (g1 >= g && g2 >= g) {
                    return DockLocation.LEFT;
                } else if (g3 >= g && g4 >= g) {
                    return DockLocation.RIGHT;
                } else if (g1 <= g && g4 <= g) {
                    return DockLocation.TOP;
                } else if (g2 <= g && g3 <= g) {
                    return DockLocation.BOTTOM;
                }
            }
        }
        return DockLocation.CENTER;
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
        } else if (this === DockLocation.BOTTOM) {
            return new Rect(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
        }
        if (this === DockLocation.LEFT) {
            return new Rect(r.x, r.y, r.width / 2, r.height);
        } else if (this === DockLocation.RIGHT) {
            return new Rect(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
        } else {
            return r.clone();
        }
    }

    /** @hidden @internal */
    split(rect: Rect, size: number) {
        if (this === DockLocation.TOP) {
            const r1 = new Rect(rect.x, rect.y, rect.width, size);
            const r2 = new Rect(rect.x, rect.y + size, rect.width, rect.height - size);
            return { start: r1, end: r2 };
        } else if (this === DockLocation.LEFT) {
            const r1 = new Rect(rect.x, rect.y, size, rect.height);
            const r2 = new Rect(rect.x + size, rect.y, rect.width - size, rect.height);
            return { start: r1, end: r2 };
        }
        if (this === DockLocation.RIGHT) {
            const r1 = new Rect(rect.getRight() - size, rect.y, size, rect.height);
            const r2 = new Rect(rect.x, rect.y, rect.width - size, rect.height);
            return { start: r1, end: r2 };
        } else {
            // if (this === DockLocation.BOTTOM) {
            const r1 = new Rect(rect.x, rect.getBottom() - size, rect.width, size);
            const r2 = new Rect(rect.x, rect.y, rect.width, rect.height - size);
            return { start: r1, end: r2 };
        }
    }

    /** @hidden @internal */
    reflect() {
        if (this === DockLocation.TOP) {
            return DockLocation.BOTTOM;
        } else if (this === DockLocation.LEFT) {
            return DockLocation.RIGHT;
        }
        if (this === DockLocation.RIGHT) {
            return DockLocation.LEFT;
        } else {
            // if (this === DockLocation.BOTTOM) {
            return DockLocation.TOP;
        }
    }

    toString() {
        return "(DockLocation: name=" + this._name + ", orientation=" + this._orientation + ")";
    }
}

export default DockLocation;
