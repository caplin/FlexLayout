import Rect from "./Rect.js";
import Orientation from "./Orientation.js";

class DockLocation
{
    constructor(name, orientation, indexPlus)
    {
        this.name = name;
        this.orientation = orientation;
        this.indexPlus = indexPlus;
    }

    static getLocation(rect, x, y)
    {
        if (x < rect.x + rect.width / 4)
        {
            return DockLocation.LEFT;
        }

        else if (x > rect.getRight() - rect.width / 4)
        {
            return DockLocation.RIGHT;
        }

        else if (y < rect.y + rect.height / 4)
        {
            return DockLocation.TOP;
        }

        else if (y > rect.getBottom() - rect.height / 4)
        {
            return DockLocation.BOTTOM;
        }
        else
        {
            return DockLocation.CENTER;
        }
    }

    getDockRect(r)
    {
        if (this == DockLocation.TOP)
        {
            return new Rect(r.x, r.y, r.width, r.height / 2);
        }
        else if (this == DockLocation.BOTTOM)
        {
            return new Rect(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
        }
        if (this == DockLocation.LEFT)
        {
            return new Rect(r.x, r.y, r.width / 2, r.height);
        }
        else if (this == DockLocation.RIGHT)
        {
            return new Rect(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
        }
        else
        {
            return r.clone();
        }
    }

    toString()
    {
        return "(DockLocation: name=" + this.name + ", orientation=" + this.orientation + ")";
    }
}

// statics
DockLocation.TOP = new DockLocation("top", Orientation.VERT, 0);
DockLocation.BOTTOM = new DockLocation("bottom", Orientation.VERT, 1);
DockLocation.LEFT = new DockLocation("left", Orientation.HORZ, 0);
DockLocation.RIGHT = new DockLocation("right", Orientation.HORZ, 1);
DockLocation.CENTER = new DockLocation("center", Orientation.VERT, 0);

export default DockLocation;

