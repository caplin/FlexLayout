import { DockLocation } from "../DockLocation";
import { DropInfo } from "../DropInfo";
import { IDraggable } from "./IDraggable";
import { Node } from "./Node";

export interface IDropTarget {
    /** @internal */
    canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined;
    /** @internal */
    drop(dragNode: Node & IDraggable, location: DockLocation, index: number, select?: boolean): void;
    /** @internal */
    isEnableDrop(): boolean;
}

