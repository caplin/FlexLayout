import Rect from "./Rect.js";

class DragDrop
{
	constructor()
	{
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
	addGlass(fCancel)
	{
		if (!this.glassShowing)
		{
			var glassRect = new Rect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight)
			glassRect.positionElement(this.glass);
			document.body.appendChild(this.glass);
			this.glass.tabIndex = -1;
			this.glass.focus();
			this.glass.addEventListener("keydown", this.onKeyPress);
			this.glassShowing = true;
			this.fDragCancel = fCancel;
			this.manualGlassManagement = false;
		}
		else // second call to addGlass (via dragstart)
		{
			this.manualGlassManagement = true;
		}
	}

	hideGlass()
	{
		if (this.glassShowing)
		{
			document.body.removeChild(this.glass);
			this.glassShowing = false;
		}
	}

	onKeyPress(event)
	{
		if (this.fDragCancel != null && event.keyCode == 27) // esc
		{
			this.hideGlass();
			document.removeEventListener("mousemove", this.onMouseMove);
			document.removeEventListener("mouseup", this.onMouseUp);
			this.dragging = false;
			this.fDragCancel();
		}
	}

	startDrag(mouseEvent, fDragStart, fDragMove, fDragEnd, fDragCancel, fClick, fDblClick)
	{
		this.addGlass(fDragCancel);

		if (this.dragging) debugger; // should never happen

		if (mouseEvent != null)
		{
			this.startX = mouseEvent.clientX;
			this.startY = mouseEvent.clientY;
			this.glass.style.cursor = getComputedStyle(mouseEvent.target).cursor;
			mouseEvent.stopPropagation();
			mouseEvent.preventDefault();
		}
		else
		{
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
	}

	onMouseMove(mouseEvent)
	{
		mouseEvent.stopPropagation();

		if (!this.dragging && (Math.abs(this.startX - mouseEvent.clientX) > 5 || Math.abs(this.startY - mouseEvent.clientY) > 5))
		{
			this.dragging = true;
			if (this.fDragStart)
			{
				this.glass.style.cursor = "move";
				this.dragging = this.fDragStart({"clientX": this.startX, "clientY": this.startY});
			}
		}

		if (this.dragging)
		{
			if (this.fDragMove)
			{
				this.fDragMove(mouseEvent);
			}
		}
		return false;
	}

	onMouseUp(mouseEvent)
	{
		mouseEvent.stopPropagation();

		if (!this.manualGlassManagement)
		{
			this.hideGlass();
		}

		document.removeEventListener("mousemove", this.onMouseMove);
		document.removeEventListener("mouseup", this.onMouseUp);

		if (this.dragging)
		{
			this.dragging = false;
			if (this.fDragEnd)
			{
				this.fDragEnd(mouseEvent);
			}
			//dump("set dragging = false\n");
		}
		else
		{
			if (Math.abs(this.startX - mouseEvent.clientX) <= 5 && Math.abs(this.startY - mouseEvent.clientY) <= 5)
			{
				var clickTime = new Date().getTime();
				// check for double click
				if (Math.abs(this.clickX - mouseEvent.clientX) <= 5 && Math.abs(this.clickY - mouseEvent.clientY) <= 5)
				{
					if (clickTime - this.lastClick < 500)
					{
						if (this.fDblClick)
						{
							this.fDblClick(mouseEvent);
						}
					}
				}

				if (this.fClick)
				{
					this.fClick(mouseEvent);
				}
				this.lastClick = clickTime;
				this.clickX = mouseEvent.clientX;
				this.clickY = mouseEvent.clientY;
			}
		}
		return false;
	}

	isDragging()
	{
		return this.dragging;
	}

	toString()
	{
		var rtn = "(DragDrop: " +
			"startX=" + this.startX +
			", startY=" + this.startY +
			", dragging=" + this.dragging +
			")";

		return rtn;
	}
}
DragDrop.instance = new DragDrop();

export default DragDrop;

