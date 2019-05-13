export default interface IDraggable {
  /** @hidden @internal */
  isEnableDrag(): boolean;
  /** @hidden @internal */
  getName(): string | undefined;
}
