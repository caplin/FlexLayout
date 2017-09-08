import Rect from "./Rect";
import Node from "./model/Node";
import DockLocation from "./DockLocation";
import IDropTarget from "./model/IDropTarget";

class DropInfo {
    node: (Node & IDropTarget);
    rect: Rect;
    location: DockLocation;
    index: number;
    className: string;

    constructor(node: (Node & IDropTarget), rect: Rect, location: DockLocation, index: number, className: string) {
        this.node = node;
        this.rect = rect;
        this.location = location;
        this.index = index;
        this.className = className;
    }
}
export default DropInfo;