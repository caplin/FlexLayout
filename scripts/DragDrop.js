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

		var self = this;
		this.mouseMoveListener = function (mouseEvent)
		{
			self.onMouseMove(mouseEvent);
		};
		this.mouseUpListener = function (mouseEvent)
		{
			self.onMouseUp(mouseEvent);
		};

		this.lastClick = 0;
		this.clickX = 0;
		this.clickY = 0;
	}

	startDrag(mouseEvent, fDragStart, fDragMove, fDragEnd, fDragCancel, fClick, fDblClick)
	{
		var glassRect = new Rect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight)
		glassRect.positionElement(this.glass);
		document.body.appendChild(this.glass);

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

		document.addEventListener("mouseup", this.mouseUpListener);
		document.addEventListener("mousemove", this.mouseMoveListener);
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

		document.body.removeChild(this.glass);

		document.removeEventListener("mousemove", this.mouseMoveListener);
		document.removeEventListener("mouseup", this.mouseUpListener);

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

