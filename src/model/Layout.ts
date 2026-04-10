import { Rect } from "./Rect";
import { IJsonSubLayout } from "./IJsonModel";
import { Model } from "./Model";
import { RowNode } from "./RowNode";
import { Node } from "./Node";
import { TabSetNode } from "./TabSetNode";
import { LayoutController } from "../view/layout/LayoutInternal";
import { ILayoutType } from "./IJsonModel";

/** @internal */
export class Layout {
    private _layoutId: string;
    private _type: ILayoutType;
    private _rect: Rect;

    private _controller: LayoutController | undefined;
    private _rootRow?: RowNode | undefined;
    private _maximizedTabSet?: TabSetNode | undefined;
    private _activeTabSet?: TabSetNode | undefined;
    private _toExportRectFunction: (rect: Rect, type: ILayoutType) => Rect;

    constructor(layoutId: string, type: ILayoutType, rect: Rect) {
        this._layoutId = layoutId;
        this._type = type;
        this._rect = rect;
        this._toExportRectFunction = (r, type) => r;
    }

    visitNodes(fn: (node: Node, level: number) => void) {
        this.getRootRow()?.forEachNode(fn, 0);
    }

    isMainLayout() {
        return this._layoutId === Model.MAIN_LAYOUT_ID;
    }

    getLayoutId(): string {
        return this._layoutId;
    }

    getType(): ILayoutType {
        return this._type;
    }

    setType(value: ILayoutType) {
        this._type = value;
    }

    getRect(): Rect {
        return this._rect;
    }

    getController(): LayoutController | undefined {
        return this._controller;
    }

    getWindow(): Window | undefined {
        return this._controller?.getCurrentWindow();
    }

    getRootRow(): RowNode | undefined {
        return this._rootRow;
    }

    getMaximizedTabSet(): TabSetNode | undefined {
        return this._maximizedTabSet;
    }

    getActiveTabSet(): TabSetNode | undefined {
        return this._activeTabSet;
    }

    setRect(value: Rect) {
        this._rect = value;
    }

    setController(value: LayoutController | undefined) {
        this._controller = value;
    }

    getWindowId(): string | undefined {
        return this._controller?.getWindowId();
    }

    setRootRow(rowNode: RowNode | undefined) {
        rowNode?.setLayout(this);
        this._rootRow = rowNode;
    }

    setMaximizedTabSet(value: TabSetNode | undefined) {
        this._maximizedTabSet = value;
    }

    setActiveTabSet(value: TabSetNode | undefined) {
        this._activeTabSet = value;
    }

    getToExportRectFunction(): (rect: Rect, type: ILayoutType) => Rect {
        return this._toExportRectFunction!;
    }

    setToExportRectFunction(value: (rect: Rect, type: ILayoutType) => Rect) {
        this._toExportRectFunction = value;
    }

    toJson(): IJsonSubLayout {
        // chrome sets top,left to large -ve values when minimized, dont save in this case
        if (this.getType() === "window" && this.getWindow() && this.getWindow()!.screenTop > -10000) {
            this.setRect(new Rect(
                this.getWindow()!.screenLeft,
                this.getWindow()!.screenTop,
                this.getWindow()!.outerWidth,
                this.getWindow()!.outerHeight
            ));
        }

        const json: IJsonSubLayout = { 
            type: this.getType(),
            layout: this.getRootRow()!.toJson(), 
            rect: this.getType() === "tab"? undefined: this.getRect().toJson() 
        };
        return json;
    }

    static fromJson(layoutJson: IJsonSubLayout, model: Model, layoutId: string): Layout {
        const count = model.getLayouts().size;
        const rect = layoutJson.rect ? Rect.fromJson(layoutJson.rect) : new Rect(50 + 50 * count, 50 + 50 * count, 600, 400);
        rect.snap(10); // snapping prevents issue where window moves 1 pixel per save/restore on Chrome

        const layout = new Layout(layoutId, layoutJson.type || "window", rect);
        layout.setRootRow(RowNode.fromJson(layoutJson.layout, model, layout));

        return layout;
    }
}
