import * as React from "react";
import { Rect } from "./Rect";

/** @internal */
const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);

export class DragDrop {
    static instance = new DragDrop();

    /** @internal */
    private _fDblClick: ((event: Event) => void) | undefined;
    /** @internal */
    private _fClick: ((event: Event) => void) | undefined;
    /** @internal */
    private _fDragEnd: ((event: Event) => void) | undefined;
    /** @internal */
    private _fDragMove: ((event: React.MouseEvent<Element>) => void) | undefined;
    /** @internal */
    private _fDragStart: ((pos: { clientX: number; clientY: number }) => boolean) | undefined;
    /** @internal */
    private _fDragCancel: ((wasDragging: boolean) => void) | undefined;

    /** @internal */
    private _glass: HTMLDivElement | undefined;
    /** @internal */
    private _defaultGlassCursor: string;
    /** @internal */
    private _glassCursorOverride: string | undefined;
    /** @internal */
    private _manualGlassManagement: boolean = false;
    /** @internal */
    private _lastClick: number;
    /** @internal */
    private _clickX: number;
    /** @internal */
    private _clickY: number;
    /** @internal */
    private _startX: number = 0;
    /** @internal */
    private _startY: number = 0;
    /** @internal */
    private _dragDepth: number = 0;
    /** @internal */
    private _glassShowing: boolean = false;
    /** @internal */
    private _dragging: boolean = false;
    /** @internal */
    private _active: boolean = false; // drag and drop is in progress, can be used on ios to prevent body scrolling (see demo)
    /** @internal */
    private _document?: Document;
    /** @internal */
    private _rootElement?: HTMLElement | undefined;
    /** @internal */
    private _lastEvent?: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<Element> | undefined;

    /** @internal */
    private constructor() {
        if (canUseDOM) {
            // check for serverside rendering
            this._glass = document.createElement("div");
            this._glass.style.zIndex = "998";
            this._glass.style.backgroundColor = "transparent";
            this._glass.style.outline = "none";
        }

        this._defaultGlassCursor = "default";

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onKeyPress = this._onKeyPress.bind(this);
        this._onDragCancel = this._onDragCancel.bind(this);
        this._onDragEnter = this._onDragEnter.bind(this);
        this._onDragLeave = this._onDragLeave.bind(this);
        this.resizeGlass = this.resizeGlass.bind(this);

        this._lastClick = 0;
        this._clickX = 0;
        this._clickY = 0;
    }

    // if you add the glass pane then you should remove it
    addGlass(fCancel: ((wasDragging: boolean) => void) | undefined) {
        if (!this._glassShowing) {
            if (!this._document) {
                this._document = window.document;
            }
            if (!this._rootElement) {
                this._rootElement = this._document.body;
            }
            this.resizeGlass();
            this._document.defaultView?.addEventListener('resize', this.resizeGlass);
            this._document.body.appendChild(this._glass!);
            this._glass!.tabIndex = -1;
            this._glass!.focus();
            this._glass!.addEventListener("keydown", this._onKeyPress);
            this._glass!.addEventListener("dragenter", this._onDragEnter, { passive: false });
            this._glass!.addEventListener("dragover", this._onMouseMove, { passive: false });
            this._glass!.addEventListener("dragleave", this._onDragLeave, { passive: false });
            this._glassShowing = true;
            this._fDragCancel = fCancel;
            this._manualGlassManagement = false;
        } else {
            // second call to addGlass (via dragstart)
            this._manualGlassManagement = true;
        }
    }

    resizeGlass() {
        const glassRect = Rect.fromElement(this._rootElement!);
        glassRect.positionElement(this._glass!, "fixed");
    }

    hideGlass() {
        if (this._glassShowing) {
            this._document!.body.removeChild(this._glass!);
            this._document!.defaultView?.removeEventListener('resize', this.resizeGlass);
            this._glassShowing = false;
            this._document = undefined;
            this._rootElement = undefined;
            this.setGlassCursorOverride(undefined);
        }
    }

    /** @internal */
    _updateGlassCursor() {
        this._glass!.style.cursor = this._glassCursorOverride ?? this._defaultGlassCursor;
    }

