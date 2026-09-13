import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { DropInfo } from "../../model/DropInfo";
import { Node } from "../../model/Node";
import { RowNode } from "../../model/RowNode";
import { TabNode } from "../../model/TabNode";
import { TabSetNode } from "../../model/TabSetNode";
import { TabGroupNode } from "../../model/TabGroupNode";
import { IDraggable } from "../../model/IDraggable";
import { IJsonTabNode } from "../../model/IJsonModel";
import { Actions } from "../../model/Actions";
import { BorderNode } from "../../model/BorderNode";
import { DockLocation } from "../../model/DockLocation";
import { Orientation } from "../../model/Orientation";
import { Rect } from "../../model/Rect";
import { CLASSES } from "../../CSSClassNames";
import { I18nLabel } from "../I18nLabel";
import { TabButtonStamp } from "../TabButtonStamp";
import { getViewController, LayoutController } from "./LayoutController";
import { isSafari } from "../Utils";
import { ModelLayout } from "../../model/ModelLayout";

export class DragDropManager {
    private static dragState: DragState | undefined = undefined;

    private _controller: LayoutController;
    private _dragEnterCount: number = 0;
    private _dragging: boolean = false;
    private _active: boolean = false;
    private _dropInfo: DropInfo | undefined;
    private _outlineDiv?: HTMLElement;
    private _mainController: LayoutController;

    constructor(controller: LayoutController) {
        this._controller = controller;
        this._mainController = controller.getMainController()!;
    }

    // a floating panel can be docked into any layout except the floating panel it was dragged from
    private isDockTarget() {
        return this._controller.getLayout().getLayoutId() !== DragDropManager.dragState?.floatLayoutId;
    }

    // center drops are not offered when the dragged node can never merge into a tabset: a floating
    // panel being docked, a tabset that cannot be closed, or a tabset holding pinned tabs
    private isExcludeCenter() {
        if (DragDropManager.dragState?.dockFloatToMain) {
            return true;
        }
        const dragNode = DragDropManager.dragState?.dragNode;
        if (dragNode instanceof TabSetNode) {
            return !dragNode.isEnableClose() || dragNode.getPinnedRunLength() > 0;
        }
        return false;
    }

    addTabWithDragAndDrop(event: DragEvent, json: IJsonTabNode, onDrop?: (node?: Node, event?: React.DragEvent<HTMLElement>) => void) {
        const tempNode = TabNode.fromJson(json, this._controller.getModel(), false);
        DragDropManager.dragState = new DragState(this._controller.getMainController()!, DragSource.Add, tempNode, json, onDrop);
    }

    // called on dragend from the drag source, or by the lost drag fallback
    onDragEnded() {
        this.clearDragMain();
        DragDropManager.dragState = undefined;
    }

    moveTabWithDragAndDrop(event: DragEvent, node: TabNode | TabSetNode) {
        this.setDragNode(event, node);
    }

    // starts dragging a floating panel's whole layout, which can be docked into any other layout
    startDockLayoutDrag(event: DragEvent, layout: ModelLayout, sourceFloatElement?: Element) {
        const rowNode = layout.getRootRow()! as unknown as Node & IDraggable;
        DragDropManager.dragState = new DragState(this._controller.getMainController()!, DragSource.Float, rowNode, undefined, undefined, true, layout.getLayoutId(), sourceFloatElement);
        event.dataTransfer!.setData("text/plain", "--flexlayout--");
        event.dataTransfer!.effectAllowed = "copyMove";
        event.dataTransfer!.dropEffect = "move";

        this._dragEnterCount = 0;
        this._controller.getModel().sortLayouts(); // must have order windows, tabs, floats

        let tabCount = 0;
        layout.getRootRow()?.forEachNode((node) => {
            if (node instanceof TabNode) {
                tabCount++;
            }
        }, 0);
        const content = this._controller.i18nName(I18nLabel.Dock_Float_Tabs).replace("?", String(tabCount));
        let rendered = false;
        if (this._controller.getProps().onRenderDragRect) {
            const dragComponent = this._controller.getProps().onRenderDragRect!(content, rowNode, undefined);
            if (dragComponent) {
                this.setDragComponent(event, dragComponent, 10, 10);
                rendered = true;
            }
        }
        if (!rendered) {
            this.setDragComponent(event, content, 10, 10);
        }
    }

