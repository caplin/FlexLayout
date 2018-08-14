import Rect from "./Rect";

class DragDrop {
    static instance = new DragDrop();

    /** @hidden @internal */
    private _fDblClick: ((event: Event) => void) | undefined;
    /** @hidden @internal */
    private _fClick: ((event: Event) => void) | undefined;
    /** @hidden @internal */
    private _fDragEnd: ((event: Event) => void) | undefined;
    /** @hidden @internal */
    private _fDragMove: ((event: Event) => void) | undefined;
    /** @hidden @internal */
    private _fDragStart: ((pos: { clientX: number, clientY: number }) => boolean) | undefined;
    /** @hidden @internal */
    private _fDragCancel: ((wasDragging: boolean) => void) | undefined;

    /** @hidden @internal */
    private _glass: HTMLDivElement;
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
    private constructor() {
        this._glass = document.createElement("div");
        this._glass.style.zIndex = "998";
        this._glass.style.position = "absolute";
        this._glass.style.backgroundColor = "white";
        this._glass.style.opacity = ".00"; // may need to be .01 for IE???
        this._glass.style.filter = "alpha(opacity=01)";

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);

        this._onKeyPress = this._onKeyPress.bind(this);

        this._lastClick = 0;
        this._clickX = 0;
        this._clickY = 0;
    }

    // if you add the glass pane then you should remove it
    addGlass(fCancel: (() => void) | undefined) {
        if (!this._glassShowing) {
            const glassRect = new Rect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
            glassRect.positionElement(this._glass);
            document.body.appendChild(this._glass);
            this._glass.tabIndex = -1;
            this._glass.focus();
            this._glass.addEventListener("keydown", this._onKeyPress);
            this._glassShowing = true;
            this._fDragCancel = fCancel;
            this._manualGlassManagement = false;
        }
        else { // second call to addGlass (via dragstart)
            this._manualGlassManagement = true;
        }
    }

    hideGlass() {
        if (this._glassShowing) {
            document.body.removeChild(this._glass);
            this._glassShowing = false;
        }
    }

    /** @hidden @internal */
    private _onKeyPress(event: KeyboardEvent) {
        if (this._fDragCancel !== undefined && event.keyCode === 27) { // esc
            this.hideGlass();
            document.removeEventListener("mousemove", this._onMouseMove);
            document.removeEventListener("mouseup", this._onMouseUp);
            this._fDragCancel(this._dragging);
            this._dragging = false;
        }
    }

    /** @hidden @internal */
    private _getLocationEvent(event: any) {
        let posEvent: any = event;
        if (event.touches) {
            posEvent = event.touches[0]
        }
        return posEvent;
    }

    /** @hidden @internal */
    private _getLocationEventEnd(event: any) {
        let posEvent: any = event;
        if (event.changedTouches) {
            posEvent = event.changedTouches[0]
        }
        return posEvent;
    }

    /** @hidden @internal */
    private _stopPropagation(event: Event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
    }

    /** @hidden @internal */
    private _preventDefault(event: Event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        return event;
    }

    startDrag(event: Event | undefined,
        fDragStart: ((pos: { clientX: number, clientY: number }) => boolean) | undefined,
        fDragMove: ((event: Event) => void) | undefined,
        fDragEnd: ((event: Event) => void) | undefined,
        fDragCancel?: (() => void) | undefined,
        fClick?: ((event: Event) => void) | undefined,
        fDblClick?: ((event: Event) => void) | undefined) {

        const posEvent = this._getLocationEvent(event);
        this.addGlass(fDragCancel);

        if (this._dragging) debugger; // should never happen

        if (event) {
            this._startX = posEvent.clientX;
            this._startY = posEvent.clientY;
            this._glass.style.cursor = getComputedStyle(event.target as Element).cursor;
            this._stopPropagation(event);
            this._preventDefault(event);
        }
        else {
            this._startX = 0;
            this._startY = 0;
            this._glass.style.cursor = "default";
        }

        this._dragging = false;
        this._fDragStart = fDragStart;
        this._fDragMove = fDragMove;
        this._fDragEnd = fDragEnd;
        this._fDragCancel = fDragCancel;
        this._fClick = fClick;
        this._fDblClick = fDblClick;

        document.addEventListener("mouseup", this._onMouseUp);
        document.addEventListener("mousemove", this._onMouseMove);
        document.addEventListener("touchend", this._onMouseUp);
        document.addEventListener("touchmove", this._onMouseMove);
    }

    /** @hidden @internal */
    private _onMouseMove(event: Event) {
        const posEvent = this._getLocationEvent(event);
        this._stopPropagation(event);
        this._preventDefault(event);

        if (!this._dragging && (Math.abs(this._startX - posEvent.clientX) > 5 || Math.abs(this._startY - posEvent.clientY) > 5)) {
            this._dragging = true;
            if (this._fDragStart) {
                this._glass.style.cursor = "move";
                this._dragging = this._fDragStart({ "clientX": this._startX, "clientY": this._startY });
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
        const posEvent = this._getLocationEventEnd(event);

        this._stopPropagation(event);
        this._preventDefault(event);

        if (!this._manualGlassManagement) {
            this.hideGlass();
        }

        document.removeEventListener("mousemove", this._onMouseMove);
        document.removeEventListener("mouseup", this._onMouseUp);
        document.removeEventListener("touchend", this._onMouseUp);
        document.removeEventListener("touchmove", this._onMouseMove);

        if (this._dragging) {
            this._dragging = false;
            if (this._fDragEnd) {
                this._fDragEnd(event);
            }
            //dump("set dragging = false\n");
        }
        else {
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

    isDragging() {
        return this._dragging;
    }

    toString() {
        const rtn = "(DragDrop: " +
            "startX=" + this._startX +
            ", startY=" + this._startY +
            ", dragging=" + this._dragging +
            ")";

        return rtn;
    }
}

export default DragDrop;