    /** @internal */
    _setDefaultGlassCursor(cursor: string) {
        this._defaultGlassCursor = cursor;
        this._updateGlassCursor()
    }

    setGlassCursorOverride(cursor: string | undefined) {
        this._glassCursorOverride = cursor;
        this._updateGlassCursor()
    }

    startDrag(
        event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<Element> | undefined,
        fDragStart: ((pos: { clientX: number; clientY: number }) => boolean) | undefined,
        fDragMove: ((event: React.MouseEvent<Element>) => void) | undefined,
        fDragEnd: ((event: Event) => void) | undefined,
        fDragCancel?: ((wasDragging: boolean) => void) | undefined,
        fClick?: ((event: Event) => void) | undefined,
        fDblClick?: ((event: Event) => void) | undefined,
        currentDocument?: Document,
        rootElement?: HTMLDivElement
    ) {
        // prevent 'duplicate' action (mouse event for same action as previous touch event (a fix for ios))
        if (event && this._lastEvent && this._lastEvent.type.startsWith("touch") && event.type.startsWith("mouse") && event.timeStamp - this._lastEvent.timeStamp < 500) {
            return;
        }

        if (this._dragging) {
            return;
        }

        this._lastEvent = event;

        if (currentDocument) {
            this._document = currentDocument;
        } else {
            this._document = window.document;
        }
        if (rootElement) {
            this._rootElement = rootElement;
        } else {
            this._rootElement = this._document.body;
        }

        const posEvent = this._getLocationEvent(event);
        this.addGlass(fDragCancel);

        if (event) {
            this._startX = posEvent.clientX;
            this._startY = posEvent.clientY;
            if (!window.matchMedia || window.matchMedia("(pointer: fine)").matches) {
                this._setDefaultGlassCursor(getComputedStyle(event.target as Element).cursor);
            }
            this._stopPropagation(event);
            this._preventDefault(event);
        } else {
            this._startX = 0;
            this._startY = 0;
            this._setDefaultGlassCursor("default");
        }

        this._dragging = false;
        this._fDragStart = fDragStart;
        this._fDragMove = fDragMove;
        this._fDragEnd = fDragEnd;
        this._fDragCancel = fDragCancel;
        this._fClick = fClick;
        this._fDblClick = fDblClick;

        this._active = true;

        if (event?.type === 'dragenter') {
            this._dragDepth = 1;
            this._rootElement.addEventListener("dragenter", this._onDragEnter, { passive: false });
            this._rootElement.addEventListener("dragover", this._onMouseMove, { passive: false });
            this._rootElement.addEventListener("dragleave", this._onDragLeave, { passive: false });
            this._document.addEventListener("dragend", this._onDragCancel, { passive: false });
            this._document.addEventListener("drop", this._onMouseUp, { passive: false });
        } else {
            this._document.addEventListener("mouseup", this._onMouseUp, { passive: false });
            this._document.addEventListener("mousemove", this._onMouseMove, { passive: false });
            this._document.addEventListener("touchend", this._onMouseUp, { passive: false });
            this._document.addEventListener("touchmove", this._onMouseMove, { passive: false });
        }
    }

    isDragging() {
        return this._dragging;
    }

    isActive() {
        return this._active;
    }

    toString() {
        const rtn = "(DragDrop: " + "startX=" + this._startX + ", startY=" + this._startY + ", dragging=" + this._dragging + ")";

        return rtn;
    }

