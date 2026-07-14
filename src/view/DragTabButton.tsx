import * as React from "react";
import { TabNode } from "../model/TabNode";
import { CLASSES } from "./CSSClassNames";
import { TabButtonStamp } from "./TabButtonStamp";
import { LayoutController } from "./layout/LayoutInternal";

/** @internal */
export interface IDragTabButton {
    tabNode: TabNode;
    controller: LayoutController;
    dragging: boolean;
}

/** @internal */
export const DragTabButton = React.memo((props: IDragTabButton) => {
    DragTabButton.displayName = "DragTabButton"; // name in react dev tools

    const { controller, tabNode } = props;
    const selfRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        tabNode.setTabStamp(selfRef.current);
    }, [tabNode]);

    const cm = controller.getClassName;

    const classNames = cm(CLASSES.FLEXLAYOUT__DRAG_RECT);

    return (
        <div ref={selfRef} className={classNames}>
            <TabButtonStamp key={tabNode.getId()} controller={controller} tabNode={tabNode} />
        </div>
    );
}, arePropsEqual);

// pause rendering while dragging
function arePropsEqual(prevProps: IDragTabButton, nextProps: IDragTabButton) {
    return nextProps.dragging;
}
