import { DockLocation } from "./DockLocation";
import { IDropTarget } from "./IDropTarget";
import { Node } from "./Node";
import { Rect } from "./Rect";

export class DropInfo {
    node: Node & IDropTarget;
    rect: Rect;
    location: DockLocation;
    index: number;
    className: string;

    constructor(node: Node & IDropTarget, rect: Rect, location: DockLocation, index: number, className: string) {
        this.node = node;
        this.rect = rect;
        this.location = location;
        this.index = index;
        this.className = className;
    }
}