    setDragNode = (event: DragEvent, node: Node & IDraggable) => {
        DragDropManager.dragState = new DragState(this._controller.getMainController()!, DragSource.Internal, node, undefined, undefined);
        event.dataTransfer!.setData("text/plain", "--flexlayout--");
        event.dataTransfer!.effectAllowed = "copyMove";
        event.dataTransfer!.dropEffect = "move";

        this._dragEnterCount = 0;

        this._controller.getModel().sortLayouts(); // must have order windows, tabs, floats

        if (node instanceof TabSetNode) {
            let rendered = false;
            let content = this._controller.i18nName(I18nLabel.Move_Tabset);
            if (node.getChildren().length > 0) {
                content = this._controller.i18nName(I18nLabel.Move_Tabs).replace("?", String(node.getChildren().length));
            }
            if (this._controller.getProps().onRenderDragRect) {
                const dragComponent = this._controller.getProps().onRenderDragRect!(content, node, undefined);
                if (dragComponent) {
                    this.setDragComponent(event, dragComponent, 10, 10);
                    rendered = true;
                }
            }
            if (!rendered) {
                this.setDragComponent(event, content, 10, 10);
            }
        } else if (node instanceof TabGroupNode) {
            // dragging a group pill moves the whole group (like dragging a tabset)
            let rendered = false;
            const content = this._controller.i18nName(I18nLabel.Move_Group).replace("?", String(node.getChildren().length));
            if (this._controller.getProps().onRenderDragRect) {
                const dragComponent = this._controller.getProps().onRenderDragRect!(content, node, undefined);
                if (dragComponent) {
                    this.setDragComponent(event, dragComponent, 10, 10);
                    rendered = true;
                }
            }
            if (!rendered) {
                this.setDragComponent(event, content, 10, 10);
            }
        } else {
            const element = event.target as HTMLElement;
            if (element && typeof element.getBoundingClientRect === "function") {
                // incase its not actually a htmlelement at runtime
                const rect = element.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const offsetY = event.clientY - rect.top;
                const parentNode = node?.getParent();
                const isInVerticalBorder = parentNode instanceof BorderNode && (parentNode as BorderNode).getOrientation() === Orientation.HORZ;
                const x = isInVerticalBorder ? 10 : offsetX;
                const y = isInVerticalBorder ? 10 : offsetY;

                let rendered = false;
                if (this._controller.getProps().onRenderDragRect) {
                    const content = <TabButtonStamp key={node.getId()} controller={this._controller} tabNode={node as TabNode} />;
                    const dragComponent = this._controller.getProps().onRenderDragRect!(content, node, undefined);
                    if (dragComponent) {
                        this.setDragComponent(event, dragComponent, x, y);
                        rendered = true;
                    }
                }
                if (!rendered) {
                    if (isSafari()) {
                        this.setDragComponent(event, <TabButtonStamp tabNode={node as TabNode} controller={this._controller} />, x, y);
                    } else {
                        event.dataTransfer!.setDragImage((node as TabNode).getTabStamp()!, x, y);
                    }
                }
            }
        }
    };

