import Rect from "./Rect";

/** @hidden @internal */
const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);

class DragDrop {
    static instance = new DragDrop();

    /** @hidden @internal */
    private _fDblClick: ((event: Event) => void) | undefined;
    /** @hidden @internal */
    private _fClick: ((event: Event) => void) | undefined;
    /** @hidden @internal */
    private _fDragEnd: ((event: Event) => void) | undefined;
    /** @hidden @internal */
    private _fDragMove: ((event: React.MouseEvent<Element>) => void) | undefined;
    /** @hidden @internal */
    private _fDragStart: ((pos: { clientX: number; clientY: number }) => boolean) | undefined;
    /** @hidden @internal */
    private _fDragCancel: ((wasDragging: boolean) => void) | undefined;

    /** @hidden @internal */
    private _glass: HTMLDivElement | undefined;
    /** @hidden @internal */
    private _manualGlassManagement: boolean = false;
    /** @hidden @internal */
    private _lastClick: number;
    /** @hidden @internal */
    private _clickX: number;
    /** @hidden @internal */
    private _clickY: number;
    /** @hidden @internal */
    private _startX: number = 0;
    /** @hidden @internal */
    private _startY: number = 0;
    /** @hidden @internal */
    private _glassShowing: boolean = false;
    /** @hidden @internal */
    private _dragging: boolean = false;
    /** @hidden @internal */
    private _active: boolean = false; // drag and drop is in progress, can be used on ios to prevent body scrolling (see demo)
    /** @hidden @internal */
    private _document?: HTMLDocument;
    /** @hidden @internal */
    private _lastEvent?: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | undefined;

    /** @hidden @internal */
    private constructor() {
        if (canUseDOM) {
            // check for serverside rendering
            this._glass = document.createElement("div");
            this._glass.style.zIndex = "998";
            this._glass.style.position = "absolute";
            this._glass.style.backgroundColor = "transparent";
            this._glass.style.outline = "none";
        }

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onKeyPress = this._onKeyPress.bind(this);

        this._lastClick = 0;
        this._clickX = 0;
        this._clickY = 0;
    }

    // if you add the glass pane then you should remove it
    addGlass(fCancel: ((wasDragging: boolean) => void) | undefined, currentDocument?: HTMLDocument) {
        if (!this._glassShowing) {
            if (!currentDocument) {
                currentDocument = window.document;
            }
            this._document = currentDocument;
            const glassRect = new Rect(0, 0, currentDocument!.documentElement.scrollWidth, currentDocument!.documentElement.scrollHeight);
            glassRect.positionElement(this._glass!);
            currentDocument!.body.appendChild(this._glass!);
            this._glass!.tabIndex = -1;
            this._glass!.focus();
            this._glass!.addEventListener("keydown", this._onKeyPress);
            this._glassShowing = true;
            this._fDragCancel = fCancel;
            this._manualGlassManagement = false;
        } else {
            // second call to addGlass (via dragstart)
            this._manualGlassManagement = true;
        }
    }

    hideGlass() {
        if (this._glassShowing) {
            this._document!.body.removeChild(this._glass!);
            this._glassShowing = false;
            this._document = undefined;
        }
    }

