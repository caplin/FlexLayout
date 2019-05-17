import DockLocation from "../DockLocation";
import DropInfo from "../DropInfo";
import IDraggable from "./IDraggable";
import Node from "./Node";

export default interface IDropTarget {
  /** @hidden @internal */
  canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined;
  /** @hidden @internal */
  drop(dragNode: (Node & IDraggable), location: DockLocation, index: number): void;
  /** @hidden @internal */
  isEnableDrop(): boolean;

}