    /** @internal */
    private _onKeyPress(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            // esc
            this._onDragCancel();
        }
    }

    /** @internal */
    private _onDragCancel() {
        this._rootElement!.removeEventListener("dragenter", this._onDragEnter);
        this._rootElement!.removeEventListener("dragover", this._onMouseMove);
        this._rootElement!.removeEventListener("dragleave", this._onDragLeave);
        this._document!.removeEventListener("dragend", this._onDragCancel);
        this._document!.removeEventListener("drop", this._onMouseUp);
        this._document!.removeEventListener("mousemove", this._onMouseMove);
        this._document!.removeEventListener("mouseup", this._onMouseUp);
        this._document!.removeEventListener("touchend", this._onMouseUp);
        this._document!.removeEventListener("touchmove", this._onMouseMove);
        this.hideGlass();
        if (this._fDragCancel !== undefined) {
            this._fDragCancel(this._dragging);
        }
        this._dragging = false;
        this._active = false;
    }

    /** @internal */
    private _getLocationEvent(event: any) {
        let posEvent: any = event;
        if (event && event.touches) {
            posEvent = event.touches[0];
        }
        return posEvent;
    }

    /** @internal */
    private _getLocationEventEnd(event: any) {
        let posEvent: any = event;
        if (event.changedTouches) {
            posEvent = event.changedTouches[0];
        }
        return posEvent;
    }

    /** @internal */
    private _stopPropagation(event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<Element>) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
    }

    /** @internal */
    private _preventDefault(event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<Element>) {
        if (event.preventDefault && event.cancelable) {
            event.preventDefault();
        }
        return event;
    }

    /** @internal */
    private _onMouseMove(event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | React.DragEvent<Element>) {
        this._lastEvent = event;

        const posEvent = this._getLocationEvent(event);
        this._stopPropagation(event);
        this._preventDefault(event);

        if (!this._dragging && (Math.abs(this._startX - posEvent.clientX) > 5 || Math.abs(this._startY - posEvent.clientY) > 5)) {
            this._dragging = true;
            if (this._fDragStart) {
                this._setDefaultGlassCursor("move");
                this._dragging = this._fDragStart({ clientX: this._startX, clientY: this._startY });
            }
        }

        if (this._dragging) {
            if (this._fDragMove) {
                this._fDragMove(posEvent);
            }
        }
        return false;
    }

    /** @internal */
    private _onMouseUp(event: Event) {
        this._lastEvent = event;

        const posEvent = this._getLocationEventEnd(event);

        this._stopPropagation(event);
        this._preventDefault(event);

        this._active = false;

        this._rootElement!.removeEventListener("dragenter", this._onDragEnter);
        this._rootElement!.removeEventListener("dragover", this._onMouseMove);
        this._rootElement!.removeEventListener("dragleave", this._onDragLeave);
        this._document!.removeEventListener("dragend", this._onDragCancel);
        this._document!.removeEventListener("drop", this._onMouseUp);
        this._document!.removeEventListener("mousemove", this._onMouseMove);
        this._document!.removeEventListener("mouseup", this._onMouseUp);
        this._document!.removeEventListener("touchend", this._onMouseUp);
        this._document!.removeEventListener("touchmove", this._onMouseMove);

        if (!this._manualGlassManagement) {
            this.hideGlass();
        }

        if (this._dragging) {
            this._dragging = false;
            if (this._fDragEnd) {
                this._fDragEnd(event);
            }
            // dump("set dragging = false\n");
        } else {
            if (this._fDragCancel) {
                this._fDragCancel(this._dragging);
            }
            if (Math.abs(this._startX - posEvent.clientX) <= 5 && Math.abs(this._startY - posEvent.clientY) <= 5) {

                let isDoubleClick = false;
                const clickTime = new Date().getTime();
                // check for double click
                if (Math.abs(this._clickX - posEvent.clientX) <= 5 && Math.abs(this._clickY - posEvent.clientY) <= 5) {
                    if (clickTime - this._lastClick < 500) {
                        if (this._fDblClick) {
                            this._fDblClick(event);
                            isDoubleClick = true;
                        }
                    }
                }
 
                if (!isDoubleClick && this._fClick) {
                    this._fClick(event);
                }

                this._lastClick = clickTime;
                this._clickX = posEvent.clientX;
                this._clickY = posEvent.clientY;
            }
        }
        return false;
    }

    /** @internal */
    private _onDragEnter(event: DragEvent) {
        this._preventDefault(event);
        this._stopPropagation(event);
        this._dragDepth++;
        return false;
    }

    /** @internal */
    private _onDragLeave(event: DragEvent) {
        this._preventDefault(event);
        this._stopPropagation(event);
        this._dragDepth--;
        if (this._dragDepth <= 0) {
            this._onDragCancel();
        }
        return false;
    }
}
