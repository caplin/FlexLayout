import * as React from "react";

export function NewFeatures() {
    return (
        <ul>
        <li>
            Help text (tooltip) option on tabs: <br/>
            <small>Hover over this tab button</small>
        </li>
        <li>
            Action to close tab set:<br/>
            <small>See added x button in this tab set</small>
        </li>
        <li>
            Allow narrow splitters with extended hit test areas:<br/>
            <small>Uses the splitterExtra global attribute</small>
        </li>
        <li>
            Tab attributes: borderWidth, borderHeight to allow tabs to have individual sizes in borders:<br/>
            <small>Try the 'With border sizes' tab</small>
        </li>
        <li>
            Customize the drag rectangle using the callback property: onRenderDragRect <br/>
            <small>In this layout all drag rectangles are custom rendered</small>
        </li>
        <li>
            New border attribute: enableAutoHide, to hide border if it has zero tabs:<br/>
            <small>Try moving all tabs from any of the borders</small>
        </li>
        <li>
            New onContextMenu prop:<br/>
            <small>All tabs and tab sets in this layout have a custom context menu</small>
        </li>
        <li>
            New tab set attribute: tabSetEnableTabWrap<br/>
            <small>All tab sets in this layout will wrap their tabs onto multiple lines when needed</small>
        </li>
    </ul>
    );
}