    startDrag(
        event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement> | undefined,
        fDragStart: ((pos: { clientX: number; clientY: number }) => boolean) | undefined,
        fDragMove: ((event: React.MouseEvent<Element>) => void) | undefined,
        fDragEnd: ((event: Event) => void) | undefined,
        fDragCancel?: ((wasDragging: boolean) => void) | undefined,
        fClick?: ((event: Event) => void) | undefined,
        fDblClick?: ((event: Event) => void) | undefined,
        currentDocument?: Document
    ) {
        // prevent 'duplicate' action (mouse event for same action as previous touch event (a fix for ios))
        if (event && this._lastEvent && this._lastEvent.type.startsWith("touch") && event.type.startsWith("mouse") && event.timeStamp - this._lastEvent.timeStamp < 500) {
            return;
        }

        this._lastEvent = event;

        if (currentDocument) {
            this._document = currentDocument;
        } else {
            this._document = window.document;
        }

        const posEvent = this._getLocationEvent(event);
        this.addGlass(fDragCancel, currentDocument);

        if (this._dragging) {
            console.warn("this._dragging true on startDrag should never happen");
        }

        if (event) {
            this._startX = posEvent.clientX;
            this._startY = posEvent.clientY;
            if (!window.matchMedia || window.matchMedia("(pointer: fine)").matches) {
                this._glass!.style.cursor = getComputedStyle(event.target as Element).cursor;
            }
            this._stopPropagation(event);
            this._preventDefault(event);
        } else {
            this._startX = 0;
            this._startY = 0;
            this._glass!.style.cursor = "default";
        }

        this._dragging = false;
        this._fDragStart = fDragStart;
        this._fDragMove = fDragMove;
        this._fDragEnd = fDragEnd;
        this._fDragCancel = fDragCancel;
        this._fClick = fClick;
        this._fDblClick = fDblClick;

        this._active = true;

        this._document.addEventListener("mouseup", this._onMouseUp, { passive: false });
        this._document.addEventListener("mousemove", this._onMouseMove, { passive: false });
        this._document.addEventListener("touchend", this._onMouseUp, { passive: false });
        this._document.addEventListener("touchmove", this._onMouseMove, { passive: false });
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

    /** @hidden @internal */
    private _onKeyPress(event: KeyboardEvent) {
        if (this._fDragCancel !== undefined && event.keyCode === 27) {
            // esc
            this._document!.removeEventListener("mousemove", this._onMouseMove);
            this._document!.removeEventListener("mouseup", this._onMouseUp);
            this._document!.removeEventListener("touchend", this._onMouseUp);
            this._document!.removeEventListener("touchmove", this._onMouseMove);
            this.hideGlass();
            this._fDragCancel(this._dragging);
            this._dragging = false;
            this._active = false;
        }
    }

    /** @hidden @internal */
    private _getLocationEvent(event: any) {
        let posEvent: any = event;
        if (event && event.touches) {
            posEvent = event.touches[0];
        }
        return posEvent;
    }

    /** @hidden @internal */
    private _getLocationEventEnd(event: any) {
        let posEvent: any = event;
        if (event.changedTouches) {
            posEvent = event.changedTouches[0];
        }
        return posEvent;
    }

    /** @hidden @internal */
    private _stopPropagation(event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
    }

    /** @hidden @internal */
    private _preventDefault(event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
        if (event.preventDefault && event.cancelable) {
            event.preventDefault();
        }
        return event;
    }

    /** @hidden @internal */
    private _onMouseMove(event: Event | React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
        this._lastEvent = event;

        const posEvent = this._getLocationEvent(event);
        this._stopPropagation(event);
        this._preventDefault(event);

        if (!this._dragging && (Math.abs(this._startX - posEvent.clientX) > 5 || Math.abs(this._startY - posEvent.clientY) > 5)) {
            this._dragging = true;
            if (this._fDragStart) {
                this._glass!.style.cursor = "move";
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

    /** @hidden @internal */
    private _onMouseUp(event: Event) {
        this._lastEvent = event;

        const posEvent = this._getLocationEventEnd(event);

        this._stopPropagation(event);
        this._preventDefault(event);

        this._active = false;

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
                const clickTime = new Date().getTime();
                // check for double click
                if (Math.abs(this._clickX - posEvent.clientX) <= 5 && Math.abs(this._clickY - posEvent.clientY) <= 5) {
                    if (clickTime - this._lastClick < 500) {
                        if (this._fDblClick) {
                            this._fDblClick(event);
                        }
                    }
                }

                if (this._fClick) {
                    this._fClick(event);
                }
                this._lastClick = clickTime;
                this._clickX = posEvent.clientX;
                this._clickY = posEvent.clientY;
            }
        }
        return false;
    }
}

export default DragDrop;
