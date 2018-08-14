import Node from "./Node";
import IDraggable from "./IDraggable";
import DropInfo from "../DropInfo";
import DockLocation from "../DockLocation";

export default interface IDropTarget {
/** @hidden @internal */
canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined;
/** @hidden @internal */
drop(dragNode: (Node & IDraggable), location: DockLocation, index: number): void;
/** @hidden @internal */
isEnableDrop(): boolean;

}
