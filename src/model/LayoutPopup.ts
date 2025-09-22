import { Rect } from "../Rect";
import { IJsonPopup } from "./IJsonModel";
import { Model } from "./Model";
import { RowNode } from "./RowNode";
import { Node } from "./Node";
import { TabSetNode } from "./TabSetNode";
import { LayoutInternal } from "../view/Layout";

export class LayoutPopup {
    private _windowId: string;
    private _layout: LayoutInternal | undefined;
    private _rect: Rect;
    private _window?: Window | undefined;
    private _root?: RowNode | undefined;
    private _maximizedTabSet?: TabSetNode | undefined;
    private _activeTabSet?: TabSetNode | undefined;
    private _toScreenRectFunction: (rect: Rect) => Rect;
    private _isDockingMode: boolean = false;

    constructor(windowId: string, rect: Rect) {
        this._windowId = windowId;
        this._rect = rect;
        this._toScreenRectFunction = (r) => r;
    }

    public visitNodes(fn: (node: Node, level: number) => void) {
        this.root!.forEachNode(fn, 0);
    }

    public get windowId(): string {
        return this._windowId;
    }

    public get rect(): Rect {
        return this._rect;
    }

    public get layout(): LayoutInternal | undefined {
        return this._layout;
    }

    public get window(): Window | undefined {
        return this._window;
    }

    public get root(): RowNode | undefined {
        return this._root;
    }

    public get maximizedTabSet(): TabSetNode | undefined {
        return this._maximizedTabSet;
    }

    public get isDockingMode(): boolean {
        return this._isDockingMode;
    }

    public get activeTabSet(): TabSetNode | undefined {
        return this._activeTabSet;
    }

    /** @internal */
    public set rect(value: Rect) {
        this._rect = value;
    }

    /** @internal */
    public set layout(value: LayoutInternal) {
        this._layout = value;
    }

    /** @internal */
    public set window(value: Window | undefined) {
        this._window = value;
    }

    /** @internal */
    public set root(value: RowNode | undefined) {
        this._root = value;
    }

    /** @internal */
    public set maximizedTabSet(value: TabSetNode | undefined) {
        this._maximizedTabSet = value;
    }

    /** @internal */
    public set isDockingMode(value: boolean) {
        this._isDockingMode = value;
    }

    /** @internal */
    public set activeTabSet(value: TabSetNode | undefined) {
        this._activeTabSet = value;
    }

    /** @internal */
    public get toScreenRectFunction(): (rect: Rect) => Rect {
        return this._toScreenRectFunction!;
    }

    /** @internal */
    public set toScreenRectFunction(value: (rect: Rect) => Rect) {
        this._toScreenRectFunction = value;
    }

    public toJson(): IJsonPopup {
        return { layout: this.root!.toJson(), rect: this.rect.toJson() }
    }

    static fromJson(windowJson: IJsonPopup, model: Model, windowId: string): LayoutPopup {
        const count = model.getwindowsMap().size;
        const rect = windowJson.rect ? Rect.fromJson(windowJson.rect) : new Rect(50 + 50 * count, 50 + 50 * count, 600, 400);
        rect.snap(10); // snapping prevents issue where window moves 1 pixel per save/restore on Chrome
        const layoutWindow = new LayoutPopup(windowId, rect);
        layoutWindow.root = RowNode.fromJson(windowJson.layout, model, layoutWindow);
        return layoutWindow;
    }
}