    setDragComponent(event: DragEvent, component: React.ReactNode, x: number, y: number) {
        const dragElement = (
            <div style={{ position: "unset" }} className={this._controller.getClassName(CLASSES.FLEXLAYOUT__LAYOUT) + " " + this._controller.getClassName(CLASSES.FLEXLAYOUT__DRAG_RECT)}>
                {component}
            </div>
        );

        const currentDocument = this._controller.getCurrentDocument();
        const tempDiv = currentDocument!.createElement("div");
        tempDiv.setAttribute("data-layout-path", "/drag-rectangle");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-10000px";
        tempDiv.style.top = "-10000px";
        currentDocument!.body.appendChild(tempDiv);
        const root = createRoot(tempDiv);
        flushSync(() => root.render(dragElement)); // commit synchronously so the browser can snapshot the drag image

        event.dataTransfer!.setDragImage(tempDiv, x, y);
        setTimeout(() => {
            // the div must outlive the dragstart dispatch for the snapshot to be taken
            root.unmount();
            currentDocument!.body.removeChild(tempDiv);
        }, 0);
    }

    updateActive(event: React.DragEvent<HTMLElement>) {
        const layouts = Array.from(this._controller.getModel().getLayouts().values());
        const dockToMain = DragDropManager.dragState?.dockFloatToMain === true;
        let found: ModelLayout | undefined = undefined;
        let foundTab: ModelLayout | undefined = undefined;
        for (let i = layouts.length - 1; i >= 0; i--) {
            const layout = layouts[i];
            // the floating panel being dragged is never a drop target
            if (dockToMain && layout.getLayoutId() === DragDropManager.dragState?.floatLayoutId) {
                continue;
            }
            const dragDropManager = getViewController(layout)?.getDragDropManager();
            if (dragDropManager) {
                if (dragDropManager.getDragEnterCount() > 0) {
                    if (layout.getType() === "tab") {
                        foundTab = layout;
                    } else if (!found && !foundTab) {
                        found = layout;
                    }
                }
            }
        }

        if (foundTab) {
            const parentLayout = foundTab.findParentLayout();
            if (found === parentLayout || !found) {
                found = foundTab;
            }
        }

        if (found) {
            getViewController(found)!.getDragDropManager().setActive(true, event);
        }
        for (const layout of layouts) {
            if (layout !== found) {
                getViewController(layout)?.getDragDropManager().setActive(false, event);
            }
        }
    }

    setActive(active: boolean, event: React.DragEvent<HTMLElement>) {
        if (this._active !== active) {
            this._active = active;
            if (this._active) {
                this.onDragEnter(event);
            } else {
                this.onDragLeave(event);
            }
        }
    }

    onDragEnterRaw = (event: React.DragEvent<HTMLElement>) => {
        this._dragEnterCount++;
        this.updateActive(event);
    };

    onDragLeaveRaw = (event: React.DragEvent<HTMLElement>) => {
        this._dragEnterCount--;
        this.updateActive(event);
    };

    clearDragMain() {
        this._controller.showOverlayOnAllWindows(false);
        for (const [, layout] of this._controller.getModel().getLayouts()) {
            const controller = getViewController(layout);
            if (controller) {
                controller.getDragDropManager().clearDragLocal();
            }
        }
    }

    clearDragLocal() {
        this._dragEnterCount = 0;
        this._active = false;
        this.clearDragLocalVisuals();
    }

    clearDragLocalVisuals() {
        this._controller.setState({ showEdges: false });
        this._dragging = false;
        if (this._outlineDiv) {
            this._controller.getRootDiv()!.removeChild(this._outlineDiv);
            this._outlineDiv = undefined;
        }
    }

