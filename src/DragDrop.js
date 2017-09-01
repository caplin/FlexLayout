import Rect from "./Rect.js";

class DragDrop {

    constructor() {
        this.glass = document.createElement("div");
        this.glass.style.zIndex = 998;
        this.glass.style.position = "absolute";
        this.glass.style.backgroundColor = "white";
        this.glass.style.opacity = ".00"; // may need to be .01 for IE???
        this.glass.style.filter = "alpha(opacity=01)";

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.onKeyPress = this.onKeyPress.bind(this);

        this.lastClick = 0;
        this.clickX = 0;
        this.clickY = 0;
    }

    // if you add the glass pane then you should remove it
    addGlass(fCancel) {
        if (!this.glassShowing) {
            const glassRect = new Rect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
            glassRect.positionElement(this.glass);
            document.body.appendChild(this.glass);
            this.glass.tabIndex = -1;
            this.glass.focus();
            this.glass.addEventListener("keydown", this.onKeyPress);
            this.glassShowing = true;
            this.fDragCancel = fCancel;
            this.manualGlassManagement = false;
        }
        else { // second call to addGlass (via dragstart)
            this.manualGlassManagement = true;
        }
    }

    hideGlass() {
        if (this.glassShowing) {
            document.body.removeChild(this.glass);
            this.glassShowing = false;
        }
    }

    onKeyPress(event) {
        if (this.fDragCancel != null && event.keyCode === 27) { // esc
            this.hideGlass();
            document.removeEventListener("mousemove", this.onMouseMove);
            document.removeEventListener("mouseup", this.onMouseUp);
            this.dragging = false;
            this.fDragCancel();
        }
    }

    getLocationEvent(event) {
        let posEvent = event;
        if (event.touches) {
            posEvent = event.touches[0]
        }
        return posEvent;
    }

    getLocationEventEnd(event) {
        let posEvent = event;
        if (event.changedTouches) {
            posEvent = event.changedTouches[0]
        }
        return posEvent;
    }

    stopPropagation(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
    }

    preventDefault(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        return event;
    }

    startDrag(event, fDragStart, fDragMove, fDragEnd, fDragCancel, fClick, fDblClick) {
        const posEvent = this.getLocationEvent(event);
        this.addGlass(fDragCancel);

        if (this.dragging) debugger; // should never happen

        if (event != null) {
            this.startX = posEvent.clientX;
            this.startY = posEvent.clientY;
            this.glass.style.cursor = getComputedStyle(event.target).cursor;
            this.stopPropagation(event);
            this.preventDefault(event);
        }
        else {
            this.startX = 0;
            this.startY = 0;
            this.glass.style.cursor = "default";
        }

        this.dragging = false;
        this.fDragStart = fDragStart;
        this.fDragMove = fDragMove;
        this.fDragEnd = fDragEnd;
        this.fDragCancel = fDragCancel;
        this.fClick = fClick;
        this.fDblClick = fDblClick;

        document.addEventListener("mouseup", this.onMouseUp);
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("touchend", this.onMouseUp);
        document.addEventListener("touchmove", this.onMouseMove);
    }

    onMouseMove(event) {
        const posEvent = this.getLocationEvent(event);
        this.stopPropagation(event);
        this.preventDefault(event);

        if (!this.dragging && (Math.abs(this.startX - posEvent.clientX) > 5 || Math.abs(this.startY - posEvent.clientY) > 5)) {
            this.dragging = true;
            if (this.fDragStart) {
                this.glass.style.cursor = "move";
                this.dragging = this.fDragStart({"clientX": this.startX, "clientY": this.startY});
            }
        }

        if (this.dragging) {
            if (this.fDragMove) {
                this.fDragMove(posEvent);
            }
        }
        return false;
    }

    onMouseUp(event) {
        const posEvent = this.getLocationEventEnd(event);

        this.stopPropagation(event);
        this.preventDefault(event);

        if (!this.manualGlassManagement) {
            this.hideGlass();
        }

        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("touchend", this.onMouseUp);
        document.removeEventListener("touchmove", this.onMouseMove);

        if (this.dragging) {
            this.dragging = false;
            if (this.fDragEnd) {
                this.fDragEnd(event);
            }
            //dump("set dragging = false\n");
        }
        else {
            if (Math.abs(this.startX - posEvent.clientX) <= 5 && Math.abs(this.startY - posEvent.clientY) <= 5) {
                const clickTime = new Date().getTime();
                // check for double click
                if (Math.abs(this.clickX - posEvent.clientX) <= 5 && Math.abs(this.clickY - posEvent.clientY) <= 5) {
                    if (clickTime - this.lastClick < 500) {
                        if (this.fDblClick) {
                            this.fDblClick(event);
                        }
                    }
                }

                if (this.fClick) {
                    this.fClick(event);
                }
                this.lastClick = clickTime;
                this.clickX = posEvent.clientX;
                this.clickY = posEvent.clientY;
            }
        }
        return false;
    }

    isDragging() {
        return this.dragging;
    }

    toString() {
        const rtn = "(DragDrop: " +
            "startX=" + this.startX +
            ", startY=" + this.startY +
            ", dragging=" + this.dragging +
            ")";

        return rtn;
    }
}
DragDrop.instance = new DragDrop();

export default DragDrop;

