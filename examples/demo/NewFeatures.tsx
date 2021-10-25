import * as React from "react";

export function NewFeatures() {
    return (
        <ul>
        <li>
            Help text (tooltip) option on tabs: <br/>
            <small>Hover over this tab button</small>
        </li>
        <li>
            Action to close tabset:<br/>
            <small>See added x button in this tabset</small>
        </li>
        <li>
            Intercept drag drop to allow dropping tabs into custom areas:<br/>
            <small>See Tab Storage tab</small>
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
            New onRenderFloatingTabPlaceholder prop:<br/>
            <small>Popout one of the tabs to see the custom rendered placeholder</small>
        </li>
        <li>
            New onContextMenu prop:<br/>
            <small>All tabs and tabsets in this layout have a custom context menu</small>
        </li>
    </ul>
    );
}