    onDragEnter = (event: React.DragEvent<HTMLElement>) => {
        if (!DragDropManager.dragState && this._controller.getProps().onExternalDrag) {
            const externalDrag = this._controller.getProps().onExternalDrag!(event);
            if (externalDrag) {
                const tempNode = TabNode.fromJson(externalDrag.json, this._controller.getModel(), false);
                DragDropManager.dragState = new DragState(this._controller.getMainController()!, DragSource.External, tempNode, externalDrag.json, externalDrag.onDrop);
            }
        }

        if (this._mainController !== DragDropManager.dragState?.mainLayoutController) {
            return;
        }
        if (DragDropManager.dragState?.dockFloatToMain && !this.isDockTarget()) {
            return;
        }

        if (DragDropManager.dragState) {
            event.preventDefault();

            this._dropInfo = undefined;
            const rootdiv = this._controller.getRootDiv();
            const currentDocument = this._controller.getCurrentDocument();
            this._outlineDiv = currentDocument!.createElement("div");
            this._outlineDiv.className = this._controller.getClassName(CLASSES.FLEXLAYOUT__OUTLINE_RECT);
            this._outlineDiv.style.visibility = "hidden";
            const speed = this._controller.getTabDragSpeed();
            this._outlineDiv.style.transition = `top ${speed}s, left ${speed}s, width ${speed}s, height ${speed}s`;

            rootdiv!.appendChild(this._outlineDiv);

            this._dragging = true;
            this._controller.showOverlayOnAllWindows(true);

            if (this._controller.getModel().getMaximizedTabset(this._controller.getLayoutId()) === undefined) {
                this._controller.setState({ showEdges: this._controller.getModel().isEnableEdgeDock() });
            }

            const clientRect = this._controller.getRootDiv()!.getBoundingClientRect()!;
            const r = new Rect(event.clientX - clientRect.left, event.clientY - clientRect.top, 1, 1);
            r.positionElement(this._outlineDiv);
        }
    };

    onDragOver = (event: React.DragEvent<HTMLElement>) => {
        if (this._mainController !== DragDropManager.dragState?.mainLayoutController) {
            return;
        }
        if (DragDropManager.dragState?.dockFloatToMain && !this.isDockTarget()) {
            return;
        }
        if (this._active) {
            // the pointer over the panel being dragged is never a valid drop target
            if (DragDropManager.dragState?.dockFloatToMain) {
                const target = event.target as Element | null;
                if (target && DragDropManager.dragState.sourceFloatElement?.contains(target)) {
                    this._dropInfo = undefined;
                    return;
                }
            }

            const clientRect = this._controller.getRootDiv()?.getBoundingClientRect();
            const pos = {
                x: event.clientX - (clientRect?.left ?? 0),
                y: event.clientY - (clientRect?.top ?? 0),
            };

            if (!DragDropManager.dragState!.dockFloatToMain) {
                this._controller.checkForBorderToShow(pos.x, pos.y);
            }

            const dropInfo = this._controller.getModel().findDropTargetNode(this._controller.getLayoutId(), DragDropManager.dragState!.dragNode!, pos.x, pos.y, this.isExcludeCenter());
            if (dropInfo) {
                // a floating panel's layout can split a tabset or dock to a layout edge (the root
                // row), never dock to the center or into a border
                if (DragDropManager.dragState!.dockFloatToMain && (dropInfo.location === DockLocation.CENTER || (!(dropInfo.node instanceof TabSetNode) && !(dropInfo.node instanceof RowNode)))) {
                    return;
                }
                event.preventDefault(); // can drop so prevent default (which is cannot drop)
                this._dropInfo = dropInfo;
                if (this._outlineDiv) {
                    this._outlineDiv.className = this._controller.getClassName(dropInfo.className);
                    dropInfo.rect.positionElement(this._outlineDiv);
                    this._outlineDiv.style.visibility = "visible";
                }
                // } else {
                //     if (this._outlineDiv) {
                //         this._outlineDiv.style.visibility = "hidden";
                //     }
            }
        }
    };

    onDragLeave = (_event: React.DragEvent<HTMLElement>) => {
        if (this._mainController !== DragDropManager.dragState?.mainLayoutController) {
            return;
        }
        this.clearDragLocalVisuals();

        if (this._controller.isMainLayout()) {
            let anyDragging = false;
            for (const [, layout] of this._controller.getModel().getLayouts()) {
                const controller = getViewController(layout);
                if (controller && controller.getDragDropManager().isDragging()) {
                    anyDragging = true;
                    break;
                }
            }
            if (anyDragging === false) {
                this.clearDragMain();
            }
        }
    };

