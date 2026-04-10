import * as React from "react";
import { TabNode } from "../model/TabNode";
import { CLASSES } from "./CSSClassNames";
import { TabButtonStamp } from "./TabButtonStamp";
import { LayoutController } from "./layout/LayoutInternal";

/** @internal */
export interface IDragContainerProps {
    tabNode: TabNode;
    controller: LayoutController;
    dragging: boolean;
}

/** @internal */
export const DragContainer = React.memo((props: IDragContainerProps) => {
    
    DragContainer.displayName = 'DragContainer'; // name in react dev tools

    const { controller, tabNode} = props;
    const selfRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(()=> {
        tabNode.setTabStamp(selfRef.current);
    }, [tabNode, selfRef.current]);

    const cm = controller.getClassName;

    const classNames = cm(CLASSES.FLEXLAYOUT__DRAG_RECT);

    return (<div
            ref={selfRef}
            className={classNames}>
            <TabButtonStamp key={tabNode.getId()} controller={controller} tabNode={tabNode} />
        </div>
    );
}, arePropsEqual);

// pause rendering while dragging
function arePropsEqual(prevProps: IDragContainerProps, nextProps: IDragContainerProps) {
    return nextProps.dragging;
}