    onDrop = (event: React.DragEvent<HTMLElement>) => {
        if (this._mainController !== DragDropManager.dragState?.mainLayoutController) {
            // a drop that is not this layout's drag (text/files) still ends the drag here; the browser
            // sends no dragleave after a drop, so clear the local enter count and active flag or the
            // next drag will find this layout already active and never create its outline/overlay
            this.clearDragLocal();
            return;
        }
        if (DragDropManager.dragState?.dockFloatToMain && !this.isDockTarget()) {
            return;
        }
        if (this._active) {
            event.preventDefault();

            const dragState = DragDropManager.dragState!;
            if (this._dropInfo) {
                // a floating panel can never be dropped back into the panel it was dragged from
                if (dragState.dockFloatToMain) {
                    const target = event.target as Element | null;
                    if (target && dragState.sourceFloatElement?.contains(target)) {
                        this._dropInfo = undefined;
                    }
                }
            }
            if (this._dropInfo) {
                if (dragState.dragJson !== undefined) {
                    const newNode = this._controller.doAction(Actions.addTab(dragState.dragJson, this._dropInfo.node.getId(), this._dropInfo.location, this._dropInfo.index));
                    if (dragState.fnNewNodeDropped !== undefined) {
                        dragState.fnNewNodeDropped(newNode, event);
                    }
                } else if (dragState.dragNode !== undefined) {
                    if (dragState.dockFloatToMain) {
                        this._controller.doAction(Actions.dockFloatToLayout(dragState.floatLayoutId!, this._dropInfo.node.getId(), this._dropInfo.location, this._dropInfo.index));
                    } else {
                        this._controller.doAction(Actions.moveNode(dragState.dragNode.getId(), this._dropInfo.node.getId(), this._dropInfo.location, this._dropInfo.index));
                    }
                }
            }

            this.clearDragMain();
            DragDropManager.dragState = undefined;
        }
        this._dragEnterCount = 0;
    };

    getDragEnterCount() {
        return this._dragEnterCount;
    }

    isDragging() {
        return this._dragging;
    }
}

export enum DragSource {
    Internal = "internal",
    External = "external",
    Add = "add",
    Float = "float",
}

export class DragState {
    readonly mainLayoutController: LayoutController;
    readonly dragSource: DragSource;
    readonly dragNode: (Node & IDraggable) | undefined;
    readonly dragJson: IJsonTabNode | undefined;
    readonly fnNewNodeDropped: ((node?: Node, event?: React.DragEvent<HTMLElement>) => void) | undefined;
    // true when dragging a floating panel's whole layout to dock into another layout
    readonly dockFloatToMain: boolean;
    readonly floatLayoutId: string | undefined;
    // the floating panel window the drag came from; drops over it are rejected
    readonly sourceFloatElement: Element | undefined;

    constructor(
        mainLayoutController: LayoutController,
        dragSource: DragSource,
        dragNode: (Node & IDraggable) | undefined,
        dragJson: IJsonTabNode | undefined,
        fnNewNodeDropped: ((node?: Node, event?: React.DragEvent<HTMLElement>) => void) | undefined,
        dockFloatToMain: boolean = false,
        floatLayoutId: string | undefined = undefined,
        sourceFloatElement: Element | undefined = undefined,
    ) {
        this.mainLayoutController = mainLayoutController;
        this.dragSource = dragSource;
        this.dragNode = dragNode;
        this.dragJson = dragJson;
        this.fnNewNodeDropped = fnNewNodeDropped;
        this.dockFloatToMain = dockFloatToMain;
        this.floatLayoutId = floatLayoutId;
        this.sourceFloatElement = sourceFloatElement;
    }
}
